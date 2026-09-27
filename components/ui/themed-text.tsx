import { Text, type TextProps, type TextStyle } from 'react-native';

import { fonts, type, type TypeVariant } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Which ink a piece of text uses. Steps come from the type ramp, including
 * `display`, the numeral steps, and `sectionTitle`. */
export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'dimmed'
  | 'inverse'
  | 'accent'
  | 'positive'
  | 'focus'
  | 'numeralFaint'
  | 'onAtmosphere'
  | 'onAtmosphereMuted'
  | 'onAtmosphereFaint'
  | 'onAccent'
  | 'onTabHighlight'
  | 'onArtwork'
  | 'onArtworkMuted'
  | 'marketingPrimary'
  | 'marketingSecondary'
  | 'marketingInverse'
  | 'marketingAccent';

export type ThemedTextProps = TextProps & {
  /** A step in the type ramp. Defaults to `body`. */
  variant?: TypeVariant;
  /** Override the step's default face without changing its size. */
  weight?: keyof typeof fonts;
  /** Defaults to `primary`. */
  tone?: TextTone;
};

/**
 * All text in the app. Screens and components pick a ramp step and an ink tone;
 * neither ever names a `fontSize` or a hex value.
 *
 * Nested `ThemedText` spans stay on the parent's baseline. `includeFontPadding`
 * is off so Android does not shift the nested face.
 *
 * `style` merges last, so a caller can set alignment or `maxWidth` without
 * forking. A caller setting `fontSize` or `color` through `style` is drift — the
 * ramp or the tone list is missing a step.
 */
export function ThemedText({
  variant = 'body',
  weight,
  tone = 'primary',
  style,
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const ink: Record<TextTone, string> = {
    primary: colors.foreground,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    dimmed: colors.dimmed,
    inverse: colors.inverseLabel,
    accent: colors.accentText,
    positive: colors.positive,
    focus: colors.focus,
    numeralFaint: colors.numeralFaint,
    onAtmosphere: colors.onAtmosphere,
    onAtmosphereMuted: colors.onAtmosphereMuted,
    onAtmosphereFaint: colors.onAtmosphereFaint,
    onAccent: colors.onAccent,
    onTabHighlight: colors.onTabHighlight,
    onArtwork: colors.onArtwork,
    onArtworkMuted: colors.onArtworkMuted,
    marketingPrimary: colors.marketingInk,
    marketingSecondary: colors.marketingMuted,
    marketingInverse: colors.marketingOnInverse,
    marketingAccent: colors.marketingAccent,
  };

  const face: TextStyle | undefined = weight ? { fontFamily: fonts[weight] } : undefined;

  return (
    <Text
      style={[type[variant], face, { color: ink[tone], includeFontPadding: false }, style]}
      {...props}
    />
  );
}
