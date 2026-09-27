import { type ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { atmosphere } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { GrainOverlay } from './grain-overlay';

export type AtmosphereCanvasProps = {
  children: ReactNode;
  /**
   * `stage` keeps a flat band through the reading area. `pearl` is the
   * destination dashboard canvas: a cool top-left, a faint warm right edge, and
   * no orb. Default `ambient`.
   */
  mode?: 'ambient' | 'stage' | 'pearl';
  style?: StyleProp<ViewStyle>;
};

function radial(rx: number, ry: number, x: number, y: number, color: string) {
  return `radial-gradient(ellipse ${rx}px ${ry}px at ${x}px ${y}px, ${color}, transparent)`;
}

/** One gradient per View. Radii are px from the window, never percent. */
function FogPool({ css }: { css: string }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { experimental_backgroundImage: css }]}
    />
  );
}

/**
 * Orb mask, ambient only. Positioned from `atmosphere.fog` so the mark sits
 * at the canvas core, tinted `canvasFogCore`.
 */
function OrbFog({ width, height, tint }: { width: number; height: number; tint: string }) {
  const imageWidth = width * atmosphere.fog.widthRatio;
  const imageHeight = imageWidth / atmosphere.fog.aspect;
  return (
    <Image
      source={require('@/assets/atmosphere/orb-fog-mask.png')}
      tintColor={tint}
      resizeMode="contain"
      accessible={false}
      style={{
        position: 'absolute',
        width: imageWidth,
        height: imageHeight,
        left: width * 0.5 - imageWidth / 2,
        top: height * atmosphere.fog.centerY - imageHeight / 2,
      }}
    />
  );
}

/**
 * Screen canvas. Paints its own base, fog, and grain. Fog layers are window-
 * sized so a scrolling child cannot stretch them. Reduced transparency
 * unmounts grain only; the fog stays.
 */
export function AtmosphereCanvas({ children, mode = 'ambient', style }: AtmosphereCanvasProps) {
  const { colors, scheme } = useTheme();
  const { width: W, height: H } = useWindowDimensions();
  const ambient = mode === 'ambient';
  const pearl = mode === 'pearl';

  return (
    <View style={[styles.root, { backgroundColor: colors.atmosphereCanvas }, style]}>
      <View pointerEvents="none" style={[styles.layers, { width: W, height: H }]}>
        {pearl ? (
          <>
            <FogPool css={radial(1.1 * W, 0.5 * H, 0, 0, colors.canvasFog)} />
            <FogPool css={radial(0.9 * W, 0.35 * H, 0.5 * W, 0.55 * H, colors.canvasFogCore)} />
            <FogPool css={radial(0.8 * W, 0.6 * H, W, 0.45 * H, colors.canvasFogLow)} />
          </>
        ) : ambient ? (
          <>
            <FogPool css={radial(0.9 * W, 0.55 * H, W, 0, colors.canvasFog)} />
            <FogPool css={radial(0.8 * W, 0.35 * H, 0, 0.38 * H, colors.canvasFogCore)} />
            <FogPool css={radial(1.1 * W, 0.3 * H, 0.5 * W, H, colors.canvasFogLow)} />
            <OrbFog width={W} height={H} tint={colors.canvasFogCore} />
          </>
        ) : (
          <>
            <FogPool css={radial(1.2 * W, 0.22 * H, 0.5 * W, 0, colors.canvasFog)} />
            <FogPool css={radial(1.3 * W, 0.42 * H, 0.5 * W, H, colors.canvasFogLow)} />
          </>
        )}
        <GrainOverlay opacity={atmosphere.grain.canvas[scheme]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  layers: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
