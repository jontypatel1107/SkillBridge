import React from "react";
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
import { useLoginMutation } from "@/redux/api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";
import { useAppDispatch } from "@/hooks/redux";
import { setAuthenticated } from "@/redux/slices/authSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    try {
      const result = await login(values).unwrap();
      await tokenStorage.setTokens(result.accessToken, result.refreshToken);
      dispatch(setAuthenticated(result.user));
    } catch {
      // error is surfaced below via RTK Query's `error` state
    }
  };

  const serverError = error
    ? "data" in error
      ? (error.data as { message?: string })?.message
      : "status" in error && error.status === "FETCH_ERROR"
        ? "Unable to connect to server. Please check your connection."
        : "Something went wrong. Please try again."
    : undefined;

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
            Welcome back
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            Log in to continue your journey.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <View style={styles.formSection}>
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

            <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotLink}>
              <Text style={[typography.caption, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </Pressable>

            {serverError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
                  {serverError}
                </Text>
              </View>
            ) : null}

            <Button
              label="Log In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Button
            label="New here? Create an account"
            variant="ghost"
            onPress={() => navigation.navigate("Signup")}
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

  formSection: {
    marginTop: spacing.xl,
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
});
