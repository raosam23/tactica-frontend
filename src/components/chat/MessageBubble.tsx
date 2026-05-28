import React from 'react'
import ReactMarkdown from 'react-markdown'

import { Message } from '@/types'
import CitationsList from './CitationsList'

const MessageBubble = (
    { message }: {
        message: Message
    }
) => {
    if (message.role === "user") {
        return (<div className="flex justify-end w-full">
            <div className="bg-primary text-primary-foreground px-4 py-2 max-w-[70%] w-fit text-sm rounded-t-2xl rounded-br-2xl mb-6">
                {message.content}
            </div></div>);
    } else if (message.role === "assistant") {
        return <div className="flex flex-col justify-start text-sm mb-6">
            <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            <CitationsList citations={message.citations} />
        </div>
    }
    return null
}

export default MessageBubble