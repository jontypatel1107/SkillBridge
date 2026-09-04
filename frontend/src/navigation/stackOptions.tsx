import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { ThemeColors, radii, spacing, typography } from "@/theme/tokens";

type StackNavigation = {
  canGoBack: () => boolean;
  goBack: () => void;
};

export function getStackScreenOptions(colors: ThemeColors) {
  return ({ navigation }: { navigation: StackNavigation }): NativeStackNavigationOptions => ({
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: [typography.h4, { color: colors.text }],
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
    headerBackVisible: false,
    headerLeft: () =>
      navigation.canGoBack() ? (
        <Pressable
          onPress={navigation.goBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
      ) : null,
  });
}

const styles = StyleSheet.create({
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
});
