/**
 * Browser OAuth helpers for Clerk SSO.
 *
 * Native Google (`google_one_tap`) is a different Clerk strategy than the
 * Google social connection (`oauth_google`). Expo Go has no native Google
 * module. `bun run android` has the module but still fails if One Tap / SHA-1
 * is not set up. Browser OAuth is the path that actually completes a session
 * in both runtimes — but only if:
 *   1. `WebBrowser.maybeCompleteAuthSession()` ran (otherwise the sheet never
 *      closes on Android), and
 *   2. this redirect URL is allowlisted in the Clerk dashboard.
 */

import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { isExpoGo } from '@/services/runtime';

WebBrowser.maybeCompleteAuthSession();

const CANCEL_CODES = new Set([
  'ERR_REQUEST_CANCELED',
  'SIGN_IN_CANCELLED',
  '-5',
  'ERR_CANCELED',
]);

export function oauthRedirectUrl(): string {
  const scheme =
    typeof Constants.expoConfig?.scheme === 'string' ? Constants.expoConfig.scheme : 'clarity';
  return AuthSession.makeRedirectUri({
    scheme,
    path: 'sso-callback',
    // Expo Go: stable `exp://localhost:8081/--/sso-callback` so Clerk can be
    // allowlisted once. The in-app browser matches the URL; it does not fetch
    // localhost on the phone.
    preferLocalhost: false,
  });
}

export function isAuthCancel(error: unknown): boolean {
  if (error == null || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string' || typeof code === 'number') {
    if (CANCEL_CODES.has(String(code))) return true;
  }
  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && /cancel/i.test(message);
}

export function isAuthSessionCancel(type: string | undefined): boolean {
  return type === 'cancel' || type === 'dismiss';
}

export function describeAuthError(error: unknown, provider: 'Google' | 'Apple'): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (/redirect/i.test(message) || /whitelist/i.test(message) || /allow.?list/i.test(message)) {
    return `Add this Redirect URL in Clerk: ${oauthRedirectUrl()}`;
  }
  if (/native module is not available/i.test(message)) {
    return `Could not sign in with ${provider}. Try again.`;
  }
  return `Could not sign in with ${provider}. Try again.`;
}
