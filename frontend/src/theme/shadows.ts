import { ViewStyle } from "react-native";
import { ThemeColors } from "./tokens";

export type ShadowPreset = "none" | "sm" | "md" | "lg" | "xl" | "card" | "button" | "float";

export function getShadow(colors: ThemeColors, preset: ShadowPreset): ViewStyle {
  const isDark = colors.background === "#0F0E17";

  if (preset === "none") return {};

  const shadows: Record<ShadowPreset, ViewStyle> = {
    none: {},
    sm: {
      shadowColor: isDark ? "#000" : "#1a1a2e",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: isDark ? "#000" : "#1a1a2e",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: isDark ? "#000" : "#1a1a2e",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    xl: {
      shadowColor: isDark ? "#000" : "#1a1a2e",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.6 : 0.16,
      shadowRadius: 24,
      elevation: 10,
    },
    card: {
      shadowColor: isDark ? "#000" : "#4F46E5",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    button: {
      shadowColor: isDark ? "#000" : "#4F46E5",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    float: {
      shadowColor: isDark ? "#818CF8" : "#4F46E5",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
  };

  return shadows[preset];
}
