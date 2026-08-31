import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { gradients } from "@/theme/gradients";
import { Button } from "@/components/Button";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/types";

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "BookingSuccess">,
  BottomTabScreenProps<MainTabParamList>
>;

export function BookingSuccessScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 150 }));
    checkOpacity.value = withDelay(500, withSpring(1, { damping: 15, stiffness: 200 }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkOpacity.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.iconCircle, circleStyle]}>
        <LinearGradient
          colors={gradients.success.colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View style={checkStyle}>
            <Feather name="check" size={48} color="#FFFFFF" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <Text style={[typography.h1, { color: colors.text, textAlign: "center", marginTop: spacing.xl }]}>
          Booking Confirmed!
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, textAlign: "center", marginTop: spacing.md, lineHeight: 24 },
          ]}
        >
          Your session has been requested.{"\n"}The mentor will confirm shortly.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(800).duration(400)} style={styles.actions}>
        <Button
          label="View My Bookings"
          onPress={() => navigation.getParent()?.navigate("BookingsTab")}
        />
        <Button
          label="Back to Home"
          variant="secondary"
          onPress={() => navigation.getParent()?.navigate("HomeTab")}
          style={{ marginTop: spacing.md }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
  },
  gradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    width: "100%",
    marginTop: spacing.xxl,
  },
});
