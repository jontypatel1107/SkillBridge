import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { MainTabParamList } from "./types";
import { HomeStackNavigator } from "./HomeStackNavigator";
import { ExploreStackNavigator } from "./ExploreStackNavigator";
import { BookingsStackNavigator } from "./BookingsStackNavigator";
import { ChatStackNavigator } from "./ChatStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { useTheme } from "@/theme/ThemeProvider";

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIcon = keyof typeof Feather.glyphMap;

const TAB_CONFIG: Record<
  keyof MainTabParamList,
  { label: string; icon: TabIcon; activeIcon: TabIcon }
> = {
  HomeTab: { label: "Home", icon: "home", activeIcon: "home" },
  ExploreTab: { label: "Explore", icon: "compass", activeIcon: "compass" },
  BookingsTab: { label: "Bookings", icon: "calendar", activeIcon: "calendar" },
  ChatTab: { label: "Chat", icon: "message-circle", activeIcon: "message-circle" },
  ProfileTab: { label: "Profile", icon: "user", activeIcon: "user" },
};

export function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const config = TAB_CONFIG[route.name];
          const iconName = focused ? config.activeIcon : config.icon;
          return (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Feather
                name={iconName}
                size={22}
                color={focused ? colors.primary : colors.textMuted}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="ExploreTab" component={ExploreStackNavigator} options={{ tabBarLabel: "Explore" }} />
      <Tab.Screen name="BookingsTab" component={BookingsStackNavigator} options={{ tabBarLabel: "Bookings" }} />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ tabBarLabel: "Chat" }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ tabBarLabel: "Profile" }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.OS === "ios" ? 88 : 64,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 8,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  activeIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
