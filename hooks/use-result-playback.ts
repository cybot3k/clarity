import { useEffect } from 'react';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';

import type { ResultPlayback } from '@/types/session';

// interruptionMode 'doNotMix' is load-bearing on iOS: it is the only value that
// leaves expo-audio with no AVAudioSession category options, which is the only
// branch where it passes mode: .default. Any other value sets the category
// without a mode, so the recognizer's .measurement mode survives and playback
// comes out of the receiver (call speaker), processing disabled.
const RESULT_PLAYBACK_AUDIO_MODE = {
  allowsRecording: false,
  playsInSilentMode: true,
  interruptionMode: 'doNotMix',
  shouldRouteThroughEarpiece: false,
} as const;

async function routeAudioToSpeaker() {
  try {
    await setAudioModeAsync(RESULT_PLAYBACK_AUDIO_MODE);
  } catch (error) {
    if (__DEV__) {
      console.warn('[results] Could not configure audio playback routing:', error);
    }
  }
}

const UNAVAILABLE: ResultPlayback = {
  available: false,
  isPlaying: false,
  positionMs: 0,
  toggle() {},
};

/**
 * Playback for the results screen's audio pill.
 *
 * When audioUri is non-null the session's recorded WAV plays through
 * expo-audio's useAudioPlayer (status polled at 250ms). When audioUri is null
 * (mock sessions / recording failure) the hook reports `available: false`
 * rather than simulating a playhead.
 */
export function useResultPlayback(audioUri: string | null, _durationMs: number): ResultPlayback {
  const player = useAudioPlayer(audioUri, { updateInterval: 250 });
  const playerStatus = useAudioPlayerStatus(player);

  // Speech recognition leaves the shared session on play-and-record with the
  // .measurement mode and never restores it. Reset category and mode so the
  // recording plays through the main speaker with normal output processing.
  // Re-assert this in toggle() in case another native module changes the
  // shared audio session after this effect runs.
  useEffect(() => {
    if (audioUri) void routeAudioToSpeaker();
  }, [audioUri]);

  // Pause and rewind after the clip finishes so the pill resets. play() after
  // didJustFinish is a no-op on iOS unless the player has been paused and
  // seeked back to 0; the seek must complete before the next play() call.
  useEffect(() => {
    if (audioUri && playerStatus.didJustFinish) {
      player.pause();
      void player.seekTo(0);
    }
  }, [audioUri, playerStatus.didJustFinish, player]);

  if (!audioUri) return UNAVAILABLE;

  return {
    available: true,
    isPlaying: playerStatus.playing,
    positionMs: Math.round(playerStatus.currentTime * 1000),
    async toggle() {
      if (playerStatus.playing) {
        player.pause();
        return;
      }
      try {
        await player.seekTo(0);
      } catch {
        // Play anyway; a failed rewind is better than a dead control.
      }
      await routeAudioToSpeaker();
      player.play();
    },
  };
}
