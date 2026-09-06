import { StyleSheet, View } from 'react-native';

import { DeltaLabel } from '@/components/metrics/delta-label';
import { DottedStroke } from '@/components/ui/dotted-stroke';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DeltaPillProps = {
  delta: number;
  suffix?: string;
  hideZero?: boolean;
};

/**
 * Destination dotted delta capsule. Color rule stays in DeltaLabel:
 * improving → positive, flat/declining → tertiary, never red.
 */
export function DeltaPill({ delta, suffix, hideZero }: DeltaPillProps) {
  const { colors } = useTheme();
  if (delta === 0 && hideZero) return null;

  const improving = delta > 0;

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: improving ? colors.positiveBg : colors.card },
      ]}>
      <DottedStroke color={colors.dottedStrokeOnFrost} radius={radius.full} />
      <DeltaLabel delta={delta} suffix={suffix} hideZero={hideZero} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
});
