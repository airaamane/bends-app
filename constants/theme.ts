/**
 * Theme constants for MX5 Pocket.
 * Dark mode only, premium feel.
 */

import { Platform } from 'react-native';

// Primary accent color (warm, sporty)
const accentColor = '#E85D04'; // Warm orange - MX-5 energy

// Classification colors
export const ClassificationColors = {
  Straight: '#4A9EFF', // Calm blue
  Flow: '#22C55E', // Energetic green
  Tight: '#EF4444', // Alert red
  Transition: '#F59E0B', // Amber warning
} as const;

// Rev zone colors
export const RevZoneColors = {
  below: '#60A5FA', // Light blue
  optimal: '#22C55E', // Green - perfect
  above: '#EF4444', // Red - back off
} as const;

// Difficulty badge colors
export const DifficultyColors = {
  easy: '#22C55E',
  moderate: '#F59E0B',
  challenging: '#EF4444',
} as const;

export const Colors = {
  // Dark mode only
  dark: {
    // Backgrounds
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1A1A1A',
    surfaceHighlight: '#242424',

    // Text
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    // Accent
    accent: accentColor,
    accentMuted: '#E85D0420',

    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#4A9EFF',

    // Borders
    border: '#27272A',
    borderLight: '#3F3F46',

    // Navigation
    tint: accentColor,
    tabIconDefault: '#71717A',
    tabIconSelected: accentColor,

    // Legacy support
    icon: '#A1A1AA',
  },
  // Force dark mode always
  light: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceElevated: '#1A1A1A',
    surfaceHighlight: '#242424',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    accent: accentColor,
    accentMuted: '#E85D0420',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#4A9EFF',
    border: '#27272A',
    borderLight: '#3F3F46',
    tint: accentColor,
    tabIconDefault: '#71717A',
    tabIconSelected: accentColor,
    icon: '#A1A1AA',
  },
};

// Typography
export const Typography = {
  // HUD display - large, readable at a glance
  hudLarge: {
    fontSize: 72,
    fontWeight: '700' as const,
    lineHeight: 80,
  },
  hudMedium: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 40,
  },
  hudLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },

  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Labels
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Fonts
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, monospace",
  },
});
