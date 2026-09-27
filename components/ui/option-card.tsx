import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { isLiquidGlassAvailable } from 'expo-glass-effect';

import { radius as radiusTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { GlassSurface } from './glass-surface';

/** Selection disc. A single control at 24pt is a circle. */
export const SELECTION_MARK_SIZE = 24;
/** Optical ring weight: 1.5pt reads on a 24pt disc, where a hairline disappears. */
const SELECTION_RING = 1.5;
const SELECTION_TICK = 14;

export type SelectionMarkProps = {
  selected: boolean;
  /** `accent` is the screen's one lime. `inverse` keeps a screen lime-free. */
  tone?: 'accent' | 'inverse';
};

/** The one selection glyph for onboarding, settings, and the paywall. */
export function SelectionMark({ selected, tone = 'accent' }: SelectionMarkProps) {
  const { colors } = useTheme();
  const ring = {
    width: SELECTION_MARK_SIZE,
    height: SELECTION_MARK_SIZE,
    borderRadius: radiusTokens.full,
  };
  if (!selected) {
    return (
      <View
        accessible={false}
        style={[ring, { borderWidth: SELECTION_RING, borderColor: colors.track }]}
      />
    );
  }
  return (
    <View
      accessible={false}
      style={[
        ring,
        {
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tone === 'inverse' ? colors.inverseSurface : colors.accent,
        },
      ]}>
      <HugeiconsIcon
        icon={Tick02Icon}
        size={SELECTION_TICK}
        strokeWidth={2}
        color={tone === 'inverse' ? colors.inverseLabel : colors.onAccent}
      />
    </View>
  );
}
export type OptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  /** The row content. The card draws no indicator of its own: the paywall wants
   * it on the left, onboarding on the right, and a `variant` for that is the
   * creep `PrimaryButton` refuses. */
  children: ReactNode;
  accessibilityLabel?: string;
  /** Merged onto the outer Pressable, for margins and min heights. */
  style?: StyleProp<ViewStyle>;
  /** Stadium on the paywall (`full`); squircle on onboarding (`lg`). */
  radius?: keyof typeof radiusTokens;
};

/**
 * One choice in a single-select group: the paywall plans, the onboarding accent,
 * goal, and priority pickers.
 *
 * The content renders INSIDE the interactive glass, the same way `PrimaryButton`
 * does: the native press response scales the material, and the content has to
 * ride along with it. That means children must not hold their own glass
 * (nested glass does not render on iOS 26); today none do. Selection is the
 * child's job (the checkmark), never a border on the surface. The `Pressable`
 * wraps the glass because the material is a native view and the touch target
 * must sit above it.
 */
export function OptionCard({
  selected,
  onSelect,
  children,
  accessibilityLabel,
  style,
  radius = 'lg',
}: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect();
      }}
      style={({ pressed }) => [!isLiquidGlassAvailable() && pressed && styles.pressed, style]}>
      <GlassSurface radius={radius} interactive style={styles.card}>
        {children}
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
