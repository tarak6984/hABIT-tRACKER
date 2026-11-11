import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useStore } from '@/store/AppStore';
import { radii, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  size?: 'md' | 'sm';
  isDisabled?: boolean;
  isLoading?: boolean;
  gradient?: readonly [string, string];
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  size = 'md',
  isDisabled = false,
  isLoading = false,
  gradient,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const { feedback } = useStore();
  const height = size === 'md' ? 54 : 40;

  const foreground: Record<Variant, string> = {
    primary: colors.onPrimary,
    secondary: colors.primary,
    ghost: colors.textMuted,
    danger: colors.danger,
  };
  const background: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.primarySoft,
    ghost: 'transparent',
    danger: colors.dangerSoft,
  };

  const content = (
    <View style={styles.content}>
      {isLoading ? (
        <ActivityIndicator color={foreground[variant]} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'md' ? 20 : 16} color={foreground[variant]} />}
          <AppText variant={size === 'md' ? 'subheading' : 'label'} color={foreground[variant]}>
            {label}
          </AppText>
        </>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled || isLoading}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { height, borderRadius: size === 'md' ? radii.md : radii.sm, backgroundColor: background[variant] },
        variant === 'primary' && { shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
        isDisabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={gradient ?? [colors.primary, colors.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size === 'md' ? radii.md : radii.sm }]}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, overflow: 'visible' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
