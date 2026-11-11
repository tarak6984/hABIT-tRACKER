import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { useStore } from '@/store/AppStore';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  tone?: 'surface' | 'primary' | 'clear';
  size?: number;
};

export function IconButton({ icon, onPress, accessibilityLabel, tone = 'surface', size = 44 }: IconButtonProps) {
  const { colors } = useTheme();
  const { feedback } = useStore();
  const background = { surface: colors.surface, primary: colors.primary, clear: 'transparent' }[tone];
  const foreground = tone === 'primary' ? colors.onPrimary : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: radii.md,
        backgroundColor: background,
        borderWidth: tone === 'surface' ? 1 : 0,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.92 : 1 }],
      })}
    >
      <Icon name={icon} size={size * 0.5} color={foreground} />
    </Pressable>
  );
}
