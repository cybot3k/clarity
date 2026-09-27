import { AnalyticsUpIcon, Clock01Icon, FireIcon, StarIcon } from '@hugeicons/core-free-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RecordsCard, type RecordRow } from '@/components/analytics/records-card';
import { type ScoreChartPoint } from '@/components/analytics/score-chart';
import { SpeakingScoreCard } from '@/components/analytics/speaking-score-card';
import { EmptyStateCard } from '@/components/empty-state-card';
import { useMinimizeOnScroll } from '@/components/glass-tabs';
import { HeaderActions } from '@/components/header-actions';
import { SkillCard } from '@/components/metrics';
import { SegmentedControl } from '@/components/segmented-control';
import { IntroReveal } from '@/components/splash';
import { AtmosphereCanvas, MetricCapsule, SectionHeader, ThemedText } from '@/components/ui';
import { spacing, TAB_BAR_SCROLL_INSET } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useSessionRecords, useWords } from '@/hooks/use-session-history';
import { useNow } from '@/hooks/use-now';
import { useSpeakingSummary } from '@/hooks/use-speaking-summary';
import { formatDayDetail, formatDayRange, formatMonthDay, timeAgo, weekdayInitial } from '@/lib/format';
import { speakingScore } from '@/lib/score';
import {
  bestSession,
  dayKeyToMs,
  longestStreakRange,
  startOfLocalDay,
  totals,
  weeklySpeakingScores,
} from '@/lib/stats';

const MODE_LABELS = { passage: 'Passage', drill: 'Drill', freestyle: 'Freestyle' } as const;

const RANGES = ['Week', 'Month', 'All time'] as const;
/** Days each range scores over. All time is resolved from the first record. */
const RANGE_DAYS = [7, 30, null] as const;
/** What the score delta is measured against, per range. All time has no prior
 * window by construction, so its delta is always null and needs no suffix. */
const DELTA_SUFFIXES = ['this week', 'this month', undefined] as const;

export default function AnalyticsScreen() {
  useMarkInteractive();

  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();

  const [range, setRange] = useState(0);
  const records = useSessionRecords();
  const now = useNow();

  // All time spans from the first session to today; the other ranges are fixed.
  const windowDays = useMemo(() => {
    const fixed = RANGE_DAYS[range];
    if (fixed != null) return fixed;
    if (records.length === 0) return 7;
    const first = startOfLocalDay(records[0].completedAt);
    return Math.max(1, Math.round((startOfLocalDay(now) - first) / 86_400_000) + 1);
  }, [range, records, now]);

  const summary = useSpeakingSummary(windowDays);
  const { mastered } = useWords();

  // What the chart plots. Week and month plot the window's days; all time
  // plots the WHOLE history as weekly buckets instead of truncating, so the
  // chart finally covers the same span as the score above it.
  const chartPoints = useMemo<ScoreChartPoint[]>(() => {
    if (range === 2) {
      return weeklySpeakingScores(records, now).map((week, i, all) => ({
        key: week.startKey,
        label: formatMonthDay(dayKeyToMs(week.startKey)),
        detail: formatDayRange(dayKeyToMs(week.startKey), dayKeyToMs(week.endKey)),
        score: week.score,
        sessions: week.sessions,
        minutes: week.minutes,
        skillCount: week.skillCount,
        isCurrent: i === all.length - 1,
      }));
    }
    return summary.days.map((day, i, all) => {
      const ms = dayKeyToMs(day.dayKey);
      return {
        key: day.dayKey,
        label: range === 0 ? weekdayInitial(ms) : formatMonthDay(ms),
        detail: formatDayDetail(ms),
        score: day.score,
        sessions: day.sessions,
        minutes: day.minutes,
        skillCount: day.skillCount,
        isCurrent: i === all.length - 1,
      };
    });
  }, [range, records, now, summary.days]);

  // All-time bests. Every value derives from the stored skills, so records
  // written before the score definition changed still rank correctly.
  const recordRows = useMemo<RecordRow[]>(() => {
    if (records.length === 0) return [];
    const t = totals(records);
    const longest = longestStreakRange(records);
    const best = bestSession(records);
    const bestScore = best ? speakingScore(best) : null;
    const rows: RecordRow[] = [];
    // Effort rows come first and stand alone: a history of only unscorable
    // sessions still practiced, and previously an absent best hid the total
    // practice row along with it.
    if (best && bestScore != null) {
      rows.push({
        icon: StarIcon,
        title: 'Best score',
        // `contentTitle` is snapshotted on the record, so this survives deleting
        // a custom passage and is right for drills too, which the built-ins-only
        // `getPassage` lookup got wrong.
        caption: `${best.contentTitle ?? MODE_LABELS[best.mode]} · ${timeAgo(
          best.completedAt,
          now,
        )}`,
        isScore: true,
        value: bestScore,
      });
    }
    if (longest) {
      rows.push({
        icon: FireIcon,
        title: 'Longest streak',
        caption: formatDayRange(longest.startMs, longest.endMs),
        value: longest.length,
        unit: longest.length === 1 ? 'day' : 'days',
      });
    }
    rows.push({
      icon: Clock01Icon,
      title: 'Total practice',
      caption: `across ${t.sessions} ${t.sessions === 1 ? 'session' : 'sessions'}`,
      value: t.minutes >= 60 ? Math.round(t.minutes / 60) : Math.round(t.minutes),
      unit: t.minutes >= 60 ? 'h' : 'min',
    });
    return rows;
  }, [records, now]);

  const header = (
    <>
      <IntroReveal order={0} fade={false} style={styles.chromeRow}>
        <HeaderActions streak={summary.streak} />
      </IntroReveal>
      <IntroReveal order={0} style={styles.titleBlock}>
        <ThemedText variant="display" tone="primary" numberOfLines={2}>
          Analytics
        </ThemedText>
        <ThemedText variant="subhead" weight="regular" tone="secondary">
          How your speaking is moving
        </ThemedText>
      </IntroReveal>
      <IntroReveal order={1} style={styles.control}>
        <SegmentedControl segments={RANGES} selectedIndex={range} onChange={setRange} />
      </IntroReveal>
    </>
  );

  const scroll = {
    onScroll,
    scrollEventThrottle: 16,
    showsVerticalScrollIndicator: false,
    style: { flex: 1 },
    contentContainerStyle: {
      paddingTop: insets.top + spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingBottom: TAB_BAR_SCROLL_INSET,
    },
  } as const;

  if (summary.empty) {
    return (
      <AtmosphereCanvas>
      <Animated.ScrollView {...scroll}>
        {header}
        <IntroReveal order={2} fade={false} style={styles.sectionCard}>
          <EmptyStateCard
            icon={AnalyticsUpIcon}
            title="No analytics yet"
            subtitle="Finish a practice session and your speaking score, skills, and records will show up here."
          />
        </IntroReveal>
      </Animated.ScrollView>
      </AtmosphereCanvas>
    );
  }

  return (
    <AtmosphereCanvas>
    <Animated.ScrollView {...scroll}>
      {header}

      <IntroReveal order={2} fade={false} style={styles.sectionCard}>
        <SpeakingScoreCard
          score={summary.score}
          delta={summary.scoreDelta ?? undefined}
          deltaSuffix={DELTA_SUFFIXES[range]}
          points={chartPoints}
          note={range === 2 ? 'Each point is one week.' : undefined}
        />
      </IntroReveal>

      <IntroReveal order={3}>
        <SectionHeader title="Skills" subtitle="How each part of your speaking is trending" />
      </IntroReveal>
      <IntroReveal order={4} fade={false} style={styles.sectionCard}>
        <SkillCard
          skills={summary.skills}
          captions={summary.captions}
          deltas={summary.skillDeltas}
        />
      </IntroReveal>

      <IntroReveal order={5}>
        <SectionHeader
          title="Effort"
          subtitle={
            range === 2
              ? `Across ${windowDays} days of practice`
              : `Last ${windowDays} days · words mastered is all-time`
          }
        />
      </IntroReveal>
      <IntroReveal order={6} fade={false} style={styles.sectionCard}>
        {/* Identity meshes in a 2×2 grid. Color is each counter's identity, never a grade. */}
        <View style={styles.counterGroup}>
          <View style={styles.counterRow}>
            <MetricCapsule
              family="minutes"
              label="Practice time"
              value={
                range === 2 && summary.minutes >= 60
                  ? Math.round(summary.minutes / 60)
                  : summary.minutes
              }
              unit={range === 2 && summary.minutes >= 60 ? 'h' : 'min'}
              delta={summary.minutesDelta ?? undefined}
              deltaSuffix="min"
              style={styles.capsule}
            />
            <MetricCapsule
              family="sessions"
              label="Sessions"
              value={summary.sessions}
              unit={summary.sessions === 1 ? 'run' : 'runs'}
              delta={summary.sessionsDelta ?? undefined}
              style={styles.capsule}
            />
          </View>
          <View style={styles.counterRow}>
            <MetricCapsule
              family="streak"
              label="Day streak"
              value={summary.streak}
              unit={summary.streak === 1 ? 'day' : 'days'}
              delta={summary.streakDelta ?? undefined}
              deltaSuffix={Math.abs(summary.streakDelta ?? 0) === 1 ? 'day' : 'days'}
              style={styles.capsule}
            />
            <MetricCapsule
              family="mastered"
              label="Words mastered"
              value={mastered}
              unit={mastered === 1 ? 'word' : 'words'}
              style={styles.capsule}
            />
          </View>
        </View>
      </IntroReveal>

      {recordRows.length > 0 && (
        <>
          <IntroReveal order={7}>
            <SectionHeader title="Records" subtitle="Your all-time bests" />
          </IntroReveal>
          <IntroReveal order={8} fade={false} style={styles.sectionCard}>
            <RecordsCard rows={recordRows} />
          </IntroReveal>
        </>
      )}
    </Animated.ScrollView>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  chromeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  titleBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  control: {
    marginTop: spacing.xl,
  },
  sectionCard: {
    marginTop: spacing.md,
  },
  counterGroup: {
    gap: spacing.md,
  },
  counterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  capsule: {
    flex: 1,
  },
});
