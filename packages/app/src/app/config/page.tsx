'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Save, Server, ShieldCheck } from "lucide-react"

interface PhantomConfig {
    apiKeys: Record<string, string>;
    mcp: {
        enabled: boolean;
        server_mode: string;
    };
    memory: {
        enabled: boolean;
    };
    autonomy?: {
        heartbeatEnabled: boolean;
        heartbeatIntervalMin: number;
        toolRules: Record<string, 'auto-approve' | 'require-human' | 'blocked'>;
    };
}

export default function ConfigPage() {
    const [config, setConfig] = useState<PhantomConfig | null>(null);
    const [ollamaStatus, setOllamaStatus] = useState<{ online: boolean; models: string[] }>({ online: false, models: [] });
    const [detectingOllama, setDetectingOllama] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
        detectOllama();
    }, []);

    const detectOllama = async () => {
        setDetectingOllama(true);
        try {
            const res = await fetch('/api/models/ollama');
            const data = await res.json();
            if (res.ok) {
                setOllamaStatus({ online: true, models: data.models || [] });
            } else {
                setOllamaStatus({ online: false, models: [] });
            }
        } catch {
            setOllamaStatus({ online: false, models: [] });
        } finally {
            setDetectingOllama(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/config');
            const data = await res.json();
            setConfig(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        try {
            await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateApiKey = (service: string, value: string) => {
        if (!config) return;
        setConfig({
            ...config,
            apiKeys: { ...config.apiKeys, [service]: value }
        });
    };

    const toggleMemory = (checked: boolean) => {
        if (!config) return;
        setConfig({
            ...config,
            memory: { ...config.memory, enabled: checked }
        });
    };

    const toggleHeartbeat = (checked: boolean) => {
        if (!config) return;
        setConfig({
            ...config,
            autonomy: { ...(config.autonomy || { heartbeatIntervalMin: 30, toolRules: {} }), heartbeatEnabled: checked }
        });
    };

    const updateHeartbeatInterval = (val: string) => {
        if (!config) return;
        setConfig({
            ...config,
            autonomy: { ...(config.autonomy || { heartbeatEnabled: false, toolRules: {} }), heartbeatIntervalMin: parseInt(val) || 30 }
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-green-500"><Loader2 className="animate-spin h-8 w-8" /></div>;

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-8">
            <header className="mb-8 flex items-center justify-between border-b border-green-900/30 pb-4">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">System Configuration</h1>
                    <p className="text-xs text-green-700 mt-1">Manage Adapters, Memory, and Security.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-900/50 hover:bg-green-800 text-green-100 border border-green-700"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* API Keys / Adapters */}
                <Card className="bg-black border-green-900/40 text-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server className="h-4 w-4" /> Adapters & API Keys</CardTitle>
                        <CardDescription className="text-green-800">Configure connection secrets for external channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {['openai', 'anthropic', 'slack', 'linear', 'discord', 'github'].map(service => (
                            <div key={service} className="space-y-1">
                                <Label className="text-xs uppercase">{service}</Label>
                                <Input
                                    type="password"
                                    value={config?.apiKeys?.[service] || ''}
                                    onChange={(e) => updateApiKey(service, e.target.value)}
                                    className="bg-green-950/20 border-green-900/50 text-green-400 focus-visible:ring-green-800"
                                    placeholder={`sk-...`}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Subsystems */}
                <Card className="bg-black border-green-900/40 text-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Subsystems</div>
                            {ollamaStatus.online ? (
                                <span className="text-[10px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">
                                    OLLAMA ONLINE
                                </span>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={detectOllama}
                                    className="h-6 text-[10px] text-green-800 hover:text-green-500 hover:bg-green-900/20"
                                    disabled={detectingOllama}
                                >
                                    {detectingOllama ? 'SCANNING...' : 'DETECT LOCAL AI'}
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription className="text-green-800">Toggle core engine features.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className={ollamaStatus.online ? "text-green-400" : ""}>Ollama Bridge (Local-First)</Label>
                                <p className="text-xs text-green-700">
                                    {ollamaStatus.online
                                        ? `Connected to local intelligence (${ollamaStatus.models.length} models found)`
                                        : "Local AI not detected. Start Ollama to run without API keys."}
                                </p>
                            </div>
                            <div className={cn("h-2 w-2 rounded-full", ollamaStatus.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-900")} />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-green-900/20">
                            <div className="space-y-0.5">
                                <Label>Crystal Memory</Label>
                                <p className="text-xs text-green-700">Enable explicit markdown-based memory (.phantom/memory/)</p>
                            </div>
                            <Switch
                                checked={config?.memory?.enabled ?? true}
                                onCheckedChange={toggleMemory}
                                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-green-900"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>MCP Server</Label>
                                <p className="text-xs text-green-700">Enable Model Context Protocol server</p>
                            </div>
                            <Switch
                                checked={config?.mcp?.enabled ?? false}
                                disabled
                                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-green-900 opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Autonomy & Security */}
                <Card className="bg-black border-red-900/40 text-red-500 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-400"><ShieldCheck className="h-4 w-4" /> Phantom Nexus Autonomy</CardTitle>
                        <CardDescription className="text-red-800">Control the background Daemon's operating permissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between border-b border-red-900/30 pb-4">
                            <div className="space-y-0.5">
                                <Label className="text-red-400">Daemon Heartbeat</Label>
                                <p className="text-xs text-red-800">Allow Phantom to wake up in the background and perform autonomous discovery.</p>
                            </div>
                            <Switch
                                checked={config?.autonomy?.heartbeatEnabled ?? false}
                                onCheckedChange={toggleHeartbeat}
                                className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-red-900"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-red-400">Heartbeat Interval (Minutes)</Label>
                            <Input
                                type="number"
                                min="5"
                                value={config?.autonomy?.heartbeatIntervalMin ?? 30}
                                onChange={(e) => updateHeartbeatInterval(e.target.value)}
                                className="bg-red-950/20 border-red-900/50 text-red-400 focus-visible:ring-red-800 max-w-[200px]"
                                disabled={!(config?.autonomy?.heartbeatEnabled ?? false)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
