import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { atmosphere, radius } from '@/constants/theme';
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

/** Today's progress arc. The track beside it stays a hairline. */
const ARC_STROKE = 2;

/**
 * Circular day letter. Goal chips sit on the canvas: completed is inverse ink,
 * never lime. Axis chips sit on a mesh: selected is the accent fill.
 */
export function DayChip({ intent, letter, filled, muted, progress, selected }: DayChipProps) {
  const { colors } = useTheme();
  const d = atmosphere.dayChipSize;
  const r = (d - ARC_STROKE) / 2;
  const c = d / 2;

  if (intent === 'axis') {
    return (
      <View style={[styles.chip, selected ? { backgroundColor: colors.accent } : null]}>
        {selected ? null : (
          <Svg width={d} height={d} style={StyleSheet.absoluteFill}>
            <Circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={colors.onAtmosphereMuted}
              strokeWidth={StyleSheet.hairlineWidth}
            />
          </Svg>
        )}
        <ThemedText variant="micro" tone={selected ? 'onAccent' : 'onAtmosphere'}>
          {letter}
        </ThemedText>
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

  const today = progress != null;
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
          stroke={colors.track}
          strokeWidth={StyleSheet.hairlineWidth}
        />
        {today && p > 0 ? (
          <Circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={colors.foreground}
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${circ * p} ${circ}`}
          />
        ) : null}
      </Svg>
      <ThemedText variant="micro" tone={today ? 'primary' : 'secondary'}>
        {letter}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: atmosphere.dayChipSize,
    height: atmosphere.dayChipSize,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    transform: [{ rotate: '-90deg' }],
  },
});
