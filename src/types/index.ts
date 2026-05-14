export interface User {
    id: string,
    email: string,
    name?: string,
}

export interface Conversation {
    id: string,
    user_id: string,
    title?: string,
    created_at: string,
    updated_at: string,
}

export type MessageRole = "user" | "assistant"

export interface Message {
    id: string,
    conversation_id: string,
    role: MessageRole,
    content: string,
    created_at: string,
    citations?: Citation[],
}

export interface Citation {
    source: string,
    relevance_score: number | null,
}

export interface ChatResponse {
    message: string,
    citations: Citation[],
}

export interface TokenResponse {
    access_token: string,
    token_type: string
}
