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
}

export default function ConfigPage() {
    const [config, setConfig] = useState<PhantomConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

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
                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Subsystems</CardTitle>
                        <CardDescription className="text-green-800">Toggle core engine features.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
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
            </div>
        </div>
    );
}
