import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/** Status tile height (layout plan CO-06 week). */
const TILE_HEIGHT = 64;
/** Day badge diameter. */
const BADGE = 24;
/** Tick inside a met-day badge. */
const TICK_SIZE = 12;
/** Heavier than the default stroke so the tick still reads at 12pt. */
const TICK_STROKE = 2;
/** Hollow ring on a past day that missed the goal. */
const RING = 1;
/** Today's progress arc (CO-12b). */
const ARC_STROKE = 2;

type DayState = 'met' | 'missed' | 'today' | 'tomorrow';

export type WeeklyProgressProps = {
  /** Shared clock from `useNow()`. Advances at midnight / foreground. */
  now: number;
  /** Today's goal completion, 0–1. */
  todayProgress: number;
  /** Completion for the 5 days before today, oldest first. */
  history: readonly boolean[];
};

/** Today's badge: a hairline track with the goal arc drawn from 12 o'clock. */
function TodayBadge({ progress }: { progress: number }) {
  const { colors } = useTheme();
  const c = BADGE / 2;
  const r = (BADGE - ARC_STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(progress, 1));

  return (
    <Svg width={BADGE} height={BADGE} importantForAccessibility="no-hide-descendants">
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={colors.track}
        strokeWidth={StyleSheet.hairlineWidth}
      />
      {p > 0 ? (
        <G rotation={-90} origin={[c, c]}>
          <Circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={colors.foreground}
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${circ * p} ${circ}`}
          />
        </G>
      ) : null}
    </Svg>
  );
}

function DayBadge({ state, todayProgress }: { state: DayState; todayProgress: number }) {
  const { colors } = useTheme();

  if (state === 'met') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.positive }]}>
        <HugeiconsIcon
          icon={Tick02Icon}
          size={TICK_SIZE}
          color={colors.inverseLabel}
          strokeWidth={TICK_STROKE}
        />
      </View>
    );
  }
  if (state === 'missed') {
    return <View style={[styles.badge, styles.hollow, { borderColor: colors.track }]} />;
  }
  if (state === 'today') {
    return <TodayBadge progress={todayProgress} />;
  }
  return null;
}

/**
 * Rolling 7-day strip (CO-06): 5 past + today + tomorrow. Not a Sunday-start
 * calendar. Day-of-month is dropped; letters follow Date.getDay(). Each day is
 * a status tile, label on top and badge below; the state lives in the badge and
 * the tile's fill, never in the letter. Display only.
 */
export function WeeklyProgress({ now, todayProgress, history }: WeeklyProgressProps) {
  const { colors } = useTheme();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + i - 5);
    const state: DayState =
      i === 6 ? 'tomorrow' : i === 5 ? 'today' : (history[i] ?? false) ? 'met' : 'missed';
    return { letter: DAY_LETTERS[date.getDay()], state };
  });

  return (
    <View style={styles.root}>
      <View style={styles.labelRow}>
        <ThemedText variant="footnote" weight="regular" tone="primary">
          This week
        </ThemedText>
        <ThemedText variant="footnote" weight="regular" tone="secondary" style={styles.tabular}>
          {`${Math.round(todayProgress * 100)}% today`}
        </ThemedText>
      </View>
      <View style={styles.row}>
        {days.map((day, i) => (
          <View
            key={i}
            style={[
              styles.tile,
              day.state === 'tomorrow' ? null : { backgroundColor: colors.fillTranslucent },
              { borderColor: day.state === 'today' ? colors.foreground : colors.outline },
            ]}>
            <ThemedText
              variant="footnote"
              weight="medium"
              tone={day.state === 'tomorrow' ? 'secondary' : 'primary'}>
              {day.letter}
            </ThemedText>
            <DayBadge state={day.state} todayProgress={todayProgress} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    height: TILE_HEIGHT,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hollow: {
    borderWidth: RING,
  },
});
