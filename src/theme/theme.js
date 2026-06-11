import { colors as palette } from './colors';

export const colors = {
  navy: palette.primary,
  navySoft: '#1b315f',
  navyMuted: '#304b7d',
  orange: palette.accent,
  orangeDark: palette.accentDark,
  red: '#e63946',
  text: palette.textPrimary,
  textMuted: palette.textMuted,
  textSoft: '#7b8699',
  line: palette.cardBorder,
  background: palette.background,
  surface: palette.white,
  surfaceAlt: '#eef2f8',
  successBg: '#d8f5dd',
  successText: '#1b5e20',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#0d1b3e',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
};
