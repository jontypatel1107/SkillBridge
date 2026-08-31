import { api } from "./baseApi";
import { ApiSuccess, User } from "@/types";

export interface ChatMessage {
  _id: string;
  sender: string;
  recipient: string;
  text?: string;
  imageUrl?: string;
  booking?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string; // other user's id
  user: Pick<User, "name" | "username" | "avatarUrl">;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    conversations: builder.query<Conversation[], void>({
      query: () => "/chat/conversations",
      transformResponse: (res: ApiSuccess<{ conversations: Conversation[] }>) =>
        res.data.conversations,
    }),
    conversationHistory: builder.query<ChatMessage[], string>({
      query: (userId) => `/chat/conversations/${userId}`,
      transformResponse: (res: ApiSuccess<{ messages: ChatMessage[] }>) => res.data.messages,
    }),
  }),
});

export const { useConversationsQuery, useConversationHistoryQuery } = chatApi;
