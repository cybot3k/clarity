/**
 * Runtime capability probes. Native-only modules (MMKV, RevenueCat, speech
 * recognition) are not in Expo Go; requiring them at module scope red-screens
 * the app before any screen can mount. Callers must go through these helpers
 * instead of importing those packages at the top of a file.
 */

import { isRunningInExpoGo } from 'expo';

export function isExpoGo(): boolean {
  return isRunningInExpoGo();
}

export type SpeechRecognitionNative =
  typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;

let speechModule: SpeechRecognitionNative | null | undefined;

/**
 * The native speech module, or null when this runtime cannot load it (Expo Go,
 * a JS reload against a stale binary, or EXPO_PUBLIC_MOCK_PRACTICE=1).
 *
 * The require is lazy and cached: Expo Go never evaluates
 * `expo-speech-recognition`, so the missing native binding cannot throw during
 * the first import of a screen.
 */
export function getSpeechRecognitionModule(): SpeechRecognitionNative | null {
  if (process.env.EXPO_PUBLIC_MOCK_PRACTICE === '1') return null;
  if (isExpoGo()) return null;
  if (speechModule !== undefined) return speechModule;
  try {
    const mod = require('expo-speech-recognition') as typeof import('expo-speech-recognition');
    speechModule = mod.ExpoSpeechRecognitionModule ?? null;
  } catch {
    speechModule = null;
  }
  return speechModule;
}

export function isSpeechNativeAvailable(): boolean {
  return getSpeechRecognitionModule() != null;
}

let nativeGoogle: boolean | undefined;

/**
 * True only when the Clerk Google native module is actually linked. Expo Go
 * never has it. A development build has it after prebuild with
 * `@clerk/expo-google-signin`.
 */
export function isNativeGoogleAvailable(): boolean {
  if (isExpoGo()) return false;
  if (nativeGoogle !== undefined) return nativeGoogle;
  try {
    const { requireOptionalNativeModule } = require('expo') as typeof import('expo');
    nativeGoogle = requireOptionalNativeModule('ClerkGoogleSignIn') != null;
  } catch {
    nativeGoogle = false;
  }
  return nativeGoogle;
}
