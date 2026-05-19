"use client";
import { useParams } from "next/navigation";
import React from "react";

const ChatPage = () => {
    const params = useParams();
    return <div>{params.conversationId}</div>;
};

export default ChatPage;
