import React from "react";
import { StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ChatStackParamList } from "./types";
import { ChatListScreen } from "@/screens/chat/ChatListScreen";
import { ConversationScreen } from "@/screens/chat/ConversationScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { typography } from "@/theme/tokens";

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStackNavigator() {
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
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: "Messages" }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerBackTitle: "Back" }} />
    </Stack.Navigator>
  );
}
