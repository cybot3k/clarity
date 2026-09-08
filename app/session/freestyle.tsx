import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereCanvas } from '@/components/ui';
import { LiveTranscript } from '@/components/session/live-transcript';
import { LiveWpm } from '@/components/session/live-wpm';
import { PracticeControls } from '@/components/session/practice-controls';
import { SessionTopBar } from '@/components/session/session-top-bar';
import { TELEPROMPTER_TEXT_SIZES } from '@/constants/session-theme';
import { getTopic, TOPICS } from '@/constants/topics';
import { useTheme } from '@/hooks/use-theme';
import { useFreestyleSession } from '@/hooks/use-freestyle-session';
import { useMarkInteractive } from '@/hooks/use-mark-interactive';
import { useSessionCheckpoint } from '@/hooks/use-session-checkpoint';
import { recordSession } from '@/services/session-history';
import { FREESTYLE_TARGET_WPM } from '@/services/scoring';
import type { SessionEndedReason } from '@/types/history';

import { useSessionContext } from './_layout';

/** Clears the absolutely-positioned SessionTopBar, plus breathing room. */
const CONTENT_TOP_GAP = 82;

export default function FreestyleScreen() {
  const { topicId } = useLocalSearchParams<{ topicId?: string }>();
  const topic = getTopic(topicId) ?? TOPICS[0];

  useMarkInteractive();

  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { setResult, retryToken } = useSessionContext();

  const session = useFreestyleSession();

  const [sizeIndex, setSizeIndex] = useState(1);
  const fontSize = TELEPROMPTER_TEXT_SIZES[sizeIndex];

  // Same contract as the passage screen: live fields rebuild the session
  // object every render; stable effects/callbacks act through a ref.
  const sessionRef = useRef(session);
  const navigatedRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    sessionRef.current.start();
    return () => {
      const s = sessionRef.current;
      if (s.status === 'listening' || s.status === 'paused') s.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Results screen's Retry bumps the token; restart a fresh attempt.
  const prevRetryRef = useRef(retryToken);
  useEffect(() => {
    if (retryToken === prevRetryRef.current) return;
    prevRetryRef.current = retryToken;
    navigatedRef.current = false;
    cancelledRef.current = false;
    sessionRef.current.restart();
  }, [retryToken]);

  const meta = useMemo(
    () => ({ mode: 'freestyle' as const, topicId: topic.id, contentTitle: topic.title }),
    [topic.id, topic.title],
  );

  // Declared above the handlers because each terminal path has to clear the
  // checkpoint once it has written its record — see `useSessionCheckpoint`.
  const checkpoint = useSessionCheckpoint({
    status: session.status,
    elapsedMs: session.elapsedMs,
    // No reference text, so the committed transcript is the only word evidence.
    spokenWords: session.finalTranscript.trim().split(/\s+/).filter(Boolean).length,
    fillerCount: session.fillerCount,
    meta: { ...meta, targetWpm: FREESTYLE_TARGET_WPM },
    onBackground: () => sessionRef.current.pause(),
  });

  const finishSession = useCallback(
    async (endedReason: SessionEndedReason = 'stopped') => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      try {
        const result = await sessionRef.current.stop();
        // Once per attempt (navigatedRef); each retry becomes its own record.
        const written = recordSession(result, { ...meta, endedReason });
        // Pushing Results does not unmount this screen, so the checkpoint has to
        // be cleared here or it gets recovered as a duplicate next launch.
        checkpoint.end();
        // Dismiss during scoring cancels this navigation; the record still lands.
        if (cancelledRef.current) return;
        setResult(result, written.ok ? written.record.id : null);
        router.push('/session/results');
      } catch {
        navigatedRef.current = false;
      }
    },
    [setResult, meta, checkpoint],
  );

  /** Records the partial attempt as 'abandoned' rather than discarding it: the
   * minutes count toward effort, the skills ignore it. */
  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancelledRef.current = true;
    const s = sessionRef.current;
    const alreadyFinishing = navigatedRef.current;
    navigatedRef.current = true;
    if (alreadyFinishing) {
      // finishSession is in-flight. It will bank the attempt; we only cancel
      // its Results push.
      router.back();
      return;
    }
    const inProgress =
      s.status === 'listening' || s.status === 'paused' || s.status === 'processing';
    if (inProgress) {
      // Checkpoint cleared only once the write lands, so a kill during stop()
      // still recovers these minutes.
      void s
        .stop()
        .then((result) => recordSession(result, { ...meta, endedReason: 'abandoned' }))
        .catch(() => {})
        .finally(() => checkpoint.end());
    } else {
      checkpoint.end();
    }
    router.back();
  }, [meta, checkpoint]);

  const handleTextSize = useCallback(() => {
    Haptics.selectionAsync();
    setSizeIndex((i) => (i + 1) % TELEPROMPTER_TEXT_SIZES.length);
  }, []);

  const handlePauseToggle = useCallback(() => {
    const s = sessionRef.current;
    if (s.status === 'listening') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      s.pause();
    } else if (s.status === 'paused') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      s.resume();
    }
  }, []);

  /** Sequenced behind the stop, never alongside it: resetting the machine under
   * an in-flight `stop()` let the stop's tail tear down the new attempt. */
  const handleRestart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const s = sessionRef.current;
    if (s.status !== 'listening' && s.status !== 'paused') {
      navigatedRef.current = false;
      s.restart();
      return;
    }
    navigatedRef.current = true;
    void s
      .stop()
      .then((result) => recordSession(result, { ...meta, endedReason: 'abandoned' }))
      .catch(() => {})
      .finally(() => {
        navigatedRef.current = false;
        sessionRef.current.restart();
        checkpoint.begin();
      });
  }, [meta, checkpoint]);

  const handleStop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    finishSession('stopped');
  }, [finishSession]);

  const contentTop = insets.top + CONTENT_TOP_GAP;

  return (
    <AtmosphereCanvas fog={false}>
    <View style={styles.screen}>
      <LiveTranscript
        finalText={session.finalTranscript}
        interimText={session.interimTranscript}
        placeholder={topic.prompt}
        fontSize={fontSize}
        colors={{
          foreground: colors.foreground,
          dimmed: colors.dimmed,
          accent: colors.atmosphereAccent,
        }}
        topInset={contentTop}
        bottomInset={windowHeight * 0.55}
      />

      <SessionTopBar
        onDismiss={handleDismiss}
        dismissDisabled={session.status === 'processing'}
        onTextSize={handleTextSize}>
        <LiveWpm liveWpm={session.liveWpm} targetWpm={FREESTYLE_TARGET_WPM} />
      </SessionTopBar>

      <PracticeControls
        status={session.status}
        error={session.error}
        elapsedMs={session.elapsedMs}
        meterLevel={session.meterLevel}
        onPauseToggle={handlePauseToggle}
        onRestart={handleRestart}
        onStop={handleStop}
        onErrorDismiss={handleDismiss}
      />
    </View>
    </AtmosphereCanvas>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
