import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography, radii } from "@/theme/tokens";
import { useConversationHistoryQuery, ChatMessage } from "@/redux/api/chatApi";
import { connectSocket } from "@/services/socket";
import { useAppSelector } from "@/hooks/redux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ChatStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<ChatStackParamList, "Conversation">;

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { userId, userName } = route.params;
  const currentUser = useAppSelector((s) => s.auth.user);
  const meId = currentUser?.id ?? currentUser?._id ?? "";

  const { data: history } = useConversationHistoryQuery(userId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: userName });
  }, [navigation, userName]);

  useEffect(() => {
    if (history) setMessages(history);
  }, [history]);

  useEffect(() => {
    let cleanupFns: (() => void)[] = [];

    connectSocket().then((socket) => {
      const onNewMessage = (msg: ChatMessage) => {
        if (msg.sender === userId || msg.recipient === userId) {
          setMessages((prev) => [...prev, msg]);
        }
      };
      const onTypingStart = ({ userId: fromId }: { userId: string }) => {
        if (fromId === userId) setIsTyping(true);
      };
      const onTypingStop = ({ userId: fromId }: { userId: string }) => {
        if (fromId === userId) setIsTyping(false);
      };

      socket.on("message:new", onNewMessage);
      socket.on("typing:start", onTypingStart);
      socket.on("typing:stop", onTypingStop);
      socket.emit("message:read", { otherUserId: userId });

      cleanupFns = [
        () => socket.off("message:new", onNewMessage),
        () => socket.off("typing:start", onTypingStart),
        () => socket.off("typing:stop", onTypingStop),
      ];
    });

    return () => cleanupFns.forEach((fn) => fn());
  }, [userId]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const socket = await connectSocket();
    socket.emit("message:send", { recipientId: userId, text });
  }, [draft, userId]);

  const onChangeDraft = async (text: string) => {
    setDraft(text);
    const socket = await connectSocket();
    socket.emit(text.length > 0 ? "typing:start" : "typing:stop", { recipientId: userId });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.flex, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={90}
    >
      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, idx) => item._id ?? String(idx)}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item, index }) => {
          const isMine = item.sender === meId;
          return (
            <Animated.View
              entering={FadeInUp.delay(index < 10 ? index * 30 : 0).duration(200)}
              style={[
                styles.bubbleRow,
                { justifyContent: isMine ? "flex-end" : "flex-start" },
              ]}
            >
              {!isMine ? (
                <View style={[styles.otherDot, { backgroundColor: colors.primary }]} />
              ) : null}
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: isMine ? colors.primary : colors.surface,
                    borderColor: isMine ? "transparent" : colors.border,
                    borderBottomRightRadius: isMine ? 4 : radii.md,
                    borderBottomLeftRadius: !isMine ? 4 : radii.md,
                  },
                ]}
              >
                <Text style={[typography.body, { color: isMine ? "#FFFFFF" : colors.text }]}>
                  {item.text}
                </Text>
                <Text
                  style={[
                    typography.tiny,
                    {
                      color: isMine ? "rgba(255,255,255,0.6)" : colors.textMuted,
                      textAlign: "right",
                      marginTop: 4,
                    },
                  ]}
                >
                  {item.createdAt ? formatTime(item.createdAt) : ""}
                </Text>
              </View>
            </Animated.View>
          );
        }}
      />

      {/* Typing indicator */}
      {isTyping ? (
        <View style={styles.typingContainer}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.typingDot,
                  {
                    backgroundColor: colors.textMuted,
                    opacity: 0.4,
                    marginLeft: i > 0 ? 4 : 0,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.sm }]}>
            {userName} is typing
          </Text>
        </View>
      ) : null}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={[styles.inputRow, { backgroundColor: colors.surfaceMuted }]}>
          <TextInput
            value={draft}
            onChangeText={onChangeDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: draft.trim() ? colors.primary : colors.surfaceMuted,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Feather
              name="send"
              size={18}
              color={draft.trim() ? "#FFFFFF" : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  // Bubbles
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
    gap: 6,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  otherDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },

  // Typing
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Input
  inputContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === "ios" ? spacing.xl : spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
