import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { Button } from "./Button";

interface ErrorStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState = React.memo(function ErrorState({
  icon = "alert-triangle",
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.danger + "15" }]}>
        <Feather name={icon} size={32} color={colors.danger} />
      </View>
      <Text style={[typography.h3, { color: colors.text, marginTop: spacing.lg }]}>
        {title}
      </Text>
      <Text
        style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm, textAlign: "center" }]}
      >
        {message}
      </Text>
      {onRetry ? (
        <View style={{ marginTop: spacing.lg }}>
          <Button label="Try Again" variant="outline" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
