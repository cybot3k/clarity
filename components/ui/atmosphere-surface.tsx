import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { atmosphere, radius as radiusTokens } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';
import type { SkillKey } from '@/types/history';
import type { Passage } from '@/types/session';

import { DottedStroke } from './dotted-stroke';
import { GrainOverlay } from './grain-overlay';

export type AtmosphereMesh =
  | 'hero'
  | 'add'
  | 'artwork'
  | 'minutes'
  | 'sessions'
  | 'streak'
  | 'mastered'
  | SkillKey;

export type AtmosphereSurfaceProps = {
  children?: ReactNode;
  /** Default `hero`. */
  radius?: keyof typeof radiusTokens;
  mesh: AtmosphereMesh;
  /** Required when mesh === 'artwork'. */
  artwork?: Passage['artwork'];
  /** Default true for metric/add/skill, false for hero/artwork. */
  dotted?: boolean;
  /** Default false. Daily Goal / Analytics / Results heroes pass true. */
  grain?: boolean;
  style?: StyleProp<ViewStyle>;
};

type Stops = {
  from: string;
  via?: string;
  to?: string;
  accent?: string;
  kind: 'hero' | 'metric' | 'add' | 'artwork';
};

function stopsFor(
  mesh: AtmosphereMesh,
  colors: ReturnType<typeof useTheme>['colors'],
  artwork?: Passage['artwork'],
): Stops {
  if (mesh === 'artwork') {
    if (!artwork) {
      throw new Error('AtmosphereSurface mesh="artwork" requires an artwork prop');
    }
    return { from: artwork.base[0], kind: 'artwork' };
  }
  if (mesh === 'add') {
    return { from: colors.card, kind: 'add' };
  }
  if (mesh === 'hero') {
    return {
      from: colors.heroStopTop,
      via: colors.heroStopMid,
      to: colors.heroStopBottom,
      accent: colors.heroStopAccent,
      kind: 'hero',
    };
  }
  const family = {
    minutes: [colors.metricMinutesFrom, colors.metricMinutesVia, colors.metricMinutesTo],
    sessions: [colors.metricSessionsFrom, colors.metricSessionsVia, colors.metricSessionsTo],
    streak: [colors.metricStreakFrom, colors.metricStreakVia, colors.metricStreakTo],
    mastered: [colors.metricMasteredFrom, colors.metricMasteredVia, colors.metricMasteredTo],
    accuracy: [colors.skillAccuracyFrom, colors.skillAccuracyVia, colors.skillAccuracyTo],
    fluency: [colors.skillFluencyFrom, colors.skillFluencyVia, colors.skillFluencyTo],
    pace: [colors.skillPaceFrom, colors.skillPaceVia, colors.skillPaceTo],
    fillers: [colors.skillFillersFrom, colors.skillFillersVia, colors.skillFillersTo],
    intonation: [colors.skillIntonationFrom, colors.skillIntonationVia, colors.skillIntonationTo],
  }[mesh];
  return { from: family[0], via: family[1], to: family[2], kind: 'metric' };
}

function defaultDotted(mesh: AtmosphereMesh): boolean {
  return mesh !== 'hero' && mesh !== 'artwork';
}

/**
 * Chromatic weather card. Sibling of GlassSurface — never nested inside one.
 * One gradient per View; ellipse radii are px from onLayout.
 */
export function AtmosphereSurface({
  children,
  radius = 'hero',
  mesh,
  artwork,
  dotted,
  grain = false,
  style,
}: AtmosphereSurfaceProps) {
  const { colors, scheme } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const stops = stopsFor(mesh, colors, artwork);
  const showDotted = dotted ?? defaultDotted(mesh);
  const corner = radiusTokens[radius];

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const w = size.w;
  const h = size.h;
  const canPaint = w > 0 && h > 0 && !reduced;

  let linearCss: string | undefined;
  let radialCss: string | undefined;
  if (canPaint) {
    if (stops.kind === 'hero' && stops.via && stops.to && stops.accent) {
      linearCss = `linear-gradient(to bottom, ${stops.from} 0%, ${stops.via} 42%, ${stops.to} 100%)`;
      radialCss = `radial-gradient(ellipse ${Math.round(w * 0.85)}px ${Math.round(h * 0.55)}px at 85% 100%, ${stops.accent} 0%, transparent 70%)`;
    } else if (stops.kind === 'metric' && stops.via && stops.to) {
      linearCss = `linear-gradient(to right, ${stops.from} 0%, ${stops.via} 42%, ${stops.to} 100%)`;
      radialCss = `radial-gradient(ellipse ${Math.round(w * 0.8)}px ${Math.round(h * 0.9)}px at 100% 50%, ${stops.to} 0%, transparent 72%)`;
    } else if (stops.kind === 'add') {
      radialCss = `radial-gradient(ellipse ${Math.round(w * 0.7)}px ${Math.round(h * 0.8)}px at 100% 50%, ${colors.addLeakHot} 0%, ${colors.addLeak} 38%, transparent 72%)`;
    } else if (stops.kind === 'artwork' && artwork) {
      linearCss = `linear-gradient(to bottom, ${artwork.base[0]} 0%, ${artwork.base[1]} 100%)`;
      radialCss = `radial-gradient(ellipse ${Math.round(w * 0.6)}px ${Math.round(w * 0.6)}px at 100% 0%, ${artwork.blob[0]} 0%, ${artwork.blob[1]} 40%, transparent 100%)`;
    }
  }

  const dottedColor =
    stops.kind === 'add' ? colors.dottedStrokeOnFrost : colors.dottedStrokeOnAtmosphere;

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          borderRadius: corner,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: stops.from,
        },
        style,
      ]}>
      {linearCss ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { experimental_backgroundImage: linearCss }]}
        />
      ) : null}
      {radialCss ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { experimental_backgroundImage: radialCss }]}
        />
      ) : null}
      {grain && !reduced ? <GrainOverlay opacity={atmosphere.grainOpacityHero[scheme]} /> : null}
      {showDotted ? <DottedStroke color={dottedColor} radius={corner} /> : null}
      {children}
    </View>
  );
}
