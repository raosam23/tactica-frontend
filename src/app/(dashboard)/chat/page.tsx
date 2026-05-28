import React from "react";

import ChatInput from "@/components/chat/ChatInput";

const ConversationPage = () => {
    return <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-medium mb-4">Start Chatting with Tactica</h2>

        <div className="p-4 w-full max-w-xl">
            <ChatInput />
        </div>
    </div>;
};

export default ConversationPage;
