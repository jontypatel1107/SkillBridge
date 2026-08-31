import React from "react";
import { View, Text, Image, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, typography } from "@/theme/tokens";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  online?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
  xxl: 96,
};

function getSize(val?: number): number {
  if (!val) return SIZE_MAP.md;
  if (val <= 30) return SIZE_MAP.xs;
  if (val <= 40) return SIZE_MAP.sm;
  if (val <= 50) return SIZE_MAP.md;
  if (val <= 64) return SIZE_MAP.lg;
  if (val <= 80) return SIZE_MAP.xl;
  return SIZE_MAP.xxl;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#EC4899",
  "#F59E0B",
  "#16A34A",
  "#06B6D4",
  "#EF4444",
  "#3B82F6",
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ uri, name, size, online, style }: AvatarProps) {
  const { colors } = useTheme();
  const dim = getSize(size);
  const fontSize = dim * 0.38;

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.initials,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: getColorForName(name),
            },
          ]}
        >
          <Text style={[typography.small, { color: "#FFFFFF", fontSize, fontWeight: "700" }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: dim * 0.26,
              height: dim * 0.26,
              borderRadius: dim * 0.13,
              backgroundColor: online ? "#16A34A" : colors.textMuted,
              borderColor: colors.surface,
              right: dim * 0.02,
              bottom: dim * 0.02,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#E7E6F0",
  },
  initials: {
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    borderWidth: 2,
  },
});
