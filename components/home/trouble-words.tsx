import { PlayIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Fragment } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ControlDisc, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One control module: the summary row, the "Practice all" pill, and each speaker disc. */
const CONTROL = 48;
/** Glyph on a 48 control. */
const ICON_SIZE = 20;
/** List row minimum height. */
const ROW_MIN_HEIGHT = 72;

export type TroubleWord = { word: string; count: number };

export type TroubleWordsProps = {
  words: readonly TroubleWord[];
  onPracticeAll: () => void;
  /** True while the practice passage is being generated. */
  generating: boolean;
  onSpeak: (word: string) => void;
  /** The word whose clip is loading; its disc shows a spinner. */
  speakingWord: string | null;
};

/**
 * "Words to master", straight on the sheet: a summary line with the solid
 * "Practice all" pill on the right, over one row per word with a tinted
 * speaker disc (the catalog's list rhythm, S2).
 */
export function TroubleWords({
  words,
  onPracticeAll,
  generating,
  onSpeak,
  speakingWord,
}: TroubleWordsProps) {
  const { colors } = useTheme();

  return (
    <View>
      <View style={styles.summary}>
        <ThemedText variant="subhead" weight="regular" tone="secondary" style={styles.count}>
          <ThemedText variant="subhead" weight="regular" tone="primary" style={styles.tabular}>
            {words.length}
          </ThemedText>
          {words.length === 1 ? ' word needs work' : ' words need work'}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: generating, busy: generating }}
          disabled={generating}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPracticeAll();
          }}
          style={({ pressed }) => [
            styles.pill,
            { backgroundColor: colors.inverseSurface },
            pressed && styles.pressed,
          ]}>
          {generating ? (
            <ActivityIndicator size="small" color={colors.inverseLabel} />
          ) : (
            <HugeiconsIcon icon={PlayIcon} size={ICON_SIZE} color={colors.inverseLabel} />
          )}
          <ThemedText variant="subhead" weight="medium" tone="inverse" numberOfLines={1}>
            {generating ? 'Creating passage' : 'Practice all'}
          </ThemedText>
        </Pressable>
      </View>
      {words.map((item, i) => (
        <Fragment key={item.word}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
          <View style={styles.row}>
            <View style={styles.word}>
              <ThemedText
                variant="title3"
                weight="regular"
                tone="primary"
                numberOfLines={1}
                style={styles.wordText}>
                {item.word}
              </ThemedText>
              <ThemedText variant="footnote" weight="regular" tone="secondary" style={styles.tabular}>
                {`${item.count}×`}
              </ThemedText>
            </View>
            <ControlDisc
              icon={VolumeHighIcon}
              fill="tinted"
              accessibilityLabel={`Hear ${item.word}`}
              busy={speakingWord === item.word}
              onPress={() => onSpeak(item.word)}
            />
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    height: CONTROL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  count: {
    flexShrink: 1,
  },
  pill: {
    height: CONTROL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xl,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.85,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  word: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  wordText: {
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
