import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TranscriptCardProps = {
  transcript: string;
};

/** Freestyle results: what you said, in place of the Word Breakdown. */
export function TranscriptCard({ transcript }: TranscriptCardProps) {
  const { colors } = useTheme();
  const empty = transcript.trim().length === 0;

  return (
    <View>
      <ThemedText variant="sectionTitle" style={styles.heading}>
        What You Said
      </ThemedText>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.divider },
        ]}>
        <ThemedText variant="bodyProse" tone={empty ? 'dimmed' : 'primary'}>
          {empty ? 'No speech was recognized this session.' : transcript}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: spacing.md,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    padding: spacing.xl,
  },
});
