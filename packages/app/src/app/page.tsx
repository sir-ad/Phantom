"use client";

import React, { useState } from "react";
import dynamicImport from "next/dynamic";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CanvasPanel } from "@/components/canvas/CanvasPanel";
import { Omnibar } from "@/components/ui/Omnibar";
import { SettingsOverlay } from "@/components/layout/SettingsOverlay";

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
        canvas={<CanvasPanel />}
      />
      <SettingsOverlay isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}

function NavPanel({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Phantom</h2>
      <nav className="space-y-2">
        <div className="p-2 hover:bg-muted rounded cursor-pointer">Projects</div>
        <div className="p-2 hover:bg-muted rounded cursor-pointer">Data Sources</div>
        <div className="p-2 hover:bg-muted rounded cursor-pointer" onClick={onOpenSettings}>Settings</div>
      </nav>
    </div>
  )
}
