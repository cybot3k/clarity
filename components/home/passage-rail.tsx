import { PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { memo, useMemo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { AtmosphereSurface, SpeechMark, ThemedText } from '@/components/ui';
import { SKILL_LABELS } from '@/constants/metrics';
import { atmosphere, radius, spacing, springs } from '@/constants/theme';
import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';
import { useTheme } from '@/hooks/use-theme';
import { speakingScore } from '@/lib/score';
import type { SessionRecord, SkillProfile } from '@/types/history';
import type { Passage } from '@/types/session';

/** One control module (layout plan D2): every in-card disc is 48. */
const DISC = 48;
/** Glyph on a 48 disc. */
const ICON_SIZE = 20;
/** Best-score arc around the identity disc (CO-12b). */
const ARC_STROKE = 2;
/**
 * The chrome SpeechMark is a fixed 64 × 20. Halved, it sits inside the 48
 * ring disc with clearance instead of crossing the ring.
 */
const MARK_IN_DISC_SCALE = 0.5;
/** Layout plan CO-04: at least 86 of the next card shows, enough for its identity column. */
const PEEK = 86;

/**
 * Square rail card edge. On the 393 basis this is the plan's 271: the card
 * starts on the page column (x 20) and the next one peeks 86 before the
 * sheet's edge (x 385).
 */
export function useRailCardSize(): number {
  const { width } = useWindowDimensions();
  return width - spacing.xl - spacing.sm - PEEK - spacing.sm;
}

/**
 * CO-04 rail: 1-up + peek, snap per card, no dots, no scale, no blur. Sits in
 * the Home sheet's 12 padding and bleeds past it to the sheet edges, so cards
 * clip at the sheet rather than at the reading column.
 */
export function Rail({ cardSize, children }: { cardSize: number; children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardSize + spacing.sm}
      decelerationRate="fast"
      style={styles.rail}
      contentContainerStyle={styles.railContent}>
      {children}
    </ScrollView>
  );
}

/** A square rail card that is one press target: medium haptic and a 0.98 press scale. */
export function RailCard({
  size,
  onPress,
  children,
}: {
  size: number;
  onPress: () => void;
  children: ReactNode;
}) {
  const { reduced } = useAtmospherePrefs();
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(pressed.value, [0, 1], [1, atmosphere.pressScale], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={() => {
        if (!reduced) pressed.value = withSpring(1, springs.snap);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, springs.snap);
      }}>
      <Animated.View style={[{ width: size, height: size }, pressStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Identity disc: the SpeechMark on a hairline ring, with the best score as an arc (CO-12b). */
function RingDisc({ progress }: { progress: number | null }) {
  const { colors } = useTheme();
  const c = DISC / 2;
  const r = (DISC - ARC_STROKE) / 2;
  const circ = 2 * Math.PI * r;
  const p = progress == null ? 0 : Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.disc}>
      <Svg
        width={DISC}
        height={DISC}
        style={StyleSheet.absoluteFill}
        importantForAccessibility="no-hide-descendants">
        <Circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={colors.artworkFill}
          strokeWidth={StyleSheet.hairlineWidth}
        />
        {p > 0 ? (
          <G rotation={-90} origin={[c, c]}>
            <Circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={colors.onArtwork}
              strokeWidth={ARC_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${circ * p} ${circ}`}
            />
          </G>
        ) : null}
      </Svg>
      <View style={styles.mark}>
        <SpeechMark color={colors.onArtwork} height={ICON_SIZE} />
      </View>
    </View>
  );
}

/** CO-12c: one row of 20 dots, lit up to the skill's current score. */
function SkillDots({ value }: { value: number }) {
  const { colors } = useTheme();
  const count = atmosphere.skillMeter.dots;
  const lit = Math.min(count, Math.max(0, Math.round((value / 100) * count)));

  return (
    <View style={styles.dots} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i < lit ? colors.onArtwork : colors.artworkFill }]}
        />
      ))}
    </View>
  );
}

type PassageCardProps = {
  item: Passage;
  size: number;
  bestScore: number | null;
  skillProfile: SkillProfile;
  onStart: (item: Passage) => void;
};

/** CO-03: ring disc, title, solid play disc, metric pair, dot row, footer. */
const PassageCard = memo(function PassageCard({
  item,
  size,
  bestScore,
  skillProfile,
  onStart,
}: PassageCardProps) {
  const { colors } = useTheme();
  const skill = item.skills?.[0];
  const estimate = skill != null ? skillProfile[skill] : undefined;
  const skillLabels = (item.skills ?? []).map((key) => SKILL_LABELS[key]).join(' · ');

  return (
    <RailCard size={size} onPress={() => onStart(item)}>
      <AtmosphereSurface mesh="artwork" artwork={item.artwork} radius="xl" style={styles.card}>
        <View
          pointerEvents="none"
          style={[
            styles.scrim,
            {
              experimental_backgroundImage: `linear-gradient(to top, ${colors.artworkScrim} 0%, transparent 100%)`,
            },
          ]}
        />
        <View style={styles.header}>
          <RingDisc progress={bestScore != null ? bestScore / 100 : null} />
          <View style={styles.titleBlock}>
            <ThemedText variant="title3" weight="regular" tone="onArtwork" numberOfLines={2}>
              {item.title}
            </ThemedText>
            <ThemedText variant="footnote" weight="regular" tone="onArtworkMuted" numberOfLines={1}>
              Speak
            </ThemedText>
          </View>
          {/* Decorative: the whole card is the press target. */}
          <View
            pointerEvents="none"
            style={[styles.disc, { backgroundColor: colors.inverseSurface }]}>
            <HugeiconsIcon icon={PlayIcon} size={ICON_SIZE} color={colors.inverseLabel} />
          </View>
        </View>

        <View style={styles.metrics}>
          {/* Each stack lists its value first so the value is the stack's
              baseline child (Yoga reads a column's baseline from its first
              child); column-reverse still paints the label above it. */}
          <View style={styles.stack}>
            {/* ScoreValue's mesh ink is the atmosphere ink, not artwork ink, so
                this numeral mirrors its value/unit spans in the artwork tones. */}
            <ThemedText variant="numeralLarge" tone="onArtwork" style={styles.tabular}>
              {item.targetWpm}
              <ThemedText variant="numeralUnit" tone="onArtworkMuted">
                {' wpm'}
              </ThemedText>
            </ThemedText>
            <ThemedText variant="footnote" tone="onArtworkMuted" numberOfLines={1}>
              Reading pace
            </ThemedText>
          </View>
          {bestScore != null ? (
            <View style={styles.stack}>
              <ThemedText variant="subhead" tone="onArtwork" style={styles.tabular}>
                {`${Math.round(bestScore)} /100`}
              </ThemedText>
              <ThemedText variant="footnote" tone="onArtworkMuted" numberOfLines={1}>
                Best score
              </ThemedText>
            </View>
          ) : null}
        </View>

        {estimate != null && estimate.samples > 0 ? <SkillDots value={estimate.value} /> : null}

        <View style={styles.footer}>
          <ThemedText variant="footnote" tone="onArtworkMuted" numberOfLines={1}>
            {item.duration}
          </ThemedText>
          {skillLabels !== '' ? (
            <ThemedText
              variant="subhead"
              tone="onArtwork"
              numberOfLines={1}
              style={styles.footerSkills}>
              {skillLabels}
            </ThemedText>
          ) : null}
        </View>
      </AtmosphereSurface>
    </RailCard>
  );
});

export type PassageRailProps = {
  items: readonly Passage[];
  records: readonly SessionRecord[];
  skillProfile: SkillProfile;
  onStart: (item: Passage) => void;
};

/** Home "For you": CO-03 passage cards on a CO-04 rail. */
export function PassageRail({ items, records, skillProfile, onStart }: PassageRailProps) {
  const size = useRailCardSize();

  // Each passage's score across the sessions spoken on it. Absent when the
  // passage has never been practiced or nothing it measured was scorable.
  const bestScores = useMemo(() => {
    const scores = new Map<string, number>();
    for (const item of items) {
      const score = speakingScore(records.filter((r) => r.passageId === item.id));
      if (score != null) scores.set(item.id, score);
    }
    return scores;
  }, [items, records]);

  return (
    <Rail cardSize={size}>
      {items.map((item) => (
        <PassageCard
          key={item.id}
          item={item}
          size={size}
          bestScore={bestScores.get(item.id) ?? null}
          skillProfile={skillProfile}
          onStart={onStart}
        />
      ))}
    </Rail>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginHorizontal: -spacing.md,
  },
  railContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.xl,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    transform: [{ scale: MARK_IN_DISC_SCALE }],
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  metrics: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stack: {
    flexDirection: 'column-reverse',
    flexShrink: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  dots: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: atmosphere.skillMeter.dot,
  },
  dot: {
    width: atmosphere.skillMeter.dot,
    height: atmosphere.skillMeter.dot,
    borderRadius: radius.full,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerSkills: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
