import { fetchEventSource } from "@microsoft/fetch-event-source";
import { isAxiosError } from "axios";
import Cookies from "js-cookie"
import { create } from "zustand";

import api from "@/lib/api";
import { ApiError } from "@/lib/error";
import { Conversation, Message } from "@/types";

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Message[];
    loadingConversationIds: string[];
    isConversationsLoading: boolean;
    isMessagesLoading: boolean;
    refreshingConversationId: string | null;

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
    loadingConversationIds: [],
    isConversationsLoading: false,
    isMessagesLoading: false,
    refreshingConversationId: null,

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
        }
    },
    deleteConversation: async (conversationId: string) => {
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
            loadingConversationIds: [...state.loadingConversationIds, conversationId],
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
        const assistantMessageId = crypto.randomUUID();
        set((state) => ({
            messages: [...state.messages, {
                id: assistantMessageId,
                conversation_id: conversationId,
                role: "assistant",
                content: "",
                created_at: new Date().toISOString(),
                citations: [],
            }]
        }))
        const token = Cookies.get("token");
        try {
            // const response = await api.post(`/conversations/${conversationId}/chat`, { message });
            await fetchEventSource(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : ""
                },
                body: JSON.stringify({ message }),
                onmessage(ev) {
                    const parsed = JSON.parse(ev.data);

                    if (parsed.type === "token") {
                        set((state) => ({
                            messages: state.messages.map((msg) => msg.id === assistantMessageId ? { ...msg, content: msg.content + parsed.content } : msg),
                        }));
                    } else if (parsed.type === "citations") {
                        set((state) => ({
                            loadingConversationIds: state.loadingConversationIds.filter(id => id !== conversationId),
                            messages: state.messages.map((msg) => msg.id === assistantMessageId ? { ...msg, citations: parsed.citations } : msg),
                        }));
                    } else {
                        console.warn("Unknown message type")
                    }
                },
                onerror(err) {
                    throw new ApiError(`Failed to send message: ${err}`);
                }
            });
        } catch {
            throw new ApiError("Failed to send message")
        }
    },
    refreshConversation: async (conversation_id: string) => {
        set({ refreshingConversationId: conversation_id });
        try {
            const response = await api.get(`/conversations/${conversation_id}`);
            set((state) => ({
                conversations: state.conversations.map((convo) => convo.id === conversation_id ? response.data : convo),
                refreshingConversationId: null,
            }));
        } catch (exception: unknown) {
            if (isAxiosError(exception)) {
                throw new ApiError("Failed to refresh conversation", exception.response?.status, exception.response?.data);
            } else {
                throw new ApiError("An unknown error occurred");
            }
        } finally {
            set({ refreshingConversationId: null });
        }
    },
}));
