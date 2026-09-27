import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AtmosphereSurface, DottedStroke, GlassSurface, SpeechMark, ThemedText } from '@/components/ui';
import { SKILL_LABELS } from '@/constants/metrics';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Passage } from '@/types/session';

/** Wide enough for the speech mark's bars without clipping. */
const THUMB_WIDTH = 76;
const THUMB_HEIGHT = 48;

/** Passage identity, painted from the passage artwork. */
function ArtworkThumb({ artwork }: { artwork: Passage['artwork'] }) {
  const { colors } = useTheme();
  return (
    <AtmosphereSurface
      mesh="artwork"
      artwork={artwork}
      radius="sm"
      style={[styles.thumb, { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.frostRim }]}>
      <SpeechMark color={colors.onArtwork} height={spacing.lg} />
    </AtmosphereSurface>
  );
}

export type PassageGroupProps = {
  children: ReactNode;
};

/** One frost sheet for a run of passage rows. Dividers start under the text. */
export function PassageGroup({ children }: PassageGroupProps) {
  const { colors } = useTheme();
  const items = Children.toArray(children);

  return (
    <GlassSurface radius="lg" tint="strong" style={styles.group}>
      {items.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          ) : null}
          {child}
        </Fragment>
      ))}
    </GlassSurface>
  );
}

export type PassageRowProps = {
  passage: Passage;
  onPress: (passage: Passage) => void;
  onLongPress?: (passage: Passage) => void;
};

/** Chromeless library row. The frost sheet owns the surface; the row is the press. */
export function PassageRow({ passage, onPress, onLongPress }: PassageRowProps) {
  const skills = (passage.skills ?? []).map((s) => SKILL_LABELS[s]).join(' · ');

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(passage);
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      onLongPress={onLongPress ? () => onLongPress(passage) : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
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
    </Pressable>
  );
}

/** Last row of a group, and the empty state when the group has no passages. */
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
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        <DottedStroke color={colors.outline} radius={radius.sm} />
        <HugeiconsIcon icon={PlusSignIcon} size={22} color={colors.foreground} strokeWidth={1.5} />
      </View>
      <View style={styles.textCol}>
        <ThemedText variant="headline">Add your own</ThemedText>
        <ThemedText variant="footnote" weight="regular" tone="secondary">
          Paste any text, speech, or transcript
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.lg + THUMB_WIDTH + spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  thumb: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
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
