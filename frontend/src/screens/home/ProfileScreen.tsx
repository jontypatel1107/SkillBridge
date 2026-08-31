import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { gradients } from "@/theme/gradients";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Divider } from "@/components/Divider";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setUnauthenticated } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/api/authApi";
import { tokenStorage } from "@/utils/tokenStorage";
import { disconnectSocket } from "@/services/socket";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileHome">;

export function ProfileScreen({ navigation }: Props) {
  const { colors, mode, setMode } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout().unwrap();
          } catch {}
          await tokenStorage.clear();
          disconnectSocket();
          dispatch(setUnauthenticated());
        },
      },
    ]);
  };

  const menuItems: {
    icon: string;
    label: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
  }[] = [
    {
      icon: "edit-2",
      label: "Edit Profile",
      subtitle: "Update your info and skills",
      onPress: () => navigation.navigate("EditProfile"),
    },
    ...(!user?.isVerified
      ? [
          {
            icon: "shield",
            label: "Verify Email",
            subtitle: "Confirm your email address",
            onPress: () => navigation.navigate("VerifyEmail"),
          },
        ]
      : []),
    ...(user?.role === "mentor"
      ? [
          {
            icon: "book-open",
            label: "My Listings",
            subtitle: "Manage your skill offerings",
            onPress: () => navigation.navigate("MyListings"),
          },
        ]
      : []),
    {
      icon: "map",
      label: "AI Roadmaps",
      subtitle: "Your personalized learning paths",
      onPress: () => navigation.navigate("Roadmaps"),
    },
    {
      icon: "bell",
      label: "Notifications",
      subtitle: "Stay updated",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      icon: mode === "dark" ? "sun" : "moon",
      label: mode === "dark" ? "Light Mode" : "Dark Mode",
      subtitle: "Switch appearance",
      onPress: () => setMode(mode === "dark" ? "light" : "dark"),
    },
    {
      icon: "log-out",
      label: "Log Out",
      subtitle: "See you next time",
      onPress: handleLogout,
      color: colors.danger,
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient
          colors={gradients.primary.colors as any}
          start={gradients.primary.start}
          end={gradients.primary.end}
          style={styles.headerGradient}
        >
          <View style={styles.avatarContainer}>
            <Avatar uri={user?.avatarUrl} name={user?.name ?? "U"} size={80} />
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileUsername}>@{user?.username}</Text>
          <View style={styles.roleBadge}>
            <Feather
              name={user?.role === "mentor" ? "award" : "book-open"}
              size={12}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.roleText}>
              {user?.role === "mentor" ? "Mentor" : "Learner"}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.statsRow, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <StatBlock
            icon="star"
            value={user?.rating?.toFixed(1) ?? "—"}
            label="Rating"
            colors={colors}
          />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatBlock
            icon="book-open"
            value={String(user?.skills?.length ?? 0)}
            label="Skills"
            colors={colors}
          />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatBlock
            icon="users"
            value={String(user?.ratingCount ?? 0)}
            label="Reviews"
            colors={colors}
          />
        </View>
      </Animated.View>

      {/* Menu */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                item.onPress();
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={styles.menuItem}>
                <View
                  style={[
                    styles.menuIcon,
                    {
                      backgroundColor: (item.color ?? colors.primary) + "15",
                    },
                  ]}
                >
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={item.color ?? colors.primary}
                  />
                </View>
                <View style={styles.menuText}>
                  <Text style={[typography.bodyMedium, { color: item.color ?? colors.text }]}>
                    {item.label}
                  </Text>
                  {item.subtitle ? (
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </View>
            </Pressable>
            {index < menuItems.length - 1 ? (
              <Divider style={{ marginLeft: 72 }} />
            ) : null}
          </React.Fragment>
        ))}
      </Animated.View>

      {/* Footer */}
      <Text style={[typography.tiny, { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl }]}>
        SkillBridge v0.1.0
      </Text>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

function StatBlock({
  icon,
  value,
  label,
  colors,
}: {
  icon: string;
  value: string;
  label: string;
  colors: any;
}) {
  return (
    <View style={styles.statBlock}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <Text style={[typography.h3, { color: colors.text, marginTop: 4 }]}>{value}</Text>
      <Text style={[typography.tiny, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },

  // Header
  headerGradient: {
    paddingTop: spacing.section,
    paddingBottom: spacing.xl,
    alignItems: "center",
  },
  avatarContainer: {
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 44,
    padding: 2,
  },
  profileName: {
    ...typography.h2,
    color: "#FFFFFF",
    marginTop: spacing.md,
  },
  profileUsername: {
    ...typography.body,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  roleText: {
    ...typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },

  // Menu
  menuSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
