import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { MainTabParamList } from "./types";
import { HomeStackNavigator } from "./HomeStackNavigator";
import { ExploreStackNavigator } from "./ExploreStackNavigator";
import { BookingsStackNavigator } from "./BookingsStackNavigator";
import { ChatStackNavigator } from "./ChatStackNavigator";
import { ProfileStackNavigator } from "./ProfileStackNavigator";
import { useTheme } from "@/theme/ThemeProvider";
import { gradients } from "@/theme/gradients";

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
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.primary,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          const config = TAB_CONFIG[route.name];
          const iconName = focused ? config.activeIcon : config.icon;
          return focused ? (
            <LinearGradient
              colors={gradients.primary.colors as any}
              start={gradients.primary.start}
              end={gradients.primary.end}
              style={styles.activeIconContainer}
            >
              <Feather
                name={iconName}
                size={22}
                color="#FFFFFF"
              />
            </LinearGradient>
          ) : (
            <View style={styles.inactiveIconContainer}>
              <Feather name={iconName} size={22} color={colors.textMuted} />
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
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 18 : 14,
    borderWidth: 1,
    borderTopWidth: 1,
    borderRadius: 24,
    height: Platform.OS === "ios" ? 76 : 66,
    paddingBottom: Platform.OS === "ios" ? 16 : 10,
    paddingTop: 10,
    ...Platform.select({
      android: { elevation: 18 },
      ios: {
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
      },
    }),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  activeIconContainer: {
    width: 38,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveIconContainer: {
    width: 38,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
