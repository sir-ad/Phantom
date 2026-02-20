"use client";

import { useState } from "react";
import { FileText, Code, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhantomArtifact } from "@/lib/types";
import { Sandpack } from "@codesandbox/sandpack-react";

// Mock initial artifact for demonstration
const INITIAL_ARTIFACT: PhantomArtifact = {
    id: '1',
    type: 'markdown',
    title: 'Welcome to Phantom',
    content: `# Phantom Workspace\n\nThis is your space for Product Strategy.\n\n- **Chat** on the left to analyze data.\n- **Canvas** on the right to edit artifacts.\n\nTry asking: "Draft a PRD for a new login flow or build me a React component."`,
    version: 1,
    status: 'synced'
};

export function CanvasPanel() {
    const [activeArtifact, setActiveArtifact] = useState<PhantomArtifact>(INITIAL_ARTIFACT);

    return (
        <div className="flex flex-col h-full bg-background border-l border-border/10">
            <div className="border-b border-border/30 px-4 py-3 flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{activeArtifact.title}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                        v{activeArtifact.version}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded font-mono">
                        <Check className="h-3 w-3" />
                        {activeArtifact.status === 'synced' ? 'SYNCED' : 'DRAFT'}
                    </div>
                    <div className="h-4 w-px bg-border/50"></div>
                    <button
                        onClick={() => alert("Edit mode activated (Phase 0 stub)")}
                        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                        [EDIT]
                    </button>
                    <button
                        onClick={() => alert("Share link copied to clipboard (Phase 0 stub)")}
                        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                        [SHARE]
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative">
                {/* Decorative grid background for Matrix/Codex feel */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                {activeArtifact.type === 'component' ? (
                    <div className="h-full relative z-10 rounded-lg overflow-hidden border border-border/30">
                        <Sandpack
                            template="react-ts"
                            theme="dark"
                            files={{
                                "/App.tsx": activeArtifact.content,
                            }}
                            options={{
                                showNavigator: false,
                                showTabs: true,
                                editorHeight: 'calc(100vh - 200px)',
                            }}
                        />
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto relative z-10 font-mono text-sm leading-relaxed text-foreground/90">
                        <pre className="whitespace-pre-wrap font-mono">
                            {activeArtifact.content}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
