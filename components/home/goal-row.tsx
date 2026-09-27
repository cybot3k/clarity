import { Mic02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ScoreValue } from '@/components/metrics';
import { ThemedText } from '@/components/ui';
import { atmosphere, radius, spacing, springs } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** One control module (layout plan D2): the split-bar segments and the CTA's action circle. */
const CONTROL = 48;
/** Every bottom-bar-class capsule is 64 tall (layout plan D3, CH-10). */
const CAPSULE_HEIGHT = 64;
/** Glyph on a 48 control. */
const ICON_SIZE = 20;
/** CO-12d semicircle gauge slot, from the layout plan's TX-05 interior. */
const GAUGE_WIDTH = 96;
const GAUGE_HEIGHT = 48;
/** The "done" segment's accent rim (layout plan CO-07). */
const RIM = 2;
/** CO-07 now-marker head, from the layout plan's TX-05 interior. */
const MARKER_WIDTH = 12;
const MARKER_HEIGHT = 8;
/**
 * The split bar sweeps in over the same 900ms the retired DailyGoalCard ring
 * used (layout plan: "CO-07 widths animate 900ms from p = 0").
 */
const SWEEP_MS = atmosphere.goalRing.durationMs;

export type GoalRowProps = {
  /** `round(minutesOnDay(records, now))`. */
  minutesToday: number;
  goalMinutes: number;
  /** Today's goal completion, 0–1. */
  todayProgress: number;
  onStart: () => void;
};

/** 0 → `to` over the sweep, or immediately under reduced motion. */
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

/** CO-12d: a semicircle arc on a dotted track, the percent sitting in its bowl on the chord. */
function Gauge({ progress }: { progress: number }) {
  const { colors } = useTheme();
  const p = useSweep(progress);
  const stroke = atmosphere.goalRing.stroke;
  // Inset by the stroke so the round caps stay inside the slot.
  const r = GAUGE_HEIGHT - stroke;
  const cx = GAUGE_WIDTH / 2;
  const cy = GAUGE_HEIGHT - stroke / 2;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const length = Math.PI * r;

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - p.value),
    // A zero-length round-capped stroke still paints a dot.
    opacity: p.value > 0 ? 1 : 0,
  }));

  return (
    <View style={styles.gauge}>
      <Svg
        width={GAUGE_WIDTH}
        height={GAUGE_HEIGHT}
        style={StyleSheet.absoluteFill}
        importantForAccessibility="no-hide-descendants">
        <Path
          d={d}
          fill="none"
          stroke={colors.dottedStrokeOnAtmosphere}
          strokeWidth={atmosphere.dottedWidth}
          strokeDasharray={atmosphere.dottedDash}
          strokeLinecap="round"
        />
        <AnimatedPath
          d={d}
          fill="none"
          stroke={colors.foreground}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={length}
          animatedProps={arcProps}
        />
      </Svg>
      <ScoreValue value={Math.round(progress * 100)} size="row" unit="%" />
    </View>
  );
}

/** Downward head centered over the gap between the two segments. */
function MarkerHead() {
  const { colors } = useTheme();
  return (
    <Svg width={MARKER_WIDTH} height={MARKER_HEIGHT} importantForAccessibility="no-hide-descendants">
      <Path
        d={`M 0 0 H ${MARKER_WIDTH} L ${MARKER_WIDTH / 2} ${MARKER_HEIGHT} Z`}
        fill={colors.foreground}
      />
    </Svg>
  );
}

type SegmentKind = 'done' | 'left';

/**
 * CO-07: two segments sized by done / left, a fixed gap, and a now-marker over
 * the gap. At 0 or at the goal it is one full-width segment and no marker.
 */
function SplitBar({ todayProgress, goalMinutes }: { todayProgress: number; goalMinutes: number }) {
  const { colors } = useTheme();
  const done = Math.round(todayProgress * goalMinutes);
  const left = goalMinutes - done;
  const split = todayProgress > 0 && todayProgress < 1;
  // Share of the bar the done segment ends at. A zero side keeps a sliver.
  const ratio = split ? Math.max(done, 0) / Math.max(goalMinutes, 1) : todayProgress >= 1 ? 1 : 0;
  const p = useSweep(ratio);

  const [barWidth, setBarWidth] = useState(0);
  const [labelWidth, setLabelWidth] = useState<Record<SegmentKind, number>>({ done: 0, left: 0 });

  const doneGrow = useAnimatedStyle(() => ({ flexGrow: Math.max(p.value, 0.0001) }));
  const leftGrow = useAnimatedStyle(() => ({ flexGrow: Math.max(1 - p.value, 0.0001) }));

  const segmentWidth = (kind: SegmentKind) => {
    if (!split) return barWidth;
    const span = barWidth - spacing.xl;
    return kind === 'done' ? span * ratio : span * (1 - ratio);
  };
  // A value that can't clear the dot and its insets collapses rather than
  // spilling out of its segment. No caption row stands in for it.
  const fits = (kind: SegmentKind) =>
    barWidth > 0 &&
    labelWidth[kind] > 0 &&
    segmentWidth(kind) >= spacing.md + atmosphere.identityPip + spacing.sm + labelWidth[kind] + spacing.xl;

  const measureLabel = (kind: SegmentKind) => (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setLabelWidth((current) => (current[kind] === next ? current : { ...current, [kind]: next }));
  };

  const label = (kind: SegmentKind) => `${kind === 'done' ? done : left} min`;

  const segment = (kind: SegmentKind) => {
    const isDone = kind === 'done';
    return (
      <Animated.View
        key={kind}
        style={[
          styles.segment,
          { backgroundColor: colors.fillTranslucent },
          isDone && { borderWidth: RIM, borderColor: colors.accent },
          split ? (isDone ? doneGrow : leftGrow) : styles.fullSegment,
        ]}>
        <View
          style={[
            styles.segmentDot,
            { backgroundColor: isDone ? colors.accent : colors.track },
          ]}
        />
        {fits(kind) ? (
          // Pinned to its measured width, so while the segment sweeps open the
          // value is clipped by the segment edge instead of re-wrapping.
          <View style={[styles.segmentLabel, { width: labelWidth[kind] }]}>
            <ThemedText
              variant="subhead"
              weight="regular"
              tone="primary"
              numberOfLines={1}
              style={styles.tabular}>
              {label(kind)}
            </ThemedText>
          </View>
        ) : null}
      </Animated.View>
    );
  };

  return (
    <View>
      {/* Off-layout copies of both values, measured at their natural width. */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.measure}>
        {(['done', 'left'] as const).map((kind) => (
          <ThemedText
            key={kind}
            variant="subhead"
            weight="regular"
            numberOfLines={1}
            onLayout={measureLabel(kind)}
            style={styles.tabular}>
            {label(kind)}
          </ThemedText>
        ))}
      </View>
      {/* The 24 band above the bar holds the marker head. */}
      <View style={styles.markerBand}>
        {split ? (
          <>
            <Animated.View style={doneGrow} />
            <View style={styles.markerSlot}>
              <MarkerHead />
            </View>
            <Animated.View style={leftGrow} />
          </>
        ) : null}
      </View>
      <View
        style={styles.bar}
        onLayout={(event) => {
          const next = event.nativeEvent.layout.width;
          setBarWidth((current) => (current === next ? current : next));
        }}>
        {split
          ? [segment('done'), segment('left')]
          : segment(todayProgress >= 1 ? 'done' : 'left')}
      </View>
    </View>
  );
}

/** CH-10: label left, accent action circle right, the whole capsule is the target. */
function StartCapsule({ onStart }: { onStart: () => void }) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pressed.value, [0, 1], [1, atmosphere.pressScale], Extrapolation.CLAMP),
      },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      onPressIn={() => {
        if (!reduced) pressed.value = withSpring(1, springs.snap);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, springs.snap);
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
        <View style={[styles.capsuleCircle, { backgroundColor: colors.accent }]}>
          <HugeiconsIcon icon={Mic02Icon} size={ICON_SIZE} color={colors.onAccent} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Home's daily goal on the open canvas, no card: today's minutes with the goal
 * and a gauge on one baseline (TX-05), the split bar (CO-07), and the screen's
 * Start Practicing capsule (CH-10).
 */
export function GoalRow({ minutesToday, goalMinutes, todayProgress, onStart }: GoalRowProps) {
  return (
    <View>
      <View style={styles.summary}>
        {/* Value first so it is this stack's baseline child (Yoga reads a
            column's baseline from its first child); column-reverse still
            paints the eyebrow above it. */}
        <View style={styles.valueStack}>
          <View style={styles.valueRow}>
            <ScoreValue value={minutesToday} size="large" unit="min" />
            <View style={styles.pair}>
              <ThemedText variant="subhead" weight="regular" tone="primary" style={styles.tabular}>
                {`${goalMinutes} min`}
              </ThemedText>
              <ThemedText variant="footnote" tone="secondary" numberOfLines={1}>
                Daily speaking goal
              </ThemedText>
            </View>
          </View>
          <ThemedText variant="eyebrow" tone="secondary">
            TODAY
          </ThemedText>
        </View>
        <Gauge progress={todayProgress} />
      </View>
      <SplitBar todayProgress={todayProgress} goalMinutes={goalMinutes} />
      <View style={styles.capsuleGap}>
        <StartCapsule onStart={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  valueStack: {
    flexDirection: 'column-reverse',
    flexShrink: 1,
    gap: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.lg,
  },
  // Value first for the same baseline reason as `valueStack`.
  pair: {
    flexDirection: 'column-reverse',
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  gauge: {
    width: GAUGE_WIDTH,
    height: GAUGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerBand: {
    height: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: spacing.xs,
  },
  markerSlot: {
    width: spacing.xl,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  segment: {
    height: CONTROL,
    flexBasis: 0,
    minWidth: 0,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fullSegment: {
    flexGrow: 1,
  },
  segmentDot: {
    position: 'absolute',
    left: spacing.md,
    width: atmosphere.identityPip,
    height: atmosphere.identityPip,
    borderRadius: radius.full,
  },
  segmentLabel: {
    position: 'absolute',
    right: spacing.xl,
  },
  measure: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'flex-start',
    opacity: 0,
  },
  capsuleGap: {
    marginTop: spacing.md,
  },
  capsule: {
    height: CAPSULE_HEIGHT,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingLeft: spacing.xxl,
    // (64 − 48) / 2: the circle sits concentric in the capsule.
    paddingRight: spacing.sm,
  },
  capsuleLabel: {
    flexShrink: 1,
  },
  capsuleCircle: {
    width: CONTROL,
    height: CONTROL,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
