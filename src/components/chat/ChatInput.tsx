"use client";
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react'

import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/error';
import { useChatStore } from '@/stores/chatStore';

import { Button } from '../ui/button';

const ChatInput = () => {
    const router = useRouter();
    const [message, setMessage] = useState<string>("");
    const { sendMessage, createConversation, activeConversationId, refreshConversation, loadingConversationIds } = useChatStore();
    const handleButtonOnClick = async () => {
        if (!message) return;
        setMessage("");
        try {
            if (!activeConversationId) {
                await createConversation();
                const newConversationId = useChatStore.getState().activeConversationId;
                if (newConversationId) {
                    router.push(`/chat/${newConversationId}`);
                    await sendMessage(newConversationId, message);
                    await refreshConversation(newConversationId);
                }
            } else {
                await sendMessage(activeConversationId, message);
            }
        } catch (error: unknown) {
            if (error instanceof ApiError) {
                enqueueSnackbar(error.message, { variant: "error" });
            } else {
                enqueueSnackbar("An unexpected error occurred", { variant: "error" });
            }
        }
    }
    const handleOnKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleButtonOnClick();
        }
    }
    return (
        <div className="relative w-full">
            <Textarea
                placeholder="Type your message..."
                className="resize-none pr-12 pb-10 min-h-[80px]"
                disabled={loadingConversationIds.includes(activeConversationId ?? "")}
                rows={1}
                value={message}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => { setMessage(event.target.value); }}
                onKeyDown={handleOnKeyDown}
            />
            <Button
                size="icon"
                className="absolute bottom-2 right-2 rounded-full cursor-pointer"
                onClick={handleButtonOnClick}
                disabled={loadingConversationIds.includes(activeConversationId ?? "")}
            >
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
    )
}

export default ChatInput;