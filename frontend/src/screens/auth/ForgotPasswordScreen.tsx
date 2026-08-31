import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useForgotPasswordMutation } from "@/redux/api/authApi";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword(values).unwrap();
      navigation.navigate("VerifyOTP", { email: values.email, purpose: "forgot-password" });
    } catch {}
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
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
            <Feather name="lock" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xl }]}>
            Forgot password?
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            Enter your email and we'll send you a verification code.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
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

            {serverError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}>
                <Feather name="alert-circle" size={16} color={colors.danger} />
                <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
                  {serverError}
                </Text>
              </View>
            ) : null}

            <Button
              label="Send OTP"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Button
            label="Back to Login"
            variant="ghost"
            onPress={() => navigation.goBack()}
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
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.screen - spacing.xxl,
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
