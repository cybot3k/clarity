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
  value: number | null;
  unit?: string;
  delta?: number | null;
  deltaSuffix?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Identity squircle for a count: label, LED, then a unit slot and mesh delta.
 * The suffix sits under the footer so a ~106pt tile can still show it.
 */
export function MetricCapsule({
  family,
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  style,
}: MetricCapsuleProps) {
  const showPill = delta != null;

  return (
    <AtmosphereSurface mesh={family} radius="xl" style={[styles.card, style]}>
      <ThemedText variant="caption" weight="semibold" tone="onAtmosphereMuted" numberOfLines={1}>
        {label}
      </ThemedText>
      <LedNumber value={value} />
      <View style={styles.footer}>
        <View style={styles.unitSlot}>
          {unit ? (
            <ThemedText variant="caption" tone="onAtmosphereMuted" numberOfLines={1}>
              {unit}
            </ThemedText>
          ) : null}
        </View>
        {showPill ? <DeltaPill delta={delta} on="mesh" /> : null}
      </View>
      {showPill && deltaSuffix ? (
        <ThemedText
          variant="micro"
          tone="onAtmosphereMuted"
          numberOfLines={1}
          style={styles.suffix}>
          {deltaSuffix}
        </ThemedText>
      ) : null}
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  footer: {
    // Contract row: unit and pill share one line. The pill is 24, so this is a floor.
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  unitSlot: {
    flex: 1,
  },
  suffix: {
    textAlign: 'right',
  },
});
