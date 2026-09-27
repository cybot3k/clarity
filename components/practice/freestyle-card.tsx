import { Mic02Icon, ShuffleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { AtmosphereSurface, PrimaryButton, ThemedText } from '@/components/ui';
import { radius, spacing } from '@/constants/theme';
import type { FreestyleTopic } from '@/constants/topics';
import { useTheme } from '@/hooks/use-theme';

/** Shuffle button. 40pt with `hitSlop` bringing the tap area past 44pt. */
const SHUFFLE_SIZE = 40;

export type FreestyleCardProps = {
  topic: FreestyleTopic;
  onShuffle: () => void;
  onStart: (topic: FreestyleTopic) => void;
};

/** Practice's one hero stage: a suggested topic, a ghost shuffle, and the
 * screen's only lime knob. Mesh, not glass, so the knob can sit inside it. */
export function FreestyleCard({ topic, onShuffle, onStart }: FreestyleCardProps) {
  const { colors } = useTheme();

  const handleShuffle = () => {
    Haptics.selectionAsync();
    onShuffle();
  };

  return (
    <AtmosphereSurface mesh="hero" radius="hero" style={styles.card}>
      <View style={styles.topicRow}>
        <ThemedText variant="footnote" tone="onAtmosphereMuted">
          Suggested topic
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Shuffle topic"
          onPress={handleShuffle}
          hitSlop={spacing.sm}
          style={[
            styles.shuffle,
            {
              backgroundColor: colors.fillTranslucent,
              borderColor: colors.frostRim,
            },
          ]}>
          <HugeiconsIcon icon={ShuffleIcon} size={18} color={colors.onAtmosphere} strokeWidth={1.5} />
        </Pressable>
      </View>

      <ThemedText variant="largeTitle" tone="onAtmosphere" numberOfLines={2} style={styles.topic}>
        {topic.title}
      </ThemedText>

      <ThemedText variant="subheadProse" tone="onAtmosphereMuted" style={styles.prompt} numberOfLines={3}>
        {topic.prompt}
      </ThemedText>

      <PrimaryButton
        title="Start Speaking"
        icon={Mic02Icon}
        size="md"
        variant="knob"
        onPress={() => onStart(topic)}
        style={styles.button}
      />
    </AtmosphereSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  topic: {
    marginTop: spacing.md,
  },
  shuffle: {
    width: SHUFFLE_SIZE,
    height: SHUFFLE_SIZE,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});
