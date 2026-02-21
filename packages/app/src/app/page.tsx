"use client";

import React, { useState } from "react";
import dynamicImport from "next/dynamic";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasPanel } from "@/components/canvas/CanvasPanel";
import { Omnibar } from "@/components/ui/Omnibar";
import { SettingsOverlay } from "@/components/layout/SettingsOverlay";
import { NavPanel } from "@/components/layout/NavPanel";

const AppShell = dynamicImport(() => import("@/components/layout/AppShell").then(mod => mod.AppShell), {
  ssr: false,
  // Minimal loading state
  loading: () => <div className="h-screen w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading Workspace...</div>
});

// Force dynamic rendering to avoid static generation issues with client components
export const dynamic = 'force-dynamic';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="h-screen w-full overflow-hidden bg-background relative">
      <Omnibar />
      <AppShell
        nav={<NavPanel onOpenSettings={() => setIsSettingsOpen(true)} />}
        chat={<ChatPanel />}
        canvas={<DashboardOverview />}
      />
      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}

function DashboardOverview() {
  return (
    <div className="flex flex-col h-full bg-background border-l border-border/10 p-8">
      <h1 className="text-2xl font-bold mb-6 font-mono border-b border-border/30 pb-4">Product Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
          <h3 className="font-mono text-sm text-green-500 mb-2">INTELLIGENCE CONTEXT</h3>
          <div className="text-3xl font-bold">Health: 85%</div>
        </div>
        <div className="bg-muted/10 border border-border/50 rounded-lg p-6 hover:border-green-500/50 transition-colors">
          <h3 className="font-mono text-sm text-green-500 mb-2">ACTIVE OPPORTUNITIES</h3>
          <div className="text-3xl font-bold">12 tracked</div>
        </div>
      </div>
    </div>
  );
}
