import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/constants/theme';

/** A fixed speech-rhythm mark. Identity, not a chart of someone's audio. */
const BARS = [0.32, 0.55, 0.4, 0.82, 0.48, 1, 0.62, 0.38, 0.74, 0.5, 0.28] as const;

export type SpeechMarkProps = {
  color: string;
  height?: number;
};

/** Compact waveform fragment. Used where a card needs to read as speech. */
export function SpeechMark({ color, height = 28 }: SpeechMarkProps) {
  return (
    <View style={[styles.row, { height }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {BARS.map((amount, index) => (
        <View
          key={index}
          style={{
            width: spacing.xs,
            height: Math.max(spacing.xs, Math.round(height * amount)),
            borderRadius: radius.full,
            backgroundColor: color,
            opacity: 0.4 + amount * 0.6,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
