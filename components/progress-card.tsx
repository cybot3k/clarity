import { StyleSheet, View } from 'react-native';

import { DeltaPill, ScoreValue } from '@/components/metrics';
import { AtmosphereSurface, ThemedText } from '@/components/ui';
import { atmosphere, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scoreBand } from '@/lib/score';

export type ProgressCardProps = {
  /** Rolling 7-day speaking score; null when the week has nothing measured. */
  score: number | null;
  /** Change vs the previous 7 days. Omit when there's no prior week. */
  scoreDelta?: number;
  totalMinutes: number;
  totalSessions: number;
  longestStreak: number;
};

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        <ThemedText variant="title">{value}</ThemedText>
        <ThemedText variant="footnote" tone="tertiary">
          {unit}
        </ThemedText>
      </View>
      <ThemedText variant="caption" tone="tertiary">
        {label}
      </ThemedText>
    </View>
  );
}

/**
 * Hero is the rolling 7-day speaking score (same figure Analytics leads with).
 * All-time totals sit underneath as SF Pro, not LED on canvas.
 *
 * Title and LED stay in the navy/teal. Hairline, "Last 7 days", and delta sit
 * on `atmosphereScrim` so white ink is never on the pale `heroStopBottom` foot.
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
  const fill = score != null ? score / 100 : 0;

  return (
    <View>
      <AtmosphereSurface mesh="hero" radius="hero" grain>
        <View style={styles.hero}>
          <ThemedText variant="eyebrow" tone="onAtmosphereMuted">
            SPEAKING SCORE
          </ThemedText>
          <View style={styles.scoreRow}>
            <ScoreValue value={score} size="hero" />
            {score != null && (
              <View style={[styles.badge, { backgroundColor: colors.card }]}>
                <ThemedText variant="caption" weight="bold">
                  {scoreBand(score).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.foot, { backgroundColor: colors.atmosphereScrim }]}>
          <View style={[styles.track, { backgroundColor: colors.ledOff }]}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round(fill * 100)}%` as `${number}%`, backgroundColor: colors.onAtmosphere },
              ]}
            />
          </View>
          <View style={styles.metaRow}>
            <ThemedText variant="footnote" tone="onAtmosphereMuted">
              Last 7 days
            </ThemedText>
            {scoreDelta != null && scoreDelta !== 0 && (
              <DeltaPill delta={scoreDelta} suffix="this week" />
            )}
          </View>
        </View>
      </AtmosphereSurface>

      <View style={styles.momentum}>
        <Stat
          value={String(hours ?? Math.round(totalMinutes))}
          unit={hours != null ? 'h' : 'min'}
          label="practice"
        />
        <View style={[styles.momentumDivider, { backgroundColor: colors.divider }]} />
        <Stat
          value={String(totalSessions)}
          unit=""
          label={totalSessions === 1 ? 'session' : 'sessions'}
        />
        <View style={[styles.momentumDivider, { backgroundColor: colors.divider }]} />
        <Stat
          value={String(longestStreak)}
          unit={longestStreak === 1 ? 'day' : 'days'}
          label="best streak"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  foot: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  track: {
    height: atmosphere.progressStroke,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: atmosphere.progressStroke,
    borderRadius: radius.full,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  momentum: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xxs,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  momentumDivider: {
    width: 1,
    height: 34,
  },
});
