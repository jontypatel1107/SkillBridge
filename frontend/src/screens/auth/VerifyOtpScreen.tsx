import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { Button } from "@/components/Button";
import { useVerifyOtpMutation, useForgotPasswordMutation } from "@/redux/api/authApi";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyOTP">;

const OTP_LENGTH = 6;

export function VerifyOtpScreen({ route, navigation }: Props) {
  const { email, purpose } = route.params;
  const { colors } = useTheme();
  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = useCallback((text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }, [code]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  }, [code]);

  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== OTP_LENGTH) return;

    try {
      await verifyOtp({ email, code: otpCode, purpose }).unwrap();
      if (purpose === "forgot-password") {
        navigation.replace("ResetPassword", { email, code: otpCode });
      }
    } catch {}
  };

  const handleResend = async () => {
    try {
      await forgotPassword({ email }).unwrap();
    } catch {}
  };

  const serverError =
    error && "data" in error ? (error.data as { message?: string })?.message : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
            <Feather name="mail" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.xl, textAlign: "center" }]}>
            Enter verification code
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs, textAlign: "center" }]}>
            We sent a 6-digit code to{"\n"}{email}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs.current[i] = ref; }}
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: digit ? colors.primary : colors.border,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {serverError ? (
          <Animated.View entering={FadeInDown.delay(150).duration(300)} style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}>
            <Feather name="alert-circle" size={16} color={colors.danger} />
            <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
              {serverError}
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Button
            label="Verify"
            onPress={handleVerify}
            loading={isLoading}
            disabled={code.join("").length !== OTP_LENGTH}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Button
            label={isResending ? "Sending..." : "Resend OTP"}
            variant="ghost"
            onPress={handleResend}
            disabled={isResending}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 2,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
});
