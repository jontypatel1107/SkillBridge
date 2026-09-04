import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Avatar } from "@/components/Avatar";
import { chatApi, useConversationHistoryQuery, ChatMessage } from "@/redux/api/chatApi";
import { connectSocket } from "@/services/socket";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePresence } from "@/hooks/usePresence";
import {
  formatDateSeparator,
  formatBubbleTime,
  isSameDay,
} from "@/utils/dateTime";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ChatStackParamList, "Conversation">;

function appendMessageOnce(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
  if (messages.some((existing) => existing._id === message._id)) return messages;
  return [...messages, message];
}

// Insert readable date separators ("Today", "Yesterday", "Mon, 12 Aug") between
// messages whose dates differ, exactly like messenger apps do.
function withDateSeparators(messages: ChatMessage[]): (ChatMessage | { type: "date"; date: string })[] {
  const rows: (ChatMessage | { type: "date"; date: string })[] = [];
  let lastDay: string | null = null;

  for (const m of messages) {
    const day = new Date(m.createdAt).toDateString();
    if (day !== lastDay) {
      rows.push({ type: "date", date: m.createdAt });
      lastDay = day;
    }
    rows.push(m);
  }

  return rows;
}

export function ConversationScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { userId, userName } = route.params;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const meId = currentUser?.id ?? currentUser?._id ?? "";
  const { isOnline } = usePresence();
  const online = isOnline(userId);

  const { data: history, refetch } = useConversationHistoryQuery(userId, {
    pollingInterval: 10000,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<any>>(null);

  // Custom navbar: avatar + name + status on the left, video call on the right.
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <View style={styles.headerAvatarWrap}>
            <Avatar uri={undefined} name={userName} size={38} />
            {online ? <View style={styles.headerOnlineDot} /> : null}
          </View>
          <View>
            <Text style={[typography.h4, { color: colors.text }]} numberOfLines={1}>
              {userName}
            </Text>
            <Text style={[typography.small, { color: online ? colors.success : colors.textMuted }]}>
              {online ? "online" : "last seen recently"}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("VideoCall", { userId, userName })}
          accessibilityRole="button"
          accessibilityLabel="Start video call"
          hitSlop={10}
          style={({ pressed }) => [
            styles.videoCallButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="video" size={18} color="#FFFFFF" />
        </Pressable>
      ),
    });
  }, [navigation, userName, userId, colors, online]);

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  useEffect(() => {
    const show = (e?: any) => {
      setKeyboardOpen(true);
      if (e?.endCoordinates?.height) setKeyboardHeight(e.endCoordinates.height);
    };
    const hide = () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    };
    const subShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      show
    );
    const subHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      hide
    );
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  useEffect(() => {
    let cleanupFns: (() => void)[] = [];
    let isActive = true;

    connectSocket().then((socket) => {
      if (!isActive) return;

      const onNewMessage = (msg: ChatMessage) => {
        if (msg.sender === userId || msg.recipient === userId) {
          dispatch(
            chatApi.util.updateQueryData("conversationHistory", userId, (draftQ) => {
              if (!draftQ.some((existing) => existing._id === msg._id)) {
                draftQ.push(msg);
              }
            })
          );
          dispatch(chatApi.util.invalidateTags(["Chat"]));
          setMessages((prev) => appendMessageOnce(prev, msg));
          socket.emit("message:read", { otherUserId: userId });
        }
      };
      const onTypingStart = ({ userId: fromId }: { userId: string }) => {
        if (fromId === userId) setIsTyping(true);
      };
      const onTypingStop = ({ userId: fromId }: { userId: string }) => {
        if (fromId === userId) setIsTyping(false);
      };
      const onRead = ({ by }: { by: string }) => {
        if (by === userId) {
          dispatch(chatApi.util.invalidateTags(["Chat"]));
        }
      };

      socket.on("message:new", onNewMessage);
      socket.on("typing:start", onTypingStart);
      socket.on("typing:stop", onTypingStop);
      socket.on("message:read", onRead);
      socket.on("connect", refetch);
      socket.emit("message:read", { otherUserId: userId });

      cleanupFns = [
        () => socket.off("message:new", onNewMessage),
        () => socket.off("typing:start", onTypingStart),
        () => socket.off("typing:stop", onTypingStop),
        () => socket.off("message:read", onRead),
        () => socket.off("connect", refetch),
      ];
    });

    return () => {
      isActive = false;
      cleanupFns.forEach((fn) => fn());
    };
  }, [dispatch, refetch, userId]);

  const rows = useMemo(() => withDateSeparators(messages), [messages]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const socket = await connectSocket();
    socket.emit("message:send", { recipientId: userId, text });
    socket.emit("typing:stop", { recipientId: userId });
  }, [draft, userId]);

  const onChangeDraft = async (text: string) => {
    setDraft(text);
    const socket = await connectSocket();
    socket.emit(text.length > 0 ? "typing:start" : "typing:stop", { recipientId: userId });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateRow}>
          <View style={[styles.dateChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[typography.caption, { color: colors.textMuted, fontWeight: "600" }]}>
              {formatDateSeparator(item.date)}
            </Text>
          </View>
        </View>
      );
    }

    const isMine = item.sender === meId;
    const prev: any = rows[index - 1];
    const next: any = rows[index + 1];
    const groupedWithPrev =
      !isMine && prev && prev.type !== "date" && prev.sender === item.sender &&
      isSameDay(new Date(prev.createdAt), new Date(item.createdAt));
    const groupedWithNext =
      !isMine && next && next.type !== "date" && next.sender === item.sender &&
      isSameDay(new Date(next.createdAt), new Date(item.createdAt));

    const showAvatar = !isMine && !groupedWithNext;
    const isGroupStart = !isMine && !groupedWithPrev;

    return (
      <View style={[styles.msgRow, isMine ? styles.myRow : styles.theirRow]}>
        {!isMine ? (
          <View style={[styles.groupAvatar, { opacity: showAvatar ? 1 : 0 }]}>
            {showAvatar ? <Avatar uri={undefined} name={userName} size={32} /> : null}
          </View>
        ) : null}
        <View>
          <View
            style={[
              styles.bubble,
              isMine
                ? {
                    backgroundColor: "#DCF8C6",
                    borderTopRightRadius: groupedWithPrev ? 6 : radii.md,
                    borderBottomRightRadius: groupedWithNext ? 6 : radii.md,
                  }
                : {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderTopLeftRadius: isGroupStart ? radii.md : 6,
                    borderBottomLeftRadius: groupedWithNext ? 6 : radii.md,
                  },
            ]}
          >
            <Text style={[typography.body, { color: isMine ? "#1A2412" : colors.text, lineHeight: 21 }]}>
              {item.text}
            </Text>
            <View style={styles.bubbleMeta}>
              {isMine ? (
                <Feather name="check" size={13} color="#82966E" />
              ) : null}
              <Text style={[typography.tiny, { color: isMine ? "#82966E" : colors.textMuted }]}>
                {formatBubbleTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        style={styles.flex}
        data={rows}
        keyExtractor={(item, idx) => (item.type === "date" ? `date-${idx}` : item._id ?? String(idx))}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        renderItem={renderItem}
      />

      {/* Typing indicator */}
      {isTyping ? (
        <View style={[styles.typingContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.typingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.typingDot, { backgroundColor: colors.textMuted, marginLeft: i > 0 ? 4 : 0 }]} />
              ))}
            </View>
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
            {userName} is typing
          </Text>
        </View>
      ) : null}

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: keyboardOpen
              ? (Platform.OS === "ios" ? 0 : keyboardHeight) + spacing.md
              : spacing.sm + tabBarHeight,
          },
        ]}
      >
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="plus" size={22} color={colors.textMuted} />
          <TextInput
            value={draft}
            onChangeText={onChangeDraft}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
            multiline
          />
          <View style={styles.inputActions}>
            {draft.trim() ? (
              <Pressable
                onPress={send}
                style={({ pressed }) => [
                  styles.sendButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Feather name="arrow-up" size={20} color="#FFFFFF" />
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.iconBtn} hitSlop={8}>
                  <Feather name="camera" size={22} color={colors.textMuted} />
                </Pressable>
                <Pressable style={styles.iconBtn} hitSlop={8}>
                  <Feather name="mic" size={22} color={colors.textMuted} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatarWrap: {
    marginRight: spacing.sm,
    position: "relative",
  },
  headerOnlineDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#16A34A",
    borderWidth: 2,
    borderColor: "#fff",
  },
  videoCallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  dateRow: {
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },

  msgRow: {
    flexDirection: "row",
    marginVertical: 1.5,
  },
  myRow: {
    justifyContent: "flex-end",
    paddingLeft: spacing.xl,
  },
  theirRow: {
    justifyContent: "flex-start",
    paddingRight: spacing.xl,
  },
  groupAvatar: {
    width: 36,
    marginRight: 6,
    alignSelf: "flex-end",
    marginBottom: 2,
  },
  bubble: {
    maxWidth: 280,
    borderWidth: 1,
    borderRadius: radii.md,
    borderColor: "transparent",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    elevation: 0.5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    marginTop: 2,
  },

  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  typingBubble: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  inputContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBtn: {
    padding: 2,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
});
