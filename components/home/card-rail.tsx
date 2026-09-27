import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { atmosphere, spacing, springs } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';

/** At least this much of the next card shows: enough for its identity column. */
const PEEK = 86;
/** The sheet's side inset from the screen edge (it bleeds 8 past the 20 page column). */
const SHEET_INSET = spacing.sm;

/**
 * Square card edge. The card starts on the page column and the next one peeks
 * 86 before the sheet's edge: 271 on a 393 screen, the destination's ≈275.
 */
export function useCardSize(): number {
  const { width } = useWindowDimensions();
  return width - SHEET_INSET - spacing.xl - spacing.sm - PEEK;
}

/**
 * 1-up + peek, snapping per card. No pager dots, no scale, no blur. It bleeds
 * through the sheet's 12 padding so cards clip at the sheet's edge rather than
 * at the reading column.
 */
export function CardRail({ size, children }: { size: number; children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={size + spacing.sm}
      decelerationRate="fast"
      style={styles.rail}
      contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

/** A square card that is one press target: medium haptic and a small press scale. */
export function PressableCard({
  size,
  onPress,
  accessibilityLabel,
  children,
}: {
  size: number;
  onPress: () => void;
  accessibilityLabel?: string;
  children: ReactNode;
}) {
  const { reduced } = useAtmospherePrefs();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={() => {
        if (!reduced) scale.value = withSpring(atmosphere.pressScale, springs.snap);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.snap);
      }}>
      <Animated.View style={[{ width: size, height: size }, pressStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginHorizontal: -spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
