import React from "react";

export function AppShell({
    nav,
    chat,
    canvas
}: {
    nav: React.ReactNode
    chat: React.ReactNode
    canvas: React.ReactNode
}) {
    return (
        <div className="grid h-full w-full grid-cols-[250px_1fr_350px] overflow-hidden border rounded-lg bg-background text-foreground shadow-xl">
            {/* The Navigator (Left Sidebar) */}
            <div className="flex flex-col overflow-hidden bg-muted/20 border-r border-border/50">
                <div className="h-full p-4 overflow-y-auto">{nav}</div>
            </div>

            {/* The Codex Canvas (Main Stage) */}
            <div className="flex flex-col relative overflow-hidden bg-background">
                <div className="h-full p-4 overflow-y-auto">{canvas}</div>
            </div>

            {/* The Matrix Stream (Right Sidebar / Action Terminal) */}
            <div className="flex flex-col overflow-hidden bg-muted/10 border-l border-border/50 shadow-inner">
                <div className="h-full p-4 overflow-y-auto">{chat}</div>
            </div>
        </div>
    );
}
