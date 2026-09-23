import { StyleSheet, View } from 'react-native';

import { DayChip, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export type WeeklyProgressProps = {
  /** Shared clock from `useNow()`. Advances at midnight / foreground. */
  now: number;
  /** Today's goal completion, 0–1. */
  todayProgress: number;
  /** Completion for the 5 days before today, oldest first. */
  history: readonly boolean[];
};

/**
 * Rolling 7-day strip: 5 past + today + tomorrow. Not a Sunday-start calendar.
 * Day-of-month is dropped; letters follow Date.getDay().
 */
export function WeeklyProgress({ now, todayProgress, history }: WeeklyProgressProps) {
  const { colors } = useTheme();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + i - 5);
    return {
      letter: DAY_LETTERS[date.getDay()],
      isTomorrow: i === 6,
      isToday: i === 5,
      completed: i < 5 ? (history[i] ?? false) : false,
    };
  });

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.divider,
        },
      ]}>
      <View style={styles.labelRow}>
        <ThemedText variant="caption" tone="secondary">
          This week
        </ThemedText>
        <ThemedText variant="caption" tone="tertiary">
          {`${Math.round(todayProgress * 100)}% today`}
        </ThemedText>
      </View>
      <View style={styles.row}>
        {days.map((day, i) => (
          <DayChip
            key={i}
            intent="goal"
            letter={day.letter}
            filled={day.completed}
            muted={day.isTomorrow}
            progress={day.isToday ? todayProgress : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
