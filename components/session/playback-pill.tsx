import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { GlassSurface, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useResultPlayback } from '@/hooks/use-result-playback';
import { useTheme } from '@/hooks/use-theme';
import { formatClock } from '@/lib/metrics';
import type { SessionResult } from '@/types/session';

const PILL_HEIGHT = spacing.xxxxl + spacing.lg;
const PLAY_SIZE = 44;
const BAR_MAX = 24;
const BAR_MIN = 3;
const BAR_WIDTH = 3;

export type PlaybackPillProps = {
  result: SessionResult;
};

/** Recording playback: inverse play circle, the result's static waveform (bars
 * tint as the playhead passes them), and the clock. */
export function PlaybackPill({ result }: PlaybackPillProps) {
  const { colors } = useTheme();

  const playback = useResultPlayback(result.audioUri, result.durationMs);

  const playedBars =
    result.durationMs > 0
      ? Math.floor((playback.positionMs / result.durationMs) * result.waveform.length)
      : 0;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playback.toggle();
  };

  const body = !playback.available ? (
    <ThemedText variant="subhead" tone="secondary">
      Recording unavailable
    </ThemedText>
  ) : (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playback.isPlaying ? 'Pause playback' : 'Play recording'}
        onPress={handleToggle}
        hitSlop={spacing.sm}
        style={({ pressed }) => [
          styles.playCircle,
          { backgroundColor: colors.inverseSurface },
          pressed && styles.pressed,
        ]}>
        <HugeiconsIcon
          icon={playback.isPlaying ? PauseIcon : PlayIcon}
          size={18}
          color={colors.inverseLabel}
          // Optical centering: the triangle reads left-heavy in a circle.
          style={playback.isPlaying ? undefined : { marginLeft: 2 }}
        />
      </Pressable>

      <View style={styles.waveform}>
        {result.waveform.map((v, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: BAR_MIN + v * (BAR_MAX - BAR_MIN),
                backgroundColor: i < playedBars ? colors.accentText : colors.tertiary,
              },
            ]}
          />
        ))}
      </View>

      <ThemedText variant="subhead" tone="secondary" style={styles.clock}>
        {formatClock(playback.isPlaying ? playback.positionMs : result.durationMs)}
      </ThemedText>
    </>
  );

  return (
    <View style={[styles.wrap, !playback.available && styles.unavailable]}>
      <GlassSurface radius="full" style={StyleSheet.absoluteFill} />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: PILL_HEIGHT,
    borderRadius: radius.full,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  unavailable: {
    justifyContent: 'center',
  },
  playCircle: {
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  waveform: {
    flex: 1,
    height: BAR_MAX + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: radius.full,
  },
  clock: {
    fontVariant: ['tabular-nums'],
  },
});
