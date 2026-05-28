"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

import { Button } from "../ui/button";
import { Spinner } from "../ui/Spinner";

const Sidebar = () => {
    const { conversations, fetchConversations, isConversationsLoading, refreshingConversationId, activeConversationId } = useChatStore();
    const { user, logout, fetchUser } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const handleNewChat = () => {
        router.push("/chat");
    };

    const handleOpenConversation = (id: string) => {
        router.push(`/chat/${id}`);
    };

    useEffect(() => {
        fetchConversations();
        fetchUser();
    }, [fetchConversations, fetchUser]);
    return (
        <div className="flex flex-col h-full w-64 p-4 bg-sidebar border-r border-sidebar-border">
            <header className="flex items-center justify-between border-b border-border mb-4 pb-2 shrink-0">
                <h1 className="text-3xl font-bold">Tactica</h1>
                <Button className="cursor-pointer" onClick={handleNewChat}>
                    <PlusIcon />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto flex flex-col gap-1 -mx-2 px-2">
                {isConversationsLoading && (
                    <div className="flex items-center justify-center h-full w-full">
                        <Spinner type="tail-spin" speed="0.75" />
                    </div>
                )}
                {!isConversationsLoading &&
                    conversations.map((convo) =>
                        convo.id === refreshingConversationId ? (
                            <div key={convo.id} className="px-3 py-2 rounded-lg truncate min-h-10 text-muted-foreground flex items-center">
                                <Spinner type="line-wobble" size="20" />
                            </div>
                        ) : (
                            <div
                                key={convo.id}
                                className={cn("px-3 py-2 rounded-lg cursor-pointer hover:bg-sidebar-accent truncate min-h-10", convo.id === activeConversationId && "bg-sidebar-accent")}
                                onClick={() => handleOpenConversation(convo.id)}
                            >
                                {convo.title || "Untitled Conversation"}
                            </div>
                        )
                    )}
            </main>

            <footer className="flex flex-col gap-1 border-t border-border pt-4 shrink-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name ?? ""}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <Button variant="default" className="cursor-pointer mt-2 w-full" onClick={handleLogout}>
                    Logout
                </Button>
            </footer>
        </div>
    );
};

export default Sidebar;
