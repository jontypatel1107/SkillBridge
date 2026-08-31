import React, { useEffect } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme/tokens";

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function ProgressBar({ progress, height = 8, showLabel, color, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clampedProgress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const barColor = color ?? colors.primary;

  return (
    <View style={style}>
      {showLabel && (
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
          {Math.round(clampedProgress * 100)}%
        </Text>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.surfaceMuted, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            { height, backgroundColor: barColor, borderRadius: height / 2 },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
