import { Mic02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/ui';
import { atmosphere, radius, spacing, springs } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';

/** One control module: the strip's segments and the capsule's handle. */
const CONTROL = 48;
/** Every bottom-bar-class capsule is 64 tall. */
const CAPSULE = 64;
/** Glyph on a 48 control. */
const ICON_SIZE = 20;
/** Now-marker head, a downward triangle over the gap. */
const HEAD_WIDTH = 12;
const HEAD_HEIGHT = 8;
/** Segment status pip. */
const PIP = 8;
/** The marker's drop line. A hairline would vanish at 1x; 1 is the reference weight. */
const LINE = 1;
/** Hollow pip ring weight. */
const PIP_RING = 1.5;
/** Gap between the two segments; the marker line runs down its middle. */
const SPLIT_GAP = spacing.xl;
const SWEEP_MS = atmosphere.goalRing.durationMs;

export type TodayGoalProps = {
  /** Minutes spoken today, rounded. */
  minutesToday: number;
  goalMinutes: number;
  /** Today's goal completion, 0–1. */
  todayProgress: number;
  onStart: () => void;
};

/** 0 → `to` over the sweep, or at once under reduced motion. */
function useSweep(to: number) {
  const { reduced } = useAtmospherePrefs();
  const value = useSharedValue(reduced ? to : 0);
  useEffect(() => {
    value.value = reduced
      ? to
      : withTiming(to, { duration: SWEEP_MS, easing: Easing.out(Easing.cubic) });
  }, [value, to, reduced]);
  return value;
}

/**
 * The hero cluster, laid out like the destination dashboard's score (S1): a
 * quiet line above an unlabeled numeral, and a caption stack whose last line
 * sits on the numeral's baseline.
 */
function Readout({ minutesToday, goalMinutes }: { minutesToday: number; goalMinutes: number }) {
  return (
    <View>
      <ThemedText variant="eyebrow" tone="secondary">
        TODAY
      </ThemedText>
      <View style={styles.readoutRow}>
        <ThemedText variant="numeralHero" weight="regular" tone="primary" style={styles.tabular}>
          {minutesToday}
          <ThemedText variant="numeralUnit" weight="regular" tone="tertiary">
            {' min'}
          </ThemedText>
        </ThemedText>
        {/* Value first so it is the column's baseline child (Yoga reads a
            column's baseline from its first child); column-reverse still
            paints the label above it. */}
        <View style={styles.caption}>
          <ThemedText variant="subhead" weight="regular" tone="primary" style={styles.tabular}>
            {`${goalMinutes} min`}
          </ThemedText>
          <ThemedText variant="footnote" weight="regular" tone="secondary" numberOfLines={1}>
            Daily speaking goal
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

type SegmentKind = 'done' | 'left';

/** A segment's pip and value. The value rides the segment's right edge while it sweeps. */
function SegmentBody({ kind, minutes, open }: { kind: SegmentKind; minutes: number; open: boolean }) {
  const { colors } = useTheme();
  const done = kind === 'done';
  const [labelWidth, setLabelWidth] = useState(0);
  const [segmentWidth, setSegmentWidth] = useState(0);
  // A value that can't clear the pip and both insets collapses rather than
  // crowding it.
  const fits =
    labelWidth > 0 && segmentWidth >= spacing.lg + PIP + spacing.sm + labelWidth + spacing.lg;

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e: LayoutChangeEvent) => setSegmentWidth(e.nativeEvent.layout.width)}>
      <View
        style={[
          styles.pip,
          done
            ? { backgroundColor: colors.onAccent }
            : { borderWidth: PIP_RING, borderColor: colors.tertiary },
        ]}
      />
      <View
        style={[styles.value, { opacity: open && fits ? 1 : 0 }]}
        onLayout={(e: LayoutChangeEvent) => setLabelWidth(e.nativeEvent.layout.width)}>
        <ThemedText
          variant="subhead"
          weight="regular"
          tone={done ? 'onAccent' : 'primary'}
          numberOfLines={1}
          style={styles.tabular}>
          {`${minutes} min`}
        </ThemedText>
      </View>
    </View>
  );
}

/**
 * Today's goal as a split strip: a lime segment for the minutes done, a quiet
 * one for the minutes left, and an ink now-marker dropped through the gap
 * between them — the dashboard's band strip (S1) with the timeline's split bar
 * (S3). At 0 or at the goal it is one full segment and no marker.
 */
function GoalStrip({ todayProgress, goalMinutes }: { todayProgress: number; goalMinutes: number }) {
  const { colors } = useTheme();
  const done = Math.min(Math.round(todayProgress * goalMinutes), goalMinutes);
  const left = Math.max(goalMinutes - done, 0);
  const split = todayProgress > 0 && todayProgress < 1;
  const ratio = split ? done / Math.max(goalMinutes, 1) : todayProgress >= 1 ? 1 : 0;
  const sweep = useSweep(ratio);
  const [width, setWidth] = useState(0);
  const span = Math.max(width - SPLIT_GAP, 0);

  const doneStyle = useAnimatedStyle(() => ({ width: span * sweep.value }));
  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: span * sweep.value + SPLIT_GAP / 2 }],
  }));

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.markerBand}>
        {split && width > 0 ? (
          <Animated.View style={[styles.marker, markerStyle]}>
            <Svg width={HEAD_WIDTH} height={HEAD_HEIGHT} style={styles.head}>
              <Path
                d={`M 0 0 H ${HEAD_WIDTH} L ${HEAD_WIDTH / 2} ${HEAD_HEIGHT} Z`}
                fill={colors.foreground}
              />
            </Svg>
            <View style={[styles.drop, { backgroundColor: colors.foreground }]} />
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.bar}>
        {split ? (
          <>
            <Animated.View style={[styles.segment, { backgroundColor: colors.accent }, doneStyle]}>
              <SegmentBody kind="done" minutes={done} open={width > 0} />
            </Animated.View>
            <View style={styles.splitGap} />
            <View
              style={[
                styles.segment,
                styles.fill,
                { backgroundColor: colors.fillTranslucent, borderColor: colors.outline },
                styles.rimmed,
              ]}>
              <SegmentBody kind="left" minutes={left} open={width > 0} />
            </View>
          </>
        ) : todayProgress >= 1 ? (
          <View style={[styles.segment, styles.fill, { backgroundColor: colors.accent }]}>
            <SegmentBody kind="done" minutes={goalMinutes} open={width > 0} />
          </View>
        ) : (
          <View
            style={[
              styles.segment,
              styles.fill,
              { backgroundColor: colors.fillTranslucent, borderColor: colors.outline },
              styles.rimmed,
            ]}>
            <SegmentBody kind="left" minutes={goalMinutes} open={width > 0} />
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * The screen's one commit: a black stadium, label left, and the lime handle
 * inset on the right, concentric with the capsule (the flask's "Start Cycle",
 * S6). The whole capsule is the target.
 */
function StartCapsule({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const pressed = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressed.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={() => {
        if (!reduced) pressed.value = withSpring(atmosphere.pressScale, springs.snap);
      }}
      onPressOut={() => {
        pressed.value = withSpring(1, springs.snap);
      }}>
      <Animated.View style={[styles.capsule, { backgroundColor: colors.ctaTrack }, pressStyle]}>
        {/* `ctaLabel` has no tone. The color is the token, not a hex. */}
        <ThemedText
          variant="headline"
          weight="medium"
          numberOfLines={1}
          style={[styles.capsuleLabel, { color: colors.ctaLabel }]}>
          Start Practicing
        </ThemedText>
        <View style={[styles.handle, { backgroundColor: colors.accent }]}>
          <HugeiconsIcon icon={Mic02Icon} size={ICON_SIZE} color={colors.onAccent} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Home's open-canvas block: today's minutes, the split strip, and the start capsule. */
export function TodayGoal({ minutesToday, goalMinutes, todayProgress, onStart }: TodayGoalProps) {
  return (
    <View>
      <Readout minutesToday={minutesToday} goalMinutes={goalMinutes} />
      <View style={styles.strip}>
        <GoalStrip todayProgress={todayProgress} goalMinutes={goalMinutes} />
      </View>
      <View style={styles.start}>
        <StartCapsule onPress={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.lg,
  },
  caption: {
    flexDirection: 'column-reverse',
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  strip: {
    marginTop: spacing.lg,
  },
  markerBand: {
    height: HEAD_HEIGHT + spacing.xs,
  },
  marker: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: HEAD_HEIGHT + spacing.xs + CONTROL,
    alignItems: 'center',
  },
  head: {
    width: HEAD_WIDTH,
  },
  drop: {
    width: LINE,
    flex: 1,
  },
  bar: {
    height: CONTROL,
    flexDirection: 'row',
  },
  segment: {
    height: CONTROL,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  rimmed: {
    borderWidth: 1,
  },
  fill: {
    flex: 1,
  },
  splitGap: {
    width: SPLIT_GAP,
  },
  pip: {
    position: 'absolute',
    left: spacing.lg,
    top: (CONTROL - PIP) / 2,
    width: PIP,
    height: PIP,
    borderRadius: radius.full,
  },
  value: {
    position: 'absolute',
    right: spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  start: {
    marginTop: spacing.lg,
  },
  capsule: {
    height: CAPSULE,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xxl,
    paddingRight: spacing.sm,
    gap: spacing.md,
  },
  capsuleLabel: {
    flex: 1,
  },
  handle: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
