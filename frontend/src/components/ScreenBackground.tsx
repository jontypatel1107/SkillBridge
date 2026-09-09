import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/theme/ThemeProvider";
import { gradients } from "@/theme/gradients";

type Mood = "home" | "explore" | "profile" | "auth" | "chat";

interface ScreenBackgroundProps {
  mood: Mood;
  style?: ViewStyle;
}

export function ScreenBackground({ mood, style }: ScreenBackgroundProps) {
  const { colors } = useTheme();

  const getGradientColors = () => {
    switch (mood) {
      case "home":
        return [colors.primary, colors.accent, colors.plum];
      case "explore":
        return [colors.primary, colors.plum, colors.accent];
      case "profile":
        return [colors.plum, colors.primary, colors.accent];
      case "auth":
        return [colors.primary, colors.accent, colors.plum];
      case "chat":
        return [colors.accent, colors.primary, colors.plum];
      default:
        return [colors.primary, colors.accent, colors.plum];
    }
  };

  const gradientColors = getGradientColors();

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <LinearGradient
        colors={[
          gradientColors[0] + "08",
          gradientColors[1] + "12",
          gradientColors[2] + "08",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: gradientColors[0] + "15",
            top: "10%",
            left: "20%",
            width: 200,
            height: 200,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: gradientColors[1] + "12",
            top: "60%",
            right: "15%",
            width: 180,
            height: 180,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            backgroundColor: gradientColors[2] + "10",
            bottom: "20%",
            left: "10%",
            width: 150,
            height: 150,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 100,
  },
});