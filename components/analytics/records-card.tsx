import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScoreValue } from '@/components/metrics';
import { ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICON_TILE_SIZE = 40;

/**
 * All-time bests. Every row here has a weekly counterpart in the counters
 * above, so a user can see "this week" and "ever" side by side without the two
 * using different names or units for the same thing.
 */
export type RecordRow = {
  icon: IconSvgElement;
  title: string;
  caption: string;
  /** Rendered as `NN /100` when true, otherwise as the raw value plus `unit`. */
  isScore?: boolean;
  value: number;
  unit?: string;
};

export function RecordsCard({ rows }: { rows: readonly RecordRow[] }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.divider,
        },
      ]}>
      {rows.map((row, i) => (
        <Fragment key={row.title}>
          {i > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
          <View style={styles.row}>
            <View style={[styles.iconTile, { borderColor: colors.outline }]}>
              <HugeiconsIcon icon={row.icon} size={20} color={colors.foreground} strokeWidth={1.5} />
            </View>
            <View style={styles.text}>
              <ThemedText variant="callout" weight="semibold" numberOfLines={1}>
                {row.title}
              </ThemedText>
              <ThemedText variant="footnote" weight="regular" tone="tertiary" numberOfLines={1}>
                {row.caption}
              </ThemedText>
            </View>
            <View style={styles.trailing}>
              {row.isScore ? (
                <ScoreValue value={row.value} size="row" on="canvas" />
              ) : (
                <ScoreValue value={row.value} size="row" on="canvas" unit={row.unit ?? ''} />
              )}
            </View>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  iconTile: {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  trailing: {
    flexShrink: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ICON_TILE_SIZE + spacing.md,
  },
});
