import { Rotate01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CHROME_BLUR_BLEED, ProgressiveBlur } from '@/components/glass-tabs';
import { PrimaryButton } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Gap between the pills and the safe-area bottom. */
const ROW_BOTTOM_GAP = spacing.sm;

export type ResultsFooterProps = {
  onRetry: () => void;
  onDone: () => void;
};

/** Floating Retry (light glass) / Done (dark) pills over a bottom
 * progressive blur so results scroll away beneath them. */
export function ResultsFooter({ onRetry, onDone }: ResultsFooterProps) {
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ProgressiveBlur
        direction="bottom"
        tint={scheme}
        style={[styles.blur, { top: -CHROME_BLUR_BLEED }]}
      />
      <View
        style={[styles.row, { paddingBottom: insets.bottom + ROW_BOTTOM_GAP }]}
        pointerEvents="box-none">
        <PrimaryButton
          title="Retry"
          icon={Rotate01Icon}
          variant="frost"
          size="lg"
          onPress={onRetry}
          style={styles.pillWrap}
        />
        <PrimaryButton
          title="Done"
          icon={Tick02Icon}
          variant="solid"
          size="lg"
          onPress={onDone}
          style={styles.pillWrap}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  blur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pillWrap: {
    flex: 1,
  },
});
