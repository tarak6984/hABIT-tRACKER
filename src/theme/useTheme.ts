import { useColorScheme } from 'react-native';

import { useStore } from '@/store/AppStore';
import { habitColors, palettes, type ColorScheme, type HabitColorId } from '@/theme/tokens';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { state } = useStore();
  const preference = state.settings.theme;
  const scheme: ColorScheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const isDark = scheme === 'dark';
  const colors = palettes[scheme];

  const habitTint = (id: HabitColorId) => {
    const color = habitColors[id];
    return { base: color.base, soft: isDark ? color.softDark : color.soft, gradient: color.gradient };
  };

  return { scheme, isDark, colors, habitTint };
}

export type Theme = ReturnType<typeof useTheme>;
