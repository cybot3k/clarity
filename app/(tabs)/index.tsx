import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMemo, useState } from 'react';

import { HeaderActions } from '@/components/header-actions';
import { GoalRow } from '@/components/home/goal-row';
import { PassageRail } from '@/components/home/passage-rail';
import { ProgressRail } from '@/components/home/progress-rail';
import { IntroReveal } from '@/components/splash';
import { WeeklyProgress } from '@/components/weekly-progress';
import {
  AtmosphereCanvas,
  GlassSurface,
  SectionHeader,
  SpeechMark,
  ThemedText,
} from '@/components/ui';
import { WordsToMaster } from '@/components/words-to-master';
import { PASSAGES } from '@/constants/passages';
import { spacing } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useSessionRecords, useDerivedStats, useWords } from '@/hooks/use-session-history';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/hooks/use-settings';
import { useSpeakingSummary } from '@/hooks/use-speaking-summary';
import { useTheme } from '@/hooks/use-theme';
import { minutesOnDay, totals } from '@/lib/stats';
import { generateWordPracticePassage } from '@/services/practice-generation';
import { speakWord } from '@/services/word-pronunciation';

// Dock bottom offset (18) + bar height (64) + spacing.xxxl (32) — replaces TAB_BAR_SCROLL_INSET for this screen.
const HOME_DOCK_INSET = 114;
/** CH-01 row height: one control module. */
const CHROME_HEIGHT = 48;
/** CH-01: the SpeechMark is 64 × 20. */
const MARK_HEIGHT = 20;

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

  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { colors } = useTheme();

  const now = useNow();
  const stats = useDerivedStats();
  const records = useSessionRecords();
  const { goalMinutes } = useSettings();
  // The same rolling-7-day figures Analytics leads with, so the two tabs can
  // never disagree about this week.
  const summary = useSpeakingSummary();
  const percent = Math.round(stats.todayProgress * 100);
  const minutesToday = Math.round(minutesOnDay(records, now));
  const startPractice = () => router.push('/practice');
  const greet = greeting(now);

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
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: HOME_DOCK_INSET,
      }}>
      {/* Chrome scrolls away with the page. Glass slots keep fade={false} —
          glass breaks under animated opacity. SpeechMark hides itself from
          accessibility. */}
      <IntroReveal order={0} fade={false} style={styles.chromeRow}>
        <SpeechMark color={colors.onAtmosphere} height={MARK_HEIGHT} />
        <HeaderActions streak={stats.streak} />
      </IntroReveal>
      <IntroReveal order={0} style={styles.greeting}>
        <ThemedText variant="largeTitle" weight="regular" tone="primary" accessibilityRole="header">
          {greet}
          {'\n'}
          <ThemedText variant="largeTitle" weight="regular" tone="secondary">
            {percent > 0 ? `${percent}% of today's speaking goal` : 'A short session is enough to start'}
          </ThemedText>
        </ThemedText>
      </IntroReveal>
      <IntroReveal order={1} style={styles.goal}>
        <GoalRow
          minutesToday={minutesToday}
          goalMinutes={goalMinutes}
          todayProgress={stats.todayProgress}
          onStart={startPractice}
        />
      </IntroReveal>

      {/* The one sheet: glass bleeds to x 8 and carries its own 12 padding, so
          its text stays on the page column. The glass is an absolute sibling of
          the content, never its parent, so nothing inside may be glass. */}
      <IntroReveal order={2} fade={false} style={styles.sheet}>
        <GlassSurface
          radius="hero"
          tint="strong"
          style={[
            StyleSheet.absoluteFill,
            // The sheet bleeds past the scroll content's end (through the dock
            // inset and a screen of overscroll), so its bottom corners stay
            // square and are never seen.
            { bottom: -(HOME_DOCK_INSET + windowHeight) },
            styles.sheetGlass,
          ]}
        />
        <View style={styles.sheetContent}>
          <IntroReveal order={3}>
            <WeeklyProgress
              now={now}
              todayProgress={stats.todayProgress}
              history={stats.weeklyHistory}
            />
          </IntroReveal>
          {/* SectionHeader owns the 32 between sections. */}
          <IntroReveal order={4}>
            <SectionHeader title="For you" subtitle="Sharpen your speaking with these passages" />
          </IntroReveal>
          <IntroReveal order={5} fade={false} style={styles.sectionBody}>
            <PassageRail
              items={PASSAGES}
              records={records}
              skillProfile={stats.skillProfile}
              onStart={(item) => router.push(`/session/${item.id}`)}
            />
          </IntroReveal>
          <IntroReveal order={6}>
            <SectionHeader title="Your progress" subtitle="Where your speaking stands right now" />
          </IntroReveal>
          <IntroReveal order={7} fade={false} style={styles.sectionBody}>
            <ProgressRail
              hasRecords={records.length > 0}
              score={summary.score}
              scoreDelta={summary.scoreDelta ?? null}
              totalMinutes={progress?.totalMinutes ?? 0}
              totalSessions={progress?.totalSessions ?? 0}
              longestStreak={progress?.longestStreak ?? 0}
              onOpenAnalytics={() => router.navigate('/analytics')}
            />
          </IntroReveal>
          {toMaster.length > 0 && (
            <>
              <IntroReveal order={8}>
                <SectionHeader
                  title="Words to master"
                  subtitle="The ones that trip you up most often"
                />
              </IntroReveal>
              <IntroReveal order={9} style={styles.sectionBody}>
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
        </View>
      </IntroReveal>
    </Animated.ScrollView>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  chromeRow: {
    height: CHROME_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    marginTop: spacing.xxxxl,
  },
  goal: {
    marginTop: spacing.xxl,
  },
  sheet: {
    marginTop: spacing.xxxl,
    marginHorizontal: -spacing.md,
  },
  sheetGlass: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sheetContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  // SectionHeader's subtitle carries a 4 bottom margin; 8 more lands a
  // section's body 12 under its subtitle.
  sectionBody: {
    marginTop: spacing.sm,
  },
});
