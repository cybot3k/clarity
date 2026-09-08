import { StyleSheet, View } from 'react-native';

import { DayChip } from '@/components/ui';
import { spacing } from '@/constants/theme';

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
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
});
