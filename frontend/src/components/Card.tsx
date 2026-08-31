import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { getShadow, ShadowPreset } from "@/theme/shadows";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: ShadowPreset;
  padding?: number;
}

export const Card = React.memo(function Card({ children, style, shadow = "sm", padding }: CardProps) {
  const { colors } = useTheme();

  return (
    <View
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
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
  },
});
