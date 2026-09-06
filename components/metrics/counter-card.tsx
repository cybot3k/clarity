import { type IconSvgElement } from '@hugeicons/react-native';
import { type StyleProp, type ViewStyle } from 'react-native';

import { MetricCapsule, type MetricFamily } from '@/components/ui';

/**
 * One effort counter: labelled icon, a big value with its unit, and the change
 * since last week. Frosted like every other card in the app; group siblings in
 * a `GlassContainer` so their glass composites as one set.
 *
 * The value is always ink. Effort is effort; there's no "good" or "bad" amount
 * of practice to color it by.
 */
export type CounterCardProps = {
  icon?: IconSvgElement;
  family: MetricFamily;
  label: string;
  value: number;
  /** Sits after the value, e.g. "min", "runs", "days". */
  unit: string;
  /** Week-over-week change. Omit for a counter with no comparison. */
  delta?: number;
  /** Appended after the delta number, e.g. "min" in "↑ 12 min". */
  deltaSuffix?: string;
  style?: StyleProp<ViewStyle>;
};

export function CounterCard({
  icon: _icon,
  family,
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  style,
}: CounterCardProps) {
  return (
    <MetricCapsule
      family={family}
      label={label}
      value={value}
      unit={unit}
      delta={delta}
      deltaSuffix={deltaSuffix}
      style={style}
    />
  );
}
