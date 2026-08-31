import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { typography, spacing, radii } from "@/theme/tokens";
import { gradients } from "@/theme/gradients";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setAuthenticated, setUnauthenticated, setHydrating } from "@/redux/slices/authSlice";
import { tokenStorage } from "@/utils/tokenStorage";
import { useMeQuery } from "@/redux/api/authApi";
import { ToastProvider } from "@/components/Toast";

function SplashScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <Animated.View entering={ZoomIn.duration(600)}>
        <LinearGradient
          colors={gradients.hero.colors as any}
          start={gradients.hero.start}
          end={gradients.hero.end}
          style={{
            width: 100,
            height: 100,
            borderRadius: radii.lg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="zap" size={44} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <Text
          style={[
            typography.h1,
            { color: colors.text, marginTop: spacing.xl, letterSpacing: -1 },
          ]}
        >
          SkillBridge
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(400)}>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
          Learn. Teach. Earn.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(800).duration(400)} style={{ marginTop: spacing.xl }}>
        <Animated.View
          style={{
            width: 24,
            height: 24,
            borderWidth: 2.5,
            borderColor: colors.border,
            borderTopColor: colors.primary,
            borderRadius: 12,
          }}
          entering={FadeIn.duration(200)}
        />
      </Animated.View>
    </View>
  );
}

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  const [hasToken, setHasToken] = React.useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      dispatch(setHydrating());
      const token = await tokenStorage.getAccessToken();
      setHasToken(!!token);
      if (!token) dispatch(setUnauthenticated());
    })();
  }, [dispatch]);

  const { data: user, isError, isSuccess } = useMeQuery(undefined, { skip: !hasToken });

  useEffect(() => {
    if (isSuccess && user) dispatch(setAuthenticated(user));
    if (isError) {
      tokenStorage.clear();
      dispatch(setUnauthenticated());
    }
  }, [isSuccess, isError, user, dispatch]);

  if (status === "idle" || status === "hydrating") {
    return <SplashScreen />;
  }

  return (
    <ToastProvider>
      <NavigationContainer>
        {status === "authenticated" ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </ToastProvider>
  );
}
