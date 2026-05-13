import { create } from "zustand";
import api from "@/lib/api";
import { Citation, Conversation, Message } from "@/types";
import { isAxiosError } from "axios";

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    citations: Citation[];
    isLoading: boolean;

    fetchConversations: () => Promise<void>;
    createConversation: () => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    setActiveConversation: (conversationId: string) => void;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    citations: [],
    isLoading: false,

    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get("/conversations/");
            set({ conversations: response.data })
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                console.error("Fetch conversations error:", error);
            } else {
                console.error("An unknown error occurred:", error);
            }
        } finally {
            set({ isLoading: false });
        }
    },
    createConversation: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post("/conversations/");
            set((state) => ({
                activeConversationId: response.data.id,
                conversations: [response.data, ...state.conversations]
            }))
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                console.error("Create conversation error:", error);
            } else {
                console.error("An unknown error occurred:", error);
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
                conversations: state.conversations.filter(convo => convo.id !== conversationId),
                activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId,
                messages: []
            }))
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                console.error("Delete conversation error:", error);
            } else {
                console.error("An unknown error occurred:", error);
            }
        } finally {
            set({ isLoading: false });
        }
    },
    setActiveConversation: (conversationId: string) => {
        set({ activeConversationId: conversationId, messages: [], citations: [] });
    },
    fetchMessages: async (conversationId: string) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/conversations/${conversationId}/messages/`);
            set({ messages: response.data });
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                console.error("Fetch messages error:", error);
            } else {
                console.error("An unknown error occurred:", error);
            }
        } finally {
            set({ isLoading: false });
        }
    },
    sendMessage: async (conversationId: string, message: string) => {
        set((state) => ({
            isLoading: true,
            messages: [...state.messages, {
                id: crypto.randomUUID(),
                conversation_id: conversationId,
                role: "user",
                content: message,
                created_at: new Date().toISOString(),
            }]
        }))
        try {
            const response = await api.post(`/conversations/${conversationId}/chat`, { message });
            set((state) => ({
                messages: [...state.messages, {
                    id: crypto.randomUUID(),
                    conversation_id: conversationId,
                    role: "assistant",
                    content: response.data.message,
                    created_at: new Date().toISOString(),
                }],
                citations: response.data.citations ?? [],
            }))
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                console.error("Send message error:", error);
            } else {
                console.error("An unknown error occurred:", error);
            }
        } finally {
            set({ isLoading: false });
        }
    },
}))