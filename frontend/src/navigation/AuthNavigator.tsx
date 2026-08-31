import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { ForgotPasswordScreen } from "@/screens/auth/ForgotPasswordScreen";
import { VerifyOtpScreen } from "@/screens/auth/VerifyOtpScreen";
import { ResetPasswordScreen } from "@/screens/auth/ResetPasswordScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: [typography.h4, { color: colors.text }],
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOtpScreen} options={{ headerShown: true, title: "Verify OTP" }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: true, title: "Reset Password" }} />
    </Stack.Navigator>
  );
}
