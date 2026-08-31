import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.memo(function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container} accessibilityRole="none">
      {icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : null}
      <Text style={[typography.h4, { color: colors.text, textAlign: "center" }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, textAlign: "center", marginTop: spacing.sm },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
});
