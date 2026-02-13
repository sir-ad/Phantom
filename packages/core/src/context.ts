// PHANTOM Core - Context Engine
// Ingests codebases, documents, screenshots, and Figma exports

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { getConfig } from './config.js';

export interface ContextEntry {
  id: string;
  type: 'code' | 'document' | 'image' | 'design' | 'data';
  path: string;
  relativePath: string;
  content?: string;
  metadata: {
    size: number;
    extension: string;
    lastModified: string;
    language?: string;
    lines?: number;
  };
  indexed: boolean;
  indexedAt?: string;
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

export class ContextEngine {
  private entries: Map<string, ContextEntry> = new Map();
  private basePath: string = '';

  async addPath(targetPath: string): Promise<ContextStats> {
    if (!existsSync(targetPath)) {
      throw new Error(`Path not found: ${targetPath}`);
    }

    this.basePath = targetPath;
    const stat = statSync(targetPath);

    if (stat.isFile()) {
      this.indexFile(targetPath, targetPath);
    } else if (stat.isDirectory()) {
      this.indexDirectory(targetPath, targetPath);
    }

    return this.getStats();
  }

  private indexDirectory(dirPath: string, basePath: string): void {
    const items = readdirSync(dirPath);

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
    const relPath = relative(basePath, filePath);

    let content: string | undefined;
    let lines: number | undefined;

    // Only read text files
    if (type === 'code' || type === 'document' || type === 'data') {
      try {
        if (stat.size < 1024 * 1024) { // Skip files > 1MB
          content = readFileSync(filePath, 'utf-8');
          lines = content.split('\n').length;
        }
      } catch {
        // Binary file or read error, skip content
      }
    }

    const entry: ContextEntry = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      path: filePath,
      relativePath: relPath || filePath,
      content,
      metadata: {
        size: stat.size,
        extension: ext,
        lastModified: stat.mtime.toISOString(),
        language: detectLanguage(ext),
        lines,
      },
      indexed: true,
      indexedAt: new Date().toISOString(),
    };

    this.entries.set(filePath, entry);
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

    // Health score based on context richness
    const hasCode = (byType['code'] || 0) > 0;
    const hasDocs = (byType['document'] || 0) > 0;
    const hasDesign = (byType['image'] || 0) > 0 || (byType['design'] || 0) > 0;
    let healthScore = 40; // Base score for having any context
    if (hasCode) healthScore += 25;
    if (hasDocs) healthScore += 20;
    if (hasDesign) healthScore += 15;

    return {
      totalFiles: this.entries.size,
      totalSize,
      byType,
      byLanguage,
      healthScore: Math.min(100, healthScore),
    };
  }

  getEntries(): ContextEntry[] {
    return Array.from(this.entries.values());
  }

  getEntry(path: string): ContextEntry | undefined {
    return this.entries.get(path);
  }

  search(query: string): ContextEntry[] {
    const lower = query.toLowerCase();
    return this.getEntries().filter(e =>
      e.relativePath.toLowerCase().includes(lower) ||
      e.content?.toLowerCase().includes(lower)
    );
  }

  clear(): void {
    this.entries.clear();
  }
}

// Singleton
let instance: ContextEngine | null = null;

export function getContextEngine(): ContextEngine {
  if (!instance) {
    instance = new ContextEngine();
  }
  return instance;
}
