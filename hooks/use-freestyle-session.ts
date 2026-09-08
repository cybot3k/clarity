import { useFreestyleSession as useFreestyleSessionMock } from './use-freestyle-session.mock';

import { isSpeechNativeAvailable } from '@/services/runtime';
import type { FreestyleSession } from '@/types/session';

/**
 * Freestyle uses the same speech-engine switch as passage practice. Expo Go
 * and EXPO_PUBLIC_MOCK_PRACTICE=1 stay on the scripted engine so the native
 * recognizer is never imported.
 */
export const USE_MOCK =
  process.env.EXPO_PUBLIC_MOCK_PRACTICE === '1' || !isSpeechNativeAvailable();

function loadFreestyleSession(): () => FreestyleSession {
  if (USE_MOCK) return useFreestyleSessionMock;
  try {
    return require('./use-freestyle-session.real').useFreestyleSession as () => FreestyleSession;
  } catch (error) {
    console.warn('[practice] native speech unavailable, using scripted freestyle', error);
    return useFreestyleSessionMock;
  }
}

export const useFreestyleSession: () => FreestyleSession = loadFreestyleSession();
