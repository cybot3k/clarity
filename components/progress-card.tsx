import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { DeltaPill, ScoreValue } from '@/components/metrics';
import { MetricCapsule, ThemedText } from '@/components/ui';
import { atmosphere, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scoreBand } from '@/lib/score';

/** Meter band. The line sits on its center. Named by the home contract, not a spacing step. */
const METER_BAND = 12;
/** Solid meter stroke. Named by the home contract, not a spacing step. */
const METER_STROKE = 2;

export type ProgressCardProps = {
  /** Rolling 7-day speaking score; null when the week has nothing measured. */
  score: number | null;
  /** Change vs the previous 7 days. Omit when there's no prior week. */
  scoreDelta?: number;
  totalMinutes: number;
  totalSessions: number;
  longestStreak: number;
};

function ScoreMeter({ score }: { score: number | null }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const y = METER_BAND / 2;
  const head = atmosphere.meterHead;
  const origin = atmosphere.meterOrigin;
  const progressX = score != null ? (width * score) / 100 : 0;
  const headX = Math.min(Math.max(progressX, head / 2), Math.max(width - head / 2, head / 2));

  return (
    <View
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        setWidth((current) => (current === next ? current : next));
      }}>
      {width > 0 ? (
        <Svg width={width} height={METER_BAND} importantForAccessibility="no-hide-descendants">
          <Line
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke={colors.track}
            strokeWidth={atmosphere.dottedWidth}
            strokeDasharray={atmosphere.dottedDash}
            strokeLinecap="round"
          />
          {score != null ? (
            <>
              <Line
                x1={0}
                y1={y}
                x2={progressX}
                y2={y}
                stroke={colors.foreground}
                strokeWidth={METER_STROKE}
                strokeLinecap="round"
              />
              <Circle cx={headX} cy={y} r={head / 2} fill={colors.foreground} />
            </>
          ) : null}
          <Circle
            cx={origin / 2}
            cy={y}
            r={origin / 2}
            fill={colors.card}
            stroke={colors.foreground}
            strokeWidth={atmosphere.meterOriginStroke}
          />
        </Svg>
      ) : (
        <View style={styles.meterPlaceholder} />
      )}
    </View>
  );
}

/**
 * Rolling 7-day speaking score on a paper card, with all-time counts in
 * identity capsules. The score is SF, never LED. The band is vocabulary,
 * not a grade.
 */
export function ProgressCard({
  score,
  scoreDelta,
  totalMinutes,
  totalSessions,
  longestStreak,
}: ProgressCardProps) {
  const { colors } = useTheme();
  const hours = totalMinutes >= 60 ? Math.round(totalMinutes / 60) : null;

  return (
    <View>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.divider,
          },
        ]}>
        <View style={styles.head}>
          <ThemedText variant="eyebrow" tone="tertiary">
            SPEAKING SCORE
          </ThemedText>
          {scoreDelta != null && scoreDelta !== 0 ? (
            <DeltaPill delta={scoreDelta} suffix="this week" />
          ) : null}
        </View>
        <View style={styles.scoreRow}>
          <ScoreValue value={score} size="large" />
          {score != null ? (
            <View style={[styles.band, { borderColor: colors.outline }]}>
              <ThemedText variant="caption" weight="semibold" tone="secondary">
                {scoreBand(score).toUpperCase()}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ScoreMeter score={score} />
        <ThemedText variant="footnote" tone="tertiary">
          Last 7 days
        </ThemedText>
      </View>
      <View style={styles.counts}>
        <MetricCapsule
          family="minutes"
          label="practice"
          value={hours ?? Math.round(totalMinutes)}
          unit={hours != null ? 'h' : 'min'}
          style={styles.capsule}
        />
        <MetricCapsule
          family="sessions"
          label={totalSessions === 1 ? 'session' : 'sessions'}
          value={totalSessions}
          unit=""
          style={styles.capsule}
        />
        <MetricCapsule
          family="streak"
          label="best streak"
          value={longestStreak}
          unit={longestStreak === 1 ? 'day' : 'days'}
          style={styles.capsule}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.xl,
    gap: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  band: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  meterPlaceholder: {
    height: METER_BAND,
  },
  counts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  capsule: {
    flex: 1,
    aspectRatio: atmosphere.statTileAspect,
  },
});
