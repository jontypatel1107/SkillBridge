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
  cyan: string;
  success: string;
  danger: string;
  warning: string;
  card: string;
  overlay: string;
}

export const colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#F8F9FC",
    surface: "#FFFFFF",
    surfaceMuted: "#F2F1FA",
    text: "#161522",
    textMuted: "#6B6B7B",
    border: "#E7E6F0",
    primary: "#4F46E5",
    primaryMuted: "#EEF0FF",
    accent: "#7C3AED",
    cyan: "#06B6D4",
    success: "#16A34A",
    danger: "#DC2626",
    warning: "#D97706",
    card: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)",
  },
  dark: {
    background: "#0F0E17",
    surface: "#181726",
    surfaceMuted: "#211F33",
    text: "#F3F2FF",
    textMuted: "#9C9AB5",
    border: "#2A2840",
    primary: "#818CF8",
    primaryMuted: "#232145",
    accent: "#A78BFA",
    cyan: "#22D3EE",
    success: "#4ADE80",
    danger: "#F87171",
    warning: "#FBBF24",
    card: "#1E1D2E",
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
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: "800" as const, letterSpacing: -0.7, lineHeight: 36 },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.5, lineHeight: 30 },
  h3: { fontSize: 18, fontWeight: "700" as const, letterSpacing: -0.3, lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: "600" as const, letterSpacing: -0.2, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  small: { fontSize: 11, fontWeight: "600" as const, lineHeight: 14 },
  tiny: { fontSize: 10, fontWeight: "600" as const, lineHeight: 13 },
};

export type ThemeMode = "light" | "dark";
