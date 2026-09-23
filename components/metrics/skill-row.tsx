import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import { SKILL_LABELS } from '@/constants/metrics';
import { atmosphere, radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SkillKey } from '@/types/history';

import { DeltaPill } from './delta-pill';
import { ScoreValue } from './score-value';

/** Caption line height, held even when a skill has no caption, so every row is
 * the same height and the tick bars below them stay on one grid. */
const CAPTION_HEIGHT = 16;

/** Skill name line height, so a row's height doesn't depend on its glyphs. */
const NAME_HEIGHT = 20;

/**
 * One skill: name, raw-measure caption, score out of 100, change, and a tick
 * meter. Identical on the session summary and on Analytics — only the `caption`
 * and `delta` bases differ ("this session" vs "this week"), which is why both
 * arrive as props rather than being derived here.
 *
 * `score: null` means the skill wasn't measured (a freestyle session has no
 * Articulation, a non-Azure one has no Expression). That renders a dash and an
 * empty track rather than a zero, so "no data" never reads as "you scored 0".
 */
export type SkillRowProps = {
  skill: SkillKey;
  score: number | null;
  /** Raw measure under the name, e.g. "183 wpm · target 179". Omit when the
   * underlying count isn't recorded — Flow and Expression have none today. */
  caption?: string;
  /** Change vs the comparison basis. Omit when there's nothing to compare. */
  delta?: number;
  /** Marks this as the weakest skill. Only ever set on one row per card. */
  focus?: boolean;
};

export function SkillRow({ skill, score, caption, delta, focus = false }: SkillRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        {/* Fixed-width slot keeps names in one vertical lane across all rows. */}
        <View
          style={[
            styles.pip,
            {
              backgroundColor:
                skill === 'accuracy'
                  ? colors.skillAccuracyFrom
                  : skill === 'fluency'
                    ? colors.skillFluencyFrom
                    : skill === 'pace'
                      ? colors.skillPaceFrom
                      : skill === 'fillers'
                        ? colors.skillFillersFrom
                        : colors.skillIntonationFrom,
            },
          ]}
        />

        <View style={styles.text}>
          <View style={styles.nameRow}>
            <ThemedText variant="callout" style={styles.name}>
              {SKILL_LABELS[skill]}
            </ThemedText>
            {focus && (
              <View style={[styles.focusPill, { backgroundColor: colors.focusBg }]}>
                <ThemedText variant="micro" weight="bold" tone="focus">
                  FOCUS
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.captionSlot}>
            {caption != null && (
              <ThemedText
                variant="footnote"
                weight="regular"
                tone="tertiary"
                style={styles.caption}
                numberOfLines={1}>
                {caption}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.trailing}>
          <ScoreValue value={score} size="sm" tone="ink" />
          {score != null && delta != null && <DeltaPill delta={delta} hideZero />}
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: colors.track }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round((score != null ? score : 0))}%` as `${number}%`,
              backgroundColor: colors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pip: {
    width: 3,
    height: NAME_HEIGHT,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    lineHeight: NAME_HEIGHT,
  },
  focusPill: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
    borderCurve: 'continuous',
  },
  captionSlot: {
    height: CAPTION_HEIGHT,
    justifyContent: 'center',
  },
  caption: {
    lineHeight: CAPTION_HEIGHT,
  },
  trailing: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
  track: {
    height: atmosphere.progressStroke,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: atmosphere.progressStroke,
    borderRadius: radius.full,
  },
});
