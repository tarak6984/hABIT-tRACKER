import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ListRowProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  tint?: string;
  right?: ReactNode;
  onPress?: () => void;
  isDestructive?: boolean;
};

export function ListRow({ icon, title, subtitle, tint, right, onPress, isDestructive = false }: ListRowProps) {
  const { colors } = useTheme();
  const accent = isDestructive ? colors.danger : (tint ?? colors.primary);

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.icon, { backgroundColor: `${accent}1F` }]}>
        <Icon name={icon} size={18} color={accent} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyBold" color={isDestructive ? colors.danger : undefined}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color={colors.textSoft} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  icon: { width: 38, height: 38, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 1 },
});
