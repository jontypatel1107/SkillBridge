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
  "#1B4D42",
  "#C97A2B",
  "#5B4159",
  "#8A3A4E",
  "#2E5C6E",
  "#A8601F",
  "#3E5C3A",
  "#B3432E",
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
          style={{
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: colors.surfaceMuted,
          }}
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
          <Text style={[typography.small, { color: "#FFFFFF", fontSize }]}>
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
              backgroundColor: online ? colors.success : colors.textMuted,
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
  initials: {
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    borderWidth: 2,
  },
});
