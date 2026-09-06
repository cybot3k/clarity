import { StyleSheet, View } from 'react-native';

import { SKILL_ORDER } from '@/constants/metrics';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { focusSkill } from '@/lib/score';
import type { SkillEstimate, SkillKey } from '@/types/history';

import { SkillRow } from './skill-row';

/**
 * The five skills in one opaque card, always in `SKILL_ORDER`. Shared by the
 * session summary and Analytics.
 */
export type SkillCardProps = {
  skills: Record<SkillKey, SkillEstimate>;
  captions?: Partial<Record<SkillKey, string>>;
  deltas?: Partial<Record<SkillKey, number>>;
};

export function SkillCard({ skills, captions, deltas }: SkillCardProps) {
  const { colors } = useTheme();
  const focus = focusSkill(skills);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {SKILL_ORDER.map((skill) => (
        <SkillRow
          key={skill}
          skill={skill}
          score={skills[skill].samples > 0 ? skills[skill].value : null}
          caption={captions?.[skill]}
          delta={deltas?.[skill]}
          focus={skill === focus}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
});
