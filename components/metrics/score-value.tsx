import { ThemedText, type TextTone } from '@/components/ui/themed-text';
import { type TypeVariant } from '@/constants/theme';

export type ScoreValueSize = 'hero' | 'large' | 'tile' | 'row';

export type ScoreValueProps = {
  value: number | string | null;
  size: ScoreValueSize;
  /** `canvas` covers canvas, card, and frost. Default `canvas`. */
  on?: 'canvas' | 'mesh';
  /** Default `/100`. `""` renders the value only. */
  unit?: string;
};

const VALUE_STEP: Record<ScoreValueSize, TypeVariant> = {
  hero: 'numeralHero',
  large: 'numeralLarge',
  tile: 'numeralTile',
  row: 'title',
};

const UNIT_STEP: Record<ScoreValueSize, TypeVariant> = {
  hero: 'numeralUnit',
  large: 'numeralUnit',
  tile: 'numeralUnit',
  row: 'footnote',
};

function formatValue(value: number | string | null): string {
  if (typeof value === 'string') return value;
  if (value == null || !Number.isFinite(value)) return '-';
  return String(Math.round(value));
}

function isMissing(value: number | string | null): boolean {
  if (value == null) return true;
  return typeof value === 'number' && !Number.isFinite(value);
}

/**
 * A score in SF, never LED. The unit is a nested span so the pair shares a
 * baseline. Faint ink is only used at the 24pt-and-above steps.
 */
export function ScoreValue({ value, size, on = 'canvas', unit = '/100' }: ScoreValueProps) {
  const mesh = on === 'mesh';
  const missing = isMissing(value);
  const strong: TextTone = mesh ? 'onAtmosphere' : 'primary';
  const quiet: TextTone =
    size === 'row'
      ? mesh
        ? 'onAtmosphereMuted'
        : 'tertiary'
      : mesh
        ? 'onAtmosphereFaint'
        : 'numeralFaint';
  const valueTone = missing ? quiet : strong;
  const unitText = unit.startsWith('/') ? unit : ` ${unit}`;

  return (
    <ThemedText
      variant={VALUE_STEP[size]}
      weight={size === 'row' ? 'bold' : undefined}
      tone={valueTone}
      style={{ fontVariant: ['tabular-nums'] }}>
      {formatValue(value)}
      {unit !== '' ? (
        <ThemedText
          variant={UNIT_STEP[size]}
          weight={size === 'row' ? 'regular' : undefined}
          tone={quiet}>
          {unitText}
        </ThemedText>
      ) : null}
    </ThemedText>
  );
}

