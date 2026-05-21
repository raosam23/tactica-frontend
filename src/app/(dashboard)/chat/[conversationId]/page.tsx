"use client";
import { useParams } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import React, { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import ChatInput from "@/components/chat/ChatInput";

const ChatPage = () => {
    const params = useParams();
    const { messages, fetchMessages, isMessagesLoading, isLoading } = useChatStore();
    useEffect(() => {
        if (params.conversationId && !isLoading) {
            fetchMessages(params.conversationId as string);
        }
    }, [params.conversationId, fetchMessages])
    if (isMessagesLoading) {
        return <div className="flex items-center justify-center h-full">
            <Spinner type="line-spinner" />
        </div>
    }
    return <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
            {messages.map(msg => <div key={msg.id}>
                <p>{msg.role}</p>
                <p>{msg.content}</p>
                <p>{msg.created_at}</p>
            </div>)}
        </div>
        <div className="p-4">
            <ChatInput />
        </div>
    </div>;
};

export default ChatPage;
