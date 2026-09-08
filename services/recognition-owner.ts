import { getSpeechRecognitionModule } from '@/services/runtime';

/**
 * Only one session hook may drive the native recognizer at a time. Both the
 * passage and freestyle hooks claim ownership on start() and release on
 * cancel/stop/unmount; claiming aborts any stale owner's session.
 *
 * The native module is resolved lazily so this file is safe to import when
 * speech recognition is missing (Expo Go).
 */

let owner: symbol | null = null;

export function claimEngine(id: symbol) {
  if (owner != null && owner !== id) {
    try {
      getSpeechRecognitionModule()?.abort();
    } catch {
      // stale owner's recognizer already inactive
    }
  }
  owner = id;
}

export function releaseEngine(id: symbol) {
  if (owner === id) owner = null;
}
