"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Mic, Lightbulb, Activity, FileSearch, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavPanel({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Chat", href: "/chat", icon: MessageSquare },
        { name: "Interviews", href: "/interviews", icon: Mic },
        { name: "Feedback", href: "/feedback", icon: Lightbulb },
        { name: "Analytics", href: "/analytics", icon: Activity },
        { name: "Discoveries", href: "/discoveries", icon: FileSearch },
    ];

    return (
        <div className="space-y-4 font-mono text-sm py-2">
            <div className="px-3 pb-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">PHANTOM</h2>
                <div className="text-xs text-muted-foreground mt-1">PM Operating System</div>
            </div>

            <nav className="space-y-1 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-green-500/10 text-green-400 font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </button>
            </div>
        </div>
    );
}
