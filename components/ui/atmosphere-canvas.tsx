import { type ReactNode } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';

import { atmosphere } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';

import { GrainOverlay } from './grain-overlay';

export type AtmosphereCanvasProps = {
  children: ReactNode;
  /** Default true. Live session passes false. */
  fog?: boolean;
};

/** CSS `transparent` is rgba(0,0,0,0); gradients interpolate through black. */
function transparentStop(color: string): string {
  const rgb = color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, 0)`;
  if (color[0] === '#' && (color.length === 7 || color.length === 9)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0)`;
  }
  return color;
}

/**
 * Screen-level pale canvas with a viewport-fixed orb fog + grain wash.
 * Fog never lives inside a ScrollView.
 */
export function AtmosphereCanvas({ children, fog = true }: AtmosphereCanvasProps) {
  const { colors, scheme } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const showFog = fog && !reduced;
  const fogWidth = windowWidth * atmosphere.fog.widthRatio;
  const fogHeight = fogWidth / atmosphere.fog.aspect;
  const fogLeft = (windowWidth - fogWidth) / 2;
  const fogTop = windowHeight * atmosphere.fog.centerY - fogHeight / 2;
  const bleedCss = `radial-gradient(ellipse ${Math.round(windowWidth * 0.7)}px ${Math.round(windowHeight * 0.55)}px at 50% 40%, ${colors.canvasFog} 0%, ${transparentStop(colors.canvasFog)} 70%)`;

  return (
    <View style={[styles.root, { backgroundColor: colors.atmosphereCanvas }]}>
      {showFog ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={require('@/assets/atmosphere/orb-fog-mask.png')}
            tintColor={colors.canvasFogCore}
            resizeMode="contain"
            fadeDuration={0}
            style={{
              position: 'absolute',
              width: fogWidth,
              height: fogHeight,
              left: fogLeft,
              top: fogTop,
            }}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: colors.canvasFog,
                experimental_backgroundImage: bleedCss,
              },
            ]}
          />
          <GrainOverlay opacity={atmosphere.grainOpacity[scheme]} />
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
