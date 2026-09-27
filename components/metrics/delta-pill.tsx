import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ThemedText, type TextTone } from '@/components/ui/themed-text';
import { radius, spacing, type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DeltaPillProps = {
  delta: number | null;
  suffix?: string;
  hideZero?: boolean;
  /** `surface` is canvas, card, or frost. Default `surface`. */
  on?: 'surface' | 'mesh';
};

/** Same chunky arrow as DeltaLabel, so the pill reads at caption size. */
function Arrow({ color, down, size }: { color: string; down: boolean; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Path
        d={
          down
            ? 'M6 10 L2 5 L4.5 5 L4.5 2 L7.5 2 L7.5 5 L10 5 Z'
            : 'M6 2 L10 7 L7.5 7 L7.5 10 L4.5 10 L4.5 7 L2 7 Z'
        }
        fill={color}
      />
    </Svg>
  );
}

/**
 * Improving is green. Flat or declining is quiet ink, never red, and never
 * colored by the score. On a mesh the pill is a `card` bubble.
 */
export function DeltaPill({ delta, suffix, hideZero, on = 'surface' }: DeltaPillProps) {
  const { colors } = useTheme();
  if (delta == null) return null;
  if (delta === 0 && hideZero) return null;

  const improving = delta > 0;
  const mesh = on === 'mesh';
  const tone: TextTone = improving ? 'positive' : mesh ? 'secondary' : 'tertiary';
  const ink = improving ? colors.positive : mesh ? colors.secondary : colors.tertiary;
  const arrowSize = Math.round(type.caption.fontSize * 0.92);

  return (
    <View
      style={[
        styles.pill,
        mesh
          ? { backgroundColor: colors.card }
          : improving
            ? { backgroundColor: colors.positiveBg }
            : {
                backgroundColor: 'transparent',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.outline,
              },
      ]}>
      <Arrow color={ink} down={!improving} size={arrowSize} />
      <ThemedText variant="caption" weight="semibold" tone={tone} numberOfLines={1}>
        {Math.abs(delta)}
        {suffix ? ` ${suffix}` : ''}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    // Contract height, not a spacing step.
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
