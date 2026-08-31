import React from "react";
import { View, TextInput, StyleSheet, ViewStyle, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing, typography } from "@/theme/tokens";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
}

export const SearchBar = React.memo(function SearchBar({ value, onChangeText, placeholder, onFocus, onBlur, style }: SearchBarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        },
        style,
      ]}
      accessibilityRole="search"
    >
      <Feather name="search" size={18} color={colors.textMuted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Search skills, mentors..."}
        placeholderTextColor={colors.textMuted}
        style={[typography.body, { color: colors.text, flex: 1 }]}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder ?? "Search skills and mentors"}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Feather name="x-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
});
