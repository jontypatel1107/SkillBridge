import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ChatStackParamList } from "./types";
import { ChatListScreen } from "@/screens/chat/ChatListScreen";
import { ConversationScreen } from "@/screens/chat/ConversationScreen";
import { VideoCallScreen } from "@/screens/chat/VideoCallScreen";
import { useTheme } from "@/theme/ThemeProvider";
import { getStackScreenOptions } from "./stackOptions";

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatStackNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={getStackScreenOptions(colors)}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: "Messages" }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerBackTitle: "Back" }} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
