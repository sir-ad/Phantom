import React, { useState } from 'react';

interface SettingsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsOverlay({ isOpen, onClose }: SettingsOverlayProps) {
    const [activeTab, setActiveTab] = useState<'models' | 'mcp' | 'os'>('models');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[800px] max-w-[90vw] max-h-[85vh] h-[600px] border border-border/50 bg-background rounded-xl shadow-2xl flex flex-col overflow-hidden text-foreground">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-muted/20">
                    <h2 className="text-xl font-bold tracking-tight">Phantom OS Control Center</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl font-light">&times;</button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-border/30 bg-muted/10 p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('models')}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'models' ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            AI Inference Providers
                        </button>
                        <button
                            onClick={() => setActiveTab('mcp')}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mcp' ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            MCP Connections (Context)
                        </button>
                        <button
                            onClick={() => setActiveTab('os')}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'os' ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            OS-Claws (Edge Nodes)
                        </button>
                    </div>

                    {/* Content */}
                    <div className="w-2/3 p-6 overflow-y-auto">
                        {activeTab === 'models' && <ModelsView />}
                        {activeTab === 'mcp' && <McpView />}
                        {activeTab === 'os' && <OSView />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModelsView() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-1">Local & Offline (Ollama)</h3>
                <p className="text-xs text-muted-foreground mb-4">Run entirely private, uncensored intelligence locally.</p>
                <div className="grid grid-cols-2 gap-3">
                    {['llama3.1:70b', 'qwen2.5:72b', 'deepseek-coder-v2', 'phi3:mini', 'gemma2:27b', 'mistral-nemo'].map(m => (
                        <div key={m} className="px-3 py-2 border border-border/40 rounded-md bg-muted/30 text-sm font-mono flex items-center justify-between">
                            {m}
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-border/40"></div>

            <div>
                <h3 className="text-lg font-semibold mb-1">Frontier Models</h3>
                <p className="text-xs text-muted-foreground mb-4">API keys for state-of-the-art superintelligence.</p>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Anthropic API Key (claude-3-7-sonnet)</label>
                        <input type="password" placeholder="sk-ant-..." className="w-full mt-1 bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50" value="************************" readOnly />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">OpenAI API Key (o3-mini)</label>
                        <input type="password" placeholder="sk-proj-..." className="w-full mt-1 bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Google API Key (gemini-3.1-pro)</label>
                        <input type="password" placeholder="AIzaSy..." className="w-full mt-1 bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function McpView() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-1">Rowboat Knowledge Graph Nodes</h3>
            <p className="text-xs text-muted-foreground mb-6">Manage external intelligence sources mapped directly into your Semantic Context Engine.</p>

            <div className="flex border border-border/50 rounded-lg p-4 bg-muted/10 items-center justify-between">
                <div>
                    <h4 className="font-medium text-sm">Notion MCP Server</h4>
                    <p className="text-xs text-muted-foreground">Sync PRDs and Docs</p>
                </div>
                <div className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">CONNECTED</div>
            </div>

            <div className="flex border border-border/50 rounded-lg p-4 bg-muted/10 items-center justify-between">
                <div>
                    <h4 className="font-medium text-sm">Jira Software Server</h4>
                    <p className="text-xs text-muted-foreground">Sync Sprints and Epics</p>
                </div>
                <div className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded">CONNECTED</div>
            </div>

            <div className="flex border border-border/50 rounded-lg p-4 bg-muted/10 items-center justify-between">
                <div>
                    <h4 className="font-medium text-sm">Slack Communications</h4>
                    <p className="text-xs text-muted-foreground">Contextualize team conversations</p>
                </div>
                <button className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90">Connect Node</button>
            </div>
        </div>
    );
}

function OSView() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-1">OpenClaw Gateway</h3>
            <p className="text-xs text-muted-foreground mb-6">Connect local telemetry agents allowing Phantom to click, type, and look around your actual operating system.</p>

            <div className="space-y-3">
                <div className="flex border border-border/50 rounded-lg p-4 bg-muted/10 items-center justify-between">
                    <div>
                        <h4 className="font-mono text-sm">edge-node-x7z9</h4>
                        <p className="text-xs text-muted-foreground font-mono">127.0.0.1 (MacBook Pro M3)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Capabilities: [Screenshot, Mouse, Bash]</span>
                        <div className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded ml-2">ONLINE</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
                <h4 className="text-sm font-medium mb-2">Connect New Node</h4>
                <code className="block p-3 bg-black/50 text-green-400 rounded text-xs font-mono">
                    npx @phantom-pm/os-agent --gateway ws://127.0.0.1:8080/os-claws
                </code>
            </div>
        </div>
    );
}
