import { StyleSheet, Text, View } from 'react-native';

import { LedNumber } from '@/components/ui';
import { fonts, spacing, type LedSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * A score, rendered the one way the app renders scores: the number in ink with
 * a muted `/100` beside it. Never a percentage — `%` is reserved for goal
 * progress (the daily-goal ring), so using it for a score would collide.
 *
 * The `/100` is sized relative to the value so the pair keeps its proportions
 * from the 19px record row up to the 56px results hero. `size` is a prop rather
 * than a ramp step because this scales with whatever gauge holds it.
 */
export type ScoreValueProps = {
  /** 0–100, or null when the metric has no data yet (renders an em-less dash). */
  value: number | null;
  /** Numeric keeps the legacy SF path; `LedSize` draws the LED. */
  size: number | LedSize;
  /** Defaults to `size * 0.37`, matching the design across every scale. Ignored for LED. */
  maxSize?: number;
  tone?: 'onAtmosphere' | 'ink';
};

export function ScoreValue({ value, size, maxSize, tone }: ScoreValueProps) {
  if (typeof size === 'string') {
    return <LedNumber value={value} size={size} unit="/100" tone={tone} />;
  }

  const { colors } = useTheme();
  const unitSize = maxSize ?? Math.round(size * 0.37);

  if (value == null) {
    return (
      <Text style={[styles.value, { color: colors.tertiary, fontSize: size, letterSpacing: 0 }]}>
        -
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.value,
          { color: colors.foreground, fontSize: size, letterSpacing: size * -0.028 },
        ]}>
        {Math.round(value)}
      </Text>
      <Text style={[styles.max, { color: colors.tertiary, fontSize: unitSize }]}>/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    fontFamily: fonts.heavy,
  },
  max: {
    fontFamily: fonts.semibold,
  },
});
