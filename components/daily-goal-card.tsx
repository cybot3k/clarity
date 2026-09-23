import { Mic02Icon } from '@hugeicons/core-free-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AtmosphereSurface, LedNumber, PrimaryButton, ThemedText } from '@/components/ui';
import { atmosphere, spacing } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type DailyGoalCardProps = {
  percent: number;
  onStartPractice: () => void;
};

export function DailyGoalCard({ percent, onStartPractice }: DailyGoalCardProps) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const clamped = Math.max(0, Math.min(percent, 100));
  const { r, durationMs } = atmosphere.progress.dailyGoal;
  const stroke = atmosphere.heroStroke;
  const arcLen = Math.PI * r;
  const svgW = 2 * r + stroke;
  const svgH = r + stroke;
  const cx = svgW / 2;
  const cy = stroke / 2;
  // sweep=0: left → down → right. sweep=1 would clip above cy.
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;

  const progress = useSharedValue(reduced ? clamped / 100 : 0);
  useEffect(() => {
    progress.value = withTiming(clamped / 100, {
      duration: reduced ? 0 : durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, durationMs, progress, reduced]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arcLen * (1 - progress.value),
  }));

  const windowH = r + atmosphere.ledHeight.hero / 2 + spacing.sm;

  return (
    <AtmosphereSurface mesh="hero" radius="hero">
      <View style={styles.inner}>
        <ThemedText variant="eyebrow" tone="onAtmosphereMuted">
          TODAY
        </ThemedText>
        <ThemedText variant="title3" tone="onAtmosphere">
          Daily speaking goal
        </ThemedText>
        <View style={[styles.gaugeWindow, { height: windowH }]}>
          <Svg width={svgW} height={svgH} style={styles.svg}>
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
          <View style={styles.led} pointerEvents="none">
            <LedNumber value={clamped} size="hero" unit="%" />
          </View>
        </View>
      </View>
      <View style={styles.scrim}>
        <PrimaryButton
          title="Start Practicing"
          icon={Mic02Icon}
          variant="solid"
          onPress={onStartPractice}
        />
      </View>
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  inner: {
    padding: spacing.xl,
    paddingBottom: 0,
  },
  gaugeWindow: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  svg: {
    alignSelf: 'center',
  },
  led: {
    position: 'absolute',
    top: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrim: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
