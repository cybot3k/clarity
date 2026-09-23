import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type AtmosphereCanvasProps = {
  children: ReactNode;
  /** Kept so existing screens compile. The canvas is a flat near-black field. */
  fog?: boolean;
};

/**
 * Screen canvas. Near-black, nothing else: no fog, no grain, no wash.
 * The interface on top of this is what carries the product.
 */
export function AtmosphereCanvas({ children }: AtmosphereCanvasProps) {
  const { colors } = useTheme();

  return <View style={[styles.root, { backgroundColor: colors.atmosphereCanvas }]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
