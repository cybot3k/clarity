import { PlayIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Fragment } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { GlassSurface, PrimaryButton, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Row inset. Wider on the left than the card's own padding so the word column
 * lines up with the header summary above it. */
const ROW_INSET = spacing.xl;

/** Speaker button. 36pt of glyph inside a 44pt hit area via `hitSlop`. */
const SPEAKER_SIZE = 36;

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

/** "Words to master" body: a frosted card whose header pairs a count summary
 * with a "Practice all" pill, over one row per trouble word (quiet count +
 * a tap-to-hear speaker). */
export function WordsToMaster({
  words,
  onPracticeAll,
  generating = false,
  onSpeak,
  speakingWord,
}: WordsToMasterProps) {
  const { colors } = useTheme();

  const handlePracticeAll = () => {
    onPracticeAll();
  };

  const handleSpeak = (word: string) => {
    Haptics.selectionAsync();
    onSpeak?.(word);
  };

  return (
    <View style={styles.card}>
      <GlassSurface radius="lg" tint="strong" style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <ThemedText variant="subhead" weight="regular" tone="secondary" style={styles.summary}>
          <ThemedText variant="subhead" weight="semibold" tone="primary">
            {words.length}
          </ThemedText>
          {words.length === 1 ? ' word needs work' : ' words need work'}
        </ThemedText>
        <PrimaryButton
          title={generating ? 'Creating passage' : 'Practice all'}
          icon={generating ? undefined : PlayIcon}
          variant="solid"
          size="md"
          disabled={generating}
          onPress={handlePracticeAll}
          style={styles.practiceAll}
        />
      </View>

      {words.map((item, i) => (
        <Fragment key={item.word}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
          <View style={styles.row}>
            <View style={styles.wordGroup}>
              <ThemedText variant="title3" weight="regular" tone="primary" style={styles.word} numberOfLines={1}>
                {item.word}
              </ThemedText>
              <ThemedText variant="footnote" tone="tertiary">
                {item.count}×
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Hear ${item.word}`}
              accessibilityState={{ busy: speakingWord === item.word }}
              disabled={speakingWord === item.word}
              onPress={() => handleSpeak(item.word)}
              hitSlop={spacing.sm}
              style={({ pressed }) => [
                styles.speaker,
                {
                  backgroundColor: colors.fillTranslucent,
                  borderColor: colors.frostRim,
                },
                pressed && styles.pressedStrong,
              ]}>
              {speakingWord === item.word ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <HugeiconsIcon icon={VolumeHighIcon} size={19} color={colors.foreground} />
              )}
            </Pressable>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingLeft: ROW_INSET,
    paddingRight: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  summary: {
    flexShrink: 1,
  },
  practiceAll: {
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: ROW_INSET,
    paddingRight: spacing.md,
    paddingVertical: spacing.md,
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
    width: SPEAKER_SIZE,
    height: SPEAKER_SIZE,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_INSET,
  },
  pressedStrong: {
    opacity: 0.6,
  },
});
