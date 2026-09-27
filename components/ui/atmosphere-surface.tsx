import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { atmosphere, radius as radiusTokens, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Passage } from '@/types/session';

import { GrainOverlay } from './grain-overlay';

export type AtmosphereMesh = 'hero' | 'minutes' | 'sessions' | 'streak' | 'mastered' | 'artwork';

type SurfaceBase = {
  children?: ReactNode;
  /** Default `xl`. */
  radius?: keyof typeof radiusTokens;
  style?: StyleProp<ViewStyle>;
};

export type AtmosphereSurfaceProps = SurfaceBase &
  (
    | { mesh: Exclude<AtmosphereMesh, 'artwork'>; artwork?: never }
    | { mesh: 'artwork'; artwork: Passage['artwork'] }
  );

type Stops = {
  fill: string;
  from: string;
  via: string;
  bloom?: string;
};

function familyStops(
  mesh: 'minutes' | 'sessions' | 'streak' | 'mastered',
  colors: ThemeColors,
): Stops {
  switch (mesh) {
    case 'minutes':
      return {
        fill: colors.metricMinutesTo,
        from: colors.metricMinutesFrom,
        via: colors.metricMinutesVia,
      };
    case 'sessions':
      return {
        fill: colors.metricSessionsTo,
        from: colors.metricSessionsFrom,
        via: colors.metricSessionsVia,
      };
    case 'streak':
      return {
        fill: colors.metricStreakTo,
        from: colors.metricStreakFrom,
        via: colors.metricStreakVia,
      };
    case 'mastered':
      return {
        fill: colors.metricMasteredTo,
        from: colors.metricMasteredFrom,
        via: colors.metricMasteredVia,
      };
  }
}

function stopsFor(mesh: AtmosphereMesh, colors: ThemeColors, artwork?: Passage['artwork']): Stops {
  if (mesh === 'hero') {
    return {
      fill: colors.heroStopMid,
      from: colors.heroStopTop,
      via: colors.heroStopBottom,
      bloom: colors.heroStopAccent,
    };
  }
  if (mesh === 'artwork') {
    // Same two-pool geometry as a family mesh. `base[0]` is the fill;
    // the blob pair occupies the top-left and bottom-right pools.
    return {
      fill: artwork?.base[0] ?? colors.artworkFallback,
      from: artwork?.blob[0] ?? colors.artworkFallback,
      via: artwork?.blob[1] ?? colors.artworkFallback,
    };
  }
  return familyStops(mesh, colors);
}

function pool(rx: number, ry: number, x: number, y: number, color: string) {
  return `radial-gradient(ellipse ${rx}px ${ry}px at ${x}px ${y}px, ${color}, transparent)`;
}

function Pool({ css }: { css: string }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { experimental_backgroundImage: css }]}
    />
  );
}

/**
 * Chromatic mesh. Grain is always on, above the paint and below children.
 * No rim and no shadow. Ellipse radii come from `onLayout`, in px.
 */
export function AtmosphereSurface({
  children,
  radius = 'xl',
  mesh,
  style,
  ...rest
}: AtmosphereSurfaceProps) {
  const { colors, scheme } = useTheme();
  const artwork = 'artwork' in rest ? rest.artwork : undefined;
  const corner = radiusTokens[radius];
  const paint = stopsFor(mesh, colors, artwork);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const { w, h } = size;
  const measured = w > 0 && h > 0;

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          borderRadius: corner,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: paint.fill,
        },
        style,
      ]}>
      {measured ? (
        <>
          <Pool css={pool(0.9 * w, 0.8 * h, 0, 0, paint.from)} />
          <Pool css={pool(0.9 * w, 0.8 * h, w, h, paint.via)} />
          {paint.bloom != null ? (
            <Pool css={pool(0.7 * w, 0.45 * h, 0.5 * w, h, paint.bloom)} />
          ) : null}
        </>
      ) : null}
      <GrainOverlay opacity={atmosphere.grain.mesh[scheme]} />
      {children}
    </View>
  );
}
