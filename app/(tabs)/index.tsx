import {
  AnalyticsUpIcon,
  BookOpen01Icon,
  Calendar03Icon,
  TextCheckIcon,
} from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMemo, useState } from 'react';

import { HeaderActions } from '@/components/header-actions';
import { HomeSheet, SheetSection } from '@/components/home/home-sheet';
import { PassageCards } from '@/components/home/passage-cards';
import { ProgressCards } from '@/components/home/progress-cards';
import { TodayGoal } from '@/components/home/today-goal';
import { TroubleWords } from '@/components/home/trouble-words';
import { WeekRow } from '@/components/home/week-row';
import { IntroReveal } from '@/components/splash';
import { AtmosphereCanvas, SpeechMark, ThemedText } from '@/components/ui';
import { PASSAGES } from '@/constants/passages';
import { spacing } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useNow } from '@/hooks/use-now';
import { useDerivedStats, useSessionRecords, useWords } from '@/hooks/use-session-history';
import { useSettings } from '@/hooks/use-settings';
import { useSpeakingSummary } from '@/hooks/use-speaking-summary';
import { useTheme } from '@/hooks/use-theme';
import { minutesOnDay, totals } from '@/lib/stats';
import { generateWordPracticePassage } from '@/services/practice-generation';
import { speakWord } from '@/services/word-pronunciation';

/** Clears the floating dock: its bottom offset (18) + height (64) + spacing.xxxl (32). */
const DOCK_INSET = 114;
/** Top bar height: one control module. */
const BAR_HEIGHT = 48;
/** The SpeechMark wordmark height in the top bar. */
const MARK_HEIGHT = 20;

/** The time of day is the whole greeting; the account name belongs to Settings. */
function greeting(now: number) {
  const hour = new Date(now).getHours();
  if (hour < 5) return 'Good Evening';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Home, composed like the destination dashboard (S1): an open pearl canvas
 * with the top bar, a two-line greeting, and one hero readout; then a white
 * sheet that carries the week, the passage cards, progress, and trouble words.
 * The dock floats over the sheet.
 */
export default function HomeScreen() {
  // The launch route: its mark is what EAS Observe records as the app's TTI.
  // History comes from the synchronous store, so the first render is the
  // finished screen.
  useMarkInteractive();

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const now = useNow();
  const stats = useDerivedStats();
  const records = useSessionRecords();
  const { goalMinutes } = useSettings();
  // The rolling-7-day figures Analytics leads with, so the two tabs agree.
  const summary = useSpeakingSummary();
  const { toMaster } = useWords(5);
  const percent = Math.round(stats.todayProgress * 100);

  // Only real history — never demo data. With nothing recorded, the progress
  // section says so instead of inventing numbers.
  const progress = useMemo(() => {
    if (records.length === 0) return null;
    const t = totals(records);
    return {
      totalMinutes: Math.round(t.minutes),
      totalSessions: t.sessions,
      longestStreak: t.longestStreak,
    };
  }, [records]);

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
    <AtmosphereCanvas mode="pearl">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.xl,
          paddingBottom: DOCK_INSET,
        }}>
        <IntroReveal order={0} style={styles.bar}>
          <SpeechMark color={colors.foreground} height={MARK_HEIGHT} />
          <HeaderActions streak={stats.streak} />
        </IntroReveal>

        <IntroReveal order={0} style={styles.greeting}>
          <ThemedText variant="largeTitle" weight="regular" tone="primary" accessibilityRole="header">
            {greeting(now)}
            {'\n'}
            <ThemedText variant="largeTitle" weight="regular" tone="tertiary">
              {percent > 0 ? `${percent}% of today's speaking goal` : 'A short session is enough to start'}
            </ThemedText>
          </ThemedText>
        </IntroReveal>

        <IntroReveal order={1} style={styles.goal}>
          <TodayGoal
            minutesToday={Math.round(minutesOnDay(records, now))}
            goalMinutes={goalMinutes}
            todayProgress={stats.todayProgress}
            onStart={() => router.push('/practice')}
          />
        </IntroReveal>

        <IntroReveal order={2} style={styles.sheet}>
          <HomeSheet>
            <SheetSection
              first
              icon={Calendar03Icon}
              title="This week"
              trailing={
                <ThemedText variant="footnote" weight="regular" tone="secondary">
                  {`${percent}% today`}
                </ThemedText>
              }>
              <WeekRow now={now} todayProgress={stats.todayProgress} history={stats.weeklyHistory} />
            </SheetSection>

            <SheetSection
              icon={BookOpen01Icon}
              title="For you"
              subtitle="Sharpen your speaking with these passages">
              <PassageCards
                items={PASSAGES}
                records={records}
                skillProfile={stats.skillProfile}
                onStart={(item) => router.push(`/session/${item.id}`)}
              />
            </SheetSection>

            <SheetSection
              icon={AnalyticsUpIcon}
              title="Your progress"
              subtitle="Where your speaking stands right now">
              <ProgressCards
                hasRecords={progress != null}
                score={summary.score}
                scoreDelta={summary.scoreDelta ?? null}
                totalMinutes={progress?.totalMinutes ?? 0}
                totalSessions={progress?.totalSessions ?? 0}
                longestStreak={progress?.longestStreak ?? 0}
                onOpenAnalytics={() => router.navigate('/analytics')}
              />
            </SheetSection>

            {toMaster.length > 0 ? (
              <SheetSection
                icon={TextCheckIcon}
                title="Words to master"
                subtitle="The ones that trip you up most often">
                <TroubleWords
                  words={toMaster}
                  onPracticeAll={handlePracticeAll}
                  generating={generatingPractice}
                  onSpeak={handleSpeak}
                  speakingWord={speakingWord}
                />
              </SheetSection>
            ) : null}
          </HomeSheet>
        </IntroReveal>
      </Animated.ScrollView>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    marginTop: spacing.xxxl,
  },
  goal: {
    marginTop: spacing.xxxl,
  },
  sheet: {
    marginTop: spacing.xxxl,
  },
});
