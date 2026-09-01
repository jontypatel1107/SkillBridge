import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { getShadow } from "@/theme/shadows";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/Skeleton";
import { chatApi, useConversationsQuery } from "@/redux/api/chatApi";
import { connectSocket } from "@/services/socket";
import { useAppDispatch } from "@/hooks/redux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ChatStackParamList, "ChatList">;

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Now";
  if (mins < 60) return mins + "m";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h";
  const days = Math.floor(hrs / 24);
  return days + "d";
}

export function ChatListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { data: conversations, isLoading, refetch } = useConversationsQuery(undefined, {
    pollingInterval: 15000,
  });

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let isActive = true;

    connectSocket().then((socket) => {
      if (!isActive) return;

      const onNewMessage = () => {
        dispatch(chatApi.util.invalidateTags(["Chat"]));
        refetch();
      };
      socket.on("message:new", onNewMessage);
      socket.on("message:read", onNewMessage);
      socket.on("connect", refetch);
      cleanup = () => {
        socket.off("message:new", onNewMessage);
        socket.off("message:read", onNewMessage);
        socket.off("connect", refetch);
      };
    });
    return () => {
      isActive = false;
      cleanup?.();
    };
  }, [dispatch, refetch]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonRow, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.skeletonAvatar, { backgroundColor: colors.surfaceMuted }]} />
              <View style={styles.skeletonText}>
                <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceMuted, width: 120 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceMuted, width: 180, marginTop: 6 }]} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={conversations ?? []}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="💬"
              title="No conversations yet"
              subtitle="Book a session to start chatting with a mentor."
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
              <Pressable
                onPress={() =>
                  navigation.navigate("Conversation", {
                    userId: item._id,
                    userName: item.user.name,
                  })
                }
                style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
              >
                <View style={[styles.conversationCard, getShadow(colors, "sm"), { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Avatar
                    uri={item.user.avatarUrl}
                    name={item.user.name}
                    size={52}
                  />
                  <View style={styles.conversationContent}>
                    <View style={styles.topRow}>
                      <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
                        {item.user.name}
                      </Text>
                      <Text style={[typography.tiny, { color: colors.textMuted }]}>
                        {item.lastMessage.createdAt ? timeAgo(item.lastMessage.createdAt) : ""}
                      </Text>
                    </View>
                    <View style={styles.bottomRow}>
                      <Text style={[typography.bodySmall, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
                        {item.lastMessage.text ?? "Sent an image"}
                      </Text>
                      {item.unreadCount > 0 ? (
                        <Badge count={item.unreadCount} style={{ marginLeft: spacing.sm }} />
                      ) : null}
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Conversation Card
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  conversationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  // Skeleton
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  skeletonText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
  },
});
