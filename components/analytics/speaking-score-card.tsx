import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScoreChart, type ScoreChartPoint } from '@/components/analytics/score-chart';
import { DeltaPill, ScoreValue } from '@/components/metrics';
import { AtmosphereSurface, ThemedText } from '@/components/ui';
import { SKILL_ORDER } from '@/constants/metrics';
import { spacing } from '@/constants/theme';
import { scoreBand } from '@/lib/score';

export type SpeakingScoreCardProps = {
  /** Rolling score over the window; null when nothing was measured. */
  score: number | null;
  /** Change vs the previous window. Omit when there's no prior data. */
  delta?: number;
  /** Window name the delta pill reads, e.g. "this week" / "this month". */
  deltaSuffix?: string;
  /** Oldest first, current bucket last. `score: null` on empty buckets. */
  points: readonly ScoreChartPoint[];
  /** Extra caption under the chart, e.g. "Each point is one week." */
  note?: string;
};

/** The bucket's practice line, e.g. "2 sessions · 14 min". Partial coverage is
 * left to the lighter segment and the footnote: a third line here would grow the
 * header and shift the chart under the finger. */
function activity(point: ScoreChartPoint): string | null {
  if (point.sessions === 0) return null;
  return `${point.sessions} ${point.sessions === 1 ? 'session' : 'sessions'} · ${point.minutes} min`;
}

/**
 * The hero: one speaking score, its band, its window change, and the bucketed
 * scores behind it.
 *
 * The chart plots the same window the score is computed from, so the number,
 * the dashed average line, and the curve can never disagree — and it's the same
 * window Home's card reads, so the two screens always show the same figure.
 *
 * Scrubbing the curve swaps this header to that bucket: the eyebrow becomes its
 * date, the hero number its score, and the meta row its band and practice.
 * The value stays above the hand instead of under it, and both states share
 * one fixed-height meta row so nothing moves while the finger drags.
 */
export function SpeakingScoreCard({
  score,
  delta,
  deltaSuffix = 'this week',
  points,
  note,
}: SpeakingScoreCardProps) {
  const [scrubbed, setScrubbed] = useState<ScoreChartPoint | null>(null);

  const footnote = [
    points.some((p) => p.score != null && p.skillCount < SKILL_ORDER.length)
      ? 'Softer segments were scored on fewer skills.'
      : null,
    note,
  ]
    .filter(Boolean)
    .join(' ');

  const shown = scrubbed ? scrubbed.score : score;
  const meta = scrubbed ? activity(scrubbed) : null;
  const bandLabel = scrubbed
    ? scrubbed.score != null
      ? scoreBand(scrubbed.score)
      : scrubbed.sessions > 0
        ? 'Practiced, not scored'
        : 'No practice'
    : score != null
      ? scoreBand(score)
      : null;

  return (
    <AtmosphereSurface mesh="hero" radius="hero" style={styles.card}>
      <View style={styles.head}>
        <ThemedText variant="eyebrow" tone="onAtmosphereMuted" numberOfLines={1}>
          {scrubbed ? scrubbed.detail.toUpperCase() : 'SPEAKING SCORE'}
        </ThemedText>
        <ScoreValue value={shown} size="hero" on="mesh" />
        <View style={styles.meta}>
          <View style={styles.metaLabel}>
            {bandLabel != null && (
              <ThemedText
                variant="footnote"
                weight="semibold"
                tone="onAtmosphere"
                numberOfLines={1}>
                {bandLabel}
              </ThemedText>
            )}
          </View>
          {scrubbed ? (
            meta != null ? (
              <ThemedText variant="caption" tone="onAtmosphereMuted" numberOfLines={1}>
                {meta}
              </ThemedText>
            ) : null
          ) : (
            delta != null &&
            delta !== 0 && <DeltaPill delta={delta} suffix={deltaSuffix} on="mesh" />
          )}
        </View>
      </View>

      <View style={styles.chart}>
        <ScoreChart points={points} avg={score} onScrub={setScrubbed} />
        {footnote.length > 0 && (
          <ThemedText
            variant="caption"
            weight="regular"
            tone="onAtmosphereMuted"
            style={styles.footnote}>
            {footnote}
          </ThemedText>
        )}
      </View>
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  footnote: {
    marginTop: spacing.md,
  },
  card: {
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  head: {
    gap: spacing.sm,
  },
  meta: {
    minHeight: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metaLabel: {
    flex: 1,
  },
  chart: {
    gap: spacing.sm,
  },
});
