import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { radii, spacing } from '@/theme/tokens';

type StatTileProps = { icon: IconName; value: string; label: string; tint: string; tintSoft: string };

export function StatTile({ icon, value, label, tint, tintSoft }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <View style={[styles.icon, { backgroundColor: tintSoft }]}>
        <Icon name={icon} size={18} color={tint} />
      </View>
      <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      <AppText variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 2, padding: spacing.sm + 2 },
  icon: { width: 34, height: 34, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
});
