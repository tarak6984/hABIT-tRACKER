import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type PremiumLockProps = { title: string; description: string; children: ReactNode };

/** Renders children for premium members; otherwise a dimmed preview with an upgrade prompt. */
export function PremiumLock({ title, description, children }: PremiumLockProps) {
  const { state } = useStore();
  const { colors } = useTheme();
  if (state.profile.isPremium) return <>{children}</>;

  return (
    <View style={styles.wrap}>
      <View style={styles.preview} pointerEvents="none" importantForAccessibility="no-hide-descendants">
        {children}
      </View>
      <View style={[styles.overlay, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText style={styles.crown}>👑</AppText>
        <AppText variant="subheading" align="center">
          {title}
        </AppText>
        <AppText variant="caption" tone="muted" align="center">
          {description}
        </AppText>
        <Button label="Unlock Premium" size="sm" icon="sparkles" onPress={() => router.push('/premium')} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  preview: { opacity: 0.18 },
  overlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -80 }],
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  crown: { fontSize: 28, lineHeight: 34 },
  button: { marginTop: spacing.xs, alignSelf: 'stretch' },
});
