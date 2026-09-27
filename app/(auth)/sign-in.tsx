import { router } from 'expo-router';
import { AppleIcon, GoogleIcon } from '@hugeicons/core-free-icons';
import { useClerk, useSignIn } from '@clerk/expo';
import { useSSO } from '@clerk/expo/experimental';
import { useSignInWithApple } from '@clerk/expo/apple';
import { Observe } from '@/services/observe';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IntroReveal } from '@/components/splash';
import { AtmosphereCanvas, PrimaryButton, SpeechMark, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useTheme } from '@/hooks/use-theme';
import {
  describeAuthError,
  isAuthCancel,
  isAuthSessionCancel,
  oauthRedirectUrl,
} from '@/services/oauth';
import { isExpoGo } from '@/services/runtime';

/**
 * Two deliberately separate ways into the Clerk DEVELOPMENT instance:
 *
 * - Local debug builds can use the password kept in `.env.local`.
 * - The static EAS Simulator build uses Clerk's public test-email convention
 *   and fixed test OTP. It only activates in the simulator QA profile, with a
 *   `pk_test_` key and a `+clerk_test` address. No password enters an EAS env
 *   or the app bundle.
 */
const AUTOMATION_BUILD = process.env.EXPO_PUBLIC_AUTOMATION === '1';
const CLERK_DEVELOPMENT_INSTANCE =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') === true;
const DEV_EMAIL = process.env.EXPO_PUBLIC_DEV_SIGNIN_EMAIL?.trim() || null;
const DEV_PASSWORD = process.env.EXPO_PUBLIC_DEV_SIGNIN_PASSWORD?.trim() || null;
const DEV_ACCOUNT =
  __DEV__ && DEV_EMAIL && DEV_PASSWORD
    ? { emailAddress: DEV_EMAIL, password: DEV_PASSWORD }
    : null;
const SIMULATOR_TEST_EMAIL =
  AUTOMATION_BUILD &&
  CLERK_DEVELOPMENT_INSTANCE &&
  DEV_EMAIL != null &&
  /\+clerk_test(?:_|@)/i.test(DEV_EMAIL)
    ? DEV_EMAIL
    : null;
const SIMULATOR_AUTH_ERROR = !AUTOMATION_BUILD
  ? null
  : !CLERK_DEVELOPMENT_INSTANCE
    ? 'Simulator sign-in needs the Clerk development environment.'
    : !SIMULATOR_TEST_EMAIL
      ? 'The simulator test user is not configured.'
      : null;
const CLERK_TEST_CODE = '424242';
/** Frost pill. A single control at 36pt is a stadium. */
const PILL_HEIGHT = 36;

/**
 * The signed-out screen.
 *
 * Google uses Clerk browser OAuth (`oauth_google`) in Expo Go and in a local
 * `bun run` binary. Native One Tap is a different strategy that needs Play
 * SHA-1 this repo does not ship; it used to fail silently and skip OAuth.
 *
 * Apple uses native Sign in with Apple on a real iOS binary, and `oauth_apple`
 * in Expo Go (native tokens are issued to host.exp.Exponent, which Clerk
 * rejects).
 *
 * No navigation on success. The root navigator's guard reads the new session.
 */
export default function SignInScreen() {
  useMarkInteractive();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const clerk = useClerk();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const { startSSOFlow } = useSSO();
  const { signIn } = useSignIn();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const activate = async (sessionId: string | null | undefined) => {
    if (!sessionId) return false;
    await clerk.setActive({ session: sessionId });
    return true;
  };

  const startOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    const redirectUrl = oauthRedirectUrl();

    if (__DEV__) {
      console.warn(
        `[auth] OAuth redirect URL (allowlist in Clerk): ${redirectUrl}`,
      );
    }

    console.warn('[auth] BEFORE startSSOFlow');

    const result = await startSSOFlow({
      strategy,
      redirectUrl,
    });

    console.warn('[auth] AFTER startSSOFlow', {
      createdSessionId: result.createdSessionId,
      authSessionType: result.authSessionResult?.type,
    });

    if (isAuthSessionCancel(result.authSessionResult?.type)) {
      return;
    }

    console.warn('[auth] BEFORE activate');

    if (await activate(result.createdSessionId)) {
      console.warn('[auth] AFTER activate');
      router.replace('/');
      return;
    }

    // Experimental SSO activates an existing session internally and returns
    // a null createdSessionId. Clerk.session is already set in that case.
    if (clerk.session) {
      return;
    }

    if (result.authSessionResult?.type === 'success') {
      throw new Error(
        `OAuth finished without a session. Add this Redirect URL in Clerk: ${redirectUrl}`,
      );
    }

    throw new Error(`${strategy} sign-in completed without a session`);
  };

  const onGoogle = async () => {
    console.warn('[auth] GOOGLE BUTTON PRESSED');

    if (busy || !clerk.loaded) return;

    setBusy(true);
    setFailure(null);

    try {
      // Browser OAuth (`oauth_google`) is the path that works in Expo Go AND
      // in a local `bun run android` without Play SHA-1 / One Tap. Native
      // `google_one_tap` is a different Clerk strategy; trying it first used
      // to swallow SHA-1 failures as a silent cancel and never open OAuth.
      await startOAuth('oauth_google');
    } catch (error) {
      if (!isAuthCancel(error)) {
        if (
          typeof Observe !== 'undefined' &&
          typeof Observe.reportError === 'function'
        ) {
          Observe.reportError(error);
        }

        if (__DEV__) {
          console.warn('[auth] google sign-in failed', error);
        }

        setFailure(describeAuthError(error, 'Google'));
      }
    } finally {
      setBusy(false);
    }
  };

  const onApple = async () => {
    if (busy || !clerk.loaded) return;
    setBusy(true);
    setFailure(null);

    try {
      // Expo Go's Apple token is issued to host.exp.Exponent, which Clerk
      // rejects. Browser OAuth is the iOS Expo Go path.
      if (!isExpoGo()) {
        try {
          const native = await startAppleAuthenticationFlow();
          if (await activate(native.createdSessionId ?? null)) return;
          return;
        } catch (error) {
          if (isAuthCancel(error)) return;
          if (__DEV__) {
            console.warn(
              '[auth] native Apple failed, falling back to OAuth',
              error,
            );
          }
        }
      }

      await startOAuth('oauth_apple');
    } catch (error) {
      if (!isAuthCancel(error)) {
        Observe.reportError(error);
        if (__DEV__) {
          console.warn('[auth] apple sign-in failed', error);
        }
        setFailure(describeAuthError(error, 'Apple'));
      }
    } finally {
      setBusy(false);
    }
  };

  /** Custom Clerk flow for the local password account or simulator test OTP. */
  const runDev = async () => {
    if ((!DEV_ACCOUNT && !SIMULATOR_TEST_EMAIL) || busy || !clerk.loaded)
      return;

    setBusy(true);
    setFailure(null);

    try {
      if (SIMULATOR_TEST_EMAIL) {
        const sent = await signIn.emailCode.sendCode({
          emailAddress: SIMULATOR_TEST_EMAIL,
        });

        if (sent.error) throw sent.error;

        const verified = await signIn.emailCode.verifyCode({
          code: CLERK_TEST_CODE,
        });

        if (verified.error) throw verified.error;
      } else if (DEV_ACCOUNT) {
        const attempted = await signIn.password(DEV_ACCOUNT);
        if (attempted.error) throw attempted.error;
      }

      if (signIn.status !== 'complete') {
        throw new Error(`Sign-in status ${signIn.status}`);
      }

      const finalized = await signIn.finalize();
      if (finalized.error) throw finalized.error;
    } catch (error) {
      Observe.reportError(error);
      console.warn('[auth] dev sign-in failed', error);
      setFailure('Dev sign-in failed. Check the Metro console.');
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || !clerk.loaded;

  return (
    <AtmosphereCanvas mode="stage">
      <View style={[styles.wordmark, { paddingTop: insets.top + spacing.xl }]}>
        <SpeechMark color={colors.accent} height={spacing.xxl} />
        <ThemedText variant="headline" weight="bold" tone="onAtmosphere">
          Clarity
        </ThemedText>
      </View>
      <View style={styles.hero}>
        <ThemedText variant="sectionTitle"><ThemedText variant="sectionTitle" weight="bold" tone="onAtmosphere">Practice out loud.</ThemedText><ThemedText variant="sectionTitle" weight="regular" tone="onAtmosphereMuted"> Track your pace, pronunciation, and the words that slow you down.</ThemedText></ThemedText>
        <View style={styles.pills}>
          {['Pace', 'Pronunciation', 'Fluency'].map((label) => (
            <View
              key={label}
              style={[styles.pill, { backgroundColor: colors.fillTranslucent, borderColor: colors.frostRim }]}>
              <ThemedText variant="footnote" weight="semibold" tone="onAtmosphere">
                {label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.actions,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {failure ? (
          <ThemedText
            variant="footnote"
            tone="onAtmosphereMuted"
            style={styles.failure}
          >
            {failure}
          </ThemedText>
        ) : null}

        {!clerk.loaded ? (
          <ThemedText
            variant="footnote"
            tone="onAtmosphereMuted"
            style={styles.failure}
          >
            Connecting…
          </ThemedText>
        ) : null}

        {SIMULATOR_AUTH_ERROR ? (
          <ThemedText
            variant="footnote"
            tone="onAtmosphereMuted"
            style={styles.failure}
            testID="simulator-auth-config-error"
          >
            {SIMULATOR_AUTH_ERROR}
          </ThemedText>
        ) : null}

        {Platform.OS === 'ios' ? (
          <IntroReveal order={0} fade={false} autoplay>
            <PrimaryButton
              title="Continue with Apple"
              icon={AppleIcon}
              disabled={disabled}
              onPress={onApple}
            />
          </IntroReveal>
        ) : null}

        <IntroReveal order={1} fade={false} autoplay>
          <PrimaryButton
            title="Continue with Google"
            icon={GoogleIcon}
            variant="frost"
            disabled={disabled}
            onPress={onGoogle}
          />
        </IntroReveal>

        {SIMULATOR_TEST_EMAIL || DEV_ACCOUNT ? (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={runDev}
            testID="dev-test-sign-in"
            style={({ pressed }) => [
              styles.textButton,
              { opacity: pressed || disabled ? 0.6 : 1 },
            ]}
          >
            <ThemedText variant="subhead" tone="onAtmosphereMuted">
              {SIMULATOR_TEST_EMAIL
                ? 'Sign in as dev test user'
                : 'Sign in as dev (development build only)'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  hero: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    height: PILL_HEIGHT,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  failure: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  textButton: {
    alignSelf: 'center',
    padding: spacing.md,
  },
});