"use client";
import React, { useEffect, useState } from "react";
import { thinkingLists } from "@/lib/constants";

const ThinkingIndicator = () => {
    const [thinkingIndex, setThinkingIndex] = useState<number>(() =>
        Math.floor(Math.random() * thinkingLists.length),
    );
    useEffect(() => {
        const interval = setInterval(() => {
            setThinkingIndex(() => Math.floor(Math.random() * thinkingLists.length));
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="text-muted-foreground text-sm">
            {thinkingLists[thinkingIndex]}
            <span className="inline-flex gap-[2px] ml-1">
                <span className="animate-bounce [animation-delay:0ms]">.</span>
                <span className="animate-bounce [animation-delay:150ms]">.</span>
                <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
        </div>
    );
};

export default ThinkingIndicator;
