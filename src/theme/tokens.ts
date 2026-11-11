export type ColorScheme = 'light' | 'dark';

export type Palette = {
  background: string;
  backgroundGradient: readonly [string, string, string];
  surface: string;
  surfaceAlt: string;
  surfaceSunken: string;
  border: string;
  text: string;
  textMuted: string;
  textSoft: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  streak: string;
  streakSoft: string;
  coin: string;
  coinSoft: string;
  xp: string;
  shadow: string;
  overlay: string;
  tabBar: string;
};

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    background: '#F5F3FF',
    backgroundGradient: ['#ECE8FF', '#F6F4FF', '#FFF8F3'],
    surface: '#FFFFFF',
    surfaceAlt: '#F1EEFF',
    surfaceSunken: '#ECE9F8',
    border: '#E8E4F7',
    text: '#1F1A3D',
    textMuted: '#6F6A8F',
    textSoft: '#A5A1C0',
    primary: '#6C5CE7',
    primaryDeep: '#5442D6',
    primarySoft: '#E9E5FF',
    onPrimary: '#FFFFFF',
    success: '#22B07D',
    successSoft: '#DBF6EA',
    danger: '#F0566E',
    dangerSoft: '#FFE3E8',
    streak: '#FF7A2F',
    streakSoft: '#FFECDF',
    coin: '#E9A800',
    coinSoft: '#FFF4CC',
    xp: '#8B5CF6',
    shadow: '#4C3CB4',
    overlay: 'rgba(24, 18, 56, 0.45)',
    tabBar: 'rgba(255,255,255,0.96)',
  },
  dark: {
    background: '#14112A',
    backgroundGradient: ['#211B45', '#16132E', '#120F24'],
    surface: '#221D40',
    surfaceAlt: '#2B2550',
    surfaceSunken: '#1A1634',
    border: '#342D60',
    text: '#F4F1FF',
    textMuted: '#ADA7D1',
    textSoft: '#716B98',
    primary: '#8E80FF',
    primaryDeep: '#7565FF',
    primarySoft: '#302965',
    onPrimary: '#FFFFFF',
    success: '#3DDBA5',
    successSoft: '#173B35',
    danger: '#FF7088',
    dangerSoft: '#47213A',
    streak: '#FF9450',
    streakSoft: '#45291F',
    coin: '#FFCB3D',
    coinSoft: '#463A1A',
    xp: '#A78BFA',
    shadow: '#000000',
    overlay: 'rgba(5, 3, 15, 0.65)',
    tabBar: 'rgba(34,29,64,0.97)',
  },
};

export type HabitColorId = 'violet' | 'sky' | 'mint' | 'peach' | 'pink' | 'sun' | 'teal' | 'coral';

type HabitColor = { base: string; soft: string; softDark: string; gradient: readonly [string, string] };

export const habitColors: Record<HabitColorId, HabitColor> = {
  violet: { base: '#7C6CF2', soft: '#ECE8FF', softDark: '#2F2A63', gradient: ['#9D8FFF', '#6C5CE7'] },
  sky: { base: '#3BA7F5', soft: '#E1F2FF', softDark: '#1C3552', gradient: ['#7CC8FF', '#3BA7F5'] },
  mint: { base: '#22B07D', soft: '#DDF7EC', softDark: '#173B35', gradient: ['#6EE0B0', '#22B07D'] },
  peach: { base: '#FF8A5B', soft: '#FFEBE1', softDark: '#45291F', gradient: ['#FFB38F', '#FF8A5B'] },
  pink: { base: '#F2649B', soft: '#FFE4EF', softDark: '#45203A', gradient: ['#FF9CC2', '#F2649B'] },
  sun: { base: '#F2B000', soft: '#FFF4CC', softDark: '#463A1A', gradient: ['#FFD95C', '#F2B000'] },
  teal: { base: '#14B8B0', soft: '#D9F6F4', softDark: '#173B3B', gradient: ['#5EE2DA', '#14B8B0'] },
  coral: { base: '#F0566E', soft: '#FFE3E8', softDark: '#47213A', gradient: ['#FF8FA0', '#F0566E'] },
};

export const habitColorIds = Object.keys(habitColors) as HabitColorId[];

export const fonts = {
  regular: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const typography = {
  display: { fontFamily: fonts.black, fontSize: 32, lineHeight: 38 },
  title: { fontFamily: fonts.black, fontSize: 24, lineHeight: 30 },
  heading: { fontFamily: fonts.extraBold, fontSize: 18, lineHeight: 24 },
  subheading: { fontFamily: fonts.extraBold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyBold: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  micro: { fontFamily: fonts.extraBold, fontSize: 10, lineHeight: 13 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;

export const radii = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
