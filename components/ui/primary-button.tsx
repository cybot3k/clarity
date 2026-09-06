import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ControlPill, type ControlPillVariant } from './control-pill';
import { ThemedText } from './themed-text';

/** Button heights. Both clear the 44pt minimum touch target comfortably; `lg` is
 * for a screen's single committing action, `md` for one inside a card. */
const HEIGHTS = { md: 54, lg: 60 } as const;

export type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconSvgElement;
  size?: keyof typeof HEIGHTS;
  disabled?: boolean;
  /** Default `solid` — today's inverted look. `frost` is illegal inside GlassView. */
  variant?: ControlPillVariant;
  /** Fires a medium impact on press. On by default: every existing caller wants
   * it, because this button always starts or commits something. */
  haptic?: boolean;
  /** Merged last, so callers can set margins without forking. */
  style?: StyleProp<ViewStyle>;
};

/**
 * The app's one committing action: "Start Practicing", "Start Speaking", "Save".
 * A capsule of inverted glass — near-black on light, near-white on dark.
 *
 * There is no `variant` prop because the app has exactly one button intent
 * today. A second intent (destructive, secondary) adds a variant here rather
 * than a second button component.
 *
 * The glass layer needs `tintColor` rather than a `backgroundColor`, and it
 * can't be nested inside another `GlassView` (nested glass doesn't render on
 * iOS 26) — so a card holding this button must render its own glass as an
 * absolute sibling, not as this button's ancestor.
 */
export function PrimaryButton({
  title,
  onPress,
  icon,
  size = 'lg',
  disabled = false,
  variant = 'solid',
  haptic = true,
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const hasGlass = isLiquidGlassAvailable();
  const ink = variant === 'frost' ? colors.foreground : colors.inverseLabel;

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [!hasGlass && pressed && styles.pressed, style]}>
      <ControlPill variant={variant} size={size} disabled={disabled} style={styles.button}>
        {icon != null && (
          <HugeiconsIcon icon={icon} size={size === 'lg' ? 22 : 20} color={ink} />
        )}
        <ThemedText variant="headline" tone={variant === 'frost' ? 'primary' : 'inverse'}>
          {title}
        </ThemedText>
      </ControlPill>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
});
