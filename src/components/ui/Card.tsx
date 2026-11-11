import { Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type CardProps = ViewProps & {
  padded?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ padded = true, onPress, style, children, accessibilityLabel, ...rest }: CardProps) {
  const { colors, isDark } = useTheme();
  const cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: padded ? spacing.md : 0,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: isDark ? 0.3 : 0.07,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    style,
  ];

  if (!onPress) {
    return (
      <View {...rest} style={cardStyle}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] }]}
    >
      {children}
    </Pressable>
  );
}
