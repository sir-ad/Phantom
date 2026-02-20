import { z } from 'zod';

export type MemoryCategory = 'decision' | 'protocol' | 'incident' | 'context' | 'scratchpad';

export interface MemoryEntry {
    id: string;
    path: string;
    category: MemoryCategory;
    title: string;
    content: string;
    lastModified: number;
    metadata?: Record<string, any>;
}

export interface MemorySearchResult {
    entry: MemoryEntry;
    score: number;
    snippet: string;
}

export const MemoryConfigSchema = z.object({
    basePath: z.string().default('.phantom/memory'),
    enabled: z.boolean().default(true),
});

export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;
