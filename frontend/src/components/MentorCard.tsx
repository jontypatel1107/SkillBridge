import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { Avatar } from "@/components/Avatar";
import type { User } from "@/types";

interface MentorCardProps {
  mentor: User;
  onPress: () => void;
  style?: object;
}

export function MentorCard({ mentor, onPress, style }: MentorCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        getShadow(colors, "sm"),
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
        },
        style,
      ]}
    >
      <Avatar uri={mentor.avatarUrl} name={mentor.name} size={48} online />
      <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={1}>
        {mentor.name}
      </Text>
      {mentor.skills && mentor.skills.length > 0 ? (
        <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]} numberOfLines={1}>
          {mentor.skills[0]}
        </Text>
      ) : (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
          {`@${mentor.username}`}
        </Text>
      )}
      <View style={styles.rating}>
        {mentor.rating ? (
          <Text style={[typography.small, { color: colors.warning }]}>
            ⭐ {mentor.rating.toFixed(1)}
          </Text>
        ) : (
          <Text style={[typography.small, { color: colors.textMuted }]}>New</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 130,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: "center",
  },
  rating: {
    marginTop: spacing.xs,
  },
});