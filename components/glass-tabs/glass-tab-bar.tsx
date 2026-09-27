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
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type AnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';

import { radius, spacing, springs, type, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { MINIMIZE_SPRING, setMinimized, useMinimizeState } from './minimize-context';
import { CHROME_BLUR_BLEED, ProgressiveBlur } from './progressive-blur';

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView);

const ICON_SIZE = 22;
const LABEL_HEIGHT = 14;
/** Space between icon and label — folded into the label's animated height so
 * it fully disappears when minimized (keeps the icon perfectly centered). */
const ITEM_GAP = 2;
const LABEL_BLOCK = LABEL_HEIGHT + ITEM_GAP;
/** Optical: centers the 22pt glyph in the 40pt minimized circle. */
const ITEM_PAD_V = 9;
/** Highlight content height expanded: glyph, label block, and vertical pad. */
const HIGHLIGHT_EXPANDED = ICON_SIZE + LABEL_BLOCK + ITEM_PAD_V * 2;
/** Highlight content height minimized: glyph plus vertical pad. */
const HIGHLIGHT_MINIMIZED = ICON_SIZE + ITEM_PAD_V * 2;
/** Gap between the highlight and the pill wall on every side, so the highlight stays concentric. */
const HIGHLIGHT_INSET = spacing.xs;
/** Pill height expanded: highlight plus the inset on both sides. */
const EXPANDED_HEIGHT = HIGHLIGHT_EXPANDED + HIGHLIGHT_INSET * 2;
/** Pill height minimized: highlight plus the inset on both sides. */
const MINIMIZED_HEIGHT = HIGHLIGHT_MINIMIZED + HIGHLIGHT_INSET * 2;
/** Fixed per-tab widths — the pill hugs its content instead of spanning the screen. */
const ITEM_WIDTH_EXPANDED = 76;
/** Equals MINIMIZED_HEIGHT, so the minimized highlight is a circle. */
const ITEM_WIDTH_MINIMIZED = 48;
/**
 * Slide spring: interruptible by design — rapid tab-hopping retargets with
 * preserved velocity. Slight under-damping gives the pill a tiny settle,
 * safe here because it's transform-only (no layout involved).
 */
const SLIDE_SPRING = springs.settle;

export type GlassTabBarTheme = {
  activeTint: string;
  inactiveTint: string;
  /** Sliding highlight pill color. */
  highlight: string;
  /** Tint layered over the liquid glass. */
  glassTint: string;
  /** Translucent background used when liquid glass is unavailable. */
  solidFallback: string;
  /** Hairline on the non-glass pill. Native glass draws its own rim. */
  rim: string;
};

function themeFromColors(c: ThemeColors): GlassTabBarTheme {
  return {
    activeTint: c.onTabHighlight,
    inactiveTint: c.onAtmosphereMuted,
    highlight: c.tabHighlight,
    glassTint: c.glassTint,
    solidFallback: c.frostFallback,
    rim: c.frostRim,
  };
}

export type GlassTabItem = {
  name: string;
  label: string;
  /** Hugeicons solid glyph — used for both tint layers. */
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
 * Floating liquid-glass tab bar with Revolut-style minimize-on-scroll,
 * a sliding highlight, and finger scrubbing. Use via `TabList asChild`
 * with expo-router's headless tabs.
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
  const minimized = useMinimizeState();
  const progress = minimized.progress;
  const slideIndex = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const lastTicked = useSharedValue(-1);
  const tabCount = Math.max(Children.count(children), 1);
  const theme = useMemo(
    () => ({ ...themeFromColors(colors), ...themeOverrides }),
    [colors, themeOverrides],
  );

  // Picker-style tick while the highlight crosses tab boundaries mid-drag.
  const tick = useCallback(() => {
    if (haptics && Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
  }, [haptics]);

  // Navigation happens only on release — switching screens live while
  // scrubbing makes the content jump under the finger.
  const selectIndex = useCallback((index: number) => onIndexSelected?.(index), [onIndexSelected]);

  // Scrubbing: the highlight tracks the finger 1:1 while dragging (no spring
  // — it must feel attached), haptic ticks fire on boundary crossings, and
  // navigation happens only on release. Taps are handled by a Tap gesture
  // racing the pan — the detector consumes the bar's touches, so the inner
  // Pressables never receive them.
  const gesture = useMemo(() => {
    const indexAtX = (x: number, minimizedValue: number) => {
      'worklet';
      const itemWidth = interpolate(
        minimizedValue,
        [0, 1],
        [ITEM_WIDTH_EXPANDED, ITEM_WIDTH_MINIMIZED],
        Extrapolation.CLAMP,
      );
      const raw = x / itemWidth - 0.5;
      return Math.min(Math.max(raw, 0), tabCount - 1);
    };

    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-14, 14])
      .onStart(() => {
        isDragging.value = true;
        lastTicked.value = Math.round(slideIndex.value);
        // Scrubbing is a deliberate bar interaction — surface the labels.
        setMinimized(minimized, 0);
      })
      .onUpdate((event) => {
        const index = indexAtX(event.x, progress.value);
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
        const index = Math.round(indexAtX(event.x, progress.value));
        slideIndex.value = withSpring(index, SLIDE_SPRING);
        setMinimized(minimized, 0);
        runOnJS(selectIndex)(index);
      });

    return Gesture.Race(pan, tap);
  }, [tabCount, selectIndex, tick, isDragging, lastTicked, slideIndex, minimized, progress]);

  const barStyle = useAnimatedStyle(() => {
    const height = interpolate(
      progress.value,
      [0, 1],
      [EXPANDED_HEIGHT, MINIMIZED_HEIGHT],
      Extrapolation.CLAMP,
    );
    const itemWidth = interpolate(
      progress.value,
      [0, 1],
      [ITEM_WIDTH_EXPANDED, ITEM_WIDTH_MINIMIZED],
      Extrapolation.CLAMP,
    );
    return {
      height,
      // Revolut-style: the pill shrinks in both dimensions.
      width: itemWidth * tabCount,
    };
  });
  // iOS 26 glass draws its own rim. Radius stays a stadium in both states.
  const shapeStyle = { borderRadius: radius.full };

  // One shared highlight that slides between tabs (transform-only → GPU).
  // All geometry derives from shared values, never from layout callbacks.
  const highlightStyle = useAnimatedStyle(() => {
    const barHeight = interpolate(
      progress.value,
      [0, 1],
      [EXPANDED_HEIGHT, MINIMIZED_HEIGHT],
      Extrapolation.CLAMP,
    );
    const itemWidth = interpolate(
      progress.value,
      [0, 1],
      [ITEM_WIDTH_EXPANDED, ITEM_WIDTH_MINIMIZED],
      Extrapolation.CLAMP,
    );
    return {
      height: barHeight - HIGHLIGHT_INSET * 2,
      width: itemWidth - HIGHLIGHT_INSET * 2,
      borderRadius: radius.full,
      top: HIGHLIGHT_INSET,
      transform: [{ translateX: itemWidth * slideIndex.value + HIGHLIGHT_INSET }],
    };
  });

  const bottomOffset = Math.max(insets.bottom - 16, 12);
  const barContext = useMemo(
    () => ({ slideIndex, isDragging, theme }),
    [slideIndex, isDragging, theme],
  );

  const barContent = (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            backgroundColor: theme.highlight,
            borderCurve: 'continuous',
          },
          highlightStyle,
        ]}
      />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <BarContext.Provider value={barContext}>{children}</BarContext.Provider>
      </View>
    </>
  );

  return (
    <Animated.View
      {...props}
      pointerEvents="box-none"
      style={[{ position: 'absolute', left: 0, right: 0, bottom: 0 }, entranceStyle]}>
      {/* Progressive blur rising from the screen's bottom edge behind the pill. */}
      <ProgressiveBlur
        direction="bottom"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: bottomOffset + EXPANDED_HEIGHT + CHROME_BLUR_BLEED,
        }}
      />
      <View
        pointerEvents="box-none"
        style={{ alignItems: 'center', marginBottom: bottomOffset }}>
        <GestureDetector gesture={gesture}>
          {/* The glass view IS the bar container: touches on the tabs land
              inside its native bounds, so `isInteractive` responds to presses.
              As a detached sibling it never receives them. */}
          {isLiquidGlassAvailable() ? (
            <AnimatedGlassView
              glassEffectStyle="regular"
              isInteractive
              tintColor={theme.glassTint}
              style={[{ borderCurve: 'continuous' }, barStyle, shapeStyle]}>
              {barContent}
            </AnimatedGlassView>
          ) : (
            <Animated.View
              style={[
                {
                  backgroundColor: theme.solidFallback,
                  borderCurve: 'continuous',
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.rim,
                },
                barStyle,
                shapeStyle,
              ]}>
              {barContent}
            </Animated.View>
          )}
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

/** Icon rendered at a fixed tint (used twice for the crossfade layers). */
function TabGlyph({ item, tint }: { item: GlassTabItem; tint: string }) {
  return (
    <View style={{ height: ICON_SIZE, justifyContent: 'center' }}>
      <HugeiconsIcon icon={item.icon} size={ICON_SIZE} color={tint} />
    </View>
  );
}

/** One tab trigger: icon + label that fades when minimized. */
export function GlassTabButton({
  item,
  index,
  isFocused,
  onPress,
  ...props
}: TabTriggerSlotProps & { item: GlassTabItem; index: number }) {
  const minimized = useMinimizeState();
  const progress = minimized.progress;
  const { colors } = useTheme();
  const bar = use(BarContext);
  const theme = bar?.theme ?? themeFromColors(colors);
  const slideIndex = bar?.slideIndex;

  // Covers programmatic navigation too (deep links, back gestures). While
  // scrubbing, the finger owns the highlight — never fight it with a spring.
  useEffect(() => {
    if (isFocused && bar && !bar.isDragging.value) {
      bar.slideIndex.value = withSpring(index, SLIDE_SPRING);
    }
  }, [isFocused, index, bar]);

  // Tint follows the sliding highlight, not navigation focus: whatever the
  // pill is over lights up — live while scrubbing, traveling on taps.
  const activeGlyphStyle = useAnimatedStyle(() => ({
    opacity: slideIndex ? 1 - Math.min(Math.abs(slideIndex.value - index), 1) : isFocused ? 1 : 0,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP),
    color: slideIndex
      ? interpolateColor(
          Math.min(Math.abs(slideIndex.value - index), 1),
          [0, 1],
          [theme.activeTint, theme.inactiveTint],
        )
      : isFocused
        ? theme.activeTint
        : theme.inactiveTint,
  }));

  // Height is animated EXPLICITLY (not derived from children) so the icon
  // stays perfectly centered every frame — layout-driven sizing lags behind
  // UI-thread animation.
  const boxStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [HIGHLIGHT_EXPANDED, HIGHLIGHT_MINIMIZED],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Pressable
      {...props}
      onPress={(event) => {
        // The GestureDetector normally consumes touches; this still fires
        // for accessibility activation (VoiceOver) and keyboard focus.
        if (bar) bar.slideIndex.value = withSpring(index, SLIDE_SPRING);
        setMinimized(minimized, 0);
        onPress?.(event);
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { alignSelf: 'stretch', alignItems: 'center', paddingTop: ITEM_PAD_V, overflow: 'hidden' },
          boxStyle,
        ]}>
        {/* Inactive glyph underneath, active glyph crossfading on top. */}
        <View>
          <TabGlyph item={item} tint={theme.inactiveTint} />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { alignItems: 'center', justifyContent: 'center' },
              activeGlyphStyle,
            ]}>
            <TabGlyph item={item} tint={theme.activeTint} />
          </Animated.View>
        </View>
        {/* ThemedText exception: label color interpolates on the UI thread. */}
        <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
          {item.label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    ...type.tabLabel,
    marginTop: ITEM_GAP,
  },
});
