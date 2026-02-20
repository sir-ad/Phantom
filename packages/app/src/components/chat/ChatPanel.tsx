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
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer phantom-local-dev-key' // TODO: Load from env
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.result?.message || JSON.stringify(data.result),
                intent: data.intent,
                result: data.result
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ **Error**: ${error.message}\n\nPlease try again or check your connection.`
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
                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                            {/* Debug view for intent */}
                            {msg.intent && (
                                <div className="text-xs text-muted-foreground mt-2 inline-block bg-muted/30 px-2 py-1 rounded">
                                    [Intent: {msg.intent.category} | Confidence: {Math.round(msg.intent.confidence * 100)}%]
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
                        <div className="pl-4 border-l-2 border-border/20 flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Processing command...</span>
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
