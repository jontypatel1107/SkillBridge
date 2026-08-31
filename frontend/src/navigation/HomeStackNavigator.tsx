import React from "react";
import { Platform, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "./types";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { SkillDetailScreen } from "@/screens/skills/SkillDetailScreen";
import { BookSessionScreen } from "@/screens/bookings/BookSessionScreen";
import { BookingSuccessScreen } from "@/screens/bookings/BookingSuccessScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: [typography.h4, { color: colors.text }],
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="SkillDetail"
        component={SkillDetailScreen}
        options={{ title: "Skill Details", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="BookSession"
        component={BookSessionScreen}
        options={{ title: "Book Session", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
