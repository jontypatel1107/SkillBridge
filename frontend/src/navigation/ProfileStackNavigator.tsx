import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "./types";
import { ProfileScreen } from "@/screens/home/ProfileScreen";
import { EditProfileScreen } from "@/screens/profile/EditProfileScreen";
import { VerifyEmailScreen } from "@/screens/profile/VerifyEmailScreen";
import { MyListingsScreen } from "@/screens/skills/MyListingsScreen";
import { CreateSkillScreen } from "@/screens/skills/CreateSkillScreen";
import { EditSkillScreen } from "@/screens/skills/EditSkillScreen";
import { RoadmapScreen } from "@/screens/ai/RoadmapScreen";
import { NotificationsScreen } from "@/screens/notifications/NotificationsScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
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
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile", headerBackTitle: "Back" }} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} options={{ title: "Verify Email", headerBackTitle: "Back" }} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: "My Listings", headerBackTitle: "Back" }} />
      <Stack.Screen name="CreateSkill" component={CreateSkillScreen} options={{ title: "New Listing", headerBackTitle: "Back" }} />
      <Stack.Screen name="EditSkill" component={EditSkillScreen} options={{ title: "Edit Listing", headerBackTitle: "Back" }} />
      <Stack.Screen name="Roadmaps" component={RoadmapScreen} options={{ title: "AI Roadmaps", headerBackTitle: "Back" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications", headerBackTitle: "Back" }} />
    </Stack.Navigator>
  );
}
