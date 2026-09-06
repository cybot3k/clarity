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
  const bleedCss = `radial-gradient(ellipse ${Math.round(windowWidth * 0.7)}px ${Math.round(windowHeight * 0.55)}px at 50% 40%, ${colors.canvasFog} 0%, transparent 70%)`;

  return (
    <View style={[styles.root, { backgroundColor: colors.atmosphereCanvas }]}>
      {showFog ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={require('@/assets/atmosphere/orb-fog-mask.png')}
            tintColor={colors.canvasFogCore}
            resizeMode="contain"
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
            style={[StyleSheet.absoluteFill, { experimental_backgroundImage: bleedCss }]}
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
