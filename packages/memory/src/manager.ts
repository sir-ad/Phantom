import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { MemoryConfig, MemoryEntry, MemorySearchResult, MemoryCategory } from './types.js';

export class MemoryManager {
    private config: MemoryConfig;
    private basePath: string;

    constructor(config: MemoryConfig) {
        this.config = config;
        this.basePath = path.resolve(process.cwd(), config.basePath);
    }

    async initialize(): Promise<void> {
        if (!this.config.enabled) return;
        await fs.ensureDir(this.basePath);
        await fs.ensureDir(path.join(this.basePath, 'protocols'));

        // Initialize core files if they don't exist
        await this.ensureFile('active_context.md', '# Active Context\n\nNo active context.');
        await this.ensureFile('decisions.md', '# Decision Log\n\nNo decisions recorded yet.');
        await this.ensureFile('scratchpad.md', '# Agent Scratchpad\n\n');
    }

    private async ensureFile(filename: string, defaultContent: string): Promise<void> {
        const filePath = path.join(this.basePath, filename);
        if (!await fs.pathExists(filePath)) {
            await fs.writeFile(filePath, defaultContent, 'utf-8');
        }
    }

    async readEntry(filename: string): Promise<MemoryEntry | null> {
        const filePath = path.join(this.basePath, filename);
        if (!await fs.pathExists(filePath)) return null;

        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        const parsed = matter(content);

        return {
            id: filename,
            path: filePath,
            category: this.categorize(filename),
            title: filename.replace('.md', ''),
            content: parsed.content,
            lastModified: stats.mtimeMs,
            metadata: parsed.data
        };
    }

    async writeEntry(filename: string, content: string, metadata?: Record<string, any>): Promise<void> {
        const filePath = path.join(this.basePath, filename);
        const fileContent = matter.stringify(content, metadata || {});
        await fs.writeFile(filePath, fileContent, 'utf-8');
    }

    async appendToEntry(filename: string, text: string): Promise<void> {
        const filePath = path.join(this.basePath, filename);
        if (await fs.pathExists(filePath)) {
            await fs.appendFile(filePath, `\n${text}`, 'utf-8');
        } else {
            await this.writeEntry(filename, text);
        }
    }

    async listEntries(): Promise<string[]> {
        if (!await fs.pathExists(this.basePath)) return [];
        const files = await fs.readdir(this.basePath);
        return files.filter(f => f.endsWith('.md'));
    }

    private categorize(filename: string): MemoryCategory {
        if (filename === 'decisions.md') return 'decision';
        if (filename === 'active_context.md') return 'context';
        if (filename === 'scratchpad.md') return 'scratchpad';
        if (filename.includes('protocols/')) return 'protocol';
        return 'incident'; // Default fallback
    }

    getMemoryPath(): string {
        return this.basePath;
    }
}
