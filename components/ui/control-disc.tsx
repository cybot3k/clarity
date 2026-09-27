import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** One control module: every circle in the app is 48. */
const DISC = 48;
/** Glyph on a 48 control. */
const GLYPH = 20;

/**
 * Fill ranks the action, never size or weight (destination S1/S2):
 * `solid` is the one primary per container, `tinted` and `card` are secondary,
 * `outline` is identity or a quiet utility.
 */
export type ControlDiscFill = 'outline' | 'tinted' | 'card' | 'solid';

export type ControlDiscProps = {
  icon: IconSvgElement;
  fill: ControlDiscFill;
  /** `artwork` when the disc sits on a card mesh. Default `surface`. */
  on?: 'surface' | 'artwork';
  /** Omit for a decorative disc inside a larger press target. */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Swaps the glyph for a spinner and blocks presses. */
  busy?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The 48 circle every screen uses for icon-only controls and identity marks. */
export function ControlDisc({
  icon,
  fill,
  on = 'surface',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  busy = false,
  disabled = false,
  style,
}: ControlDiscProps) {
  const { colors } = useTheme();
  const artwork = on === 'artwork';

  let background = 'transparent';
  let rim: string | null = null;
  let glyph = artwork ? colors.onArtwork : colors.foreground;
  switch (fill) {
    case 'outline':
      rim = artwork ? colors.artworkFill : colors.outline;
      break;
    case 'tinted':
      background = artwork ? colors.artworkFill : colors.fillTranslucent;
      break;
    case 'card':
      background = colors.card;
      glyph = colors.foreground;
      break;
    case 'solid':
      // On a mesh the solid stays dark in both schemes, as on the reference cards.
      background = artwork ? colors.ctaTrack : colors.inverseSurface;
      glyph = artwork ? colors.ctaLabel : colors.inverseLabel;
      break;
  }

  const disc = [
    styles.disc,
    { backgroundColor: background },
    rim != null && { borderWidth: 1, borderColor: rim },
  ];
  const content = busy ? (
    <ActivityIndicator size="small" color={glyph} />
  ) : (
    <HugeiconsIcon icon={icon} size={GLYPH} color={glyph} />
  );

  if (onPress == null) {
    return (
      <View pointerEvents="none" style={[disc, style]}>
        {content}
      </View>
    );
  }

  const blocked = busy || disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: blocked, busy }}
      disabled={blocked}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [disc, pressed && styles.pressed, style]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
