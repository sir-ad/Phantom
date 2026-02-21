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

function DiscoveriesOverview() {
    return (
        <div className="flex flex-col h-full bg-background border-l border-border/10 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-border/30 pb-4">
                <h1 className="text-2xl font-bold font-mono">Discovery Reports</h1>
                <button className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md font-mono text-sm transition-colors">
                    Run Discovery Loop
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4 overflow-y-auto">
                {[
                    { id: 1, title: "Enterprise SSO Demand", type: "Opportunity", score: 92, evidence: "14 interviews, 45 support tickets", date: "2-hours ago" },
                    { id: 2, title: "Mobile App Performance Degradation", type: "Risk", score: 85, evidence: "Analytics anomaly: +200ms TTFB", date: "1-day ago" },
                    { id: 3, title: "Configurable Webhooks", type: "Opportunity", score: 76, evidence: "22 feature requests", date: "3-days ago" },
                ].map(item => (
                    <div key={item.id} className="flex flex-col bg-muted/5 border border-border/30 rounded-lg p-5 hover:border-green-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-green-400 group-hover:text-green-300 transition-colors">{item.title}</h3>
                            <div className="flex items-center gap-3 font-mono text-xs">
                                <span className={cn(
                                    "px-2 py-1 rounded",
                                    item.type === 'Opportunity' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {item.type}
                                </span>
                                <span className="text-muted-foreground">{item.date}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mt-4 font-mono text-sm">
                            <div className="text-muted-foreground">
                                <span className="text-foreground/50 text-xs block mb-1">EVIDENCE</span>
                                {item.evidence}
                            </div>
                            <div className="text-right">
                                <span className="text-foreground/50 text-xs block mb-1">CONFIDENCE SCORE</span>
                                <span className="text-green-500 font-bold text-xl">{item.score}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DiscoveriesPage() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <main className="h-screen w-full overflow-hidden bg-background relative">
            <Omnibar />
            <AppShell
                nav={<NavPanel onOpenSettings={() => setIsSettingsOpen(true)} />}
                chat={<ChatPanel />}
                canvas={<DiscoveriesOverview />}
            />
            <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </main>
    );
}
