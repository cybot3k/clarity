import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsUpIcon } from '@hugeicons/core-free-icons';
import { useMemo, useState } from 'react';

import { DailyGoalCard } from '@/components/daily-goal-card';
import { EmptyStateCard } from '@/components/empty-state-card';
import { useMinimizeOnScroll } from '@/components/glass-tabs';
import { HeaderActions } from '@/components/header-actions';
import { PassageCarousel } from '@/components/passage-carousel';
import { ProgressCard } from '@/components/progress-card';
import { IntroReveal } from '@/components/splash';
import { WeeklyProgress } from '@/components/weekly-progress';
import { AtmosphereCanvas, SectionHeader, ThemedText } from '@/components/ui';
import { WordsToMaster } from '@/components/words-to-master';
import { PASSAGES } from '@/constants/passages';
import { spacing, TAB_BAR_SCROLL_INSET } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useSessionRecords, useDerivedStats, useWords } from '@/hooks/use-session-history';
import { useNow } from '@/hooks/use-now';
import { useSpeakingSummary } from '@/hooks/use-speaking-summary';
import { totals } from '@/lib/stats';
import { generateWordPracticePassage } from '@/services/practice-generation';
import { speakWord } from '@/services/word-pronunciation';

/** Takes `now` from the shared clock so it refreshes on foreground instead of
 * being frozen at whatever hour the screen first mounted.
 *
 * The time of day is the whole greeting. The account's `displayName` is
 * deliberately NOT in it: the name is for Settings, not for the header. */
function greeting(now: number) {
  const hour = new Date(now).getHours();
  if (hour < 5) return 'Good Evening';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  // The launch route: its mark is what EAS Observe records as the app's TTI.
  // History comes from the synchronous store, so the first render is the
  // finished screen — nothing to wait on beyond the splash.
  useMarkInteractive();

  const onScroll = useMinimizeOnScroll();
  const insets = useSafeAreaInsets();

  const now = useNow();
  const stats = useDerivedStats();
  const records = useSessionRecords();
  // The same rolling-7-day figures Analytics leads with, so the two tabs can
  // never disagree about this week.
  const summary = useSpeakingSummary();
  const percent = Math.round(stats.todayProgress * 100);
  const startPractice = () => router.push('/practice');
  const greet = greeting(now);
  const splitAt = greet.indexOf(' ');
  const lead = splitAt === -1 ? greet : greet.slice(0, splitAt);
  const tail = splitAt === -1 ? '' : greet.slice(splitAt + 1);

  // Progress + trouble words are derived only from real history — never demo
  // data. With nothing recorded yet, `progress` is null and the section shows
  // an empty state that says so rather than inventing numbers.
  const progress = useMemo(() => {
    if (records.length === 0) return null;
    const t = totals(records);
    return {
      totalMinutes: Math.round(t.minutes),
      totalSessions: t.sessions,
      longestStreak: t.longestStreak,
    };
  }, [records]);

  // From the running per-word aggregates, which know whether a word is actually
  // improving. `challengingWords` on a record only ever held a lossy top-5, so it
  // could not tell a word the user has since mastered from one they still miss.
  const { toMaster } = useWords(5);

  const [generatingPractice, setGeneratingPractice] = useState(false);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const handlePracticeAll = async () => {
    if (generatingPractice) return;
    setGeneratingPractice(true);
    try {
      const passage = await generateWordPracticePassage(toMaster.map((w) => w.word));
      router.push(`/session/${passage.id}`);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Passage not created',
        error instanceof Error ? error.message : 'Passage generation is unavailable right now.',
      );
    } finally {
      setGeneratingPractice(false);
    }
  };

  const handleSpeak = async (word: string) => {
    if (speakingWord) return;
    setSpeakingWord(word);
    try {
      await speakWord(word);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Pronunciation unavailable',
        error instanceof Error ? error.message : 'Pronunciation audio is unavailable right now.',
      );
    } finally {
      setSpeakingWord(null);
    }
  };

  return (
    <AtmosphereCanvas>
    <Animated.ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: TAB_BAR_SCROLL_INSET,
      }}>
      {/* Chrome floats; the greeting sits under it. Glass and mesh slots keep
          fade={false} — glass breaks under animated opacity. */}
      <IntroReveal order={0} fade={false} style={styles.chromeRow}>
        <HeaderActions streak={stats.streak} />
      </IntroReveal>
      <IntroReveal order={0} style={styles.titleBlock}>
        <ThemedText variant="display" numberOfLines={2} tone="primary">
          <ThemedText variant="display" tone="numeralFaint">
            {lead}
          </ThemedText>
          {'\n'}
          {tail}
        </ThemedText>
        <ThemedText variant="subhead" weight="regular" tone="secondary">
          {percent > 0 ? (
            <>
              <ThemedText variant="subhead" weight="semibold" tone="primary">
                {`${percent}%`}
              </ThemedText>
              {" of today's speaking goal"}
            </>
          ) : (
            'A short session is enough to start'
          )}
        </ThemedText>
      </IntroReveal>
      <IntroReveal order={1} style={{ marginTop: spacing.xxl }}>
        <WeeklyProgress now={now} todayProgress={stats.todayProgress} history={stats.weeklyHistory} />
      </IntroReveal>
      <IntroReveal order={2} fade={false} style={{ marginTop: spacing.xl }}>
        <DailyGoalCard percent={percent} onStartPractice={startPractice} />
      </IntroReveal>
      <IntroReveal order={3}>
        <SectionHeader title="For you" subtitle="Sharpen your speaking with these passages" />
      </IntroReveal>
      <IntroReveal order={4} fade={false}>
        <PassageCarousel
          items={PASSAGES}
          onStart={(item) => router.push(`/session/${item.id}`)}
          horizontalPadding={spacing.xl}
        />
      </IntroReveal>
      <IntroReveal order={5}>
        <SectionHeader title="Your progress" subtitle="Where your speaking stands right now" />
      </IntroReveal>
      <IntroReveal order={6} fade={false} style={styles.sectionCard}>
        {progress ? (
          <ProgressCard
            {...progress}
            score={summary.score}
            scoreDelta={summary.scoreDelta ?? undefined}
          />
        ) : (
          <EmptyStateCard
            icon={AnalyticsUpIcon}
            title="No progress yet"
            subtitle="Finish your first practice session and your 7-day score, minutes, sessions, and best streak will show up here."
          />
        )}
      </IntroReveal>
      {toMaster.length > 0 && (
        <>
          <IntroReveal order={7}>
            <SectionHeader title="Words to master" subtitle="The ones that trip you up most often" />
          </IntroReveal>
          <IntroReveal order={8} fade={false} style={styles.sectionCard}>
            <WordsToMaster
              words={toMaster}
              onPracticeAll={handlePracticeAll}
              generating={generatingPractice}
              onSpeak={handleSpeak}
              speakingWord={speakingWord}
            />
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  titleBlock: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  // Breathing room between a section's title/description block and its card.
  sectionCard: {
    marginTop: spacing.md,
  },
});
