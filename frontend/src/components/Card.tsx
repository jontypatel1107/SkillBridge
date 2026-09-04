import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { getShadow, ShadowPreset } from "@/theme/shadows";
import { gradients } from "@/theme/gradients";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: ShadowPreset;
  padding?: number;
}

export const Card = React.memo(function Card({ children, style, shadow = "sm", padding }: CardProps) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.surface, colors.surfaceMuted] as any}
      start={gradients.primarySoft.start}
      end={gradients.primarySoft.end}
      style={[
        styles.card,
        getShadow(colors, shadow),
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: padding ?? spacing.md,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
  },
});
