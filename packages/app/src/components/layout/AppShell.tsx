"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelRightClose, MessageSquare, Layout, Sidebar as SidebarIcon } from "lucide-react";

export function AppShell({
    nav,
    chat,
    canvas
}: {
    nav: React.ReactNode
    chat: React.ReactNode
    canvas: React.ReactNode
}) {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'canvas' | 'chat'>('canvas');
    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background">
            {/* Desktop / Large Screen Layout */}
            <div className="hidden md:grid h-full w-full grid-cols-[auto_1fr_auto] overflow-hidden">
                {/* The Navigator (Left Sidebar) */}
                <div className={cn(
                    "flex flex-col overflow-hidden bg-muted/20 border-r border-border/50 transition-all duration-300 relative",
                    isNavOpen ? "w-[260px]" : "w-[0px]"
                )}>
                    <div className="h-full p-4 overflow-y-auto whitespace-nowrap">{nav}</div>
                    <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 p-1 bg-background border border-border rounded-full hover:bg-muted transition-colors shadow-sm"
                    >
                        <SidebarIcon className={cn("h-3 w-3", !isNavOpen && "rotate-180")} />
                    </button>
                </div>

                {/* The Codex Canvas (Main Stage) */}
                <div className="flex flex-col relative overflow-hidden bg-background">
                    <div className="h-full p-4 overflow-y-auto">{canvas}</div>
                </div>

                {/* The Matrix Stream (Right Sidebar / Action Terminal) */}
                <div className={cn(
                    "flex flex-col overflow-hidden bg-muted/10 border-l border-border/50 shadow-inner transition-all duration-300 relative",
                    isChatOpen ? "w-[380px]" : "w-[0px]"
                )}>
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-50 p-1 bg-background border border-border rounded-full hover:bg-muted transition-colors shadow-sm"
                    >
                        <MessageSquare className={cn("h-3 w-3", !isChatOpen && "opacity-50")} />
                    </button>
                    <div className="h-full p-4 overflow-y-auto whitespace-nowrap">{chat}</div>
                </div>
            </div>

            {/* Mobile Layout (< 768px) */}
            <div className="flex flex-col md:hidden h-full w-full overflow-hidden">
                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'canvas' ? (
                        <div className="h-full overflow-y-auto p-4">{canvas}</div>
                    ) : (
                        <div className="h-full overflow-y-auto p-4">{chat}</div>
                    )}
                </div>

                {/* Mobile Tab Bar */}
                <div className="h-16 border-t border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-around px-6">
                    <button
                        onClick={() => setActiveTab('canvas')}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-colors",
                            activeTab === 'canvas' ? "text-green-500" : "text-muted-foreground"
                        )}
                    >
                        <Layout className="h-5 w-5" />
                        <span className="text-[10px] uppercase font-bold tracking-tighter">Canvas</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-colors",
                            activeTab === 'chat' ? "text-green-500" : "text-muted-foreground"
                        )}
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-[10px] uppercase font-bold tracking-tighter">Matrix</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
