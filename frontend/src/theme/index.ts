// ─── theme/index.ts ───────────────────────────────────────────────────────────
// DermTrace design tokens — "clinical stat-card" direction.
// Inspired by dense, data-forward fitness-app dashboards: deep navy hero
// cards carrying one big number, quiet white surfaces everywhere else,
// a single indigo accent, tight bold numerals.

export const colors = {
  // Base surfaces
  bg:        '#F3F4FA',   // app background — cool, soft, slightly lavender
  surface:   '#FFFFFF',   // card background
  surfaceAlt:'#F7F7FC',

  // Dark "hero" surface — used for the one stat that matters per screen
  navy900:   '#100F29',
  navy800:   '#1B1A3F',
  navy700:   '#26254E',

  // Accent — a single indigo, no secondary accent hue
  indigo:      '#4C51F7',
  indigoDeep:  '#3A3ED6',
  indigoLight: '#8A8DFB',
  indigoSoft:  '#E9E9FE',

  // Text
  ink:        '#12112B',
  inkMuted:   '#6C6C8C',
  inkFaint:   '#A2A2C0',
  onDark:     '#FFFFFF',
  onDarkMuted:'#9494C4',

  // Status — desaturated so the indigo stays the loudest color on screen
  success:     '#2FBE86',
  successSoft: '#E4F8EF',
  warning:     '#F0A93C',
  warningSoft: '#FCF1DE',
  danger:      '#EF5B57',
  dangerSoft:  '#FCEBEA',

  line:      '#E9E9F3',

  // Legacy aliases kept so existing screen code referencing old token
  // names continues to resolve during the transition.
  sage600: '#4C51F7',
  sage400: '#8A8DFB',
  sage100: '#E9E9FE',
  sage50:  '#F3F4FA',
  cream:   '#F3F4FA',
  white:   '#FFFFFF',
  gray600: '#6C6C8C',
  gray400: '#A2A2C0',
  gray200: '#E9E9F3',
  gray100: '#EEEEF6',
  gray50:  '#F7F7FC',
  amber400:'#F0A93C',
  amber50: '#FCF1DE',
  rose400: '#EF5B57',
  rose50:  '#FCEBEA',
  blue50:  '#E9E9FE',
  blue600: '#3A3ED6',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 24, xl: 28, full: 999 };

// Type scale — bold, tight-tracked numerals for stats; a calmer
// mid-weight for everything else. React Native ships without custom
// fonts wired up here, so the personality comes from weight/size/
// letter-spacing discipline rather than a display typeface.
export const type = {
  display: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  h1:      { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  h2:      { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.2 },
  stat:    { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.8 },
  body:    { fontSize: 14, fontWeight: '500' as const },
  label:   { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8 },
  caption: { fontSize: 11, fontWeight: '500' as const },
};
