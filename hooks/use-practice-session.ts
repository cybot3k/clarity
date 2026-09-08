import { usePracticeSession as usePracticeSessionMock } from './use-practice-session.mock';

import { isSpeechNativeAvailable } from '@/services/runtime';
import type { Passage, PracticeSession } from '@/types/session';

/**
 * Swap point between the mock session (UI development, Expo Go, simulator QA)
 * and the real speech-recognition engine.
 *
 * Expo Go has no expo-speech-recognition native module. Importing the real
 * hook would evaluate that package at module scope and red-screen launch, so
 * the real engine is required only after a runtime probe succeeds.
 *
 * Set EXPO_PUBLIC_MOCK_PRACTICE=1 to force the mock in a development build.
 */
export const USE_MOCK =
  process.env.EXPO_PUBLIC_MOCK_PRACTICE === '1' || !isSpeechNativeAvailable();

function loadPracticeSession(): (passage: Passage) => PracticeSession {
  if (USE_MOCK) return usePracticeSessionMock;
  try {
    return require('./use-practice-session.real').usePracticeSession as (
      passage: Passage,
    ) => PracticeSession;
  } catch (error) {
    console.warn('[practice] native speech unavailable, using scripted session', error);
    return usePracticeSessionMock;
  }
}

export const usePracticeSession: (passage: Passage) => PracticeSession = loadPracticeSession();
