import { Mic02Icon } from '@hugeicons/core-free-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { ScoreValue } from '@/components/metrics';
import { AtmosphereSurface, GlassSurface, PrimaryButton, ThemedText } from '@/components/ui';
import { atmosphere, radius, spacing } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type DailyGoalCardProps = {
  percent: number;
  onStartPractice: () => void;
};

function GoalRing({ progress }: { progress: number }) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const size = atmosphere.goalRing.size;
  const stroke = atmosphere.goalRing.stroke;
  const c = size / 2;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const headR = atmosphere.meterHead / 2;
  const originR = atmosphere.meterOrigin / 2;

  const p = useSharedValue(reduced ? progress : 0);
  useEffect(() => {
    p.value = withTiming(progress, {
      duration: reduced ? 0 : atmosphere.goalRing.durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [p, progress, reduced]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - p.value),
    opacity: p.value > 0 ? 1 : 0,
  }));

  const headProps = useAnimatedProps(() => {
    const angle = -Math.PI / 2 + 2 * Math.PI * p.value;
    return {
      cx: c + r * Math.cos(angle),
      cy: c + r * Math.sin(angle),
      opacity: p.value > 0 ? 1 : 0,
    };
  });

  const originProps = useAnimatedProps(() => ({
    opacity: p.value >= 1 ? 0 : 1,
  }));

  return (
    <Svg width={size} height={size} importantForAccessibility="no-hide-descendants">
      <Circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={colors.onAtmosphereMuted}
        strokeWidth={atmosphere.dottedWidth}
        strokeDasharray={atmosphere.dottedDash}
        strokeLinecap="round"
      />
      <G rotation={-90} origin={[c, c]}>
        <AnimatedCircle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={colors.onAtmosphere}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          animatedProps={arcProps}
        />
      </G>
      <AnimatedCircle
        cx={c}
        cy={c - r}
        r={originR}
        fill="none"
        stroke={colors.onAtmosphere}
        strokeWidth={atmosphere.meterOriginStroke}
        animatedProps={originProps}
      />
      <AnimatedCircle cx={c} cy={c - r} r={headR} fill={colors.onAtmosphere} animatedProps={headProps} />
    </Svg>
  );
}

/**
 * Hero mesh stage with today's percent and a dotted goal ring. A frost shelf
 * overlaps the stage edge and holds the screen's one knob.
 */
export function DailyGoalCard({ percent, onStartPractice }: DailyGoalCardProps) {
  const clamped = Math.max(0, Math.min(percent, 100));

  return (
    <View>
      <AtmosphereSurface mesh="hero" radius="hero" style={styles.stage}>
        <ThemedText variant="eyebrow" tone="onAtmosphereMuted">
          TODAY
        </ThemedText>
        <View style={styles.numeralRow}>
          <ScoreValue value={clamped} size="hero" on="mesh" unit="%" />
          <GoalRing progress={clamped / 100} />
        </View>
      </AtmosphereSurface>
      <View style={styles.shelf}>
        <GlassSurface radius="lg" tint="standard" style={StyleSheet.absoluteFill} />
        <View style={styles.shelfContent}>
          <ThemedText variant="title3" weight="regular" tone="primary">
            Daily speaking goal
          </ThemedText>
          <PrimaryButton
            title="Start Practicing"
            icon={Mic02Icon}
            variant="knob"
            size="lg"
            onPress={onStartPractice}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: atmosphere.shelfOverlap + spacing.xl,
  },
  numeralRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  shelf: {
    marginTop: -atmosphere.shelfOverlap,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  shelfContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
