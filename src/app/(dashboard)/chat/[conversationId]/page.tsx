"use client";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import { Spinner } from "@/components/ui/Spinner";
import { useChatStore } from "@/stores/chatStore";

const ChatPage = () => {
    const params = useParams();
    const { messages, fetchMessages, isMessagesLoading, isLoading, setActiveConversation, activeConversationId } = useChatStore();
    useEffect(() => {
        setActiveConversation(params.conversationId as string);
        if (!(isLoading && activeConversationId === params.conversationId)) {
            fetchMessages(params.conversationId as string);
        }
    }, [params.conversationId, fetchMessages, setActiveConversation, activeConversationId, isLoading])
    if (isMessagesLoading) {
        return <div className="flex items-center justify-center h-full">
            <Spinner type="line-spinner" />
        </div>
    }
    return <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-8">
            {messages.map(msg =>
                <MessageBubble key={msg.id} message={msg} />
            )}
        </div>
        <div className="p-4">
            <ChatInput />
        </div>
    </div>;
};

export default ChatPage;
