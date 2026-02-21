// PHANTOM Core - Context Engine
// Deterministic local indexing for code, docs, images, and design assets.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { createHash } from 'crypto';
import { extname, join, relative, resolve } from 'path';
import { getConfig } from './config.js';
import { EmbeddingEngine, type Embedding } from './ai/embeddings.js';

export interface ContextLink {
  targetId: string;
  relation: 'mentions' | 'blocks' | 'implements' | 'resolves' | 'related' | 'author';
  weight: number;
}

export interface ContextEntry {
  id: string;
  type: 'code' | 'document' | 'image' | 'design' | 'data' | 'ticket' | 'message' | 'person';
  path: string;
  relativePath: string;
  content?: string;
  metadata: {
    size: number;
    extension: string;
    lastModified: string;
    language?: string;
    lines?: number;
    title?: string;
    author?: string;
  };
  indexed: boolean;
  indexedAt?: string;
  links?: ContextLink[]; // Knowledge Graph edges
}

export interface ContextStats {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byLanguage: Record<string, number>;
  healthScore: number;
}

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go', '.rs', '.java',
  '.kt', '.swift', '.c', '.cpp', '.h', '.cs', '.php', '.vue', '.svelte',
  '.html', '.css', '.scss', '.less', '.sql', '.graphql', '.proto',
]);

const DOC_EXTENSIONS = new Set([
  '.md', '.txt', '.rst', '.adoc', '.org', '.tex', '.pdf', '.docx',
]);

const IMAGE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico',
]);

const DESIGN_EXTENSIONS = new Set([
  '.fig', '.sketch', '.xd', '.psd', '.ai',
]);

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
  'venv', '.venv', 'target', '.gradle', 'vendor', '.phantom',
]);

const IGNORE_FILES = new Set([
  '.DS_Store', 'Thumbs.db', '.gitignore', 'package-lock.json',
  'yarn.lock', 'pnpm-lock.yaml',
]);

function detectLanguage(ext: string): string | undefined {
  const langMap: Record<string, string> = {
    '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript',
    '.jsx': 'JavaScript', '.py': 'Python', '.rb': 'Ruby',
    '.go': 'Go', '.rs': 'Rust', '.java': 'Java', '.kt': 'Kotlin',
    '.swift': 'Swift', '.c': 'C', '.cpp': 'C++', '.cs': 'C#',
    '.php': 'PHP', '.vue': 'Vue', '.svelte': 'Svelte',
    '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS',
    '.sql': 'SQL', '.graphql': 'GraphQL',
  };
  return langMap[ext];
}

function getFileType(ext: string): ContextEntry['type'] {
  if (CODE_EXTENSIONS.has(ext)) return 'code';
  if (DOC_EXTENSIONS.has(ext)) return 'document';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (DESIGN_EXTENSIONS.has(ext)) return 'design';
  return 'data';
}

function stableEntryId(path: string, size: number, mtimeIso: string): string {
  const digest = createHash('sha256')
    .update(`${path}|${size}|${mtimeIso}`)
    .digest('hex')
    .slice(0, 16);
  return `ctx_${digest}`;
}

interface PersistedContext {
  entries: ContextEntry[];
}

export class ContextEngine {
  private entries: Map<string, ContextEntry> = new Map();
  private basePath = '';
  private readonly storePath: string;
  private embeddingEngine: EmbeddingEngine | null = null;

  constructor() {
    const cfgDir = getConfig().getConfigDir();
    const contextDir = join(cfgDir, 'context');
    mkdirSync(contextDir, { recursive: true });
    this.storePath = join(contextDir, 'index.json');
    this.load();

    // Initialize embedding engine if we have AI capabilities
    this.initializeEmbeddings(contextDir);
  }

  private initializeEmbeddings(contextDir: string): void {
    try {
      this.embeddingEngine = new EmbeddingEngine(join(contextDir, 'embeddings'));
    } catch (error) {
      console.warn('Failed to initialize embedding engine:', error);
      this.embeddingEngine = null;
    }
  }

  private load(): void {
    if (!existsSync(this.storePath)) return;

    try {
      const raw = readFileSync(this.storePath, 'utf8');
      const parsed = JSON.parse(raw) as PersistedContext;
      this.entries.clear();
      for (const entry of parsed.entries || []) {
        if (entry?.path) {
          this.entries.set(entry.path, entry);
        }
      }
    } catch {
      this.entries.clear();
    }
  }

  private persist(): void {
    const payload: PersistedContext = {
      entries: Array.from(this.entries.values()).sort((a, b) => a.path.localeCompare(b.path)),
    };
    writeFileSync(this.storePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }

  async addPath(targetPath: string): Promise<ContextStats> {
    const resolvedPath = resolve(targetPath);
    if (!existsSync(resolvedPath)) {
      throw new Error(`Path not found: ${resolvedPath}`);
    }

    this.basePath = resolvedPath;
    const stat = statSync(resolvedPath);

    if (stat.isFile()) {
      this.indexFile(resolvedPath, resolvedPath);
    } else if (stat.isDirectory()) {
      this.indexDirectory(resolvedPath, resolvedPath);
    }

    this.persist();
    return this.getStats();
  }

  private indexDirectory(dirPath: string, basePath: string): void {
    const items = readdirSync(dirPath).sort();

    for (const item of items) {
      if (IGNORE_DIRS.has(item) || IGNORE_FILES.has(item)) continue;

      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        this.indexDirectory(fullPath, basePath);
      } else if (stat.isFile()) {
        this.indexFile(fullPath, basePath);
      }
    }
  }

  private indexFile(filePath: string, basePath: string): void {
    const ext = extname(filePath).toLowerCase();
    const stat = statSync(filePath);
    const type = getFileType(ext);
    const relPath = relative(basePath, filePath) || filePath;
    const lastModified = stat.mtime.toISOString();

    let content: string | undefined;
    let lines: number | undefined;

    // Read only text files and cap content to keep index deterministic and bounded.
    if (type === 'code' || type === 'document' || type === 'data') {
      try {
        if (stat.size <= 1_000_000) {
          content = readFileSync(filePath, 'utf8');
          lines = content.split('\n').length;
        }
      } catch {
        content = undefined;
        lines = undefined;
      }
    }

    const entry: ContextEntry = {
      id: stableEntryId(filePath, stat.size, lastModified),
      type,
      path: filePath,
      relativePath: relPath,
      content,
      metadata: {
        size: stat.size,
        extension: ext,
        lastModified,
        language: detectLanguage(ext),
        lines,
      },
      indexed: true,
      indexedAt: new Date().toISOString(),
    };

    this.entries.set(filePath, entry);

    // Create embedding for text-based files
    if (this.embeddingEngine && content) {
      this.createEmbeddingAsync(entry, content).catch(error => {
        console.warn(`Failed to create embedding for ${filePath}:`, error);
      });
    }
  }

  private async createEmbeddingAsync(entry: ContextEntry, content: string): Promise<void> {
    if (!this.embeddingEngine) return;

    await this.embeddingEngine.indexEntry(
      entry.id,
      entry.path,
      entry.relativePath,
      entry.type,
      content,
      {
        language: entry.metadata.language,
        lines: entry.metadata.lines,
        size: entry.metadata.size,
        lastModified: entry.metadata.lastModified,
      }
    );
  }

  getStats(): ContextStats {
    const byType: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};
    let totalSize = 0;

    for (const entry of this.entries.values()) {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
      if (entry.metadata.language) {
        byLanguage[entry.metadata.language] = (byLanguage[entry.metadata.language] || 0) + 1;
      }
      totalSize += entry.metadata.size;
    }

    const hasCode = (byType.code || 0) > 0;
    const hasDocs = (byType.document || 0) > 0;
    const hasDesign = (byType.image || 0) > 0 || (byType.design || 0) > 0;

    let healthScore = 35;
    if (hasCode) healthScore += 30;
    if (hasDocs) healthScore += 20;
    if (hasDesign) healthScore += 15;

    return {
      totalFiles: this.entries.size,
      totalSize,
      byType,
      byLanguage,
      healthScore: Math.max(0, Math.min(100, healthScore)),
    };
  }

  getEntries(): ContextEntry[] {
    return Array.from(this.entries.values()).sort((a, b) => a.path.localeCompare(b.path));
  }

  getEntry(path: string): ContextEntry | undefined {
    return this.entries.get(resolve(path));
  }

  getEmbeddingStats() {
    return this.embeddingEngine?.getStats() || null;
  }

  async search(query: string): Promise<ContextEntry[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    // Try semantic search first if embedding engine is available
    if (this.embeddingEngine) {
      try {
        return await this.semanticSearch(query);
      } catch (error) {
        console.warn('Semantic search failed, falling back to text search:', error);
      }
    }

    // Fallback to text-based search
    return this.textSearch(normalized);
  }

  public addLink(sourcePathOrId: string, targetPathOrId: string, relation: ContextLink['relation'], weight: number = 1.0): void {
    let source = this.entries.get(resolve(sourcePathOrId)) || Array.from(this.entries.values()).find(e => e.id === sourcePathOrId);
    let target = this.entries.get(resolve(targetPathOrId)) || Array.from(this.entries.values()).find(e => e.id === targetPathOrId);

    if (source && target) {
      if (!source.links) source.links = [];
      if (!source.links.find(l => l.targetId === target!.id && l.relation === relation)) {
        source.links.push({ targetId: target.id, relation, weight });
        this.persist();
      }
    }
  }

  private async semanticSearch(query: string): Promise<ContextEntry[]> {
    if (!this.embeddingEngine) return [];

    const results = await this.embeddingEngine.search(query, 20);

    // Convert embedding results to context entries
    const entries: ContextEntry[] = [];
    const entryIds = new Set<string>();

    for (const result of results) {
      if (result.score > 0.3) { // Minimum similarity threshold
        const entry = this.getEntry(result.entry.path);
        if (entry && !entryIds.has(entry.id)) {
          entries.push(entry);
          entryIds.add(entry.id);

          // Knowledge Graph Traversal: Pull in 1st-degree connected nodes
          if (entry.links) {
            for (const link of entry.links) {
              const connectedNode = Array.from(this.entries.values()).find(e => e.id === link.targetId);
              if (connectedNode && !entryIds.has(connectedNode.id)) {
                entries.push(connectedNode);
                entryIds.add(connectedNode.id);
              }
            }
          }
        }
      }
    }

    return entries.slice(0, 15); // Return top 15 (including graph edges)
  }

  private textSearch(normalized: string): ContextEntry[] {
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const scored: Array<{ entry: ContextEntry; score: number }> = [];

    for (const entry of this.entries.values()) {
      const pathLower = entry.relativePath.toLowerCase();
      const contentLower = entry.content?.toLowerCase() || '';

      let score = 0;
      if (pathLower.includes(normalized)) score += 20;
      if (contentLower.includes(normalized)) score += 10;

      for (const token of tokens) {
        if (pathLower.includes(token)) score += 6;
        if (contentLower.includes(token)) score += 3;
      }

      if (score > 0) {
        scored.push({ entry, score });
      }
    }

    return scored
      .sort((a, b) => (b.score - a.score) || a.entry.path.localeCompare(b.entry.path))
      .map(item => item.entry)
      .slice(0, 10); // Return top 10
  }

  clear(): void {
    this.entries.clear();
    this.persist();
  }

  getCustomRules(): string | null {
    const cwd = process.cwd();
    const ruleFiles = ['PHANTOM.md', 'AGENTS.md', '.phantom.rules'];
    let rules = '';

    for (const file of ruleFiles) {
      const fullPath = join(cwd, file);
      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          rules += `\n\n--- Rules from ${file} ---\n${content}`;
        } catch (e) { }
      }
    }

    return rules.trim() || null;
  }
}

let instance: ContextEngine | null = null;

export function getContextEngine(): ContextEngine {
  if (!instance) {
    instance = new ContextEngine();
  }
  return instance;
}
