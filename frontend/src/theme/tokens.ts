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
    background: "#F5F7FB",
    surface: "#FFFFFF",
    surfaceMuted: "#ECF2FF",
    text: "#101323",
    textMuted: "#65708A",
    border: "#DDE5F3",
    primary: "#2563EB",
    primaryMuted: "#E8F0FF",
    accent: "#F43F5E",
    cyan: "#0891B2",
    success: "#059669",
    danger: "#E11D48",
    warning: "#F59E0B",
    card: "#FFFFFF",
    overlay: "rgba(0,0,0,0.4)",
  },
  dark: {
    background: "#080B12",
    surface: "#111827",
    surfaceMuted: "#172033",
    text: "#F8FAFC",
    textMuted: "#93A4BA",
    border: "#263348",
    primary: "#60A5FA",
    primaryMuted: "#102445",
    accent: "#FB7185",
    cyan: "#22D3EE",
    success: "#34D399",
    danger: "#FB7185",
    warning: "#FBBF24",
    card: "#101624",
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
