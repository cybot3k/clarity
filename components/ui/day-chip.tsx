import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { atmosphere } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

export type DayChipProps = {
  intent: 'goal' | 'axis';
  letter: string;
  /** goal: completed day. */
  filled?: boolean;
  /** goal: tomorrow. */
  muted?: boolean;
  /** goal: today 0–1. */
  progress?: number;
  /** axis: scrubbed / isCurrent. */
  selected?: boolean;
};

const STROKE = 1.5;

/**
 * Circular day letter. Home `goal` sits on atmosphereCanvas (inverse fill when
 * completed). Analytics `axis` sits on the hero foot (white selected pill).
 */
export function DayChip({ intent, letter, filled, muted, progress, selected }: DayChipProps) {
  const { colors } = useTheme();
  const d = atmosphere.dayChipSize;
  const r = (d - STROKE) / 2;
  const c = d / 2;

  if (intent === 'axis') {
    return (
      <View
        style={[
          styles.chip,
          selected ? { backgroundColor: colors.card } : null,
        ]}>
        {!selected ? (
          <Svg width={d} height={d} style={StyleSheet.absoluteFill}>
            <Circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={colors.foreground}
              strokeWidth={STROKE}
            />
          </Svg>
        ) : null}
        <ThemedText variant="micro">{letter}</ThemedText>
      </View>
    );
  }

  if (muted) {
    return (
      <View style={styles.chip}>
        <ThemedText variant="micro" tone="tertiary">
          {letter}
        </ThemedText>
      </View>
    );
  }

  if (filled) {
    return (
      <View style={[styles.chip, { backgroundColor: colors.inverseSurface }]}>
        <ThemedText variant="micro" tone="inverse">
          {letter}
        </ThemedText>
      </View>
    );
  }

  const p = Math.max(0, Math.min(progress ?? 0, 1));
  const circ = 2 * Math.PI * r;

  return (
    <View style={styles.chip}>
      <Svg width={d} height={d} style={[StyleSheet.absoluteFill, styles.ring]}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={colors.foreground}
          strokeWidth={STROKE}
        />
        {p > 0 ? (
          <Circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={colors.inverseSurface}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${circ * p} ${circ}`}
          />
        ) : null}
      </Svg>
      <ThemedText variant="micro">{letter}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: atmosphere.dayChipSize,
    height: atmosphere.dayChipSize,
    borderRadius: atmosphere.dayChipSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    transform: [{ rotate: '-90deg' }],
  },
});
