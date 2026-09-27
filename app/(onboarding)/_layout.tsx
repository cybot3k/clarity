import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { router, useSegments } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHROME_BLUR_BLEED, ProgressiveBlur } from '@/components/glass-tabs';
import { ONBOARDING_BACK_SIZE, ONBOARDING_HEADER_HEIGHT, ONBOARDING_STEPS } from '@/components/onboarding';
import { GlassSurface } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** The first step. Set here, inside the group, rather than as a root anchor:
 * the root's guards filter after anchors resolve, and an anchor naming a
 * removed group would point the navigator at a screen that is not there. */
export const unstable_settings = { initialRouteName: 'name' };

/** Progress dot. A single mark at 6pt is a circle. */
const DOT_SIZE = 6;
/** Current step capsule. Wider than the dot so the row reads as progress, not a radio. */
const DOT_ACTIVE_WIDTH = 20;

/**
 * Chrome shared by every onboarding step: a frost back circle on the left,
 * progress dots in the middle, and a spacer on the right so the dots stay
 * optically centered. It floats over the stage fog and does not remount
 * between steps.
 */
export default function OnboardingLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const current = segments[segments.length - 1];
  const index = Math.max(0, ONBOARDING_STEPS.indexOf(current as never));
  const canGoBack = index > 0;

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.atmosphereCanvas }}>
      <Stack screenOptions={{ headerShown: false }} />
      <View pointerEvents="box-none" style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <ProgressiveBlur
          direction="top"
          style={[styles.headerBlur, { height: insets.top + ONBOARDING_HEADER_HEIGHT + CHROME_BLUR_BLEED }]}
        />
        {canGoBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back}>
            <GlassSurface radius="full" interactive style={styles.backCircle}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.onAtmosphere} strokeWidth={2} />
            </GlassSurface>
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.dots}>
          {ONBOARDING_STEPS.map((step, stepIndex) => (
            <View
              key={step}
              style={[
                styles.dot,
                stepIndex === index
                  ? { width: DOT_ACTIVE_WIDTH, backgroundColor: colors.onAtmosphere }
                  : { backgroundColor: stepIndex < index ? colors.onAtmosphereMuted : colors.track },
              ]}
            />
          ))}
        </View>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backCircle: {
    width: ONBOARDING_BACK_SIZE,
    height: ONBOARDING_BACK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: ONBOARDING_BACK_SIZE,
    height: ONBOARDING_BACK_SIZE,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.full,
  },
});
