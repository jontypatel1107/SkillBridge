export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  accentMuted: string;
  plum: string;
  cyan: string;
  success: string;
  danger: string;
  warning: string;
  card: string;
  overlay: string;
}

export const colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#F4F7F2",
    surface: "#FFFFFF",
    surfaceMuted: "#EAF0E6",
    text: "#1C2321",
    textMuted: "#6B7570",
    border: "#DCE5D8",
    primary: "#1B4D42",
    primaryMuted: "#E1EDE8",
    accent: "#C97A2B",
    accentMuted: "#F7E9D7",
    plum: "#5B4159",
    cyan: "#2E5C6E",
    success: "#2F7D4F",
    danger: "#B3432E",
    warning: "#C97A2B",
    card: "#FFFFFF",
    overlay: "rgba(15,20,18,0.4)",
  },
  dark: {
    background: "#121714",
    surface: "#1A211D",
    surfaceMuted: "#212B24",
    text: "#EEF3EC",
    textMuted: "#9AA69E",
    border: "#2B362F",
    primary: "#5FA894",
    primaryMuted: "#1F3A33",
    accent: "#E0A25A",
    accentMuted: "#3A2E1D",
    plum: "#9A7897",
    cyan: "#5FA894",
    success: "#6FBF8E",
    danger: "#E0846F",
    warning: "#E0A25A",
    card: "#1A211D",
    overlay: "rgba(0,0,0,0.6)",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 60,
  screen: 80,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  h1: { fontFamily: "Fraunces_600SemiBold", fontSize: 30, letterSpacing: -0.7, lineHeight: 36 },
  h2: { fontFamily: "Fraunces_600SemiBold", fontSize: 24, letterSpacing: -0.5, lineHeight: 30 },
  h3: { fontFamily: "Fraunces_500Medium", fontSize: 18, letterSpacing: -0.3, lineHeight: 24 },
  h4: { fontFamily: "Inter_600SemiBold", fontSize: 16, letterSpacing: -0.2, lineHeight: 22 },
  body: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: "Inter_500Medium", fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 16 },
  small: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 14 },
  tiny: { fontFamily: "Inter_600SemiBold", fontSize: 10, lineHeight: 13 },
};

export type ThemeMode = "light" | "dark";