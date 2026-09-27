import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

/** Button heights. Both clear the 44pt minimum; `lg` is the screen commit. */
const HEIGHTS = { md: 54, lg: 60 } as const;

type ButtonBase = {
  title: string;
  onPress: () => void;
  size?: keyof typeof HEIGHTS;
  disabled?: boolean;
  /** Fires a medium impact on press. On by default. */
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type PrimaryButtonProps = ButtonBase &
  (
    | { variant?: 'solid' | 'frost'; icon?: IconSvgElement }
    | { variant: 'knob'; icon: IconSvgElement }
  );

/**
 * The screen's committing action. `solid` is the inverse fill, `frost` is
 * glass (illegal inside another GlassView), and `knob` is the one lime on
 * the screen. The knob does not slide. Pressed opacity applies only when
 * this instance is not rendering liquid glass.
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
  const height = HEIGHTS[size];
  const iconSize = size === 'lg' ? 22 : 20;
  const glass = variant === 'frost' && !disabled && isLiquidGlassAvailable();
  const knob = variant === 'knob' && !disabled && icon != null;

  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  let body;
  if (knob && icon != null) {
    const diameter = height - 2 * spacing.sm;
    body = (
      <View
        style={[
          styles.knobTrack,
          { height, backgroundColor: colors.ctaTrack, paddingLeft: spacing.sm },
        ]}>
        <View
          style={[
            styles.knob,
            { width: diameter, height: diameter, backgroundColor: colors.accent },
          ]}>
          <HugeiconsIcon icon={icon} size={iconSize} color={colors.onAccent} />
        </View>
        <View style={styles.knobLabel}>
          {/* `ctaLabel` has no tone. The color is the token, not a hex. */}
          <ThemedText variant="headline" style={{ color: colors.ctaLabel }}>
            {title}
          </ThemedText>
        </View>
      </View>
    );
  } else if (variant === 'frost' && !disabled) {
    const frostBody = (
      <>
        {icon != null ? (
          <HugeiconsIcon icon={icon} size={iconSize} color={colors.foreground} />
        ) : null}
        <ThemedText variant="headline">{title}</ThemedText>
      </>
    );
    body = glass ? (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        tintColor={colors.glassTintStrong}
        style={[styles.fill, { height }]}>
        {frostBody}
      </GlassView>
    ) : (
      <View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: colors.frostFallback,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.frostRim,
          },
        ]}>
        {frostBody}
      </View>
    );
  } else {
    body = (
      <View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: disabled ? colors.inverseSurfaceMuted : colors.inverseSurface,
          },
        ]}>
        {icon != null ? (
          <HugeiconsIcon icon={icon} size={iconSize} color={colors.inverseLabel} />
        ) : null}
        <ThemedText variant="headline" tone="inverse">
          {title}
        </ThemedText>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [pressed && !glass && styles.pressed, style]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  knobTrack: {
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  knob: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobLabel: {
    flex: 1,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
