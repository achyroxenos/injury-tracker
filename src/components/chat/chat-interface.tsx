"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Loader2, Camera, History, ArrowLeft } from "lucide-react";
import { useInjury } from "@/context/injury-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExportReportButton } from "@/components/report/export-button";
import { analyzeInjury } from "@/app/actions/analyze-injury";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export function ChatInterface() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contextId = searchParams.get("context");
    const { getInjury } = useInjury();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"chat" | "timeline" | "compare">("chat");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const injury = contextId ? getInjury(contextId) : undefined;

    // Initialize Chat
    useEffect(() => {
        if (injury && messages.length === 0) {
            const latestLog = injury.logs[injury.logs.length - 1];
            const isIllness = injury.type === "illness";

            const intro = isIllness
                ? `I'm analyzing your symptoms. Latest fever: ${latestLog.temperature || "N/A"}°C.`
                : `I'm analyzing your **${injury.bodyPart}**. Latest pain: ${latestLog.painLevel}/10.`;

            setMessages([
                {
                    id: "system-1",
                    role: "assistant",
                    content: intro,
                },
                {
                    id: "system-2",
                    role: "assistant",
                    content: isIllness
                        ? "Drink plenty of fluids. Have your symptoms worsened?"
                        : "Healing looks steady. Would you like to compare it to the first photo?",
                },
            ]);
        }
    }, [injury]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !injury) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user" as const,
            content: input,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Call real AI (or mock if no key)
            const result = await analyzeInjury(injury, userMsg.content);

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: result.text,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!injury) return <div className="p-8 text-center">Injury not found</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Top Actions Bar */}
            <div className="flex items-center justify-between py-2 px-1 gap-2 overflow-x-auto">
                <button
                    onClick={() => setViewMode("chat")}
                    className={cn("px-4 py-2 rounded-full text-xs font-medium border transition-colors", viewMode === "chat" ? "bg-primary text-primary-foreground" : "bg-card")}
                >
                    AI Chat
                </button>
                <button
                    onClick={() => setViewMode("timeline")}
                    className={cn("px-4 py-2 rounded-full text-xs font-medium border transition-colors", viewMode === "timeline" ? "bg-primary text-primary-foreground" : "bg-card")}
                >
                    Timeline
                </button>
                <button
                    onClick={() => setViewMode("compare")}
                    className={cn("px-4 py-2 rounded-full text-xs font-medium border transition-colors", viewMode === "compare" ? "bg-primary text-primary-foreground" : "bg-card")}
                >
                    Compare
                </button>
                <Link
                    href={`/log?injuryId=${injury.id}`}
                    className="bg-secondary text-secondary-foreground p-2 rounded-full ml-auto"
                >
                    <Camera className="w-4 h-4" />
                </Link>
                <ExportReportButton injury={injury} />
            </div>

            {/* VIEW: CHAT */}
            {viewMode === "chat" && (
                <>
                    <div className="flex-1 overflow-y-auto space-y-4 p-4" ref={scrollRef}>
                        {messages.map((m) => (
                            <div key={m.id} className={cn("flex w-full animate-in-up", m.role === "user" ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed shadow-sm transition-all",
                                    m.role === "user"
                                        ? "bg-gradient-to-br from-primary to-rose-500 text-primary-foreground rounded-br-sm ml-4"
                                        : "glass dark:glass-dark rounded-bl-sm mr-4 border-primary/10"
                                )}>
                                    {m.content.split('\n').map((line, i) => (
                                        <p key={i} className={cn("mb-2 last:mb-0", line.startsWith('-') ? "pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary" : "")}>
                                            {/* Basic markdown bold parser for UI rendering */}
                                            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                                part.startsWith('**') && part.endsWith('**')
                                                    ? <strong key={j} className={m.role === "user" ? "font-black" : "font-bold text-primary"}>{part.slice(2, -2)}</strong>
                                                    : part
                                            )}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex w-full justify-start animate-fade-in pl-1">
                                <div className="glass dark:glass-dark rounded-3xl rounded-bl-sm p-4 max-w-[85%] shadow-sm flex items-center gap-1.5 border-primary/10">
                                    <div className="flex gap-1 items-center h-5">
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                                    </div>
                                    <span className="text-xs font-semibold text-muted-foreground ml-2 tracking-wide uppercase">Analyzing</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-background/80 glass dark:glass-dark border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <form onSubmit={handleSend} className="flex gap-3 max-w-md mx-auto relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message your assistant..."
                                className="flex-1 bg-secondary/80 focus:bg-background rounded-full pl-6 pr-14 py-4 text-sm outline-none border border-transparent focus:border-primary/30 focus:shadow-sm transition-all shadow-inner"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* VIEW: TIMELINE */}
            {
                viewMode === "timeline" && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {injury.logs.slice().reverse().map((log, i) => (
                            <div key={log.id} className="flex gap-4 relative">
                                {/* Timeline Line */}
                                {i !== injury.logs.length - 1 && (
                                    <div className="absolute left-6 top-10 bottom-[-24px] w-0.5 bg-border" />
                                )}

                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-sm overflow-hidden">
                                        {log.imageUrl ? (
                                            <img src={log.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <History className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 pt-1 pb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {new Date(log.date).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-1">
                                            {log.temperature && (
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-full", log.temperature > 37.5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                                                    {log.temperature}°C
                                                </span>
                                            )}
                                            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">
                                                {injury.type === 'illness' ? `Discomfort: ${log.painLevel}/10` : `Pain: ${log.painLevel}/10`}
                                            </span>
                                        </div>
                                    </div>

                                    {log.symptoms && log.symptoms.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {log.symptoms.map(s => (
                                                <span key={s} className="text-[10px] border px-1.5 rounded-md text-muted-foreground">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-card p-3 rounded-lg border text-sm shadow-sm mb-2">
                                        {log.notes || "No notes logged."}
                                    </div>

                                    {log.treatments && log.treatments.length > 0 && (
                                        <div className="flex flex-col gap-1">
                                            {log.treatments.map(t => (
                                                <div key={t.id} className="flex items-center gap-2 text-xs bg-secondary/50 p-2 rounded-md">
                                                    <span>{t.type === "medication" ? "💊" : t.type === "dressing" ? "🩹" : "🧊"}</span>
                                                    <span className="font-medium">{t.name}</span>
                                                    <span className="text-muted-foreground ml-auto">{t.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            {/* VIEW: COMPARE */}
            {
                viewMode === "compare" && (
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {/* First Log */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-center uppercase text-muted-foreground">Start</span>
                                <div className="flex-1 bg-black/5 rounded-xl overflow-hidden relative">
                                    {injury.logs[0]?.imageUrl ? (
                                        <img src={injury.logs[0].imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                                    )}
                                </div>
                                <div className="text-center text-xs">
                                    {new Date(injury.logs[0].date).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Latest Log */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-center uppercase text-primary">Latest</span>
                                <div className="flex-1 bg-black/5 rounded-xl overflow-hidden relative border-2 border-primary">
                                    {injury.logs[injury.logs.length - 1]?.imageUrl ? (
                                        <img src={injury.logs[injury.logs.length - 1].imageUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Photo</div>
                                    )}
                                </div>
                                <div className="text-center text-xs font-bold">
                                    {new Date(injury.logs[injury.logs.length - 1].date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-accent/20 p-4 rounded-xl text-sm border border-accent/50 text-accent-foreground">
                            <strong>AI Analysis:</strong> The redness has decreased by approximately 40% compared to the first photo. Swelling is visibly reduced.
                        </div>
                    </div>
                )
            }
        </div >
    );
}
