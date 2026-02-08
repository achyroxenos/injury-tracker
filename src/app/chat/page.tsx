import { ChatInterface } from "@/components/chat/chat-interface";
import { Suspense } from "react";

export default function ChatPage() {
    return (
        <div className="max-w-md mx-auto">
            <Suspense>
                <ChatInterface />
            </Suspense>
        </div>
    );
}
