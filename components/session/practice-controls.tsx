import { PauseIcon, PlayIcon, Rotate01Icon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHROME_BLUR_BLEED, ProgressiveBlur } from '@/components/glass-tabs';
import { GlassSurface, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PracticeError, PracticeStatus } from '@/types/session';

import { LiveWaveform } from './live-waveform';

/** Control-row circle buttons and the pill between them share one height. */
const CIRCLE = 56;

/** How far the card floats above the safe-area bottom. */
const CARD_BOTTOM_GAP = spacing.sm;

/** Horizontal inset of the floating card from the screen edges. */
const CARD_INSET = spacing.md;

export type PracticeControlsProps = {
  status: PracticeStatus;
  error: PracticeError | null;
  elapsedMs: number;
  meterLevel: SharedValue<number>;
  onPauseToggle: () => void;
  onRestart: () => void;
  onStop: () => void;
  onErrorDismiss: () => void;
};

/** Floating glass control card: waveform + timer row over a
 * `[restart] [Pause ↔ Resume] [stop]` row. Swaps to a message + actions
 * layout when the session errors. */
export function PracticeControls({
  status,
  error,
  elapsedMs,
  meterLevel,
  onPauseToggle,
  onRestart,
  onStop,
  onErrorDismiss,
}: PracticeControlsProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const processing = status === 'processing';
  const paused = status === 'paused';
  const ghost = {
    backgroundColor: colors.fillTranslucent,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
  };

  const pillContent = processing ? (
    <>
      <ActivityIndicator size="small" color={colors.foreground} />
      <ThemedText variant="headline">
        Scoring…
      </ThemedText>
    </>
  ) : (
    <>
      <HugeiconsIcon
        icon={paused ? PlayIcon : PauseIcon}
        size={20}
        color={colors.foreground}
      />
      <ThemedText variant="headline">
        {paused ? 'Resume' : 'Pause'}
      </ThemedText>
    </>
  );

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + CARD_BOTTOM_GAP }]} pointerEvents="box-none">
      <ProgressiveBlur
        direction="bottom"
        style={[
          styles.blur,
          {
            top: -CHROME_BLUR_BLEED,
            bottom: -(insets.bottom + CARD_BOTTOM_GAP),
          },
        ]}
      />
      <View style={styles.card}>
        {/* Glass as an absolute sibling under the content — the buttons
            inside are never nested in another glass effect. */}
        <GlassSurface radius="hero" style={StyleSheet.absoluteFill} />

        {status === 'error' ? (
          <View style={styles.errorWrap}>
            <ThemedText variant="headline">Something went wrong</ThemedText>
            <ThemedText variant="footnote" tone="secondary" style={styles.errorMessage}>
              {error?.message ?? 'Speech recognition is unavailable right now.'}
            </ThemedText>
            <View style={styles.controlsRow}>
              <Pressable
                onPress={onErrorDismiss}
                style={({ pressed }) => [
                  styles.pill,
                  ghost,
                  pressed && styles.pressed,
                ]}>
                <ThemedText variant="headline">Dismiss</ThemedText>
              </Pressable>
              <Pressable
                onPress={onRestart}
                style={({ pressed }) => [
                  styles.pill,
                  { backgroundColor: colors.inverseSurface },
                  pressed && styles.pressed,
                ]}>
                <ThemedText variant="headline" tone="inverse">
                  Try Again
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <LiveWaveform
              meterLevel={meterLevel}
              elapsedMs={elapsedMs}
              barColor={paused ? colors.tertiary : colors.accentText}
              timerColor={colors.foreground}
            />
            <View style={styles.controlsRow}>
              <Pressable
                onPress={onRestart}
                disabled={processing}
                style={({ pressed }) => [
                  styles.circle,
                  ghost,
                  (pressed || processing) && styles.pressed,
                ]}>
                <HugeiconsIcon icon={Rotate01Icon} size={24} color={colors.foreground} strokeWidth={1.8} />
              </Pressable>

              <Pressable
                onPress={onPauseToggle}
                disabled={processing}
                style={({ pressed }) => [
                  styles.pill,
                  ghost,
                  pressed && !processing && styles.pressed,
                ]}>
                {pillContent}
              </Pressable>

              <Pressable
                onPress={onStop}
                disabled={processing}
                style={({ pressed }) => [
                  styles.circle,
                  { backgroundColor: colors.inverseSurface },
                  (pressed || processing) && styles.pressed,
                ]}>
                <HugeiconsIcon icon={StopIcon} size={22} color={colors.inverseLabel} />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: CARD_INSET,
    right: CARD_INSET,
  },
  blur: {
    position: 'absolute',
    left: -CARD_INSET,
    right: -CARD_INSET,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.hero,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flex: 1,
    height: CIRCLE,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  errorWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  errorMessage: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
