"use client";

import React from "react";
import { Mic, MessageSquare, ClipboardList, Map, Video, Palette, Search, Target, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface ContextItem {
    id: string;
    name: string;
    type: string;
    status: 'indexed' | 'indexing' | 'error';
    tokenCount: number;
    active: boolean;
    createdAt: string;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'interview': return <Mic className="h-4 w-4" />;
        case 'slack': return <MessageSquare className="h-4 w-4" />;
        case 'jira': return <ClipboardList className="h-4 w-4" />;
        case 'roadmap': return <Map className="h-4 w-4" />;
        case 'meeting': return <Video className="h-4 w-4" />;
        case 'figma': return <Palette className="h-4 w-4" />;
        case 'competitive': return <Search className="h-4 w-4" />;
        case 'okr': return <Target className="h-4 w-4" />;
        default: return <ClipboardList className="h-4 w-4" />;
    }
};

interface ContextItemProps {
    item: ContextItem;
    onToggle: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}

export function ContextItemComponent({ item, onToggle, onDelete }: ContextItemProps) {
    return (
        <div className="group flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors border-b border-zinc-900/50">
            <div className={cn(
                "p-1.5 rounded-md",
                item.active ? "text-green-400 bg-green-500/10" : "text-muted-foreground bg-muted/20"
            )}>
                {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-xs truncate font-medium",
                        item.active ? "text-foreground" : "text-muted-foreground line-through opacity-50"
                    )}>
                        {item.name}
                    </span>
                    {item.status === 'indexing' && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>{item.tokenCount.toLocaleString()} tkn</span>
                    <span>•</span>
                    <span>{item.type}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 hover:text-red-400 text-muted-foreground transition-colors"
                    title="Remove Context"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
                <Switch
                    checked={item.active}
                    onCheckedChange={(val) => onToggle(item.id, val)}
                    className="h-4 w-7 scale-75"
                />
            </div>
        </div>
    );
}
