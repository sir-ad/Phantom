"use client";

import React, { useState } from "react";
import dynamicImport from "next/dynamic";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Omnibar } from "@/components/ui/Omnibar";
import { SettingsOverlay } from "@/components/layout/SettingsOverlay";
import { NavPanel } from "@/components/layout/NavPanel";

const AppShell = dynamicImport(() => import("@/components/layout/AppShell").then(mod => mod.AppShell), {
    ssr: false,
    loading: () => <div className="h-screen w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Workspace...</div>
});

export const dynamic = 'force-dynamic';

function FeedbackOverview() {
    return (
        <div className="flex flex-col h-full bg-background border-l border-border/10 p-8">
            <h1 className="text-2xl font-bold mb-6 font-mono border-b border-border/30 pb-4">Feedback Hub</h1>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
                    <h3 className="font-mono text-sm text-green-500 mb-2">TOTAL FEEDBACK</h3>
                    <div className="text-3xl font-bold">1,204</div>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
                    <h3 className="font-mono text-sm text-green-500 mb-2">ACTIVE THEMES</h3>
                    <div className="text-3xl font-bold">8</div>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
                    <h3 className="font-mono text-sm text-green-500 mb-2">INTEGRATIONS</h3>
                    <div className="text-3xl font-bold">3 connected</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4">
                <h2 className="text-lg font-bold font-mono text-muted-foreground mb-4">Trending Feature Requests</h2>
                <div className="space-y-3">
                    {[
                        { id: 1, title: "Dark Mode Support", sources: 45, impact: "High" },
                        { id: 2, title: "Slack Integration", sources: 32, impact: "Medium" },
                        { id: 3, title: "Role-Based Access Control", sources: 18, impact: "High" },
                    ].map(req => (
                        <div key={req.id} className="flex items-center justify-between bg-muted/5 border border-border/30 rounded-lg p-4 hover:border-green-500/30 transition-colors">
                            <div>
                                <div className="font-bold text-green-400">{req.title}</div>
                                <div className="text-xs text-muted-foreground mt-1 font-mono">Mentions across Intercom, Zendesk</div>
                            </div>
                            <div className="flex items-center gap-6 font-mono text-sm text-right">
                                <div>
                                    <div className="text-muted-foreground text-xs">Sources</div>
                                    <div>{req.sources}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground text-xs">Impact</div>
                                    <div className={req.impact === 'High' ? 'text-green-500' : 'text-yellow-500'}>{req.impact}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FeedbackPage() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <main className="h-screen w-full overflow-hidden bg-background relative">
            <Omnibar />
            <AppShell
                nav={<NavPanel onOpenSettings={() => setIsSettingsOpen(true)} />}
                chat={<ChatPanel />}
                canvas={<FeedbackOverview />}
            />
            <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </main>
    );
}
