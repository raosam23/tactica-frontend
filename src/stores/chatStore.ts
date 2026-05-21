import { isAxiosError } from "axios";
import { create } from "zustand";

import api from "@/lib/api";
import { ApiError } from "@/lib/error";
import { Conversation, Message } from "@/types";

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    isLoading: boolean;
    isConversationsLoading: boolean;
    isMessagesLoading: boolean;

    fetchConversations: () => Promise<void>;
    createConversation: () => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    setActiveConversation: (conversationId: string) => void;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, message: string) => Promise<void>;
    refreshConversation: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,
    isConversationsLoading: false,
    isMessagesLoading: false,

    fetchConversations: async () => {
        set({ isConversationsLoading: true });
        try {
            const response = await api.get("/conversations/");
            set({ conversations: response.data });
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                throw new ApiError("Failed to fetch conversations", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isConversationsLoading: false });
        }
    },
    createConversation: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post("/conversations/", {});
            set((state) => ({
                activeConversationId: response.data.id,
                conversations: [response.data, ...state.conversations],
                messages: []
            }));
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                throw new ApiError("Failed to create conversation", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isLoading: false });
        }
    },
    deleteConversation: async (conversationId: string) => {
        set({ isLoading: true });
        try {
            await api.delete(`/conversations/${conversationId}/`);
            set((state) => ({
                conversations: state.conversations.filter((convo) => convo.id !== conversationId),
                activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
                messages: state.activeConversationId === conversationId ? [] : state.messages,
            }));
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                throw new ApiError("Failed to delete conversation", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isLoading: false });
        }
    },
    setActiveConversation: (conversationId: string) => {
        set({ activeConversationId: conversationId, messages: [] });
    },
    fetchMessages: async (conversationId: string) => {
        set({ isMessagesLoading: true });
        try {
            const response = await api.get(`/conversations/${conversationId}/messages/`);
            set({ messages: response.data });
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                throw new ApiError("Failed to fetch messages", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (conversationId: string, message: string) => {
        set((state) => ({
            isLoading: true,
            messages: [
                ...state.messages,
                {
                    id: crypto.randomUUID(),
                    conversation_id: conversationId,
                    role: "user",
                    content: message,
                    created_at: new Date().toISOString(),
                },
            ],
        }));
        try {
            const response = await api.post(`/conversations/${conversationId}/chat`, { message });
            set((state) => ({
                messages: [
                    ...state.messages,
                    {
                        id: crypto.randomUUID(),
                        conversation_id: conversationId,
                        role: "assistant",
                        content: response.data.message,
                        created_at: new Date().toISOString(),
                        citations: response.data.citations ?? [],
                    },
                ],
            }));
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                throw new ApiError("Failed to send message", error.response?.status, error.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ isLoading: false });
        }
    },
    refreshConversation: async (conversation_id: string) => {
        const response = await api.get(`/conversations/${conversation_id}`);
        set((state) => ({
            conversations: state.conversations.map((convo) => convo.id === conversation_id ? response.data : convo),
        }));
    },
}));
