import LottieView, { type AnimationObject } from 'lottie-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const START = require('@/assets/lottie/loading-spinner/Start.json');
const ACTIVE = require('@/assets/lottie/loading-spinner/Active.json');
const STOP = require('@/assets/lottie/loading-spinner/Stop.json');

// The animations are authored black. Rewrite every fill/stroke to the theme
// ink, keeping each node's alpha (the files use alpha-0 helper fills).
function tintLottie(source: object, rgb: [number, number, number]): AnimationObject {
  const clone = JSON.parse(JSON.stringify(source)) as AnimationObject;
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === 'object') {
      const shape = node as { ty?: unknown; c?: { a?: number; k?: unknown[] } };
      if (
        (shape.ty === 'fl' || shape.ty === 'st') &&
        Array.isArray(shape.c?.k) &&
        typeof shape.c.k[0] === 'number'
      ) {
        shape.c.k = [...rgb, typeof shape.c.k[3] === 'number' ? shape.c.k[3] : 1];
      }
      Object.values(node).forEach(walk);
    }
  };
  walk(clone);
  return clone;
}

function colorChannels(color: string): [number, number, number] {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim());
  if (hex) {
    const raw = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    const n = Number.parseInt(raw, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color.trim());
  if (rgb) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  return [0, 0, 0];
}

const sourceCache = new Map<string, { start: AnimationObject; active: AnimationObject; stop: AnimationObject }>();
function getSources(color: string) {
  const cached = sourceCache.get(color);
  if (cached) return cached;
  const rgb = colorChannels(color);
  const sources = {
    start: tintLottie(START, rgb),
    active: tintLottie(ACTIVE, rgb),
    stop: tintLottie(STOP, rgb),
  };
  sourceCache.set(color, sources);
  return sources;
}

// Start is 152.4 frames @60fps (~2.5s), Stop is 58.8 (~1s). The fallbacks fire
// if onAnimationFinish never does, so the spinner can't wedge a screen open.
const START_FALLBACK_MS = 3200;
const STOP_FALLBACK_MS = 1600;

type Phase = 'start' | 'active' | 'stop' | 'done';

export type LoadingSpinnerProps = {
  /** Keep true while the work is in flight; flip false to play the stop animation. */
  active: boolean;
  /** Fired exactly once, after the stop animation completes (or its fallback timer). */
  onFinish?: () => void;
  size?: number;
};

export function LoadingSpinner({ active, onFinish, size = 40 }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const sources = useMemo(() => getSources(colors.foreground), [colors.foreground]);
  const [phase, setPhase] = useState<Phase>('start');
  const viewRef = useRef<LottieView>(null);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // autoPlay is unreliable when a LottieView remounts (phase/theme key changes),
  // so kick playback imperatively after each mount.
  useEffect(() => {
    if (phase === 'done') return;
    const timer = setTimeout(() => viewRef.current?.play(), 32);
    return () => clearTimeout(timer);
  }, [phase, sources]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('done');
    onFinishRef.current?.();
  }, []);

  useEffect(() => {
    if (active) {
      if (finishedRef.current) {
        finishedRef.current = false;
        setPhase('start');
      }
      return;
    }
    setPhase((current) => (current === 'start' || current === 'active' ? 'stop' : current));
  }, [active]);

  useEffect(() => {
    if (phase === 'start') {
      const timer = setTimeout(() => {
        setPhase((current) => (current === 'start' ? 'active' : current));
      }, START_FALLBACK_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'stop') {
      const timer = setTimeout(finish, STOP_FALLBACK_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, finish]);

  if (phase === 'done') return null;

  return (
    <View style={{ width: size, height: size }}>
      {phase === 'start' ? (
        <LottieView
          ref={viewRef}
          key={`start-${colors.foreground}`}
          source={sources.start}
          autoPlay
          loop={false}
          style={{ width: size, height: size }}
          onAnimationFinish={(isCancelled) => {
            if (!isCancelled) {
              setPhase((current) => (current === 'start' ? 'active' : current));
            }
          }}
          onAnimationFailure={() =>
            setPhase((current) => (current === 'start' ? 'active' : current))
          }
        />
      ) : null}
      {phase === 'active' ? (
        <LottieView
          ref={viewRef}
          key={`active-${colors.foreground}`}
          source={sources.active}
          autoPlay
          loop
          style={{ width: size, height: size }}
        />
      ) : null}
      {phase === 'stop' ? (
        <LottieView
          ref={viewRef}
          key={`stop-${colors.foreground}`}
          source={sources.stop}
          autoPlay
          loop={false}
          style={{ width: size, height: size }}
          onAnimationFinish={(isCancelled) => {
            if (!isCancelled) finish();
          }}
          onAnimationFailure={finish}
        />
      ) : null}
    </View>
  );
}
