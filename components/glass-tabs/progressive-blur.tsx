import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Shared falloff beyond floating navigation chrome. */
export const CHROME_BLUR_BLEED = 44;

type Props = ViewProps & {
  /** Blur strength at the anchored edge. */
  intensity?: number;
  /** Which edge the blur is anchored to (strongest there, fading away). */
  direction?: 'top' | 'bottom';
  /** Blur material. Defaults to the current color scheme. */
  tint?: 'light' | 'dark';
};

/** `r,g,b` from a `#rrggbb` or `rgba(r,g,b,a)` token — gradient stops need channels. */
function rgbChannels(color: string): string {
  if (color.startsWith('#')) {
    const n = parseInt(color.slice(1, 7), 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const m = /(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color);
  return m ? `${m[1]},${m[2]},${m[3]}` : '0,0,0';
}

/**
 * Progressive (gradient) blur: one BlurView alpha-masked by an eased
 * gradient, so the material fades continuously with no layer seams —
 * full strength through the first 30%, easing to nothing at the far
 * edge. A soft gradient scrim keeps overlaid chrome legible.
 * The scrim is the canvas hue, not black. Call sites should not force `tint`.
 */
export function ProgressiveBlur({
  style,
  intensity = 40,
  direction = 'top',
  tint,
  ...rest
}: Props) {
  const { colors, scheme } = useTheme();
  const blurTint = tint ?? scheme;
  const toEdge = direction === 'top' ? 'bottom' : 'top';
  const rgb = rgbChannels(colors.chromeScrim);

  return (
    <View pointerEvents="none" style={style} {...rest}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <View
            style={{
              flex: 1,
              experimental_backgroundImage: `linear-gradient(to ${toEdge}, rgb(0,0,0) 0%, rgb(0,0,0) 30%, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.82) 58%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.38) 81%, rgba(0,0,0,0.16) 91%, rgba(0,0,0,0) 100%)`,
            }}
          />
        }>
        <BlurView tint={blurTint} intensity={intensity} style={StyleSheet.absoluteFill} />
      </MaskedView>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          experimental_backgroundImage: `linear-gradient(to ${toEdge}, ${colors.chromeScrim} 0%, rgba(${rgb},0.32) 42%, rgba(${rgb},0.08) 68%, rgba(${rgb},0) 88%)`,
        }}
      />
    </View>
  );
}
