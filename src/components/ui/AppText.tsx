import { Text, type TextProps } from 'react-native';

import { typography, type TypographyVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Tone = 'default' | 'muted' | 'soft' | 'primary' | 'inverse' | 'success' | 'danger';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: Tone;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export function AppText({ variant = 'body', tone = 'default', color, align, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const toneColor: Record<Tone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    soft: colors.textSoft,
    primary: colors.primary,
    inverse: '#FFFFFF',
    success: colors.success,
    danger: colors.danger,
  };
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.4}
      style={[typography[variant], { color: color ?? toneColor[tone], textAlign: align }, style]}
    />
  );
}
