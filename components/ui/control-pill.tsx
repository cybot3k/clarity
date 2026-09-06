import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ControlPillVariant = 'frost' | 'solid';

const HEIGHTS = { md: 54, lg: 60 } as const;

export type ControlPillProps = {
  variant?: ControlPillVariant;
  size?: keyof typeof HEIGHTS;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Shared 54/60 capsule. Frost is GlassView + glassTintStrong (illegal inside
 * another GlassView). Solid is today's inverseSurface tint.
 */
export function ControlPill({
  variant = 'solid',
  size = 'lg',
  disabled = false,
  children,
  style,
}: ControlPillProps) {
  const { colors } = useTheme();
  const hasGlass = isLiquidGlassAvailable();
  const shape: ViewStyle = {
    height: HEIGHTS[size],
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (variant === 'frost') {
    if (hasGlass && !disabled) {
      return (
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          tintColor={colors.glassTintStrong}
          style={[shape, style]}>
          {children}
        </GlassView>
      );
    }
    return (
      <View
        style={[
          shape,
          { backgroundColor: disabled ? colors.inverseSurfaceMuted : colors.frostFallback },
          style,
        ]}>
        {children}
      </View>
    );
  }

  if (hasGlass && !disabled) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        tintColor={colors.inverseSurface}
        style={[shape, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        shape,
        { backgroundColor: disabled ? colors.inverseSurfaceMuted : colors.inverseSurface },
        style,
      ]}>
      {children}
    </View>
  );
}
