/**
 * Expo Go does not ship ExpoAppMetrics / ExpoObserve. Requiring `expo-observe`
 * then throws `Cannot find native module 'ExpoAppMetrics'` before any screen
 * mounts. This shim uses the real package only when the native module exists.
 */

const { requireOptionalNativeModule } = require('expo');

function hasObserveNative() {
  try {
    return (
      requireOptionalNativeModule('ExpoAppMetrics') != null ||
      requireOptionalNativeModule('ExpoObserve') != null
    );
  } catch {
    return false;
  }
}

const noopMark = { markInteractive() {} };

let nativeObserve = null;
if (hasObserveNative()) {
  try {
    // Extra alias in metro.config.js so this is not rewritten back to this shim.
    nativeObserve = require('expo-observe-native');
  } catch (error) {
    console.warn('[observe] native package failed to load', error);
  }
}

if (nativeObserve) {
  module.exports = nativeObserve;
} else {
  const Observe = {
    configure() {},
    reportError(error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[observe]', error);
      }
    },
    setBundleDefaults() {},
    addListener() {
      return { remove() {} };
    },
    getIntegrations() {
      return null;
    },
  };

  function ObserveRoot({ children }) {
    return children ?? null;
  }
  ObserveRoot.wrap = function wrap(Component) {
    return Component;
  };

  function ObserveErrorBoundary({ children }) {
    return children ?? null;
  }

  function ObserveInteractiveMarker({ children }) {
    return children ?? null;
  }

  function useObserve() {
    return noopMark;
  }

  module.exports = {
    Observe,
    default: Observe,
    ObserveRoot,
    ObserveErrorBoundary,
    ObserveInteractiveMarker,
    useObserve,
    AppMetrics: Observe,
  };
}
