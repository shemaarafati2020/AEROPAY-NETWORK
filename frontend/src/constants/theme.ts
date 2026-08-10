/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: 'rgba(255, 255, 255, 0.85)',
    backgroundSelected: 'rgba(241, 245, 249, 0.9)',
    textSecondary: '#64748B',
    accent: '#A51C24', // Equity Burgundy Red
    accentLight: '#C5222B',
    accentGlow: 'rgba(165, 28, 36, 0.15)',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    divider: 'rgba(226, 232, 240, 0.8)',
    glassBackground: 'rgba(255, 255, 255, 0.82)',
    glassBorder: 'rgba(255, 255, 255, 0.7)',
    glassBorderSubtle: 'rgba(0, 0, 0, 0.06)',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0B0D14', // Deep midnight Apple-style OLED background
    backgroundElement: 'rgba(20, 24, 36, 0.85)', // Frosted glass surface
    backgroundSelected: 'rgba(32, 38, 54, 0.9)',
    textSecondary: '#94A3B8',
    accent: '#C5222B', // Luminous Burgundy Red
    accentLight: '#E11D48',
    accentGlow: 'rgba(197, 34, 43, 0.25)',
    success: '#10B981',
    error: '#F87171',
    warning: '#FBBF24',
    divider: 'rgba(255, 255, 255, 0.08)',
    glassBackground: 'rgba(20, 24, 38, 0.72)', // iPhone-style frosted glass
    glassBorder: 'rgba(255, 255, 255, 0.14)', // Crisp glass highlight edge
    glassBorderSubtle: 'rgba(255, 255, 255, 0.07)',
    cardShadow: 'rgba(0, 0, 0, 0.35)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
// YOLO badge trigger 1
// YOLO badge trigger 2
// YOLO badge trigger 3
