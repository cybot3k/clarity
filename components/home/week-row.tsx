import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { weekdayInitial } from '@/lib/format';
import { startOfLocalDayOffset } from '@/lib/stats';

/** Portrait status tile, like the timeline's month tiles (S3). */
const TILE_HEIGHT = 64;
/** Day badge diameter. */
const BADGE = 24;
/** Tick inside a met-day badge. */
const TICK = 12;
/** Heavier than the default stroke so the tick still reads at 12pt. */
const TICK_STROKE = 2;
/** Hollow ring on a past day that missed the goal. */
const RING = 1.5;
/** Today's progress arc. */
const ARC = 2;
/** Today's tile rim. */
const TODAY_RIM = 1.5;

type DayState = 'met' | 'missed' | 'today' | 'tomorrow';

export type WeekRowProps = {
  /** Shared clock from `useNow()`. */
  now: number;
  /** Today's goal completion, 0–1. */
  todayProgress: number;
  /** Goal met on each of the 5 days before today, oldest first. */
  history: readonly boolean[];
};

/** A hairline track with today's goal drawn from 12 o'clock. */
function TodayArc({ progress }: { progress: number }) {
  const { colors } = useTheme();
  const c = BADGE / 2;
  const r = (BADGE - ARC) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(progress, 1));

  return (
    <Svg width={BADGE} height={BADGE}>
      <Circle cx={c} cy={c} r={r} fill="none" stroke={colors.track} strokeWidth={RING} />
      {p > 0 ? (
        <G rotation={-90} origin={[c, c]}>
          <Circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={colors.foreground}
            strokeWidth={ARC}
            strokeLinecap="round"
            strokeDasharray={`${circ * p} ${circ}`}
          />
        </G>
      ) : null}
    </Svg>
  );
}

function Badge({ state, todayProgress }: { state: DayState; todayProgress: number }) {
  const { colors } = useTheme();
  const met = state === 'met' || (state === 'today' && todayProgress >= 1);

  if (met) {
    return (
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <HugeiconsIcon
          icon={Tick02Icon}
          size={TICK}
          color={colors.onAccent}
          strokeWidth={TICK_STROKE}
        />
      </View>
    );
  }
  if (state === 'today') return <TodayArc progress={todayProgress} />;
  if (state === 'missed') {
    // Home can't tell "no practice" from "below goal", so both are one quiet ring.
    return <View style={[styles.badge, { borderWidth: RING, borderColor: colors.track }]} />;
  }
  return <View style={styles.badge} />;
}

/**
 * This week as seven status tiles: the five days before today, today, and
 * tomorrow. The label sits on top and the state lives in the badge, so the
 * letter never changes weight or color to say how a day went.
 */
export function WeekRow({ now, todayProgress, history }: WeekRowProps) {
  const { colors } = useTheme();
  const days = [-5, -4, -3, -2, -1, 0, 1].map((offset, i) => {
    const state: DayState =
      offset === 1 ? 'tomorrow' : offset === 0 ? 'today' : history[i] ? 'met' : 'missed';
    return { key: offset, letter: weekdayInitial(startOfLocalDayOffset(now, offset)), state };
  });

  return (
    <View style={styles.row}>
      {days.map(({ key, letter, state }) => (
        <View
          key={key}
          style={[
            styles.tile,
            state === 'tomorrow'
              ? { borderWidth: 1, borderColor: colors.outline }
              : { backgroundColor: colors.fillTranslucent },
            state === 'today' && { borderWidth: TODAY_RIM, borderColor: colors.foreground },
          ]}>
          <ThemedText
            variant="footnote"
            weight="regular"
            tone={state === 'tomorrow' ? 'secondary' : 'primary'}>
            {letter}
          </ThemedText>
          <Badge state={state} todayProgress={todayProgress} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    height: TILE_HEIGHT,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
