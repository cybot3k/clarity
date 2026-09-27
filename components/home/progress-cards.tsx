import {
  AnalyticsUpIcon,
  ArrowUpRight01Icon,
  Chart02Icon,
  Clock01Icon,
  FireIcon,
  Mic02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ScoreValue } from '@/components/metrics';
import { ControlDisc, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scoreBand } from '@/lib/score';

import { CardRail, PressableCard, useCardSize } from './card-rail';

/** Delta arrow box; the path below is traced on this 12 grid. */
const ARROW = 12;
/** Empty-state icon ring. */
const EMPTY_RING = 52;
/** Empty-state glyph. */
const EMPTY_ICON = 24;
/** Widest the empty subtitle runs before wrapping into short, centered lines. */
const EMPTY_SUBTITLE_MAX_WIDTH = 260;

export type ProgressCardsProps = {
  hasRecords: boolean;
  /** Rolling 7-day speaking score; null when the week has nothing measured. */
  score: number | null;
  /** Change vs the previous 7 days; null when there's no prior week. */
  scoreDelta: number | null;
  totalMinutes: number;
  totalSessions: number;
  longestStreak: number;
  onOpenAnalytics: () => void;
};

function DeltaArrow({ color, down }: { color: string; down: boolean }) {
  return (
    <Svg width={ARROW} height={ARROW} viewBox={`0 0 ${ARROW} ${ARROW}`}>
      <Path
        d={
          down
            ? 'M6 10 L2 5 L4.5 5 L4.5 2 L7.5 2 L7.5 5 L10 5 Z'
            : 'M6 2 L10 7 L7.5 7 L7.5 10 L4.5 10 L4.5 7 L2 7 Z'
        }
        fill={color}
      />
    </Svg>
  );
}

/**
 * The catalog's square stat tile (S2 "Payments on Time"): identity disc
 * top-left, the ↗ disc top-right, a one-line title, a deliberate void, and the
 * value on the bottom-left with status on the bottom-right. On the white sheet
 * the tile takes the soft grey fill and its ↗ disc goes white — S2's
 * white-on-grey, inverted.
 */
function StatTile({
  size,
  icon,
  title,
  onPress,
  above,
  value,
  status,
}: {
  size: number;
  icon: IconSvgElement;
  title: string;
  onPress: () => void;
  /** A line hung over the value (the score's weekly change). */
  above?: ReactNode;
  value: ReactNode;
  /** Bottom-right slot, on the value's baseline. */
  status?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <PressableCard size={size} onPress={onPress}>
      <View style={[styles.tile, { backgroundColor: colors.fillTranslucent }]}>
        <View style={styles.tileHeader}>
          <ControlDisc icon={icon} fill="outline" />
          {/* Decorative: the whole tile is the press target. */}
          <ControlDisc icon={ArrowUpRight01Icon} fill="card" />
        </View>
        <ThemedText
          variant="title3"
          weight="regular"
          tone="primary"
          numberOfLines={1}
          style={styles.title}>
          {title}
        </ThemedText>
        {/* Each column lists its baseline line first (Yoga reads a column's
            baseline from its first child); column-reverse paints it last. */}
        <View style={styles.bottom}>
          <View style={styles.value}>
            {value}
            {above}
          </View>
          {status}
        </View>
      </View>
    </PressableCard>
  );
}

/** The week's change, held at its height even when empty so every tile's value sits alike. */
function DeltaLine({ scoreDelta }: { scoreDelta: number | null }) {
  const { colors } = useTheme();
  const hasDelta = scoreDelta != null && scoreDelta !== 0;
  const improving = hasDelta && scoreDelta > 0;
  return (
    <View style={styles.delta}>
      {hasDelta ? (
        <>
          <DeltaArrow color={improving ? colors.positive : colors.secondary} down={!improving} />
          <ThemedText
            variant="callout"
            weight="regular"
            tone={improving ? 'positive' : 'secondary'}
            style={styles.tabular}>
            {Math.abs(scoreDelta)}
            <ThemedText variant="callout" weight="regular" tone="secondary">
              {' this week'}
            </ThemedText>
          </ThemedText>
        </>
      ) : null}
    </View>
  );
}

/** Stands in for the tiles before the first session. States plainly there is no data yet. */
function EmptyProgress() {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: colors.fillTranslucent }]}>
      <View style={[styles.emptyRing, { borderColor: colors.outline }]}>
        <HugeiconsIcon icon={AnalyticsUpIcon} size={EMPTY_ICON} color={colors.foreground} />
      </View>
      <ThemedText variant="title3" weight="regular" tone="primary" style={styles.centered}>
        No progress yet
      </ThemedText>
      <ThemedText variant="footnoteProse" tone="secondary" style={styles.emptySubtitle}>
        {
          'Finish your first practice session and your 7-day score, minutes, sessions, and best streak will show up here.'
        }
      </ThemedText>
    </View>
  );
}

/**
 * Home "Your progress": the 7-day speaking score and the all-time effort counts
 * as square tiles on a rail, each opening Analytics. Before any session it
 * shows an empty block instead of zeros.
 */
export function ProgressCards({
  hasRecords,
  score,
  scoreDelta,
  totalMinutes,
  totalSessions,
  longestStreak,
  onOpenAnalytics,
}: ProgressCardsProps) {
  const size = useCardSize();
  if (!hasRecords) return <EmptyProgress />;
  const hours = totalMinutes >= 60;

  return (
    <CardRail size={size}>
      <StatTile
        size={size}
        icon={Chart02Icon}
        title="Speaking score"
        onPress={onOpenAnalytics}
        above={<DeltaLine scoreDelta={scoreDelta} />}
        value={<ScoreValue value={score} size="large" unit="/100" />}
        status={
          <View style={styles.status}>
            <ThemedText variant="footnote" weight="regular" tone="secondary" numberOfLines={1}>
              Last 7 days
            </ThemedText>
            {score != null ? (
              <ThemedText variant="footnote" weight="regular" tone="primary" numberOfLines={1}>
                {scoreBand(score)}
              </ThemedText>
            ) : null}
          </View>
        }
      />
      <StatTile
        size={size}
        icon={Clock01Icon}
        title="practice"
        onPress={onOpenAnalytics}
        value={
          <ScoreValue
            value={hours ? Math.round(totalMinutes / 60) : Math.round(totalMinutes)}
            size="large"
            unit={hours ? 'h' : 'min'}
          />
        }
      />
      <StatTile
        size={size}
        icon={Mic02Icon}
        title={totalSessions === 1 ? 'session' : 'sessions'}
        onPress={onOpenAnalytics}
        value={<ScoreValue value={totalSessions} size="large" unit="" />}
      />
      <StatTile
        size={size}
        icon={FireIcon}
        title="best streak"
        onPress={onOpenAnalytics}
        value={
          <ScoreValue value={longestStreak} size="large" unit={longestStreak === 1 ? 'day' : 'days'} />
        }
      />
    </CardRail>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: radius.xxl,
    borderCurve: 'continuous',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: spacing.xxl,
  },
  bottom: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  value: {
    flexDirection: 'column-reverse',
    flexShrink: 1,
  },
  delta: {
    minHeight: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  status: {
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xxl,
    borderCurve: 'continuous',
  },
  emptyRing: {
    width: EMPTY_RING,
    height: EMPTY_RING,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  centered: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: EMPTY_SUBTITLE_MAX_WIDTH,
  },
});
