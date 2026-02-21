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

function AnalyticsOverview() {
    return (
        <div className="flex flex-col h-full bg-background border-l border-border/10 p-8">
            <h1 className="text-2xl font-bold mb-6 font-mono border-b border-border/30 pb-4">Usage Intelligence</h1>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
                    <h3 className="font-mono text-sm text-green-500 mb-2">ACTIVE USERS</h3>
                    <div className="text-3xl font-bold">0</div>
                </div>
                <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
                    <h3 className="font-mono text-sm text-green-500 mb-2">CHURN RISK</h3>
                    <div className="text-3xl font-bold">Low</div>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm border border-dashed border-border/50 rounded-lg">
                Connect tracking data sources to view analytics.
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <main className="h-screen w-full overflow-hidden bg-background relative">
            <Omnibar />
            <AppShell
                nav={<NavPanel onOpenSettings={() => setIsSettingsOpen(true)} />}
                chat={<ChatPanel />}
                canvas={<AnalyticsOverview />}
            />
            <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </main>
    );
}
