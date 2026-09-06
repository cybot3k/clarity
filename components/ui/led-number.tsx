import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { atmosphere, LED_GLYPHS, type LedSize } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

export type LedNumberProps = {
  value: number | string | null;
  size?: LedSize;
  /** "/100", "min", "%", "wpm" — SF Pro, never LED. */
  unit?: string;
  /** Default `onAtmosphere`. Pass `ink` on canvas / frost / card. */
  tone?: 'onAtmosphere' | 'ink';
};

const UNIT_VARIANT = {
  sm: 'caption',
  md: 'footnote',
  hero: 'title3',
} as const;

function formatValue(value: number | string | null): string {
  if (value == null) return '---';
  if (typeof value === 'string') return value;
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-6) {
    return String(Math.round(value));
  }
  return String(Math.round(value * 10) / 10);
}

function accessibilityFor(display: string, unit?: string, original: number | string | null): string {
  if (original == null) return 'No value';
  if (unit === '/100') return `${display} out of 100`;
  if (unit === '%') return `${display} percent`;
  if (unit) return `${display} ${unit}`;
  return display;
}

/**
 * 5×7 SVG dot-matrix numerals. Not ThemedText. Circles are hidden from VoiceOver.
 */
export function LedNumber({
  value,
  size = 'md',
  unit,
  tone = 'onAtmosphere',
}: LedNumberProps) {
  const { colors } = useTheme();
  const { cell, gap, glow } = atmosphere.led[size];
  const digitW = 5 * cell + 4 * gap;
  const digitH = 7 * cell + 6 * gap;
  const onR = cell / 2;
  const glowR = (cell + glow) / 2;
  const offR = (cell * 0.4) / 2;
  const isNull = value == null;
  const display = formatValue(value);
  const ink = tone === 'ink';
  const onColor = ink ? colors.foreground : colors.ledOn;
  const offColor = ink ? colors.track : colors.ledOff;
  const glowColor = ink ? 'transparent' : colors.ledGlow;

  const glyphs: { kind: 'digit' | 'dot'; key?: string }[] = [];
  for (const ch of display) {
    if (ch === '.') glyphs.push({ kind: 'dot' });
    else if (ch in LED_GLYPHS) glyphs.push({ kind: 'digit', key: ch });
  }

  let width = 0;
  for (const g of glyphs) {
    if (g.kind === 'dot') width += gap + cell + gap;
    else width += digitW + gap;
  }
  if (width > 0) width -= gap;
  const height = digitH + glow;

  const circles: { cx: number; cy: number; r: number; fill: string }[] = [];
  let x = glow / 2;
  const y0 = glow / 2;

  for (const g of glyphs) {
    if (g.kind === 'dot') {
      x += gap;
      circles.push({
        cx: x + onR,
        cy: y0 + 6 * (cell + gap) + onR,
        r: onR,
        fill: isNull ? offColor : onColor,
      });
      x += cell + gap;
      continue;
    }
    const map = LED_GLYPHS[g.key as keyof typeof LED_GLYPHS];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        const on = map[row][col] === '1';
        const cx = x + col * (cell + gap) + onR;
        const cy = y0 + row * (cell + gap) + onR;
        if (on) {
          if (isNull) {
            circles.push({ cx, cy, r: onR, fill: offColor });
          } else {
            if (!ink) circles.push({ cx, cy, r: glowR, fill: glowColor });
            circles.push({ cx, cy, r: onR, fill: onColor });
          }
        } else {
          circles.push({ cx, cy, r: offR, fill: offColor });
        }
      }
    }
    x += digitW + gap;
  }

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityFor(display, unit, value)}
      style={styles.row}>
      <Svg
        width={width + glow}
        height={height}
        importantForAccessibility="no-hide-descendants">
        {circles.map((c, i) => (
          <Circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} accessible={false} />
        ))}
      </Svg>
      {unit ? (
        <ThemedText
          variant={UNIT_VARIANT[size]}
          tone={ink ? 'primary' : 'onAtmosphere'}
          style={styles.unit}>
          {unit}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: atmosphere.led.sm.gap,
  },
  unit: {
    marginLeft: atmosphere.led.sm.gap,
  },
});
