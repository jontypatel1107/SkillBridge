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
import { useVerifyEmailMutation, useConfirmEmailMutation } from "@/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateUser } from "@/redux/slices/authSlice";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "VerifyEmail">;

const OTP_LENGTH = 6;

export function VerifyEmailScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [verifyEmail, { isLoading: isSending }] = useVerifyEmailMutation();
  const [confirmEmail, { isLoading: isConfirming, error }] = useConfirmEmailMutation();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [sent, setSent] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleSendOtp = async () => {
    try {
      await verifyEmail().unwrap();
      setSent(true);
    } catch {}
  };

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

  const handleConfirm = async () => {
    const otpCode = code.join("");
    if (otpCode.length !== OTP_LENGTH) return;

    try {
      const result = await confirmEmail({ code: otpCode }).unwrap();
      dispatch(updateUser({ isVerified: true }));
      navigation.goBack();
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
            <Feather name="shield" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.xl, textAlign: "center" }]}>
            Verify your email
          </Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs, textAlign: "center" }]}>
            {user?.email}
          </Text>
        </Animated.View>

        {!sent ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
            <Text style={[typography.body, { color: colors.textMuted, textAlign: "center" }]}>
              We'll send a 6-digit verification code to your email address.
            </Text>
            <Button
              label="Send Verification Code"
              onPress={handleSendOtp}
              loading={isSending}
              style={{ marginTop: spacing.xl }}
            />
          </Animated.View>
        ) : (
          <>
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
                label="Verify Email"
                onPress={handleConfirm}
                loading={isConfirming}
                disabled={code.join("").length !== OTP_LENGTH}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(250).duration(400)}>
              <Button
                label={isSending ? "Sending..." : "Resend Code"}
                variant="ghost"
                onPress={handleSendOtp}
                disabled={isSending}
              />
            </Animated.View>
          </>
        )}
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
  section: {
    marginTop: spacing.xxl,
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
