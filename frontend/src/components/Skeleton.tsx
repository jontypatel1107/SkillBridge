import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height = 16, borderRadius, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ width: width ?? "100%", height, borderRadius: borderRadius ?? radii.sm }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.surfaceMuted, borderRadius: borderRadius ?? radii.sm },
          animStyle,
        ]}
      />
    </View>
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <Skeleton height={20} width={80} borderRadius={radii.full} />
      <Skeleton height={18} style={{ marginTop: spacing.md }} />
      <Skeleton height={14} width={260} style={{ marginTop: spacing.sm }} />
      <View style={styles.cardFooter}>
        <Skeleton height={14} width={60} />
        <Skeleton height={14} width={40} />
      </View>
    </View>
  );
}

export function SkeletonMentorCard({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.mentorCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    >
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.mentorInfo}>
        <Skeleton height={16} width={100} />
        <Skeleton height={12} width={70} style={{ marginTop: spacing.xs }} />
        <Skeleton height={12} width={50} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  mentorCard: {
    width: 160,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
  },
  mentorInfo: {
    marginTop: spacing.md,
    alignItems: "center",
  },
});
