import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

import { useAtmospherePrefs } from '@/hooks/use-atmosphere-prefs';

export type GrainOverlayProps = {
  opacity: number;
  style?: StyleProp<ImageStyle>;
};

/**
 * Repeated grain tile. Renders nothing when the caller passes a non-positive
 * opacity, or when reduce-motion / reduce-transparency is on. Callers still
 * mount it; unmounting is this component's job.
 */
export function GrainOverlay({ opacity, style }: GrainOverlayProps) {
  const { reduced } = useAtmospherePrefs();
  if (opacity <= 0 || reduced) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require('@/assets/atmosphere/grain.png')}
        resizeMode="repeat"
        accessible={false}
        style={[StyleSheet.absoluteFill, { opacity }, style]}
      />
    </View>
  );
}
