import type { IconSvgElement } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ControlDisc, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Home's one sheet: an opaque white slab under the open canvas, the way the
 * destination dashboard (S1) lifts its detail onto a white panel. It bleeds
 * 8 past the page column on each side and pads 12 back in, so its text stays
 * on the column. Not glass, so anything may sit inside it.
 */
export function HomeSheet({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();

  return (
    <View style={styles.sheet}>
      {/* The slab runs well past the scroll content's end (dock inset plus
          overscroll), so its bottom corners are never seen. */}
      <View
        pointerEvents="none"
        style={[styles.slab, { backgroundColor: colors.card, bottom: -2 * height }]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export type SheetSectionProps = {
  icon: IconSvgElement;
  title: string;
  subtitle?: string;
  /** Right slot on the header's axis: a short meta readout. */
  trailing?: ReactNode;
  /** The first section sits on the sheet's top padding, with no gap above. */
  first?: boolean;
  children: ReactNode;
};

/**
 * A sheet section with the dashboard's module header (S1 "Credit History"):
 * an outline identity disc, the title on its axis, and an optional trailing
 * readout on the right pad line.
 */
export function SheetSection({ icon, title, subtitle, trailing, first, children }: SheetSectionProps) {
  return (
    <View style={!first && styles.spaced}>
      <View style={styles.header}>
        <ControlDisc icon={icon} fill="outline" />
        <View style={styles.titles}>
          <ThemedText
            variant="title"
            weight="regular"
            tone="primary"
            numberOfLines={1}
            accessibilityRole="header">
            {title}
          </ThemedText>
          {subtitle != null ? (
            <ThemedText variant="footnote" weight="regular" tone="secondary" numberOfLines={2}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        {trailing}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: -spacing.md,
  },
  slab: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    borderCurve: 'continuous',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  spaced: {
    marginTop: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    marginTop: spacing.lg,
  },
});
