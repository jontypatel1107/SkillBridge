import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { categoryGradients } from "@/theme/gradients";
import { hapticLight } from "@/utils/haptics";
import type { SkillCategory } from "@/types";

interface SkillCardProps {
  title: string;
  category: SkillCategory;
  price: number;
  mentorName?: string;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  development: "code",
  ai: "cpu",
  design: "pen-tool",
  music: "music",
  fitness: "activity",
  business: "briefcase",
  photography: "camera",
  cooking: "coffee",
  languages: "globe",
};

export const SkillCard = React.memo(function SkillCard({ title, category, price, mentorName, onPress }: SkillCardProps) {
  const { colors } = useTheme();
  const grad = categoryGradients[category] ?? categoryGradients.development;

  const handlePress = useCallback(() => {
    hapticLight();
    onPress?.();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${category}, $${price} per hour${mentorName ? `, by ${mentorName}` : ""}`}
    >
      <View style={[styles.card, getShadow(colors, "card"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <LinearGradient
          colors={grad.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <Feather
            name={(CATEGORY_ICONS[category] ?? "zap") as any}
            size={44}
            color="rgba(255,255,255,0.18)"
            style={styles.watermark}
          />
          <View style={styles.headerRow}>
            <Text style={styles.categoryLabel}>{category}</Text>
            <Text style={styles.price}>${price}/hr</Text>
          </View>
        </LinearGradient>
        <View style={styles.body}>
          <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          {mentorName ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              by {mentorName}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
  },
  gradientHeader: {
    height: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: spacing.md,
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  categoryLabel: {
    ...typography.tiny,
    color: "rgba(255,255,255,0.9)",
  },
  price: {
    ...typography.small,
    color: "#FFFFFF",
  },
  body: {
    padding: spacing.md,
  },
});