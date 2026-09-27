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
import { AtmosphereSurface, ThemedText, type AtmosphereMesh } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scoreBand } from '@/lib/score';

import { Rail, RailCard, useRailCardSize } from './passage-rail';

/** One control module (layout plan D2): every in-card disc is 48. */
const DISC = 48;
/** Glyph on a 48 disc. */
const ICON_SIZE = 20;
/** Delta arrow box. The path below is traced on this 12 grid (from `DeltaLabel`). */
const ARROW = 12;
/** Empty-state icon ring, same as `EmptyStateCard`'s. Not a radius step. */
const EMPTY_RING = 52;
/** Empty-state glyph, same as `EmptyStateCard`'s. */
const EMPTY_ICON = 24;
/** Widest the empty subtitle runs before wrapping into short, centered lines. */
const EMPTY_SUBTITLE_MAX_WIDTH = 260;

export type ProgressRailProps = {
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

/** Chunky delta arrow, the same path `DeltaLabel` draws. `down` mirrors it. */
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
 * CO-02L four-corner tile: outline identity disc top-left, decorative action
 * disc top-right, one-line title, a void, and the value band at the bottom.
 */
function ProgressTile({
  size,
  mesh,
  icon,
  title,
  onPress,
  children,
}: {
  size: number;
  mesh: Exclude<AtmosphereMesh, 'artwork'>;
  icon: IconSvgElement;
  title: string;
  onPress: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <RailCard size={size} onPress={onPress}>
      <AtmosphereSurface mesh={mesh} radius="xl" style={styles.tile}>
        <View style={styles.tileHeader}>
          <View style={[styles.disc, styles.identity, { borderColor: colors.outline }]}>
            <HugeiconsIcon icon={icon} size={ICON_SIZE} color={colors.onAtmosphere} />
          </View>
          {/* Decorative: the whole tile is the press target. */}
          <View
            pointerEvents="none"
            style={[styles.disc, { backgroundColor: colors.fillTranslucent }]}>
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={ICON_SIZE} color={colors.onAtmosphere} />
          </View>
        </View>
        <ThemedText
          variant="title3"
          weight="regular"
          tone="onAtmosphere"
          numberOfLines={1}
          style={styles.title}>
          {title}
        </ThemedText>
        <View style={styles.void} />
        {children}
      </AtmosphereSurface>
    </RailCard>
  );
}

/** TX-03 compact: a held delta row over the score, with the caption stack on its baseline. */
function ScoreBand({ score, scoreDelta }: { score: number | null; scoreDelta: number | null }) {
  const { colors } = useTheme();
  const hasDelta = scoreDelta != null && scoreDelta !== 0;
  const improving = hasDelta && scoreDelta > 0;

  return (
    <View>
      {/* Held at its height even when empty, so every tile's value band sits alike. */}
      <View style={styles.deltaRow}>
        {hasDelta ? (
          <>
            <DeltaArrow
              color={improving ? colors.positive : colors.onAtmosphereMuted}
              down={!improving}
            />
            <ThemedText
              variant="callout"
              weight="regular"
              tone={improving ? 'positive' : 'onAtmosphereMuted'}
              style={styles.tabular}>
              {Math.abs(scoreDelta)}
              <ThemedText variant="callout" weight="regular" tone="onAtmosphereMuted">
                {' this week'}
              </ThemedText>
            </ThemedText>
          </>
        ) : null}
      </View>
      <View style={styles.scoreRow}>
        <ScoreValue value={score} size="large" on="mesh" unit="/100" />
        {/* "Last 7 days" first so it is the stack's baseline child (Yoga reads a
            column's baseline from its first child); column-reverse still
            paints the band word above it. */}
        <View style={styles.caption}>
          <ThemedText variant="footnote" tone="onAtmosphereMuted" numberOfLines={1}>
            Last 7 days
          </ThemedText>
          {score != null ? (
            <ThemedText variant="footnote" tone="onAtmosphereMuted" numberOfLines={1}>
              {scoreBand(score)}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** Stands in for the rail before the first session. States plainly there is no data yet. */
function EmptyProgress() {
  const { colors } = useTheme();

  return (
    <View style={styles.empty}>
      <View style={[styles.emptyRing, { borderColor: colors.track }]}>
        <HugeiconsIcon icon={AnalyticsUpIcon} size={EMPTY_ICON} color={colors.secondary} />
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
 * as a CO-04 rail of CO-02L tiles, each opening Analytics. Before any session
 * it renders an empty block in the rail's place instead of zeros.
 */
export function ProgressRail({
  hasRecords,
  score,
  scoreDelta,
  totalMinutes,
  totalSessions,
  longestStreak,
  onOpenAnalytics,
}: ProgressRailProps) {
  const size = useRailCardSize();

  if (!hasRecords) return <EmptyProgress />;

  const hours = totalMinutes >= 60;

  return (
    <Rail cardSize={size}>
      <ProgressTile
        size={size}
        mesh="hero"
        icon={Chart02Icon}
        title="Speaking score"
        onPress={onOpenAnalytics}>
        <ScoreBand score={score} scoreDelta={scoreDelta} />
      </ProgressTile>
      <ProgressTile
        size={size}
        mesh="minutes"
        icon={Clock01Icon}
        title="practice"
        onPress={onOpenAnalytics}>
        <ScoreValue
          value={hours ? Math.round(totalMinutes / 60) : Math.round(totalMinutes)}
          size="large"
          on="mesh"
          unit={hours ? 'h' : 'min'}
        />
      </ProgressTile>
      <ProgressTile
        size={size}
        mesh="sessions"
        icon={Mic02Icon}
        title={totalSessions === 1 ? 'session' : 'sessions'}
        onPress={onOpenAnalytics}>
        <ScoreValue value={totalSessions} size="large" on="mesh" unit="" />
      </ProgressTile>
      <ProgressTile
        size={size}
        mesh="streak"
        icon={FireIcon}
        title="best streak"
        onPress={onOpenAnalytics}>
        <ScoreValue
          value={longestStreak}
          size="large"
          on="mesh"
          unit={longestStreak === 1 ? 'day' : 'days'}
        />
      </ProgressTile>
    </Rail>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: spacing.xl,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    marginTop: spacing.xxl,
  },
  void: {
    flex: 1,
    minHeight: spacing.xxl,
  },
  deltaRow: {
    minHeight: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  caption: {
    flexDirection: 'column-reverse',
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyRing: {
    width: EMPTY_RING,
    height: EMPTY_RING,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  centered: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: EMPTY_SUBTITLE_MAX_WIDTH,
  },
});
