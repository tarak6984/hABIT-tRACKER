import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export const TAB_BAR_CLEARANCE = 110;

type ScreenProps = {
  children: ReactNode;
  isScrollable?: boolean;
  hasTabBar?: boolean;
  gradient?: readonly [string, string, ...string[]];
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
};

export function Screen({ children, isScrollable = true, hasTabBar = false, gradient, contentStyle, footer }: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = (hasTabBar ? TAB_BAR_CLEARANCE : spacing.xl) + insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradient ?? colors.backgroundGradient} style={StyleSheet.absoluteFill} />
      {isScrollable ? (
        <ScrollView
          contentContainerStyle={[{ paddingTop: insets.top + spacing.xs, paddingBottom: bottomPadding, paddingHorizontal: spacing.lg }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="never"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, { paddingTop: insets.top + spacing.xs, paddingHorizontal: spacing.lg }, contentStyle]}>{children}</View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, paddingTop: spacing.sm }}>{footer}</View>
      ) : null}
    </View>
  );
}

type ScreenHeaderProps = { title: string; right?: ReactNode; onBack?: () => void; showsBack?: boolean };

export function ScreenHeader({ title, right, onBack, showsBack = true }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {showsBack ? (
        <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={onBack ?? (() => router.back())} />
      ) : (
        <View style={styles.headerSlot} />
      )}
      <AppText variant="heading" align="center" style={styles.headerTitle} numberOfLines={1}>
        {title}
      </AppText>
      <View style={styles.headerSlot}>{right}</View>
    </View>
  );
}

type SectionHeaderProps = { title: string; actionLabel?: string; onAction?: () => void };

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {actionLabel && onAction ? (
        <AppText variant="label" tone="primary" onPress={onAction} accessibilityRole="button" suppressHighlighting>
          {actionLabel}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, minHeight: 48 },
  headerTitle: { flex: 1, marginHorizontal: spacing.xs },
  headerSlot: { minWidth: 44, alignItems: 'flex-end' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
});
