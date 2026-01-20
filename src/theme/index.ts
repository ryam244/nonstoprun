/**
 * Non-Stop Run Theme Configuration
 * Extracted from design HTML files
 */

export const colors = {
  // Primary
  primary: '#13ec49',
  primaryLight: 'rgba(19, 236, 73, 0.1)',
  primaryMedium: 'rgba(19, 236, 73, 0.2)',
  primaryShadow: 'rgba(19, 236, 73, 0.3)',

  // Background
  backgroundLight: '#f6f8f6',
  backgroundDark: '#102215',

  // White
  white: '#ffffff',
  whiteTransparent80: 'rgba(255, 255, 255, 0.8)',
  whiteTransparent95: 'rgba(255, 255, 255, 0.95)',

  // Slate palette (for text, borders, etc.)
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',

  // Accent colors for course types
  blue500: '#3b82f6',
  blue600: '#2563eb',
  purple500: '#a855f7',
  purple600: '#9333ea',
  red500: '#ef4444',

  // Transparent variants
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

export const typography = {
  // Font families - will use system fonts in RN
  fontFamily: {
    display: 'System', // Lexend-like
    sans: 'System', // Noto Sans JP-like
  },

  // Font sizes
  fontSize: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 56,
  },

  // Font weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.015,
    tight: -0.01,
    normal: 0,
    wide: 0.015,
    wider: 0.05,
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 8,
  DEFAULT: 16,
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
} as const;

export const icons = {
  strokeWidth: 1.5,
  size: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 40,
  },
} as const;

// Tab bar configuration
export const tabBar = {
  height: 80,
  iconSize: 26,
  labelSize: 10,
  items: [
    { key: 'home', label: 'ホーム', icon: 'home' },
    { key: 'community', label: 'コミュニティ', icon: 'groups' },
    { key: 'training', label: 'トレーニング', icon: 'fitness-center' },
    { key: 'events', label: 'イベント', icon: 'event' },
    { key: 'profile', label: 'プロフィール', icon: 'person' },
  ],
} as const;

// Distance wheel presets
export const distancePresets = [3, 5, 10, 21] as const;

// Theme export
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  icons,
  tabBar,
  distancePresets,
} as const;

export type Theme = typeof theme;
export default theme;
