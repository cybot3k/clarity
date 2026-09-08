import { Image, StyleSheet, View } from 'react-native';

export type GrainOverlayProps = {
  /** From `atmosphere.grainOpacity[scheme]` or `grainOpacityHero`. Unmounts at 0. */
  opacity: number;
};

/**
 * Film-grain overlay. Amplitude is baked into `assets/atmosphere/grain.png`.
 * Cover, not repeat — iOS tiling of a require()'d Image is unreliable.
 */
export function GrainOverlay({ opacity }: GrainOverlayProps) {
  if (opacity <= 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require('@/assets/atmosphere/grain.png')}
        resizeMode="cover"
        fadeDuration={0}
        style={[StyleSheet.absoluteFill, { opacity }]}
      />
    </View>
  );
}
