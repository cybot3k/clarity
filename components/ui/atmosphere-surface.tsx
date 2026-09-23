import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius as radiusTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SkillKey } from '@/types/history';
import type { Passage } from '@/types/session';

export type AtmosphereMesh =
  | 'hero'
  | 'add'
  | 'artwork'
  | 'minutes'
  | 'sessions'
  | 'streak'
  | 'mastered'
  | SkillKey;

export type AtmosphereSurfaceProps = {
  children?: ReactNode;
  /** Default `hero`. */
  radius?: keyof typeof radiusTokens;
  mesh: AtmosphereMesh;
  /** Accepted so artwork call sites keep compiling. Not painted. */
  artwork?: Passage['artwork'];
  /** Accepted so older call sites keep compiling. Borders replace dotted strokes. */
  dotted?: boolean;
  /** Accepted so older call sites keep compiling. Grain is never painted. */
  grain?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Raised surface on the black canvas. One fill, one hairline border.
 * `mesh` stays in the API so existing cards don't fork, and it does not
 * change the color — skill identity lives in labels and the signal accent.
 */
export function AtmosphereSurface({
  children,
  radius = 'hero',
  style,
}: AtmosphereSurfaceProps) {
  const { colors } = useTheme();
  const corner = radiusTokens[radius];

  return (
    <View
      style={[
        {
          borderRadius: corner,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.divider,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
