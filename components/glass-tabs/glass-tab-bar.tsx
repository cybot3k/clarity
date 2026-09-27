import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Children, createContext, use, useCallback, useEffect, useMemo } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type AnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';

import { radius, spacing, springs, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Glyph on a 48 control (layout plan §4). */
const ICON_SIZE = 20;
/** One control module: every tab is a 48 circle (layout plan D2). */
const CIRCLE = 48;
/** Tray wall to circle, on every side. (64 − 48) / 2, so the circles sit concentric. */
const TRAY_INSET = spacing.sm;
/** Pitch between tab centers: one circle plus the 8 gap. */
const SLOT_WIDTH = CIRCLE + spacing.sm;
/** Every bottom bar is 64 tall (layout plan D3). */
const TRAY_HEIGHT = CIRCLE + TRAY_INSET * 2;
/**
 * Slide spring: interruptible by design — rapid tab-hopping retargets with
 * preserved velocity. Slight under-damping gives the disc a tiny settle,
 * safe here because it's transform-only (no layout involved).
 */
const SLIDE_SPRING = springs.settle;

export type GlassTabBarTheme = {
  activeTint: string;
  inactiveTint: string;
  /** Sliding selected-disc color. */
  highlight: string;
  /** Tint layered over the liquid glass. */
  glassTint: string;
  /** Translucent background used when liquid glass is unavailable. */
  solidFallback: string;
  /** Hairline on the non-glass tray. Native glass draws its own rim. */
  rim: string;
  /** Hairline ring on an unselected tab circle. */
  ring: string;
};

function themeFromColors(c: ThemeColors): GlassTabBarTheme {
  return {
    activeTint: c.onTabHighlight,
    // Ink glyphs on hairline circles, as on the destination dashboard dock (S1).
    inactiveTint: c.foreground,
    highlight: c.tabHighlight,
    glassTint: c.glassTint,
    solidFallback: c.frostFallback,
    rim: c.frostRim,
    ring: c.outline,
  };
}

export type GlassTabItem = {
  name: string;
  /** Not drawn. The dock is icon-only, so this is the tab's accessibility label. */
  label: string;
  /** Hugeicons glyph — used for both tint layers. */
  icon: IconSvgElement;
};

type BarContextValue = {
  slideIndex: SharedValue<number>;
  isDragging: SharedValue<boolean>;
  theme: GlassTabBarTheme;
};

const BarContext = createContext<BarContextValue | null>(null);

export type GlassTabBarProps = TabListProps & {
  /** Called when a tab is chosen by tap or scrub release. */
  onIndexSelected?: (index: number) => void;
  theme?: Partial<GlassTabBarTheme>;
  /** Haptic tick while the scrub crosses tab boundaries (iOS). */
  haptics?: boolean;
  /** Extra (animated) style on the bar's root — e.g. the app-intro entrance.
   * A prop instead of a wrapper view because expo-router's TabList must keep
   * the bar as its direct `asChild` element for trigger parsing. */
  entranceStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
};

/**
 * Floating icon-only liquid-glass dock (CH-08): a fixed 176 × 64 stadium of
 * three 48 circles with a sliding selected disc and finger scrubbing. It never
 * minimizes. Use via `TabList asChild` with expo-router's headless tabs.
 */
export function GlassTabBar({
  children,
  onIndexSelected,
  theme: themeOverrides,
  haptics = true,
  entranceStyle,
  ...props
}: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const slideIndex = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const lastTicked = useSharedValue(-1);
  const tabCount = Math.max(Children.count(children), 1);
  const theme = useMemo(
    () => ({ ...themeFromColors(colors), ...themeOverrides }),
    [colors, themeOverrides],
  );

  // Picker-style tick while the disc crosses tab boundaries mid-drag.
  const tick = useCallback(() => {
    if (haptics && Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
  }, [haptics]);

  // Navigation happens only on release — switching screens live while
  // scrubbing makes the content jump under the finger.
  const selectIndex = useCallback((index: number) => onIndexSelected?.(index), [onIndexSelected]);

  // Scrubbing: the disc tracks the finger 1:1 while dragging (no spring — it
  // must feel attached), haptic ticks fire on boundary crossings, and
  // navigation happens only on release. Taps are handled by a Tap gesture
  // racing the pan — the detector consumes the bar's touches, so the inner
  // Pressables never receive them.
  const gesture = useMemo(() => {
    const indexAtX = (x: number) => {
      'worklet';
      // Slot i is centered at TRAY_INSET + CIRCLE / 2 + i * SLOT_WIDTH.
      const raw = (x - TRAY_INSET - CIRCLE / 2) / SLOT_WIDTH;
      return Math.min(Math.max(raw, 0), tabCount - 1);
    };

    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-14, 14])
      .onStart(() => {
        isDragging.value = true;
        lastTicked.value = Math.round(slideIndex.value);
      })
      .onUpdate((event) => {
        const index = indexAtX(event.x);
        slideIndex.value = index;

        const rounded = Math.round(index);
        if (rounded !== lastTicked.value) {
          lastTicked.value = rounded;
          runOnJS(tick)();
        }
      })
      .onFinalize(() => {
        // Fires on failure too (e.g. the touch was a tap) — only act when
        // the pan actually activated, or we'd stomp the tap's navigation.
        if (!isDragging.value) {
          return;
        }
        const rounded = Math.round(slideIndex.value);
        slideIndex.value = withSpring(rounded, SLIDE_SPRING);
        runOnJS(selectIndex)(rounded);
        isDragging.value = false;
      });

    const tap = Gesture.Tap()
      // Real fingers drift a few points — the default tolerance (~2pt)
      // makes ordinary taps fail. Past 6pt horizontal the pan takes over.
      .maxDistance(16)
      .maxDuration(400)
      .onEnd((event, success) => {
        if (!success) {
          return;
        }
        const index = Math.round(indexAtX(event.x));
        slideIndex.value = withSpring(index, SLIDE_SPRING);
        runOnJS(selectIndex)(index);
      });

    return Gesture.Race(pan, tap);
  }, [tabCount, selectIndex, tick, isDragging, lastTicked, slideIndex]);

  // Fixed size: circles at pitch 56 with the 8 inset on both ends.
  const trayStyle: ViewStyle = {
    width: tabCount * SLOT_WIDTH - spacing.sm + TRAY_INSET * 2,
    height: TRAY_HEIGHT,
    borderRadius: radius.full,
    borderCurve: 'continuous',
  };

  // One shared disc that slides between tabs (transform-only → GPU).
  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: SLOT_WIDTH * slideIndex.value }],
  }));

  const bottomOffset = Math.max(insets.bottom - spacing.lg, spacing.md);
  const barContext = useMemo(
    () => ({ slideIndex, isDragging, theme }),
    [slideIndex, isDragging, theme],
  );

  const barContent = (
    <>
      <Animated.View
        style={[styles.highlight, { backgroundColor: theme.highlight }, highlightStyle]}
      />
      <View style={styles.row}>
        <BarContext.Provider value={barContext}>{children}</BarContext.Provider>
      </View>
    </>
  );

  return (
    <Animated.View
      {...props}
      pointerEvents="box-none"
      style={[{ position: 'absolute', left: 0, right: 0, bottom: 0 }, entranceStyle]}>
      <View
        pointerEvents="box-none"
        style={{ alignItems: 'center', marginBottom: bottomOffset }}>
        <GestureDetector gesture={gesture}>
          {/* The glass view IS the bar container: touches on the tabs land
              inside its native bounds, so `isInteractive` responds to presses.
              As a detached sibling it never receives them. */}
          {isLiquidGlassAvailable() ? (
            <GlassView
              glassEffectStyle="regular"
              isInteractive
              tintColor={theme.glassTint}
              style={trayStyle}>
              {barContent}
            </GlassView>
          ) : (
            <View
              style={[
                trayStyle,
                {
                  backgroundColor: theme.solidFallback,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.rim,
                },
              ]}>
              {barContent}
            </View>
          )}
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

/** Icon rendered at a fixed tint (used twice for the crossfade layers). */
function TabGlyph({ item, tint }: { item: GlassTabItem; tint: string }) {
  return <HugeiconsIcon icon={item.icon} size={ICON_SIZE} color={tint} />;
}

/** One tab trigger: a 48 circle holding the glyph. The label is spoken, not drawn. */
export function GlassTabButton({
  item,
  index,
  isFocused,
  onPress,
  ...props
}: TabTriggerSlotProps & { item: GlassTabItem; index: number }) {
  const { colors } = useTheme();
  const bar = use(BarContext);
  const theme = bar?.theme ?? themeFromColors(colors);
  const slideIndex = bar?.slideIndex;

  // Covers programmatic navigation too (deep links, back gestures). While
  // scrubbing, the finger owns the disc — never fight it with a spring.
  useEffect(() => {
    if (isFocused && bar && !bar.isDragging.value) {
      bar.slideIndex.value = withSpring(index, SLIDE_SPRING);
    }
  }, [isFocused, index, bar]);

  // Tint follows the sliding disc, not navigation focus: whatever the disc
  // is over lights up — live while scrubbing, traveling on taps. The hairline
  // ring fades out under the disc for the same reason.
  const activeGlyphStyle = useAnimatedStyle(() => ({
    opacity: slideIndex ? 1 - Math.min(Math.abs(slideIndex.value - index), 1) : isFocused ? 1 : 0,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: slideIndex ? Math.min(Math.abs(slideIndex.value - index), 1) : isFocused ? 0 : 1,
  }));

  return (
    <Pressable
      {...props}
      accessibilityLabel={item.label}
      onPress={(event) => {
        // The GestureDetector normally consumes touches; this still fires
        // for accessibility activation (VoiceOver) and keyboard focus.
        if (bar) bar.slideIndex.value = withSpring(index, SLIDE_SPRING);
        onPress?.(event);
      }}
      style={styles.circle}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { borderColor: theme.ring }, ringStyle]}
      />
      {/* Inactive glyph underneath, active glyph crossfading on top. */}
      <TabGlyph item={item} tint={theme.inactiveTint} />
      <Animated.View style={[styles.activeGlyph, activeGlyphStyle]}>
        <TabGlyph item={item} tint={theme.activeTint} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: TRAY_INSET,
    left: TRAY_INSET,
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radius.full,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TRAY_INSET,
    gap: spacing.sm,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  activeGlyph: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
