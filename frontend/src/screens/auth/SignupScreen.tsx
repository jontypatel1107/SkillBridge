import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { gradients } from "@/theme/gradients";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useRegisterMutation } from "@/redux/api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthenticated } from "@/redux/slices/authSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "At least 3 characters")
    .regex(/^[a-z0-9_.]+$/, "Letters, numbers, dots, underscores only"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type SignupForm = z.infer<typeof signupSchema>;

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [register, { isLoading, error }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupForm) => {
    try {
      const result = await register({ ...values, role }).unwrap();
      await tokenStorage.setTokens(result.accessToken, result.refreshToken);
      dispatch(setAuthenticated(result.user));
    } catch {
      // surfaced via `error` below
    }
  };

  const serverError =
    error && "data" in error ? (error.data as { message?: string })?.message : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <LinearGradient
            colors={gradients.hero.colors as any}
            start={gradients.hero.start}
            end={gradients.hero.end}
            style={styles.branding}
          >
            <Feather name="zap" size={32} color="#FFFFFF" />
            <Text style={styles.brandName}>SkillBridge</Text>
            <Text style={styles.brandTagline}>Learn. Teach. Earn.</Text>
          </LinearGradient>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xxl }]}>
            Create your account
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            Start your learning or teaching journey.
          </Text>
        </Animated.View>

        {/* Role Toggle */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.roleContainer}>
            {([
              { key: "student" as const, icon: "book-open", label: "I want to learn" },
              { key: "mentor" as const, icon: "award", label: "I want to teach" },
            ]).map((r) => {
              const isActive = role === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: isActive ? colors.primaryMuted : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Feather
                    name={r.icon as any}
                    size={20}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: isActive ? colors.primary : colors.textMuted, marginTop: 4 },
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.formSection}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Full name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Username"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.username?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            {serverError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
                  {serverError}
                </Text>
              </View>
            ) : null}

            <Button
              label="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Button
            label="Already have an account? Log in"
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  branding: {
    alignItems: "center",
    paddingTop: spacing.screen + spacing.xl,
    paddingBottom: spacing.xl,
    borderRadius: radii.lg,
    marginTop: spacing.lg,
  },
  brandName: {
    ...typography.h1,
    color: "#FFFFFF",
    marginTop: spacing.md,
  },
  brandTagline: {
    ...typography.body,
    color: "rgba(255,255,255,0.7)",
    marginTop: spacing.xs,
  },

  // Role
  roleContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },

  formSection: {
    marginTop: spacing.xl,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
});
