import Constants, { AppOwnership } from "expo-constants";
import { Platform } from "react-native";
import type { ReactNode } from "react";

/**
 * expo-observe's native module (ExpoAppMetrics) only exists in a real
 * dev/production build. Statically importing "expo-observe" eagerly looks
 * up that module and throws synchronously if it's missing — always true in
 * Expo Go and on web. Every file needing Observe/ObserveRoot/
 * ObserveErrorBoundary/useObserve must go through this wrapper instead of
 * importing "expo-observe" directly, or the app crashes before any runtime
 * check can run.
 */
export const canObserve =
  Platform.OS !== "web" && Constants.appOwnership !== AppOwnership.Expo;

const Passthrough = ({ children }: { children: ReactNode }) => <>{children}</>;

export const { Observe, ObserveErrorBoundary, ObserveRoot, useObserve } = canObserve
  ? require("expo-observe")
  : {
      Observe: { configure: () => {}, logEvent: () => {}, setGlobalAttributes: () => {} },
      ObserveErrorBoundary: Passthrough,
      ObserveRoot: Passthrough,
      useObserve: () => ({ markInteractive: () => {} }),
    };