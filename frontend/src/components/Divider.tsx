import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.divider, { backgroundColor: colors.border }, style]} />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});
