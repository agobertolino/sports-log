export const colors = {
  bg: '#0A0A0A',
  surface: '#161616',
  card: '#1E1E1E',        // era #161616 — più visibile sul bg
  gray4: '#2A2A2A',       // era #222222
  gray3: '#666666',       // era #555555 — leggermente più chiaro
  gray2: '#A8A8A8',       // era #A0A0A0
  gray1: '#E8E8E8',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.13)',      // era 0.08 — bordi più visibili
  borderHover: 'rgba(255,255,255,0.25)', // era 0.18
  error: 'rgba(255,80,80,0.5)',
} as const;

export const fonts = {
  serif: 'DMSerifDisplay_400Regular',
  serifItalic: 'DMSerifDisplay_400Regular_Italic',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 52,
} as const;