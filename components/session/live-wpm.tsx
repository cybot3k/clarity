import { StyleSheet, View } from 'react-native';

import { ScoreValue } from '@/components/metrics';
import { ThemedText } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { paceLabel } from '@/lib/metrics';

export type LiveWpmProps = {
  liveWpm: number;
  targetWpm: number;
};

/** Practice header center slot: live pace over a "target N · pace" caption. */
export function LiveWpm({ liveWpm, targetWpm }: LiveWpmProps) {
  return (
    <View style={styles.wrap}>
      <ScoreValue value={liveWpm > 0 ? liveWpm : null} size="row" unit="WPM" />
      <ThemedText variant="footnote" tone="secondary">
        {`target ${targetWpm} · ${paceLabel(liveWpm, targetWpm)}`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
