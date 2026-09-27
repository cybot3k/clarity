import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { DeltaPill, ScoreValue } from '@/components/metrics';
import { AtmosphereSurface, ThemedText } from '@/components/ui';
import { atmosphere, spacing } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';
import { scoreBand } from '@/lib/score';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const START_DEG = 135;
const SWEEP_DEG = 270;

export type ScoreGaugeProps = {
  score: number;
  delta?: number;
};

export function ScoreGauge({ score, delta }: ScoreGaugeProps) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const clamped = Math.max(0, Math.min(score, 100));
  const { r, delayMs, durationMs, stroke, dotPitch } = atmosphere.progress.results;
  const box = 2 * r + atmosphere.cursorSize;
  const c = box / 2;
  const arcLen = (SWEEP_DEG / 360) * 2 * Math.PI * r;
  const startRad = (START_DEG * Math.PI) / 180;
  const endRad = ((START_DEG + SWEEP_DEG) * Math.PI) / 180;
  const sx = c + r * Math.cos(startRad);
  const sy = c + r * Math.sin(startRad);
  const ex = c + r * Math.cos(endRad);
  const ey = c + r * Math.sin(endRad);
  const d = `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`;

  const progress = useSharedValue(reduced ? clamped / 100 : 0);
  useEffect(() => {
    progress.value = withDelay(
      reduced ? 0 : delayMs,
      withTiming(clamped / 100, {
        duration: reduced ? 0 : durationMs,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [clamped, delayMs, durationMs, progress, reduced]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arcLen * (1 - progress.value),
  }));

  const lensProps = useAnimatedProps(() => {
    const angle = ((START_DEG + SWEEP_DEG * progress.value) * Math.PI) / 180;
    return {
      cx: c + r * Math.cos(angle),
      cy: c + r * Math.sin(angle),
    };
  });

  return (
    <AtmosphereSurface mesh="hero" radius="hero" style={styles.card}>
      <View style={[styles.gauge, { width: box, height: box }]}>
        <Svg width={box} height={box}>
          <Path
            d={d}
            fill="none"
            stroke={colors.onAtmosphereMuted}
            strokeWidth={stroke}
            strokeLinecap="round"
            // Near-zero dash so the round caps read as a ring of dots.
            strokeDasharray={`0.1 ${dotPitch}`}
          />
          <AnimatedPath
            d={d}
            fill="none"
            stroke={colors.onAtmosphere}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen}`}
            animatedProps={animatedProps}
          />
          <AnimatedCircle
            animatedProps={lensProps}
            r={atmosphere.cursorSize / 2}
            stroke={colors.cursorRing}
            strokeWidth={1}
            fill="none"
          />
          <AnimatedCircle
            animatedProps={lensProps}
            r={atmosphere.cursorDotSize / 2}
            fill={colors.cursorDot}
          />
        </Svg>
        <View style={styles.hollow} pointerEvents="none">
          <ScoreValue value={clamped} size="hero" on="mesh" />
          <ThemedText variant="subhead" tone="onAtmosphereMuted">
            {scoreBand(clamped)}
          </ThemedText>
          {delta != null && delta !== 0 ? (
            <DeltaPill delta={delta} suffix="vs avg" on="mesh" />
          ) : null}
        </View>
      </View>
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxxl,
    alignItems: 'center',
  },
  gauge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hollow: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
