import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ChipProps = {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  emoji?: string;
  tint?: string;
  isLocked?: boolean;
};

export function Chip({ label, isSelected = false, onPress, icon, emoji, tint, isLocked = false }: ChipProps) {
  const { colors } = useTheme();
  const { feedback } = useStore();
  const accent = tint ?? colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={() => {
        feedback.select();
        onPress?.();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: spacing.sm,
        paddingVertical: 8,
        borderRadius: radii.pill,
        borderWidth: 1.5,
        borderColor: isSelected ? accent : colors.border,
        backgroundColor: isSelected ? `${accent}1F` : colors.surface,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      {emoji ? <AppText variant="label">{emoji}</AppText> : null}
      {icon ? <Icon name={icon} size={15} color={isSelected ? accent : colors.textMuted} /> : null}
      <AppText variant="label" color={isSelected ? accent : colors.textMuted}>
        {label}
      </AppText>
      {isLocked ? <Icon name="lock-closed" size={12} color={colors.textSoft} /> : null}
    </Pressable>
  );
}
