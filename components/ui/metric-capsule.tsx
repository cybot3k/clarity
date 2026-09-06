import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { DeltaPill } from '@/components/metrics/delta-pill';
import { spacing } from '@/constants/theme';

import { AtmosphereSurface } from './atmosphere-surface';
import { LedNumber } from './led-number';
import { ThemedText } from './themed-text';

export type MetricFamily = 'minutes' | 'sessions' | 'streak' | 'mastered';

export type MetricCapsuleProps = {
  family: MetricFamily;
  label: string;
  value: number;
  unit: string;
  delta?: number;
  deltaSuffix?: string;
  style?: StyleProp<ViewStyle>;
};

/** Color-coded stadium: identity mesh, LED value, dotted delta. No icon. */
export function MetricCapsule({
  family,
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  style,
}: MetricCapsuleProps) {
  return (
    <AtmosphereSurface mesh={family} radius="full" dotted style={[styles.card, style]}>
      <View style={styles.header}>
        <ThemedText variant="caption" tone="onAtmosphere" numberOfLines={1} style={styles.label}>
          {label}
        </ThemedText>
        {delta != null ? <DeltaPill delta={delta} suffix={deltaSuffix} hideZero /> : null}
      </View>
      <LedNumber value={value} size="md" unit={unit} />
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    flexShrink: 1,
  },
});
