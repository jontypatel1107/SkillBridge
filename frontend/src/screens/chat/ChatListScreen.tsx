import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SectionList,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { chatApi, useConversationsQuery, Conversation } from "@/redux/api/chatApi";
import { usePresence } from "@/hooks/usePresence";
import { connectSocket } from "@/services/socket";
import { useAppDispatch } from "@/hooks/redux";
import { formatListTime } from "@/utils/dateTime";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ChatStackParamList, "ChatList">;

function previewText(msg: Conversation["lastMessage"]): string {
  if (msg.text) return msg.text;
  if (msg.imageUrl) return "📷 Photo";
  return "New message";
}

export function ChatListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { data: conversations, isLoading, refetch } = useConversationsQuery(undefined, {
    pollingInterval: 15000,
  });
  const { isOnline } = usePresence();

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

  // Group conversations into "Today" / "Yesterday" / "Older" sections.
  const sections = useMemo(() => {
    if (!conversations) return [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const startYest = new Date(startToday);
    startYest.setDate(startToday.getDate() - 1);

    for (const c of conversations) {
      const t = new Date(c.lastMessage.createdAt).getTime();
      if (t >= startToday.getTime()) today.push(c);
      else if (t >= startYest.getTime()) yesterday.push(c);
      else older.push(c);
    }

    const s: { title: string; data: Conversation[] }[] = [];
    if (today.length) s.push({ title: "Today", data: today });
    if (yesterday.length) s.push({ title: "Yesterday", data: yesterday });
    if (older.length) s.push({ title: "Earlier", data: older });
    return s;
  }, [conversations]);

  if (isLoading) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={styles.listContent}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.skeletonAvatar, { backgroundColor: colors.surfaceMuted }]} />
              <View style={styles.skeletonText}>
                <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceMuted, width: 120 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: colors.surfaceMuted, width: 200, marginTop: 6 }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="💬"
            title="No conversations yet"
            subtitle="Book a session to start chatting with a mentor."
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const online = isOnline(item._id);
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(300)}>
              <Pressable
                onPress={() =>
                  navigation.navigate("Conversation", {
                    userId: item._id,
                    userName: item.user.name,
                  })
                }
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
              >
                <View style={[styles.row]}>
                  <View style={styles.avatarWrap}>
                    <Avatar
                      uri={item.user.avatarUrl}
                      name={item.user.name}
                      size={54}
                    />
                    {online && !item.user.avatarUrl ? (
                      <View style={[styles.avatarOnline, { borderColor: colors.background }]} />
                    ) : null}
                  </View>

                  <View style={styles.rowContent}>
                    <View style={styles.topRow}>
                      <Text
                        style={[typography.bodyMedium, { color: colors.text, fontWeight: "700" }]}
                        numberOfLines={1}
                      >
                        {item.user.name}
                      </Text>
                      <Text style={[typography.tiny, { color: item.unreadCount > 0 ? colors.primary : colors.textMuted, fontWeight: item.unreadCount > 0 ? "700" : "500" }]}>
                        {item.lastMessage.createdAt ? formatListTime(item.lastMessage.createdAt) : ""}
                      </Text>
                    </View>

                    <View style={styles.bottomRow}>
                      <View style={[styles.previewWrap, item.unreadCount > 0 && { flex: 1 }]}>
                        {item.unreadCount > 0 ? (
                          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        ) : null}
                        <Text
                          style={[
                            typography.bodySmall,
                            item.unreadCount > 0
                              ? { color: colors.text, fontWeight: "600" }
                              : { color: colors.textMuted },
                            { flexShrink: 1 },
                          ]}
                          numberOfLines={1}
                        >
                          {previewText(item.lastMessage)}
                        </Text>
                      </View>
                      {item.unreadCount > 0 ? (
                        <Badge count={item.unreadCount} style={{ marginLeft: spacing.sm }} />
                      ) : null}
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOnline: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#16A34A",
    borderWidth: 2,
  },
  rowContent: {
    flex: 1,
    marginLeft: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.15)",
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  previewWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
  },

  skeletonAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  skeletonText: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
  },
});
