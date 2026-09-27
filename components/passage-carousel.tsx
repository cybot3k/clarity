import { PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { AtmosphereSurface, SpeechMark, ThemedText } from '@/components/ui';
import { atmosphere, radius, spacing, springs } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';

/** Opal-style layout: 2 full cards centered with a 15% peek of the next card
 * on each side, so the row reads as horizontally scrollable at a glance. */
const ITEMS_CENTERED = 2;
const PEEK_RATIO = 0.15;
const VISIBLE_RATIO = ITEMS_CENTERED + PEEK_RATIO * 2;
/** Outer padding (not margin/gap) on each item keeps the visual gap stable
 * while the card scales down inside its layout box. */
const ITEM_GAP = spacing.sm;
const CARD_RADIUS = radius.xl;
/** The "Start" pill on a card. Visual only — the whole card is pressable. */
const BUTTON_HEIGHT = 40;
/** Width / height of the card's layout box, matched to the design mock. */
const CARD_ASPECT = 0.88;

export type PassageItem = {
  id: string;
  title: string;
  /** Display string, e.g. "~2 mins". */
  duration: string;
  /** Card art: vertical base gradient pair + a radial accent blob pair,
   * as CSS color strings. Alphas < 1 let the card's glass read through. */
  artwork: { base: [string, string]; blob: [string, string] };
};

export type PassageCarouselProps = {
  items: PassageItem[];
  onStart: (item: PassageItem) => void;
  /** The consuming screen's content padding; the carousel bleeds past it
   * edge-to-edge and re-pads its content so cards align with the column. */
  horizontalPadding?: number;
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function PassageCarousel({
  items,
  onStart,
  horizontalPadding = spacing.xl,
}: PassageCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = (screenWidth - horizontalPadding * 2) / VISIBLE_RATIO;
  // Inset by the item gap so the first card's VISUAL edge (inside its 6pt
  // gap padding) lines up with the consuming screen's content column.
  const edgePadding = horizontalPadding - ITEM_GAP;

  // Single source of truth for every card's scale/blur interpolation.
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x);
    },
  });

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      // overflow:visible — a ScrollView clips to its bounds by default, and
      // the press scale grows past the card bounds.
      style={{ marginHorizontal: -horizontalPadding, overflow: 'visible' }}
      contentContainerStyle={{ paddingHorizontal: edgePadding }}>
      {items.map((item, index) => (
        <PassageCard
          key={item.id}
          item={item}
          index={index}
          scrollX={scrollX}
          itemWidth={itemWidth}
          screenWidth={screenWidth}
          edgePadding={edgePadding}
          onStart={onStart}
        />
      ))}
    </Animated.ScrollView>
  );
}

type PassageCardProps = {
  item: PassageItem;
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  screenWidth: number;
  edgePadding: number;
  onStart: (item: PassageItem) => void;
};

const PassageCard = memo(function PassageCard({
  item,
  index,
  scrollX,
  itemWidth,
  screenWidth,
  edgePadding,
  onStart,
}: PassageCardProps) {
  const { colors, scheme } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const pressed = useSharedValue(0);

  // Cards at the visual center stay full size and sharp; they shrink to 0.88
  // and (on iOS) blur up to 15 as they move a card-and-a-half away from it.
  const rCardStyle = useAnimatedStyle(() => {
    const screenCenter = (screenWidth - edgePadding * 2) / 2;
    const itemCenter = index * itemWidth - scrollX.get() + itemWidth / 2;
    const distance = Math.abs(itemCenter - screenCenter);
    const scale = interpolate(
      distance,
      [0, itemWidth, itemWidth * 1.5],
      [1, 1, 0.88],
      Extrapolation.CLAMP,
    );
    const press = interpolate(pressed.value, [0, 1], [1, atmosphere.pressScale], Extrapolation.CLAMP);
    return { transform: [{ scale: scale * press }] };
  });

  const rBlurProps = useAnimatedProps(() => {
    const screenCenter = (screenWidth - edgePadding * 2) / 2;
    const itemCenter = index * itemWidth - scrollX.get() + itemWidth / 2;
    const distance = Math.abs(itemCenter - screenCenter);
    return {
      intensity: interpolate(
        distance,
        [0, itemWidth, itemWidth * 1.5],
        [0, 0, 15],
        Extrapolation.CLAMP,
      ),
    };
  });

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart(item);
  };

  return (
    <Animated.View style={[{ width: itemWidth }, styles.item, rCardStyle]}>
      {/* The whole card is the button. Press feedback is transform scale only. */}
      <Pressable
        onPress={handleStart}
        onPressIn={() => {
          if (!reduced) pressed.value = withSpring(1, springs.snap);
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, springs.snap);
        }}
        style={styles.clip}>
        <AtmosphereSurface
          mesh="artwork"
          artwork={item.artwork}
          radius="xl"
          style={[
            styles.cardFill,
            {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.frostRim,
            },
          ]}>
          <View
            pointerEvents="none"
            style={[
              styles.scrim,
              {
                experimental_backgroundImage: `linear-gradient(to top, ${colors.artworkScrim} 0%, transparent 100%)`,
              },
            ]}
          />
          <View style={styles.content}>
            <View style={styles.markRow}>
              <SpeechMark color={colors.onArtwork} height={spacing.xl} />
              <ThemedText variant="caption" tone="onArtworkMuted">
                Speak
              </ThemedText>
            </View>
            <View>
              <ThemedText variant="headline" tone="onArtwork" numberOfLines={2}>
                {item.title}
              </ThemedText>
              <ThemedText variant="footnote" tone="onArtworkMuted" style={styles.duration}>
                {item.duration}
              </ThemedText>
              <View style={[styles.button, { backgroundColor: colors.inverseSurface }]}>
                <HugeiconsIcon icon={PlayIcon} size={15} color={colors.inverseLabel} />
                <ThemedText variant="subhead" tone="inverse">
                  Start
                </ThemedText>
              </View>
            </View>
          </View>
        </AtmosphereSurface>
      </Pressable>

      {/* Off-center depth blur, iOS only (parity with the reference app). */}
      {Platform.OS === 'ios' && (
        <View style={styles.blurClip} pointerEvents="none">
          <AnimatedBlurView
            animatedProps={rBlurProps}
            tint={scheme === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  item: {
    aspectRatio: CARD_ASPECT,
    padding: ITEM_GAP,
  },
  clip: {
    flex: 1,
  },
  cardFill: {
    flex: 1,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  markRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  duration: {
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
    height: BUTTON_HEIGHT,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  blurClip: {
    position: 'absolute',
    top: ITEM_GAP,
    left: ITEM_GAP,
    right: ITEM_GAP,
    bottom: ITEM_GAP,
    borderRadius: CARD_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
});
