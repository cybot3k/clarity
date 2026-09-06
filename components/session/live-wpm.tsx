import { StyleSheet, View } from 'react-native';

import { LedNumber, ThemedText } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { paceLabel } from '@/lib/metrics';

export type LiveWpmProps = {
  liveWpm: number;
  targetWpm: number;
};

/** Practice header center slot: blue live WPM (SwiftUI numericText transition
 * so digits roll) over a gray "target 179 · good pace" caption. */
export function LiveWpm({ liveWpm, targetWpm }: LiveWpmProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.wpmRow}>
        <LedNumber value={liveWpm > 0 ? liveWpm : null} size="sm" tone="ink" />
        <ThemedText variant="footnote" weight="semibold">
          WPM
        </ThemedText>
      </View>
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
  wpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
});
