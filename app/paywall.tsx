import { ArrowRight02Icon, Cancel01Icon, Crown02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';

import {
  AtmosphereCanvas,
  AtmosphereSurface,
  GlassSurface,
  OptionCard,
  PrimaryButton,
  SelectionMark,
  ThemedText,
} from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useSubscription } from '@/hooks/use-subscription';
import { useTheme } from '@/hooks/use-theme';
import { fetchCurrentOffering, purchasePackage } from '@/services/purchases';

/** Apple's standard EULA, which covers auto-renewing subscriptions. */
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://exponathan-clarity.expo.app/privacy';

const FEATURES = [
  'Unlimited practice sessions',
  'Personal AI speech coaching',
  'Full speaking analytics and history',
  'Early access to new features',
];

const PLAN_ANNUAL = 'ANNUAL';
const PLAN_MONTHLY = 'MONTHLY';
const PLAN_WEEKLY = 'WEEKLY';

/** Display order and the per-card caption wording, keyed by package type. */
const PLAN_LABELS: Partial<Record<string, { title: string; caption: string }>> = {
  [PLAN_ANNUAL]: { title: 'Annual', caption: 'per year' },
  [PLAN_MONTHLY]: { title: 'Monthly', caption: 'per month' },
  [PLAN_WEEKLY]: { title: 'Weekly', caption: 'per week' },
};

/** Hairline close circle. A single control at 40pt is a circle. */
const CLOSE_SIZE = 40;
/** Chip row controls. A single control at 40pt is a circle or stadium. */
const CHIP_SIZE = 40;
/** Feature tick disc. A single control at 28pt is a circle. */
const FEATURE_DISC = 28;
const FEATURE_TICK = 14;
/** Stadium plan row. A single control at 64pt uses `radius.full`. */
const PLAN_MIN_HEIGHT = 64;
/** Three stadiums plus the two gaps between them, so the slab does not jump when plans arrive. */
const PLANS_SLOT_MIN_HEIGHT = PLAN_MIN_HEIGHT * 3 + spacing.sm * 2;
/** Save badge. A single control at 22pt is a stadium. */
const SAVE_BADGE_HEIGHT = 22;
/** Unavailable crown tile. An icon tile at 64pt uses `radius.md`, not a stadium. */
const ICON_TILE = 64;

/** Annual first because it is the default selection and carries the badge. */
function sortPlans(packages: PurchasesPackage[]): PurchasesPackage[] {
  const order = [PLAN_ANNUAL, PLAN_MONTHLY, PLAN_WEEKLY];
  return packages
    .filter((pkg) => order.includes(pkg.packageType))
    .sort((a, b) => order.indexOf(a.packageType) - order.indexOf(b.packageType));
}

/**
 * "Save 44%": the annual price against a year of the monthly plan. Derived from
 * the store's own numbers so it can never disagree with the prices shown; null
 * when either plan is missing or the math yields nothing worth bragging about.
 */
function annualSavings(plans: PurchasesPackage[]): number | null {
  const annual = plans.find((pkg) => pkg.packageType === PLAN_ANNUAL);
  const monthly = plans.find((pkg) => pkg.packageType === PLAN_MONTHLY);
  const yearAtMonthlyRate = monthly?.product.pricePerYear ?? null;
  if (!annual || !yearAtMonthlyRate) return null;

  const saved = Math.round((1 - annual.product.price / yearAtMonthlyRate) * 100);
  return saved >= 5 ? saved : null;
}

/**
 * Shown when this build has no store: web, or a release build with no API key.
 * An honest dead end beats a paywall that renders empty, and it names the cause
 * so the next person is not guessing.
 */
function PurchasesUnavailable() {
  const { colors } = useTheme();

  return (
    <AtmosphereCanvas mode="ambient">
      <View style={styles.centered}>
        <AtmosphereSurface mesh="hero" radius="hero" style={styles.unavailableSlab}>
          <View
            style={[
              styles.iconTile,
              {
                backgroundColor: colors.fillTranslucent,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.frostRim,
              },
            ]}>
            <HugeiconsIcon icon={Crown02Icon} size={32} color={colors.proGold} />
          </View>
          <ThemedText variant="title" tone="onAtmosphere" style={styles.centeredText}>
            Clarity Pro is unavailable
          </ThemedText>
          <ThemedText variant="subheadProse" tone="onAtmosphereMuted" style={styles.centeredText}>
            This build has no store connected, so plans cannot load. Try the app on a device or
            simulator build.
          </ThemedText>
        </AtmosphereSurface>
      </View>
    </AtmosphereCanvas>
  );
}

function PlanCard({
  plan,
  selected,
  savings,
  onSelect,
}: {
  plan: PurchasesPackage;
  selected: boolean;
  /** "Save 44%" badge value; only the annual card gets one. */
  savings: number | null;
  onSelect: () => void;
}) {
  const { colors } = useTheme();
  const labels = PLAN_LABELS[plan.packageType];
  if (!labels) return null;

  const isAnnual = plan.packageType === PLAN_ANNUAL;
  const perMonth = isAnnual ? plan.product.pricePerMonthString : null;

  return (
    <OptionCard radius="full" selected={selected} onSelect={onSelect} style={styles.planCard}>
      <View style={styles.planRow}>
        <SelectionMark selected={selected} tone="inverse" />
        <View style={styles.planTitle}>
          <ThemedText variant="title3">{labels.title}</ThemedText>
          {savings !== null && (
            <View
              style={[
                styles.saveBadge,
                { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.frostRim },
              ]}>
              <ThemedText variant="caption" weight="semibold" tone="primary">
                Save {savings}%
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.planPrice}>
          <ThemedText variant="title3" weight="bold">
            {plan.product.priceString}
          </ThemedText>
          <ThemedText variant="footnote" tone="secondary">
            {perMonth ? `${perMonth} / mo` : labels.caption}
          </ThemedText>
        </View>
      </View>
    </OptionCard>
  );
}

/**
 * The Clarity Pro paywall, fully in-app.
 *
 * Layout and copy live here; prices come from the store via the Current
 * offering's packages, so a price change in App Store Connect (or a plan-mix
 * change in the RevenueCat dashboard) still needs no release. Only wording and
 * layout changes do — that is the trade against the previous dashboard-hosted
 * paywall, accepted so the screen can speak the app's own design language.
 *
 * Presented as a modal from the root layout. For gating a locked feature in
 * place, prefer `usePaywall().requirePro` over navigating here.
 */
export default function PaywallScreen() {
  useMarkInteractive();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { available, refresh, restore } = useSubscription();

  const [plans, setPlans] = useState<PurchasesPackage[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // A purchase can land while the customer is also tapping the close button;
  // one latch keeps that from popping two screens.
  const dismissed = useRef(false);
  const close = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    router.back();
  };

  useEffect(() => {
    if (!available) return;
    let alive = true;
    setLoadFailed(false);
    fetchCurrentOffering()
      .then((offering) => {
        if (!alive) return;
        const sorted = sortPlans(offering?.availablePackages ?? []);
        setPlans(sorted);
        setSelectedId(sorted[0]?.identifier ?? null);
        setLoadFailed(sorted.length === 0);
      })
      .catch(() => {
        if (alive) setLoadFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [available]);

  const selected = plans?.find((plan) => plan.identifier === selectedId) ?? null;
  const savings = plans ? annualSavings(plans) : null;

  const buy = async () => {
    if (!selected || busy) return;
    setBusy(true);
    const result = await purchasePackage(selected);
    setBusy(false);

    switch (result.outcome) {
      case 'purchased':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        refresh();
        close();
        return;
      case 'pending':
        Alert.alert(
          'Payment pending',
          'Your payment is still processing. Clarity Pro unlocks as soon as it clears.',
        );
        return;
      case 'failed':
        Alert.alert('Purchase failed', result.message);
        return;
      case 'cancelled':
        // A normal outcome, not an error. The paywall stays open.
        return;
    }
  };

  const restorePurchase = async () => {
    if (busy) return;
    setBusy(true);
    const result = await restore();
    setBusy(false);

    if (result.outcome === 'restored') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      close();
      return;
    }
    if (result.outcome === 'nothingToRestore') {
      // A successful restore that found nothing. Saying so is the difference
      // between the customer retrying and the customer contacting support.
      Alert.alert(
        'Nothing to restore',
        'We could not find a Clarity Pro purchase on this store account. Make sure you are signed in with the account you bought it on.',
      );
      return;
    }
    Alert.alert('Restore failed', result.message);
  };

  if (!available) return <PurchasesUnavailable />;

  return (
    <AtmosphereCanvas mode="ambient">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.chipRow}>
          <GlassSurface radius="full" style={styles.crownCircle}>
            <HugeiconsIcon icon={Crown02Icon} size={20} color={colors.proGold} />
          </GlassSurface>
          <View style={[styles.brandPill, { backgroundColor: colors.inverseSurface }]}>
            <ThemedText variant="callout" weight="regular" tone="inverse">
              Clarity
            </ThemedText>
            <ThemedText variant="callout" weight="bold" tone="inverse">
              Pro
            </ThemedText>
          </View>
        </View>

        <AtmosphereSurface mesh="hero" radius="hero" style={styles.slab}>
          <View style={styles.headerRow}>
            <ThemedText variant="largeTitle" style={styles.headline}>
              <ThemedText variant="largeTitle" weight="regular" tone="onAtmosphereMuted">Get the full power of </ThemedText>
              <ThemedText variant="largeTitle" weight="bold" tone="onAtmosphere">Clarity</ThemedText>
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={close}
              style={({ pressed }) => [
                styles.close,
                {
                  backgroundColor: colors.fillTranslucent,
                  borderColor: colors.frostRim,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}>
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={18}
                color={colors.onAtmosphere}
                strokeWidth={1.5}
              />
            </Pressable>
          </View>

          <View style={styles.features}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureDisc,
                    {
                      backgroundColor: colors.fillTranslucent,
                      borderColor: colors.frostRim,
                    },
                  ]}>
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={FEATURE_TICK}
                    color={colors.onAtmosphere}
                    strokeWidth={2}
                  />
                </View>
                <ThemedText variant="subheadProse" tone="onAtmosphere" style={styles.featureText}>
                  {feature}
                </ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.flexSpacer} />

          {plans === null && !loadFailed ? (
            <View style={styles.plansLoading}>
              <ActivityIndicator color={colors.onAtmosphere} />
            </View>
          ) : loadFailed ? (
            <View style={styles.plansLoading}>
              <ThemedText variant="subheadProse" tone="onAtmosphereMuted" style={styles.centeredText}>
                Plans could not load. Check your connection and reopen this screen.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.plans}>
              {plans?.map((plan) => (
                <PlanCard
                  key={plan.identifier}
                  plan={plan}
                  selected={plan.identifier === selectedId}
                  savings={plan.packageType === PLAN_ANNUAL ? savings : null}
                  onSelect={() => setSelectedId(plan.identifier)}
                />
              ))}
            </View>
          )}

          <PrimaryButton
            variant="knob"
            icon={ArrowRight02Icon}
            title="Continue with Clarity Pro"
            onPress={buy}
            disabled={busy || !selected}
          />
        </AtmosphereSurface>

        <Pressable
          accessibilityRole="button"
          onPress={restorePurchase}
          disabled={busy}
          style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
          <ThemedText variant="subhead" tone="onAtmosphereMuted">
            Restore purchase
          </ThemedText>
        </Pressable>

        <View style={styles.legalRow}>
          <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={spacing.sm}>
            <ThemedText variant="caption" tone="onAtmosphereMuted">
              Terms of Use
            </ThemedText>
          </Pressable>
          <ThemedText variant="caption" tone="onAtmosphereMuted">
            |
          </ThemedText>
          <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={spacing.sm}>
            <ThemedText variant="caption" tone="onAtmosphereMuted">
              Privacy Policy
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  crownCircle: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandPill: {
    height: CHIP_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  slab: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headline: {
    flex: 1,
  },
  close: {
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  unavailableSlab: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  centeredText: {
    textAlign: 'center',
  },
  iconTile: {
    width: ICON_TILE,
    height: ICON_TILE,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  features: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureDisc: {
    width: FEATURE_DISC,
    height: FEATURE_DISC,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  flexSpacer: {
    flexGrow: 1,
    minHeight: spacing.xxxl,
  },
  plans: {
    gap: spacing.sm,
  },
  plansLoading: {
    minHeight: PLANS_SLOT_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    minHeight: PLAN_MIN_HEIGHT,
    justifyContent: 'center',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  planTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planPrice: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  saveBadge: {
    height: SAVE_BADGE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.85,
  },
  textButton: {
    alignSelf: 'center',
    padding: spacing.md,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
