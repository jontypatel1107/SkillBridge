import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme/tokens";

interface BadgeProps {
  count?: number;
  dot?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ count, dot, color, style }: BadgeProps) {
  const { colors } = useTheme();
  const bg = color ?? colors.danger;

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: bg, borderColor: colors.surface },
          style,
        ]}
      />
    );
  }

  if (count === undefined) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 20,
    height: 20,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  text: {
    ...typography.tiny,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
