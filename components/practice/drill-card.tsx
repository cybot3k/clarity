import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AtmosphereSurface, ThemedText } from '@/components/ui';
import { DRILL_META } from '@/constants/drills';
import { SKILL_ICONS, SKILL_LABELS } from '@/constants/metrics';
import { atmosphere, radius, spacing, springs } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';
import type { Passage } from '@/types/session';

/** Card width for the horizontal drills row: two cards plus a peek of the third
 * at the common phone width, so the row reads as scrollable. */
const CARD_WIDTH = 168;

const ICON_BED_SIZE = 40;

export type DrillCardProps = {
  drill: Passage;
  onStart: (drill: Passage) => void;
};

/** Artwork tile for the horizontal drills row. Press feedback is scale only,
 * so the parent row must not clip it. */
export function DrillCard({ drill, onStart }: DrillCardProps) {
  const { colors } = useTheme();
  const { reduced } = useAtmospherePrefs();
  const meta = DRILL_META[drill.id];
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * (1 - atmosphere.pressScale) }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart(drill);
  };

  return (
    <Animated.View style={[styles.item, pressStyle]}>
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        onPressIn={() => {
          if (!reduced) pressed.value = withSpring(1, springs.snap);
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, springs.snap);
        }}
        style={styles.item}>
        <AtmosphereSurface
          mesh="artwork"
          artwork={drill.artwork}
          radius="xl"
          style={[
            styles.card,
            { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.frostRim },
          ]}>
          <View>
            <ThemedText variant="title3" weight="regular" tone="onArtwork" numberOfLines={2}>
              {drill.title}
            </ThemedText>
            {meta != null && (
              <ThemedText
                variant="footnote"
                weight="regular"
                tone="onArtworkMuted"
                numberOfLines={2}
                style={styles.blurb}>
                {meta.blurb}
              </ThemedText>
            )}
          </View>
          <View style={styles.footer}>
            <View
              style={[
                styles.iconWell,
                {
                  backgroundColor: colors.fillTranslucent,
                  borderColor: colors.frostRim,
                },
              ]}>
              <HugeiconsIcon
                icon={meta ? SKILL_ICONS[meta.skill] : SKILL_ICONS.accuracy}
                size={22}
                color={colors.onArtwork}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.meta}>
              {meta != null && (
                <ThemedText variant="caption" weight="semibold" tone="onArtwork">
                  {SKILL_LABELS[meta.skill]}
                </ThemedText>
              )}
              <ThemedText variant="caption" tone="onArtworkMuted">
                {drill.duration}
              </ThemedText>
            </View>
          </View>
        </AtmosphereSurface>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    width: CARD_WIDTH,
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: atmosphere.drillAspect,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  blurb: {
    marginTop: spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  iconWell: {
    width: ICON_BED_SIZE,
    height: ICON_BED_SIZE,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    alignItems: 'flex-end',
  },
});
