"use client";

import React, { useState } from "react";
import dynamicImport from "next/dynamic";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasPanel } from "@/components/canvas/CanvasPanel";
import { Omnibar } from "@/components/ui/Omnibar";
import { SettingsOverlay } from "@/components/layout/SettingsOverlay";
import { NavPanel } from "@/components/layout/NavPanel";
import { ContextPanel } from "@/components/context/ContextPanel";

const AppShell = dynamicImport(() => import("@/components/layout/AppShell").then(mod => mod.AppShell), {
    ssr: false,
    loading: () => <div className="h-screen w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Workspace...</div>
});

export const dynamic = 'force-dynamic';

export default function ChatPage() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <main className="h-screen w-full overflow-hidden bg-background relative">
            <Omnibar />
            <AppShell
                nav={
                    <div className="flex h-full divide-x divide-zinc-900">
                        <NavPanel onOpenSettings={() => setIsSettingsOpen(true)} />
                        <ContextPanel />
                    </div>
                }
                chat={<ChatPanel />}
                canvas={<CanvasPanel />}
            />
            <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </main>
    );
}
