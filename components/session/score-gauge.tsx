import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { DeltaPill } from '@/components/metrics';
import { AtmosphereSurface, LedNumber, ThemedText } from '@/components/ui';
import { atmosphere, spacing } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';
import { scoreBand } from '@/lib/score';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type ScoreGaugeProps = {
  score: number;
  delta?: number;
};

export function ScoreGauge({ score, delta }: ScoreGaugeProps) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const clamped = Math.max(0, Math.min(score, 100));
  const { r, delayMs, durationMs } = atmosphere.progress.results;
  const stroke = atmosphere.heroStroke;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startDeg = 135;
  const arcLen = 1.5 * Math.PI * r;
  const svgW = 2 * r + stroke;
  const svgH = 2 * r + stroke;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const pt = (deg: number) => [cx + r * Math.cos(toRad(deg)), cy + r * Math.sin(toRad(deg))] as const;
  const [sx, sy] = pt(startDeg);
  const [ex, ey] = pt(45);
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

  return (
    <AtmosphereSurface mesh="hero" radius="hero" style={styles.card}>
      <View style={styles.gauge}>
        <Svg width={svgW} height={svgH}>
          <Path
            d={d}
            fill="none"
            stroke={colors.track}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <AnimatedPath
            d={d}
            fill="none"
            stroke={colors.accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLen}`}
            animatedProps={animatedProps}
          />
        </Svg>
        <View style={styles.hollow} pointerEvents="none">
          <LedNumber value={clamped} size="hero" unit="/100" />
          <ThemedText variant="subhead" tone="onAtmosphereMuted">
            {scoreBand(clamped)}
          </ThemedText>
          {delta != null && delta !== 0 && <DeltaPill delta={delta} suffix="vs avg" />}
        </View>
      </View>
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  gauge: {
    width: atmosphere.progress.results.r * 2 + atmosphere.heroStroke,
    height: atmosphere.progress.results.r * 2 + atmosphere.heroStroke,
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
