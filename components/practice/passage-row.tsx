import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AtmosphereSurface, SpeechMark, ThemedText } from '@/components/ui';
import { SKILL_LABELS } from '@/constants/metrics';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Passage } from '@/types/session';

/** Wide enough for the speech mark's bars without clipping. */
const THUMB_WIDTH = 76;
const THUMB_HEIGHT = 48;

/** Speech mark in a square bed. Passage identity is the title, not a gradient. */
function ArtworkThumb() {
  const { colors } = useTheme();
  return (
    <View style={[styles.thumb, { backgroundColor: colors.fill }]}>
      <SpeechMark color={colors.accent} height={spacing.lg} />
    </View>
  );
}

export type PassageRowProps = {
  passage: Passage;
  onPress: (passage: Passage) => void;
  onLongPress?: (passage: Passage) => void;
};

/** Library list row: artwork thumb, title, duration + skill chips. The whole
 * row is the pressable glass (content inside, per the PassageCard finding). */
export function PassageRow({ passage, onPress, onLongPress }: PassageRowProps) {
  const { colors } = useTheme();
  const skills = (passage.skills ?? []).map((s) => SKILL_LABELS[s]).join(' · ');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(passage);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      onLongPress={onLongPress ? () => onLongPress(passage) : undefined}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.divider,
          },
        ]}>
        <ArtworkThumb />
        <View style={styles.textCol}>
          <ThemedText variant="headline" numberOfLines={1}>
            {passage.title}
          </ThemedText>
          <ThemedText variant="footnote" weight="regular" tone="secondary" numberOfLines={1}>
            {passage.duration}
            {skills.length > 0 ? `  ·  ${skills}` : ''}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

/** Dashed "add your own" row that opens the passage editor. */
export function AddPassageRow({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => pressed && styles.pressed}>
      <AtmosphereSurface mesh="add" radius="lg" dotted style={styles.addBorder}>
        <View style={styles.addRow}>
          <View style={[styles.thumb, styles.addThumb, { borderColor: colors.outline }]}>
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={22}
              color={colors.foreground}
              strokeWidth={1.5}
            />
          </View>
          <View style={styles.textCol}>
            <ThemedText variant="headline">Add your own</ThemedText>
            <ThemedText variant="footnote" weight="regular" tone="secondary">
              Paste any text, speech, or transcript
            </ThemedText>
          </View>
        </View>
      </AtmosphereSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  addBorder: {
    marginTop: spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addThumb: {
    borderWidth: spacing.xxs,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
