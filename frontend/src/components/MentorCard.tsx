import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { hapticLight } from "@/utils/haptics";
import { Avatar } from "./Avatar";
import type { User } from "@/types";

interface MentorCardProps {
  mentor: User;
  skillTitle?: string;
  distance?: string;
  onPress?: () => void;
}

export const MentorCard = React.memo(function MentorCard({ mentor, skillTitle, distance, onPress }: MentorCardProps) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    hapticLight();
    onPress?.();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${mentor.name}${skillTitle ? `, teaches ${skillTitle}` : ""}${mentor.rating ? `, rated ${mentor.rating.toFixed(1)}` : ""}`}
    >
      <View style={[styles.card, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.topRow}>
          <Avatar uri={mentor.avatarUrl} name={mentor.name} size={56} online />
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
                {mentor.name}
              </Text>
              {mentor.isVerified ? (
                <Text style={{ fontSize: 14, marginLeft: 4 }}>✓</Text>
              ) : null}
            </View>
            {skillTitle ? (
              <Text style={[typography.caption, { color: colors.primary }]} numberOfLines={1}>
                {skillTitle}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              {mentor.rating ? (
                <Text style={[typography.small, { color: colors.warning }]}>
                  ⭐ {mentor.rating.toFixed(1)}
                </Text>
              ) : (
                <Text style={[typography.small, { color: colors.textMuted }]}>New</Text>
              )}
              {mentor.ratingCount ? (
                <Text style={[typography.small, { color: colors.textMuted }]}>
                  {" "}· {mentor.ratingCount} reviews
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.bottomRow}>
          {distance ? (
            <Text style={[typography.small, { color: colors.textMuted }]}>{distance}</Text>
          ) : (
            <View />
          )}
          <View style={[styles.badge, { backgroundColor: colors.primaryMuted }]}>
            <Text style={[typography.small, { color: colors.primary }]}>View Profile</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export const MentorCardHorizontal = React.memo(function MentorCardHorizontal({ mentor, skillTitle, onPress }: MentorCardProps) {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    hapticLight();
    onPress?.();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${mentor.name}${skillTitle ? `, teaches ${skillTitle}` : ""}`}
    >
      <View style={[styles.horizontalCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Avatar uri={mentor.avatarUrl} name={mentor.name} size={48} online />
        <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={1}>
          {mentor.name}
        </Text>
        {skillTitle ? (
          <Text style={[typography.caption, { color: colors.primary, marginTop: 2 }]} numberOfLines={1}>
            {skillTitle}
          </Text>
        ) : null}
        <View style={styles.ratingRow}>
          {mentor.rating ? (
            <Text style={[typography.small, { color: colors.warning }]}>
              ⭐ {mentor.rating.toFixed(1)}
            </Text>
          ) : (
            <Text style={[typography.small, { color: colors.textMuted }]}>New</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "transparent",
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
  },
  horizontalCard: {
    width: 140,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
  },
  ratingRow: {
    marginTop: spacing.xs,
  },
});
