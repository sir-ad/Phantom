"use client";

import React, { useState } from "react";
import dynamicImport from "next/dynamic";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Omnibar } from "@/components/ui/Omnibar";
import { SettingsOverlay } from "@/components/layout/SettingsOverlay";
import { NavPanel } from "@/components/layout/NavPanel";
import { cn } from "@/lib/utils";

const AppShell = dynamicImport(() => import("@/components/layout/AppShell").then(mod => mod.AppShell), {
    ssr: false,
    loading: () => <div className="h-screen w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Workspace...</div>
});

export const dynamic = 'force-dynamic';

function InterviewsOverview() {
    const mockInterviews = [
        { id: 1, name: "Acme Corp Customer Sync.mp3", status: "Analyzed", date: "2026-02-19", score: 8.5 },
        { id: 2, name: "UX Research - John Doe.wav", status: "Processing", date: "2026-02-20", score: null },
        { id: 3, name: "Sales Handoff - Q1.mp4", status: "Analyzed", date: "2026-02-18", score: 6.2 },
    ];

    return (
        <div className="flex flex-col h-full bg-background border-l border-border/10 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-border/30 pb-4">
                <h1 className="text-2xl font-bold font-mono">Interview Manager</h1>
                <button className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md font-mono text-sm transition-colors">
                    + Upload Interview
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="grid grid-cols-12 gap-4 text-xs text-muted-foreground font-mono px-4 pb-2 border-b border-border/20">
                    <div className="col-span-5 border-r border-border/20">FILE</div>
                    <div className="col-span-3 border-r border-border/20 pl-2">STATUS</div>
                    <div className="col-span-2 border-r border-border/20 pl-2">DATE</div>
                    <div className="col-span-2 pl-2">JTBD SCORE</div>
                </div>

                {mockInterviews.map((interview) => (
                    <div key={interview.id} className="grid grid-cols-12 gap-4 items-center bg-muted/5 border border-border/30 rounded-lg p-4 hover:border-green-500/30 transition-colors">
                        <div className="col-span-5 font-mono text-sm text-green-400 truncate pr-2">
                            {interview.name}
                        </div>
                        <div className="col-span-3 text-sm">
                            <span className={cn(
                                "px-2 py-1 text-xs rounded-md font-mono",
                                interview.status === "Analyzed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500 animate-pulse"
                            )}>
                                {interview.status}
                            </span>
                        </div>
                        <div className="col-span-2 text-muted-foreground text-sm font-mono">
                            {interview.date}
                        </div>
                        <div className="col-span-2 font-mono text-sm">
                            {interview.score ? (
                                <span className="text-green-500">{interview.score} / 10</span>
                            ) : (
                                <span className="text-muted-foreground">--</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function InterviewsPage() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <main className="h-screen w-full overflow-hidden bg-background relative">
            <Omnibar />
            <AppShell
                nav={<NavPanel onOpenSettings={() => setIsSettingsOpen(true)} />}
                chat={<ChatPanel />}
                canvas={<InterviewsOverview />}
            />
            <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </main>
    );
}
