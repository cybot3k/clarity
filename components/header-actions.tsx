import { Crown02Icon, FireIcon, Settings01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ControlDisc, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';

/** One control module: the capsule is 48 tall, like the settings disc beside it. */
const CONTROL = 48;
/** Glyph on a 48 control. */
const ICON_SIZE = 20;

function proButtonLabel(isLoading: boolean, isPro: boolean): string {
  if (isLoading) return 'Checking your subscription';
  return isPro ? 'Manage Clarity Pro' : 'Get Clarity Pro';
}

/**
 * The root-tab top bar's trailing pair: the streak capsule and the settings
 * disc. Both are hairline outlines on the canvas with no fill, like the
 * utility circles in the destination dashboard (S1). They sit directly on the
 * canvas, so there is no glass here to nest or to fade.
 *
 * The streak capsule doubles as the subscription entry point. That pairing is
 * temporary and deliberate — it keeps plans one tap away now that the trailing
 * disc leads to Settings instead — so the accessibility label describes the
 * subscription destination rather than the streak, which is what a screen-reader
 * user is about to activate.
 */
export function HeaderActions({ streak }: { streak: number }) {
  const { colors } = useTheme();
  const { access, isLoading } = useSubscription();

  /**
   * Subscribers get the Customer Center, where they can change plan, cancel, or
   * fix a billing problem; everyone else gets the paywall.
   *
   * The button waits for the first entitlement read rather than routing on the
   * withheld-by-default `isPro`. That read is served from the SDK's cache and
   * lands a frame or two into a cold start; sending a paying customer to the
   * paywall during those frames is the one outcome worth waiting to avoid.
   */
  const openPlans = () => {
    if (isLoading) return;
    Haptics.selectionAsync();
    router.push(access.isPro ? '/manage-subscription' : '/paywall');
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={openPlans}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading }}
        accessibilityLabel={proButtonLabel(isLoading, access.isPro)}
        accessibilityHint={`Current streak: ${streak}`}
        style={({ pressed }) => [
          styles.streak,
          { borderColor: colors.outline },
          pressed && styles.pressed,
        ]}>
        <HugeiconsIcon
          icon={access.isPro ? Crown02Icon : FireIcon}
          size={ICON_SIZE}
          color={access.isPro ? colors.proGold : colors.streakFlame}
        />
        <ThemedText variant="callout" weight="medium" tone="primary" style={styles.count}>
          {streak}
        </ThemedText>
      </Pressable>
      <ControlDisc
        icon={Settings01Icon}
        fill="outline"
        accessibilityLabel="Settings"
        onPress={() => router.push('/settings')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streak: {
    height: CONTROL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  count: {
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    opacity: 0.7,
  },
});
