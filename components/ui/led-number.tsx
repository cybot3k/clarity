import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { LED_GLYPHS } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type LedNumberProps = {
  value: number | null;
  accessibilityLabel?: string;
};

/** One md spec. 5×7, so a digit is 16.5 × 23.5 and four digits span 78. */
const DOT = 2.5;
const PITCH = 3.5;
const GAP = 4;
const FOUR_DIGIT_MAX = 78;
const MANY_DIGITS = 5;
const MANY_SCALE = 0.8;

const SAMPLE = LED_GLYPHS['0'];
const ROWS = SAMPLE.length;
const COLS = SAMPLE[0].length;

function glyphString(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-';
  return String(Math.round(value));
}

function fitPitch(dot: number, pitch: number, gap: number): number {
  const span = 4 * ((COLS - 1) * pitch + dot) + 3 * gap;
  if (span <= FOUR_DIGIT_MAX) return pitch;
  const room = FOUR_DIGIT_MAX - 4 * dot - 3 * gap;
  const denom = 4 * (COLS - 1);
  return denom > 0 ? Math.max(0, room / denom) : pitch;
}

/**
 * 5×7 dot-matrix count. One size. Lit dots are `ledOn`, unlit are `ledOff`.
 * `null` is the dash glyph. Not ThemedText — circles stay out of VoiceOver.
 */
export function LedNumber({ value, accessibilityLabel }: LedNumberProps) {
  const { colors } = useTheme();
  const display = glyphString(value);
  const glyphs = [...display].filter((ch) => ch in LED_GLYPHS);

  let dot = DOT;
  let pitch = fitPitch(DOT, PITCH, GAP);
  let gap = GAP;
  if (glyphs.length >= MANY_DIGITS) {
    dot *= MANY_SCALE;
    pitch *= MANY_SCALE;
    gap *= MANY_SCALE;
  }

  const digitW = (COLS - 1) * pitch + dot;
  const digitH = (ROWS - 1) * pitch + dot;
  const width = glyphs.length === 0 ? 0 : glyphs.length * digitW + (glyphs.length - 1) * gap;
  const onR = dot / 2;

  const circles: { cx: number; cy: number; fill: string }[] = [];
  let x = 0;
  for (const ch of glyphs) {
    const map = LED_GLYPHS[ch as keyof typeof LED_GLYPHS];
    for (let row = 0; row < ROWS; row++) {
      const line = map[row] ?? '';
      for (let col = 0; col < COLS; col++) {
        circles.push({
          cx: x + col * pitch + onR,
          cy: row * pitch + onR,
          fill: line[col] === '1' ? colors.ledOn : colors.ledOff,
        });
      }
    }
    x += digitW + gap;
  }

  const label =
    accessibilityLabel ?? (value == null || !Number.isFinite(value) ? 'No value' : display);

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={styles.row}>
      <Svg width={width} height={digitH} importantForAccessibility="no-hide-descendants">
        {circles.map((c, i) => (
          <Circle key={i} cx={c.cx} cy={c.cy} r={onR} fill={c.fill} accessible={false} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'flex-start',
  },
});
