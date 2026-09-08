import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Deep-link landing for Clerk browser OAuth (`…/sso-callback`).
 *
 * `openAuthSessionAsync` normally captures the redirect before this route
 * mounts. The screen exists so Expo Router has somewhere to put the URL if
 * the OS delivers it as a cold start instead.
 */
export default function SsoCallbackScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.screen, { backgroundColor: colors.atmosphereCanvas }]}>
      <ThemedText variant="subhead" tone="secondary">
        Finishing sign-in…
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
