'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, Save, RefreshCw } from "lucide-react"

interface MemoryFile {
    name: string;
}

export default function MemoryGardenerPage() {
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            fetchFileContent(selectedFile);
        }
    }, [selectedFile]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/memory');
            const data = await res.json();
            if (data.files) {
                setFiles(data.files);
                // Auto-select first file if none selected
                if (!selectedFile && data.files.length > 0) {
                    setSelectedFile(data.files[0]);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFileContent = async (filename: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/memory/${encodeURIComponent(filename)}`);
            const data = await res.json();
            if (data.content) {
                setContent(data.content);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedFile) return;
        setSaving(true);
        try {
            await fetch('/api/memory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: selectedFile, content }),
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-black text-green-500 font-mono overflow-hidden">
            {/* Sidebar: File List */}
            <div className="w-64 border-r border-green-900/30 flex flex-col">
                <div className="p-4 border-b border-green-900/30 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider">Crystal Memory</h2>
                    <Button variant="ghost" size="icon" onClick={fetchFiles} className="h-6 w-6">
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </div>
                <ScrollArea className="flex-1 p-2">
                    {files.map(file => (
                        <button
                            key={file}
                            onClick={() => setSelectedFile(file)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-xs hover:bg-green-900/20 rounded flex items-center gap-2",
                                selectedFile === file && "bg-green-900/30 text-green-400 font-bold"
                            )}
                        >
                            <FileText className="h-3 w-3" />
                            {file}
                        </button>
                    ))}
                </ScrollArea>
            </div>

            {/* Main: Editor */}
            <div className="flex-1 flex flex-col">
                <div className="h-12 border-b border-green-900/30 flex items-center justify-between px-4 bg-black/50">
                    <span className="text-xs text-green-600">{selectedFile || 'No file selected'}</span>
                    <div className="flex items-center gap-2">
                        {saving && <span className="text-xs text-green-800 animate-pulse">Saving...</span>}
                        <Button
                            onClick={handleSave}
                            disabled={saving || !selectedFile}
                            className="h-7 text-xs bg-green-900/50 hover:bg-green-800 text-green-100 border border-green-700"
                        >
                            <Save className="h-3 w-3 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>
                <div className="flex-1 p-0 relative">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full resize-none bg-black text-green-400 font-mono p-4 border-0 focus-visible:ring-0 text-sm leading-relaxed"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
