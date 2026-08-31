import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme/tokens";
import { BookingStatus } from "@/types";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { colors } = useTheme();

  const config: Record<BookingStatus, { bg: string; fg: string; label: string }> = {
    pending: { bg: colors.warning + "22", fg: colors.warning, label: "Pending" },
    confirmed: { bg: colors.primaryMuted, fg: colors.primary, label: "Confirmed" },
    completed: { bg: colors.success + "22", fg: colors.success, label: "Completed" },
    cancelled: { bg: colors.danger + "22", fg: colors.danger, label: "Cancelled" },
  };

  const { bg, fg, label } = config[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[typography.small, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
});
