import { ClerkProvider, useAuth } from "@clerk/expo";
import { resourceCache } from "@clerk/expo/resource-cache";
import { tokenCache } from "@/services/clerk-token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useFonts } from "expo-font";
import {
  Observe,
  ObserveErrorBoundary,
  ObserveRoot,
  canObserve,
} from "@/services/observe";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Platform } from "react-native";

import { AuthBridge } from "@/components/auth-bridge";
import "@/services/oauth";
import { ConvexSync } from "@/components/convex-sync";
import { ProgressiveBlur } from "@/components/glass-tabs";
import { ObserveErrorFallback } from "@/components/observe-error-fallback";
import { IntroRevealProvider, SplashOverlay } from "@/components/splash";
import { fontAssets, fonts } from "@/constants/theme";
import { useIntroReveal } from "@/hooks/use-intro-reveal";
import { AppReadyProvider } from "@/hooks/use-mark-interactive";
import { useSettings } from "@/hooks/use-settings";
import { SubscriptionProvider } from "@/hooks/use-subscription";
import { useTheme } from "@/hooks/use-theme";
import { clearAccountData } from "@/services/account";
import { getLastSignedInUserId } from "@/services/auth-state";
import {
  getSettingsResolved,
  resetLocalStoresOnce,
  subscribeSyncState,
} from "@/services/sync-state";

/**
 * EAS Observe. The expo-router integration adds per-route navigation metrics
 * (cold_ttr, warm_ttr, and a per-navigation tti tagged with the route pattern)
 * on top of the app-wide startup metrics. It must be configured at module
 * scope: the library throws if the integration is toggled after the tree
 * mounts, and this module is evaluated before any screen renders.
 *
 * Metrics from debug builds are dropped by default, so a local dev build sends
 * nothing. EXPO_PUBLIC_OBSERVE_IN_DEV=1 dispatches them anyway while verifying
 * the wiring; it has no effect on release builds.
 */
Observe.configure({
  integrations: { "expo-router": canObserve },
  dispatchInDebug: process.env.EXPO_PUBLIC_OBSERVE_IN_DEV === "1",
});

/**
 * Read in app code and passed explicitly: Metro inlines EXPO_PUBLIC_ variables
 * here but not inside node_modules. Deliberately NOT asserted at module scope.
 * `ClerkProvider` throws during render when the key is missing, and a render
 * throw is what `ObserveErrorBoundary` below can catch and report; a module
 * scope throw happens before any boundary exists.
 */
const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

/**
 * Same explicit-read rule as the Clerk key. Also NOT asserted at module scope,
 * and for a stronger reason: `ConvexReactClient` validates the URL in its
 * constructor and throws on an empty one, so the client is built lazily below,
 * inside render, where `ObserveErrorBoundary` can catch and report a missing
 * value exactly like a missing Clerk key.
 *
 * That only holds because the construction happens inside `ConvexRoot`, a
 * CHILD of the boundary. Calling it in `RootLayout`'s own return statement
 * instead evaluates it while the boundary is still an unmounted element, so
 * the throw escapes to the root: an uncaught JS error, which expo-updates'
 * error recovery answers with a hard crash on every launch. Build 22 shipped
 * exactly that after `EXPO_PUBLIC_CONVEX_URL` was left out of the EAS
 * production environment.
 */
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

let convexClient: ConvexReactClient | null = null;

/** A module-level singleton, not `useMemo`: a recomputed memo would open a
 * second WebSocket and orphan the first. */
function getConvexClient(): ConvexReactClient {
  if (!convexClient) {
    convexClient = new ConvexReactClient(CONVEX_URL, {
      // Off on purpose. This project has a web build (EXPO_MARKETING_WEB=1)
      // where the default attaches a real `beforeunload` prompt.
      unsavedChangesWarning: false,
    });
  }
  return convexClient;
}

/**
 * Owns the Convex client's construction so a bad or missing
 * `EXPO_PUBLIC_CONVEX_URL` surfaces as a caught render error under
 * `ObserveErrorBoundary`, not as an uncaught throw that takes the process
 * down. Nothing else belongs here: it exists to put `getConvexClient()` one
 * component below the boundary.
 */
function ConvexRoot({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={getConvexClient()} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

/**
 * One-time wipe of pre-account local data, before any store hydrates.
 *
 * History recorded before sign-in existed has no owner; uploading it would
 * hand it to whichever account signs in first on this device. Local data was
 * disposable when accounts shipped, so it is dropped once, behind a guard the
 * sign-out wipe does not touch. `clearAccountData` also clears the sign-in
 * flag, which is correct here: nothing on the device belongs to anyone yet.
 */
resetLocalStoresOnce(clearAccountData);

/** The QA seed route is compiled to a refusal unless the simulator build profile
 * sets this, and now it is also removed from the navigator in every other build. */
const SEED_ENABLED = process.env.EXPO_PUBLIC_SEED_HOOKS === "1";

// Single source of truth for the native route background. The navigator paints
// every screen's container with the navigation theme's `background`, so setting
// it here themes all nested navigators at once and paints the screen container
// before JS content mounts — the surface behind the tab-switch fade always
// matches the screen color, so no flash.
function NavThemeProvider({ children }: { children: ReactNode }) {
  const { colors, scheme } = useTheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.atmosphereCanvas,
      card: colors.atmosphereCanvas,
      text: colors.foreground,
    },
    // Navigator-rendered text (headers, back labels) uses SF Pro Rounded too.
    fonts: {
      regular: { fontFamily: fonts.regular, fontWeight: "400" },
      medium: { fontFamily: fonts.medium, fontWeight: "500" },
      bold: { fontFamily: fonts.semibold, fontWeight: "600" },
      heavy: { fontFamily: fonts.bold, fontWeight: "700" },
    },
  } as const;

  // Keep the native root view / window (behind the routes: launch, overscroll
  // bounce, transparent sheets) in sync with the theme too.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.atmosphereCanvas);
  }, [colors.atmosphereCanvas]);

  return <ThemeProvider value={navTheme}>{children}</ThemeProvider>;
}

/**
 * The root navigator and its three-way gate: signed out, signed in but not
 * onboarded, and fully onboarded.
 *
 * The gate is SYNCHRONOUS. On the first frame Clerk has not loaded, so
 * `signedIn` comes from the flag the auth bridge keeps in MMKV. That is what
 * lets a returning user land on their tabs offline, exactly as they did before
 * accounts existed; Clerk then confirms or revokes and the guard follows.
 *
 * Declaration order matters. When a guard removes the group that owns the
 * current route, expo-router falls back to the first available screen, and
 * signed out that must be sign-in. Guard flips also drop the removed group's
 * history, which is why sign-out needs no `router.replace` anywhere.
 */
function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { onboardingCompletedAt } = useSettings();

  const signedIn =
    isSignedIn === true || getLastSignedInUserId() !== null;
  const onboarded = onboardingCompletedAt != null;

  const blurHeader = {
    title: "",
    headerTransparent: true,
    headerShadowVisible: false,
    headerBlurEffect: "none",
    headerBackground: () => (
      <ProgressiveBlur direction="top" style={{ flex: 1 }} />
    ),
  } as const;

  return (
    <Stack>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !onboarded}>
        <Stack.Screen
          name="(onboarding)"
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && onboarded}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="session"
          options={{ presentation: "fullScreenModal", headerShown: false }}
        />
        <Stack.Screen
          name="passage-editor"
          options={{ presentation: "modal", ...blurHeader }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: "modal", ...blurHeader }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="manage-subscription"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={SEED_ENABLED}>
        <Stack.Screen name="dev-seed" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppShell({
  fontsReady,
  fontError,
}: {
  fontsReady: boolean;
  fontError: Error | null;
}) {
  const { revealed, setRevealed, splashDone, setSplashDone } =
    useIntroReveal();
  const { scheme } = useTheme();
  const { onboardingCompletedAt } = useSettings();
  const { isLoaded: clerkLoaded } = useAuth();
  const settingsResolved = useSyncExternalStore(
    subscribeSyncState,
    getSettingsResolved,
    getSettingsResolved,
  );

  const restoringSession =
    !clerkLoaded && getLastSignedInUserId() !== null;

  const holdGate =
    !splashDone &&
    (restoringSession ||
      (onboardingCompletedAt == null && !settingsResolved));

  return (
    <>
      <AuthBridge />
      <ConvexSync />
      <SubscriptionProvider>
        <AppReadyProvider value={splashDone}>
          <IntroRevealProvider value={revealed}>
            <NavThemeProvider>
              {(fontsReady || fontError) && !holdGate ? (
                <RootNavigator />
              ) : null}

              <StatusBar style={!splashDone || scheme === "dark" ? "light" : "dark"} />

              {!splashDone ? (
                <SplashOverlay
                  hold={holdGate}
                  onReveal={() => setRevealed(true)}
                  onDone={() => setSplashDone(true)}
                />
              ) : null}
            </NavThemeProvider>
          </IntroRevealProvider>
        </AppReadyProvider>
      </SubscriptionProvider>
    </>
  );
}

function RootLayout() {
  const [fontsReady, fontError] = useFonts(fontAssets);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ObserveErrorBoundary fallback={ObserveErrorFallback}>
        <KeyboardProvider
          statusBarTranslucent
          navigationBarTranslucent
          preserveEdgeToEdge
        >
          <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY}
            tokenCache={tokenCache}
            __experimental_resourceCache={resourceCache}
          >
            <ConvexRoot>
              <AppShell
                fontsReady={fontsReady}
                fontError={fontError ?? null}
              />
            </ConvexRoot>
          </ClerkProvider>
        </KeyboardProvider>
      </ObserveErrorBoundary>
    </GestureHandlerRootView>
  );
}

// Named wrapper instead of ObserveRoot.wrap(RootLayout): Fast Refresh of a HOC
// wrapped default export was a source of "Invalid hook call" because
// expo-observe's useObserve conditionally calls expo-router hooks.
function ObservedRoot() {
  if (Platform.OS === "web") {
    return <RootLayout />;
  }

  return (
    <ObserveRoot>
      <RootLayout />
    </ObserveRoot>
  );
}

export default ObservedRoot;