import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ExploreStackParamList } from "./types";
import { ExploreScreen } from "@/screens/skills/ExploreScreen";
import { SkillDetailScreen } from "@/screens/skills/SkillDetailScreen";
import { BookSessionScreen } from "@/screens/bookings/BookSessionScreen";
import { BookingSuccessScreen } from "@/screens/bookings/BookingSuccessScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreStackNavigator() {
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
      <Stack.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false }} />
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
