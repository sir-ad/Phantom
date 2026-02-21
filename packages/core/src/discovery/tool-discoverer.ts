import { SkillRegistry, AgentTool } from '../skills/registry.js';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as chokidar from 'chokidar';

export class ToolDiscoverer {
    private discoveredTools = new Map<string, AgentTool>();

    async discoverAll(): Promise<AgentTool[]> {
        const tools: AgentTool[] = [];

        // 1. Discover from local modules
        const localTools = await this.discoverLocalModules();
        tools.push(...localTools);

        // 2. Discover from npm packages
        const npmTools = await this.discoverNpmPackages();
        tools.push(...npmTools);

        // 3. Discover from user workspace
        const userTools = await this.discoverUserTools();
        tools.push(...userTools);

        // Cache all discovered tools and register them
        const registry = SkillRegistry.getInstance();

        // We'll bundle discovered tools into a virtual skill
        const discoveredSkillTools: AgentTool[] = [];

        for (const tool of tools) {
            this.discoveredTools.set(tool.name, tool);
            discoveredSkillTools.push(tool);
        }

        if (discoveredSkillTools.length > 0) {
            registry.register({
                id: 'auto-discovered-tools',
                name: 'Auto-Discovered Tools',
                description: 'Tools automatically discovered across the workspace and system.',
                version: '1.0.0',
                tools: discoveredSkillTools
            });
        }

        return tools;
    }

    private async exists(p: string) {
        try {
            await fs.access(p);
            return true;
        } catch {
            return false;
        }
    }

    private async discoverLocalModules(): Promise<AgentTool[]> {
        const modulesDir = path.join(process.cwd(), 'packages/modules');
        if (!await this.exists(modulesDir)) return [];

        const modules = await fs.readdir(modulesDir);
        const tools: AgentTool[] = [];

        for (const moduleName of modules) {
            const toolsFile = path.join(modulesDir, moduleName, 'TOOLS.md');
            if (await this.exists(toolsFile)) {
                const toolDef = await this.parseToolDefinition(toolsFile);
                tools.push(...toolDef);
            }
        }

        return tools;
    }

    private async discoverNpmPackages(): Promise<AgentTool[]> {
        const nodeModules = path.join(process.cwd(), 'node_modules');
        if (!await this.exists(path.join(nodeModules, '@phantom'))) return [];

        const phantomPackages = await fs.readdir(
            path.join(nodeModules, '@phantom'),
            { withFileTypes: true }
        );

        const tools: AgentTool[] = [];

        for (const pkg of phantomPackages.filter(d => d.isDirectory())) {
            const pkgPath = path.join(nodeModules, '@phantom', pkg.name);
            try {
                const pkgJsonStr = await fs.readFile(path.join(pkgPath, 'package.json'), 'utf-8');
                const pkgJson = JSON.parse(pkgJsonStr);

                if (pkgJson.phantom?.tools) {
                    tools.push(...pkgJson.phantom.tools.map((t: any) => ({
                        ...t,
                        handler: async (args: any) => { return `[Mock Execution of ${t.name}]`; } // Need dynamic import in a real app, mock for now
                    })));
                }
            } catch (e) {
                // Suppress errors for invalid packages
            }
        }

        return tools;
    }

    private async discoverUserTools(): Promise<AgentTool[]> {
        const userToolsDir = path.join(os.homedir(), '.phantom', 'tools');
        if (!await this.exists(userToolsDir)) return [];

        const userTools = await fs.readdir(userToolsDir);
        const tools: AgentTool[] = [];

        for (const toolFile of userTools) {
            if (toolFile.endsWith('.tool.js') || toolFile.endsWith('.tool.ts')) {
                const toolPath = path.join(userToolsDir, toolFile);
                try {
                    const tool = await import(toolPath);
                    tools.push(tool.default || tool);
                } catch (e) {
                    console.warn(`Failed to import user tool at ${toolPath}`, e);
                }
            }
        }

        return tools;
    }

    private async parseToolDefinition(filepath: string): Promise<AgentTool[]> {
        try {
            const content = await fs.readFile(filepath, 'utf-8');
            const tools: AgentTool[] = [];
            const sections = content.split(/^##\s+/m).slice(1);

            for (const section of sections) {
                const lines = section.split('\n');
                const name = lines[0].trim().toLowerCase().replace(/\s+/g, '_');
                const description = lines.slice(1).join('\n').trim();

                const paramsMatch = description.match(/Parameters:\s*```json\n([\s\S]+?)\n```/);
                const parameters = paramsMatch ? JSON.parse(paramsMatch[1]) : {};

                tools.push({
                    name,
                    description,
                    parameters,
                    handler: async () => { return `Executed parsed tool ${name}`; } // Mock fallback
                });
            }
            return tools;
        } catch (e) {
            return [];
        }
    }
}

export class ToolWatcher {
    private watcher: chokidar.FSWatcher | null = null;

    watch(discoverer: ToolDiscoverer) {
        const watchPaths = [
            path.join(process.cwd(), 'packages/modules'),
            path.join(os.homedir(), '.phantom', 'tools'),
        ];

        this.watcher = chokidar.watch(watchPaths, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        this.watcher.on('change', async (changedPath) => {
            console.log(`Tool change detected: ${changedPath}`);
            await discoverer.discoverAll();
        });
    }

    stop() {
        if (this.watcher) {
            this.watcher.close();
        }
    }
}
