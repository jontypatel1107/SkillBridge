import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { ScreenBackground } from "@/components/ScreenBackground";
import {
  useMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
  AppNotification,
} from "@/redux/api/notificationsApi";

const NOTIFICATION_ICONS: Record<string, { icon: string; color: string }> = {
  booking: { icon: "calendar", color: "#1B4D42" },
  message: { icon: "message-circle", color: "#2E5C6E" },
  review: { icon: "star", color: "#C97A2B" },
  achievement: { icon: "award", color: "#3E5C3A" },
  recommendation: { icon: "zap", color: "#5B4159" },
  default: { icon: "bell", color: "#6B7570" },
};

function getNotificationConfig(type: string) {
  return NOTIFICATION_ICONS[type] ?? NOTIFICATION_ICONS.default;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationsScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useMyNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

  const notifications = data?.notifications ?? [];

  return (
    <View style={styles.flex}>
      <ScreenBackground mood="chat" />
      <Animated.View entering={FadeIn.duration(400)} style={styles.flex}>
        {data && data.unreadCount > 0 ? (
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {data.unreadCount} unread notification{data.unreadCount !== 1 ? "s" : ""}
            </Text>
            <Pressable onPress={() => markAllRead()} disabled={isMarkingAll} hitSlop={8}>
              <Text style={[typography.bodyMedium, { color: colors.primary }]}>
                {isMarkingAll ? "Marking..." : "Mark all read"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.listContent}>
            <SkeletonCard />
            <SkeletonCard style={{ marginTop: spacing.md }} />
            <SkeletonCard style={{ marginTop: spacing.md }} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyState
                icon="🔔"
                title="You're all caught up"
                subtitle="No new notifications to show."
              />
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  if (!item.isRead) markRead(item._id);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
              >
                <NotificationCard item={item} />
              </Pressable>
            )}
          />
        )}
      </Animated.View>
    </View>
  );
}

function NotificationCard({ item }: { item: AppNotification }) {
  const { colors } = useTheme();
  const config = getNotificationConfig(item.type);

  return (
    <View
      style={[
        styles.card,
        getShadow(colors, "sm"),
        {
          backgroundColor: colors.surface,
          borderColor: item.isRead ? colors.border : colors.primary + "30",
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: config.color + "15" },
        ]}
      >
        <Feather name={config.icon as any} size={18} color={config.color} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text
            style={[
              item.isRead ? typography.body : typography.bodyMedium,
              { color: colors.text, flex: 1 },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {!item.isRead ? (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          ) : null}
        </View>
        <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: 4 }]} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={[typography.tiny, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {timeAgo(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  card: {
    flexDirection: "row",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});
