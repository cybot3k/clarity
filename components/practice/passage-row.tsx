import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AtmosphereSurface, ThemedText } from '@/components/ui';
import { SKILL_LABELS } from '@/constants/metrics';
import { radius, spacing } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';
import type { Passage } from '@/types/session';

const THUMB_SIZE = 56;

/** Small square of the passage's card artwork (same gradient technique as
 * PassageCard, minus the text-legibility bed). */
function ArtworkThumb({ artwork }: { artwork: Passage['artwork'] }) {
  const { reduced } = useAtmospherePrefs();
  return (
    <View style={[styles.thumb, { backgroundColor: artwork.base[0] }]}>
      {reduced ? null : (
        <>
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                experimental_backgroundImage: `linear-gradient(to bottom, ${artwork.base[0]} 0%, ${artwork.base[1]} 100%)`,
              },
            ]}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                experimental_backgroundImage: `radial-gradient(ellipse ${THUMB_SIZE}px ${THUMB_SIZE}px at 100% 0%, ${artwork.blob[0]} 0%, ${artwork.blob[1]} 40%, transparent 100%)`,
              },
            ]}
          />
        </>
      )}
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
      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <ArtworkThumb artwork={passage.artwork} />
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
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    overflow: 'hidden',
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
