import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DocumentationConfig {
    inputDir: string;
    outputDir: string;
    title?: string;
}

export class DocumentationEngine {
    constructor(private config: DocumentationConfig) { }

    async build() {
        const { inputDir, outputDir } = this.config;

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Copy static assets (if any)
        // Ensure Oat assets are present
        this.ensureOatAssets(outputDir);

        // Scan for markdown files
        const files = this.scanFiles(inputDir);

        // Build Sidebar
        const sidebar = this.generateSidebar(files);

        // Process each file
        for (const file of files) {
            await this.processFile(file, sidebar);
        }

        console.log(`Documentation built to ${outputDir}`);
    }

    private scanFiles(dir: string, baseDir = dir): string[] {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results = results.concat(this.scanFiles(fullPath, baseDir));
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                results.push(path.relative(baseDir, fullPath));
            }
        }
        return results.sort();
    }

    private generateSidebar(files: string[]): string {
        // Simple Sidebar generation based on directory structure
        // Returns HTML string for the sidebar
        let html = '<ul class="sidebar-list">';
        // Group by folder?
        // simple flat list for now or slightly nested
        const groups: Record<string, string[]> = {};

        for (const file of files) {
            const dir = path.dirname(file);
            if (!groups[dir]) groups[dir] = [];
            groups[dir].push(file);
        }

        for (const [dir, groupFiles] of Object.entries(groups)) {
            if (dir !== '.') {
                html += `<li class="sidebar-header">${this.formatTitle(dir)}</li>`;
            }
            for (const file of groupFiles) {
                const title = this.extractTitle(file); // Or generate from filename
                const link = file.replace('.md', '.html');
                const isActive = false; // logic handled in template or JS
                html += `<li><a href="/${link}" class="${isActive ? 'active' : ''}">${title}</a></li>`;
            }
        }
        html += '</ul>';
        return html;
    }

    private extractTitle(file: string): string {
        const basename = path.basename(file, '.md');
        return basename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    private formatTitle(dir: string): string {
        return dir.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    private async processFile(relativePath: string, sidebarHtml: string) {
        const { inputDir, outputDir } = this.config;
        const inputFile = path.join(inputDir, relativePath);
        const outputFile = path.join(outputDir, relativePath.replace('.md', '.html'));

        const content = fs.readFileSync(inputFile, 'utf-8');

        // Configure marked with highlight.js
        const htmlContent = await marked.parse(content, {
            async: true,
            highlight: (code, lang) => {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        });

        // Ensure output subdir exists
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });

        const pageHtml = this.wrapTemplate(htmlContent, sidebarHtml, this.extractTitle(relativePath));
        fs.writeFileSync(outputFile, pageHtml);
    }

    private wrapTemplate(content: string, sidebar: string, title: string): string {
        // Oat Template
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${this.config.title || 'Docs'}</title>
    <link rel="stylesheet" href="assets/oat.min.css">
    <script src="assets/oat.min.js"></script>
    <style>
        /* Custom tweaks for docs */
        body { display: flex; }
        .sidebar { width: 250px; border-right: 1px solid var(--border); padding: 1rem; height: 100vh; overflow-y: auto; position: fixed; }
        .main-content { margin-left: 250px; padding: 2rem; max-width: 800px; }
        div.code-block { background: var(--bg-alt); padding: 1rem; border-radius: 4px; overflow-x: auto; margin-bottom: 1rem; }
        /* Oat specific overrides if needed */
        [data-theme='dark'] { --bg: #111; --text: #eee; }
    </style>
</head>
<body data-theme="dark">
    <nav class="sidebar">
        <h3>Phantom</h3>
        ${sidebar}
    </nav>
    <main class="main-content">
        <h1>${title}</h1>
        ${content}
    </main>
</body>
</html>`;
    }

    private ensureOatAssets(outputDir: string) {
        // Find assets dir relative to this file or config
        // Default to package root assets if not provided
        let assetsDir = path.resolve(__dirname, '../../assets'); // Default assumption

        // If run with tsx, __dirname is src/. If build, dist/.
        // Try to find assets dir
        if (!fs.existsSync(assetsDir)) {
            assetsDir = path.resolve(__dirname, '../assets'); // src/../assets
        }

        const destAssets = path.join(outputDir, 'assets');
        if (!fs.existsSync(destAssets)) fs.mkdirSync(destAssets, { recursive: true });

        if (fs.existsSync(path.join(assetsDir, 'oat.min.css'))) {
            fs.copyFileSync(path.join(assetsDir, 'oat.min.css'), path.join(destAssets, 'oat.min.css'));
            fs.copyFileSync(path.join(assetsDir, 'oat.min.js'), path.join(destAssets, 'oat.min.js'));
        } else {
            console.warn(`Warning: Oat assets not found at ${assetsDir}`);
        }
    }
}
