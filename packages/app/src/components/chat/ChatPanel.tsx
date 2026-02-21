"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    intent?: any;
    result?: any;
}

export function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm Phantom. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const loadingPhases = [
        "Initializing synaptic bridge...",
        "Querying neural context...",
        "Analyzing intent patterns...",
        "Synthesizing response...",
        "Finalizing output stream..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingPhase(prev => (prev + 1) % loadingPhases.length);
            }, 2000);
        } else {
            setLoadingPhase(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent, retryContent?: string) => {
        e?.preventDefault();
        const userMessage = retryContent || input.trim();
        if (!userMessage || isLoading) return;

        if (!retryContent) setInput("");
        setError(null);

        // Only add to messages if it's not a retry (to avoid duplicates)
        if (!retryContent) {
            setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer phantom-local-dev-key'
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.result?.message || JSON.stringify(data.result),
                intent: data.intent,
                result: data.result
            }]);
        } catch (err: any) {
            setError(userMessage);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ [SYSTEM_INTERRUPT]: ${err.message}\n\nConnection to neural engine failed. Please verify configuration or retry.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn(
                        "w-full pb-4 border-b border-border/30 last:border-0",
                        msg.role === 'user' ? "text-foreground/80" : "text-foreground"
                    )}>
                        <div className="flex items-center gap-2 mb-1.5 opacity-60 text-xs">
                            {msg.role === 'user' ? (
                                <><span className="text-blue-400">user@phantom</span><span>~</span></>
                            ) : (
                                <><span className="text-green-500 font-bold">phantom</span><span className="animate-pulse">_</span></>
                            )}
                        </div>

                        <div className="pl-4 border-l-2 border-border/20">
                            <div className={cn(
                                "whitespace-pre-wrap leading-relaxed",
                                msg.content.includes("[SYSTEM_INTERRUPT]") && "text-amber-500/90 font-bold"
                            )}>
                                {msg.content}
                            </div>

                            {/* Debug view for intent */}
                            {msg.intent && (
                                <div className="text-xs text-muted-foreground mt-2 inline-block bg-muted/30 px-2 py-1 rounded">
                                    [Intent: {msg.intent.category} | Confidence: {Math.round(msg.intent.confidence * 100)}%]
                                </div>
                            )}

                            {/* Retry Action for System Interrupts */}
                            {msg.content.includes("[SYSTEM_INTERRUPT]") && error && idx === messages.length - 1 && (
                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={() => handleSubmit(undefined, error)}
                                        className="text-xs px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 transition-colors uppercase tracking-widest font-bold"
                                    >
                                        Execute Retry
                                    </button>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                                        className="text-xs px-3 py-1 bg-border/10 border border-border/30 text-foreground/50 hover:bg-border/20 transition-colors uppercase tracking-widest font-bold"
                                    >
                                        Config.sys
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="w-full pb-4">
                        <div className="flex items-center gap-2 mb-1.5 opacity-60 text-xs text-green-500 font-bold">
                            <span>phantom</span><span className="animate-pulse">_</span>
                        </div>
                        <div className="pl-4 border-l-2 border-border/20 flex items-center gap-2 text-green-500/70">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="animate-pulse">{loadingPhases[loadingPhase]}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border/50 bg-background">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-mono text-sm leading-none select-none">
                        ❯
                    </div>
                    <input
                        className="w-full py-3 pl-8 pr-12 font-mono text-sm border border-border/30 rounded bg-muted/10 focus:outline-none focus:ring-1 focus:ring-green-500/50 transition-all placeholder:text-muted-foreground/50"
                        placeholder="execute_command --target all..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
    )
}
