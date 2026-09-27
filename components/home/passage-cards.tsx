import { PlayIcon } from '@hugeicons/core-free-icons';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { AtmosphereSurface, ControlDisc, SpeechMark, ThemedText } from '@/components/ui';
import { SKILL_LABELS } from '@/constants/metrics';
import { atmosphere, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { meshFor } from '@/lib/mesh';
import { speakingScore } from '@/lib/score';
import type { SessionRecord, SkillProfile } from '@/types/history';
import type { Passage } from '@/types/session';

import { CardRail, PressableCard, useCardSize } from './card-rail';

/** One control module: the identity ring matches the action disc. */
const DISC = 48;
/** Best-score arc around the identity disc. */
const ARC = 2;
/** The ring's resting track. */
const TRACK = 1;
/**
 * SpeechMark is drawn at the chrome's 20 high, which runs 64 wide. Halved, it
 * sits inside the 48 ring with clearance instead of crossing it.
 */
const MARK_HEIGHT = 20;
const MARK_SCALE = 0.5;

/** The identity disc: SpeechMark on a hairline ring, the best score drawn as an arc. */
function ScoreRing({ progress }: { progress: number | null }) {
  const { colors } = useTheme();
  const c = DISC / 2;
  const r = (DISC - ARC) / 2;
  const circ = 2 * Math.PI * r;
  const p = progress == null ? 0 : Math.max(0, Math.min(progress, 1));

  return (
    <View style={styles.ring}>
      <Svg width={DISC} height={DISC} style={StyleSheet.absoluteFill}>
        <Circle cx={c} cy={c} r={r} fill="none" stroke={colors.artworkFill} strokeWidth={TRACK} />
        {p > 0 ? (
          <G rotation={-90} origin={[c, c]}>
            <Circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={colors.onArtwork}
              strokeWidth={ARC}
              strokeLinecap="round"
              strokeDasharray={`${circ * p} ${circ}`}
            />
          </G>
        ) : null}
      </Svg>
      <View style={styles.mark}>
        <SpeechMark color={colors.onArtwork} height={MARK_HEIGHT} />
      </View>
    </View>
  );
}

/** One row of dots lit up to the skill's current score; lime is the lit state (S2). */
function SkillDots({ value }: { value: number }) {
  const { colors } = useTheme();
  const count = atmosphere.skillMeter.dots;
  const lit = Math.min(count, Math.max(0, Math.round((value / 100) * count)));

  return (
    <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: i < lit ? colors.accent : colors.artworkFill }]}
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

/**
 * The catalog's tinted feature card (S2 "TD Bank"): identity ring and title on
 * top with the solid action disc in the corner, a label-over-value pair and a
 * right-anchored pair on one baseline, a dot meter, and a footer.
 */
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
    <PressableCard size={size} onPress={() => onStart(item)}>
      <AtmosphereSurface mesh={meshFor(item)} radius="xxl" style={styles.card}>
        {/* Deepens the foot so the footer's white ink clears the glow. */}
        <View
          pointerEvents="none"
          style={[
            styles.scrim,
            {
              experimental_backgroundImage: `linear-gradient(to top, ${colors.artworkScrimStrong} 0%, transparent 100%)`,
            },
          ]}
        />
        <View style={styles.header}>
          <ScoreRing progress={bestScore != null ? bestScore / 100 : null} />
          <ThemedText
            variant="title3"
            weight="regular"
            tone="onArtwork"
            numberOfLines={2}
            style={styles.title}>
            {item.title}
          </ThemedText>
          {/* Decorative: the whole card is the press target. */}
          <ControlDisc icon={PlayIcon} fill="solid" on="artwork" />
        </View>

        <View style={styles.pairs}>
          {/* Values first so each is its column's baseline child; column-reverse
              still paints the label above. */}
          <View style={styles.stack}>
            <ThemedText variant="numeralLarge" tone="onArtwork" style={styles.tabular}>
              {item.targetWpm}
              <ThemedText variant="numeralUnit" tone="onArtworkMuted">
                {' wpm'}
              </ThemedText>
            </ThemedText>
            <ThemedText variant="footnote" weight="regular" tone="onArtworkMuted" numberOfLines={1}>
              Reading pace
            </ThemedText>
          </View>
          {bestScore != null ? (
            <View style={[styles.stack, styles.trailing]}>
              <ThemedText variant="subhead" weight="regular" tone="onArtwork" style={styles.tabular}>
                {`${Math.round(bestScore)} /100`}
              </ThemedText>
              <ThemedText variant="footnote" weight="regular" tone="onArtworkMuted" numberOfLines={1}>
                Best score
              </ThemedText>
            </View>
          ) : null}
        </View>

        {estimate != null && estimate.samples > 0 ? <SkillDots value={estimate.value} /> : null}

        <View style={styles.footer}>
          <ThemedText variant="footnote" weight="regular" tone="onArtworkMuted" numberOfLines={1}>
            {item.duration}
          </ThemedText>
          {skillLabels !== '' ? (
            <ThemedText
              variant="subhead"
              weight="regular"
              tone="onArtwork"
              numberOfLines={1}
              style={styles.footerSkills}>
              {skillLabels}
            </ThemedText>
          ) : null}
        </View>
      </AtmosphereSurface>
    </PressableCard>
  );
});

export type PassageCardsProps = {
  items: readonly Passage[];
  records: readonly SessionRecord[];
  skillProfile: SkillProfile;
  onStart: (item: Passage) => void;
};

/** Home "For you": tinted passage cards on a 1-up rail. */
export function PassageCards({ items, records, skillProfile, onStart }: PassageCardsProps) {
  const size = useCardSize();

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
    <CardRail size={size}>
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
    </CardRail>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.xl,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  ring: {
    width: DISC,
    height: DISC,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    transform: [{ scale: MARK_SCALE }],
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  pairs: {
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
  trailing: {
    alignItems: 'flex-end',
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
