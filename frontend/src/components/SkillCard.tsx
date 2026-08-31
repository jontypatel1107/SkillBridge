import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      <View style={[styles.card, getShadow(colors, "sm"), { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={grad.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <Text style={styles.categoryLabel}>{category}</Text>
          <Text style={styles.price}>${price}/hr</Text>
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
    borderColor: "transparent",
  },
  gradientHeader: {
    height: 64,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  categoryLabel: {
    ...typography.tiny,
    color: "rgba(255,255,255,0.85)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  price: {
    ...typography.small,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  body: {
    padding: spacing.md,
  },
});
