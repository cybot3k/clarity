import { PlayIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Fragment } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One control module (layout plan D2): the header row, "Practice all", and the speaker disc. */
const CONTROL = 48;
/** Glyph on a 48 control. */
const ICON_SIZE = 20;
/** List row minimum height (layout plan CO-11). */
const ROW_MIN_HEIGHT = 72;

export type WordToMaster = { word: string; count: number };

export type WordsToMasterProps = {
  words: readonly WordToMaster[];
  onPracticeAll: () => void;
  /** True while the practice passage is being generated; shows a spinner in the pill. */
  generating?: boolean;
  /** Play the word's pronunciation. */
  onSpeak?: (word: string) => void;
  /** The word whose clip is currently loading; its speaker shows a spinner. */
  speakingWord?: string | null;
};

/** "Words to master" body, straight on the sheet (CO-11): a header pairing a
 * count summary with a solid "Practice all" capsule, over one row per trouble
 * word (quiet count + a tap-to-hear speaker disc). */
export function WordsToMaster({
  words,
  onPracticeAll,
  generating = false,
  onSpeak,
  speakingWord,
}: WordsToMasterProps) {
  const { colors } = useTheme();

  const handlePracticeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPracticeAll();
  };

  const handleSpeak = (word: string) => {
    Haptics.selectionAsync();
    onSpeak?.(word);
  };

  return (
    <View>
      <View style={styles.header}>
        <ThemedText variant="subhead" weight="regular" tone="secondary" style={styles.summary}>
          <ThemedText variant="subhead" weight="semibold" tone="primary" style={styles.tabular}>
            {words.length}
          </ThemedText>
          {words.length === 1 ? ' word needs work' : ' words need work'}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: generating, busy: generating }}
          disabled={generating}
          onPress={handlePracticeAll}
          style={({ pressed }) => [
            styles.practiceAll,
            { backgroundColor: colors.inverseSurface },
            pressed && styles.pressed,
          ]}>
          {generating ? (
            <ActivityIndicator size="small" color={colors.inverseLabel} />
          ) : (
            <HugeiconsIcon icon={PlayIcon} size={ICON_SIZE} color={colors.inverseLabel} />
          )}
          <ThemedText variant="headline" weight="medium" tone="inverse" numberOfLines={1}>
            {generating ? 'Creating passage' : 'Practice all'}
          </ThemedText>
        </Pressable>
      </View>

      {words.map((item, i) => (
        <Fragment key={item.word}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
          <View style={styles.row}>
            <View style={styles.wordGroup}>
              <ThemedText
                variant="title3"
                weight="regular"
                tone="primary"
                style={styles.word}
                numberOfLines={1}>
                {item.word}
              </ThemedText>
              <ThemedText variant="footnote" tone="tertiary" style={styles.tabular}>
                {item.count}×
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hear ${item.word}`}
              accessibilityState={{ busy: speakingWord === item.word }}
              disabled={speakingWord === item.word}
              onPress={() => handleSpeak(item.word)}
              style={({ pressed }) => [
                styles.speaker,
                { backgroundColor: colors.fillTranslucent },
                pressed && styles.pressedStrong,
              ]}>
              {speakingWord === item.word ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <HugeiconsIcon icon={VolumeHighIcon} size={ICON_SIZE} color={colors.foreground} />
              )}
            </Pressable>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: CONTROL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summary: {
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  practiceAll: {
    flexShrink: 0,
    height: CONTROL,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  wordGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  word: {
    flexShrink: 1,
  },
  speaker: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.85,
  },
  pressedStrong: {
    opacity: 0.6,
  },
});
