"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, Info } from "lucide-react";
import { ContextItem, ContextItemComponent } from "./ContextItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ContextPanel() {
    const [items, setItems] = useState<ContextItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchContext = async () => {
        try {
            const res = await fetch('/api/context/list');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch context:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContext();
    }, []);

    const handleToggle = async (id: string, active: boolean) => {
        try {
            const res = await fetch('/api/context/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active })
            });
            if (res.ok) {
                setItems(curr => curr.map(item => item.id === id ? { ...item, active } : item));
            }
        } catch (error) {
            console.error('Failed to toggle context:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/context/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setItems(curr => curr.filter(item => item.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete context:', error);
        }
    };

    const handleAdd = async () => {
        const url = window.prompt("Enter a URL (Figma, Notion, or Web link):");
        if (!url) return;

        setUploading(true);
        try {
            const res = await fetch('/api/context/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'web', // Default, server will detect if it's figma
                    name: "", // Server will extract title
                    content: url
                })
            });
            if (res.ok) {
                const data = await res.json();
                setItems(curr => [...curr, data.item]);
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Failed to add context:', error);
            alert("Failed to connect to external link.");
        } finally {
            setUploading(false);
        }
    };

    const activeItems = items.filter(i => i.active);
    const inactiveItems = items.filter(i => !i.active);

    return (
        <div className="flex flex-col h-full bg-background border-r border-zinc-900 w-64">
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Context</h2>
                    <span className="bg-green-500/10 text-green-400 text-[10px] px-1.5 py-0.5 rounded-full border border-green-500/20">
                        {activeItems.length}
                    </span>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={uploading}
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-7 w-7 rounded-md hover:bg-green-500/10 hover:text-green-400 transition-colors"
                    )}
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </button>
            </div>

            <ScrollArea className="flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-50">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Indexing Brain...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="p-6 text-center space-y-3 opacity-40">
                        <Info className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-[10px] font-mono leading-relaxed">
                            No context loaded.<br />Load transcripts or docs to ground Phantom.
                        </p>
                    </div>
                ) : (
                    <div className="py-2">
                        {activeItems.length > 0 && (
                            <div className="mb-4">
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Active</div>
                                {activeItems.map(item => (
                                    <ContextItemComponent
                                        key={item.id}
                                        item={item}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}

                        {inactiveItems.length > 0 && (
                            <div>
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Stored</div>
                                {inactiveItems.map(item => (
                                    <ContextItemComponent
                                        key={item.id}
                                        item={item}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>

            <div className="p-3 border-t border-zinc-900 bg-zinc-950/50">
                <div className="flex items-start gap-2 p-2 rounded bg-zinc-900/50 border border-zinc-800/50">
                    <Info className="h-3 w-3 mt-0.5 text-zinc-500" />
                    <p className="text-[9px] text-zinc-400 leading-tight">
                        Active context is automatically injected into all AI prompts for grounding.
                    </p>
                </div>
            </div>
        </div>
    );
}
