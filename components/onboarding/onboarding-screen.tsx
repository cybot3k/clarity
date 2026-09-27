import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHROME_BLUR_BLEED, ProgressiveBlur } from '@/components/glass-tabs';
import { AtmosphereCanvas, PrimaryButton, ThemedText } from '@/components/ui';
import { spacing } from '@/constants/theme';

/** Back circle. A single control at 40pt is a circle. */
export const ONBOARDING_BACK_SIZE = 40;
/** Floating header band: the back circle plus its vertical padding. */
export const ONBOARDING_HEADER_HEIGHT = ONBOARDING_BACK_SIZE + spacing.sm * 2;

export type OnboardingScreenProps = {
  title: string;
  /** Bold suffix of `title`. Missing or non-suffix titles render fully bold. */
  emphasis?: string;
  subtitle?: string;
  children: ReactNode;
  ctaTitle: string;
  onContinue: () => void;
  ctaDisabled?: boolean;
  /** Tertiary footnote under the content, for the honest caveats. */
  note?: string | null;
  /** Rendered under the CTA: a "Not now" text button, typically. */
  footer?: ReactNode;
};

function StepTitle({ title, emphasis }: { title: string; emphasis?: string }) {
  const suffix = emphasis != null && emphasis.length > 0 && title.endsWith(emphasis) ? emphasis : null;
  if (suffix == null) {
    return (
      <ThemedText variant="display" weight="bold" tone="onAtmosphere">
        {title}
      </ThemedText>
    );
  }
  const lead = title.slice(0, title.length - suffix.length);
  return (
    <ThemedText variant="display" weight="regular" tone="onAtmosphereFaint">
      {lead}
      <ThemedText variant="display" weight="bold" tone="onAtmosphere">
        {suffix}
      </ThemedText>
    </ThemedText>
  );
}

/**
 * The shape every onboarding step shares: a scroll view for the question and
 * its choices, and a CTA pinned to the bottom edge. The CTA lives outside the
 * scroll view in a `KeyboardStickyView`, so on the name step it rides up with
 * the keyboard frame-for-frame instead of hiding behind it. The `opened` offset
 * cancels the safe-area padding, which the keyboard already covers.
 *
 * Nothing here animates in. The steps are tapped through quickly, and a
 * staggered reveal on every push read as lag.
 */
export function OnboardingScreen({
  title,
  emphasis,
  subtitle,
  children,
  ctaTitle,
  onContinue,
  ctaDisabled = false,
  note,
  footer,
}: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, spacing.lg);
  return (
    <AtmosphereCanvas mode="stage">
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + ONBOARDING_HEADER_HEIGHT + spacing.xxl },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <StepTitle title={title} emphasis={emphasis} />
          {subtitle ? (
            <ThemedText variant="subheadProse" tone="onAtmosphereMuted" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
          {children}
          {note ? (
            <ThemedText variant="footnoteProse" tone="onAtmosphereMuted" style={styles.note}>
              {note}
            </ThemedText>
          ) : null}
        </ScrollView>
        <KeyboardStickyView offset={{ closed: 0, opened: bottomPad }}>
          <View style={[styles.cta, { paddingBottom: bottomPad }]}>
            <ProgressiveBlur direction="bottom" style={styles.ctaBlur} />
            <PrimaryButton variant="solid" title={ctaTitle} onPress={onContinue} disabled={ctaDisabled} />
            {footer}
          </View>
        </KeyboardStickyView>
      </View>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  note: {
    marginTop: spacing.md,
  },
  cta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  ctaBlur: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: -CHROME_BLUR_BLEED,
  },
});
