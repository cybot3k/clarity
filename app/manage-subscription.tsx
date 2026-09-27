import { router } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { AtmosphereCanvas, AtmosphereSurface, PrimaryButton, ThemedText } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useSubscription } from '@/hooks/use-subscription';
import { isExpoGo } from '@/services/runtime';

type CustomerCenterView = typeof import('react-native-purchases-ui').default.CustomerCenterView;

function loadCustomerCenterView(): CustomerCenterView | null {
  if (isExpoGo()) return null;
  try {
    const ui = require('react-native-purchases-ui') as typeof import('react-native-purchases-ui');
    return ui.default.CustomerCenterView;
  } catch {
    return null;
  }
}

/**
 * The RevenueCat Customer Center, embedded as a route.
 *
 * This is the self-serve subscription screen: see the active plan, change it,
 * cancel, request a refund (iOS only), or report a purchase that did not unlock.
 * Which of those appear, and the retention offers shown on the way out, are
 * configured under Project Settings > Customer Center in the dashboard, so the
 * flow can change without an app release.
 *
 * Shipping this is also the cheapest support win available: cancellations and
 * "I paid and nothing happened" are the two most common subscription tickets,
 * and both are self-serve here.
 *
 * Embedded rather than `presentCustomerCenter()` so it is a real navigation
 * destination with a back stack. The imperative version is on
 * `usePaywall().presentCustomerCenter`, for presenting it over what the customer
 * is already doing.
 *
 * Expo Go has no RevenueCat native view, so this route falls back to copy
 * instead of importing `react-native-purchases-ui` at module scope.
 */
export default function ManageSubscriptionScreen() {
  useMarkInteractive();

  const { refresh } = useSubscription();
  const dismissed = useRef(false);
  const CustomerCenterView = loadCustomerCenterView();

  const close = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    router.back();
  };

  if (!CustomerCenterView) {
    return (
      <AtmosphereCanvas mode="ambient">
        <View style={styles.fallback}>
          <AtmosphereSurface mesh="hero" radius="hero" style={styles.slab}>
            <ThemedText variant="title" tone="onAtmosphere" style={styles.fallbackTitle}>
              Subscriptions are unavailable here
            </ThemedText>
            <ThemedText variant="subheadProse" tone="onAtmosphereMuted" style={styles.fallbackBody}>
              Manage billing in a development or store build. Expo Go cannot talk to
              the App Store or Play Billing.
            </ThemedText>
            <PrimaryButton title="Close" onPress={close} />
          </AtmosphereSurface>
        </View>
      </AtmosphereCanvas>
    );
  }

  return (
    <CustomerCenterView
      style={styles.customerCenter}
      onRestoreCompleted={() => {
        refresh();
      }}
      onRefundRequestCompleted={() => {
        // A granted refund revokes the entitlement server-side, so the local
        // read has to come from RevenueCat again rather than the SDK cache.
        refresh();
      }}
      onPromotionalOfferSucceeded={() => {
        refresh();
      }}
      onShowingManageSubscriptions={() => {
        // The customer is heading to the store's own management page, where they
        // may cancel. Refresh so returning to the app shows the real state.
        refresh();
      }}
      onDismiss={close}
    />
  );
}

const styles = StyleSheet.create({
  customerCenter: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  slab: {
    padding: spacing.xxl,
    gap: spacing.md,
  },
  fallbackTitle: {
    textAlign: 'center',
  },
  fallbackBody: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
