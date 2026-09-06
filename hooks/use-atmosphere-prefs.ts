import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Reduce-motion (all platforms) or reduce-transparency (iOS). When either is
 * on, AtmosphereCanvas skips fog/grain, AtmosphereSurface paints solid From,
 * GrainOverlay unmounts, and arc/LED wipes snap.
 */
export function useAtmospherePrefs(): { reduced: boolean } {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      const motion = await AccessibilityInfo.isReduceMotionEnabled();
      const transparency =
        Platform.OS === 'ios' && 'isReduceTransparencyEnabled' in AccessibilityInfo
          ? await AccessibilityInfo.isReduceTransparencyEnabled()
          : false;
      if (!cancelled) setReduced(motion || transparency);
    };

    read();

    const motionSub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
      if (value) setReduced(true);
      else read();
    });

    return () => {
      cancelled = true;
      motionSub.remove();
    };
  }, []);

  return { reduced };
}
