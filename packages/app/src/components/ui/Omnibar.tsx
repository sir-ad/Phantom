"use client";

import { Search, Terminal, Command } from "lucide-react";
import { useState, useEffect } from "react";

export function Omnibar() {
    const [isFocused, setIsFocused] = useState(false);
    const [input, setInput] = useState("");

    // Simulate Cmd+K focus (basic implementation)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('omnibar-input')?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        // Broadcast event or handle command execution here
        console.log("Executing global command:", input);
        setInput("");
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
            <form
                onSubmit={handleSubmit}
                className={`relative flex items-center bg-background border rounded-lg shadow-2xl transition-all duration-200 ${isFocused ? 'ring-2 ring-primary/50 border-primary shadow-primary/10' : 'border-border/50 hover:border-border'
                    }`}
            >
                <div className="pl-4 pr-2 text-muted-foreground flex items-center">
                    <Terminal className="h-5 w-5 text-primary/80" />
                </div>

                <input
                    id="omnibar-input"
                    className="flex-1 bg-transparent border-none outline-none py-3 text-base text-foreground placeholder:text-muted-foreground/70"
                    placeholder="Ask Phantom or run a command (e.g., 'Draft PRD', 'Analyze interviews')..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete="off"
                />

                <div className="px-3 flex items-center gap-1">
                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <Command className="h-3 w-3" />
                        <span>K</span>
                    </kbd>
                </div>
            </form>
        </div>
    );
}
