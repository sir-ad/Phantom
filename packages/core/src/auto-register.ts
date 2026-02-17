// PHANTOM Core - MCP Auto-Registration System
// Automatically injects Phantom's MCP server config into detected agent config files
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { homedir } from 'os';
import { AgentDiscovery, type DetectedAgent, AGENT_SIGNATURES } from './agent-discovery.js';

export interface RegistrationTarget {
    agentId: string;
    agentName: string;
    configPath: string;
    configKey: string;
    format: 'mcp-standard' | 'vscode' | 'zed' | 'cline' | 'continue';
}

export interface RegistrationResult {
    agentId: string;
    agentName: string;
    success: boolean;
    configPath: string;
    action: 'created' | 'updated' | 'skipped' | 'error';
    message: string;
    backupPath?: string;
}

export interface RegistrationSummary {
    totalTargets: number;
    successful: number;
    skipped: number;
    errors: number;
    results: RegistrationResult[];
    phantomServerCommand: string;
    phantomServerArgs: string[];
}

function getMCPServerPath(): string {
    // Resolve the MCP server entry point relative to this package
    const candidates = [
        join(dirname(dirname(dirname(__dirname))), 'packages', 'mcp-server', 'dist', 'index.js'),
        join(dirname(dirname(__dirname)), 'mcp-server', 'dist', 'index.js'),
        join(__dirname, '..', '..', 'mcp-server', 'dist', 'index.js'),
    ];

    for (const candidate of candidates) {
        const resolved = resolve(candidate);
        if (existsSync(resolved)) return resolved;
    }

    // Fallback: assume it's installed globally or via npx
    return 'phantom-mcp-server';
}

function getPhantomMCPConfig(): { command: string; args: string[] } {
    const serverPath = getMCPServerPath();

    // If we found the actual file path, use node directly
    if (serverPath.endsWith('.js')) {
        return {
            command: 'node',
            args: [serverPath],
        };
    }

    // Otherwise use npx as fallback
    return {
        command: 'npx',
        args: ['-y', '@phantom-pm/cli', 'mcp', 'serve'],
    };
}

function safeReadJSON(filePath: string): Record<string, any> {
    if (!existsSync(filePath)) return {};
    try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
        return {};
    }
}

function safeWriteJSON(filePath: string, data: Record<string, any>): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function backupFile(filePath: string): string | undefined {
    if (!existsSync(filePath)) return undefined;
    const backupPath = `${filePath}.phantom-backup.${Date.now()}`;
    copyFileSync(filePath, backupPath);
    return backupPath;
}

/**
 * Get all known registration targets with their config file paths and formats
 */
export function getRegistrationTargets(cwd: string): RegistrationTarget[] {
    const home = homedir();
    const platform = process.platform;

    const targets: RegistrationTarget[] = [
        {
            agentId: 'claude-code',
            agentName: 'Claude Code',
            configPath: join(home, '.claude', 'settings.json'),
            configKey: 'mcpServers',
            format: 'mcp-standard',
        },
        {
            agentId: 'claude-desktop',
            agentName: 'Claude Desktop',
            configPath: platform === 'darwin'
                ? join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
                : platform === 'win32'
                    ? join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json')
                    : join(home, '.config', 'claude', 'claude_desktop_config.json'),
            configKey: 'mcpServers',
            format: 'mcp-standard',
        },
        {
            agentId: 'cursor',
            agentName: 'Cursor',
            configPath: join(cwd, '.cursor', 'mcp.json'),
            configKey: 'mcpServers',
            format: 'mcp-standard',
        },
        {
            agentId: 'windsurf',
            agentName: 'Windsurf',
            configPath: join(home, '.codeium', 'windsurf', 'mcp_config.json'),
            configKey: 'mcpServers',
            format: 'mcp-standard',
        },
        {
            agentId: 'vscode',
            agentName: 'Visual Studio Code',
            configPath: join(cwd, '.vscode', 'settings.json'),
            configKey: 'mcp.servers',
            format: 'vscode',
        },
        {
            agentId: 'zed',
            agentName: 'Zed',
            configPath: platform === 'darwin'
                ? join(home, '.config', 'zed', 'settings.json')
                : join(home, '.config', 'zed', 'settings.json'),
            configKey: 'context_servers',
            format: 'zed',
        },
        {
            agentId: 'cline',
            agentName: 'Cline',
            configPath: join(cwd, '.vscode', 'cline_mcp_settings.json'),
            configKey: 'mcpServers',
            format: 'cline',
        },
        {
            agentId: 'continue',
            agentName: 'Continue',
            configPath: join(home, '.continue', 'config.json'),
            configKey: 'mcpServers',
            format: 'continue',
        },
        {
            agentId: 'antigravity',
            agentName: 'Antigravity (Gemini)',
            configPath: join(cwd, '.gemini', 'settings.json'),
            configKey: 'mcpServers',
            format: 'mcp-standard',
        },
        {
            agentId: 'opencode',
            agentName: 'OpenCode',
            configPath: join(home, '.opencode', 'config.json'),
            configKey: 'mcpServers',
            format: 'mcp-standard',
        },
    ];

    return targets;
}

/**
 * Register Phantom MCP server with a specific agent
 */
export function registerWithAgent(target: RegistrationTarget): RegistrationResult {
    const mcpConfig = getPhantomMCPConfig();

    try {
        const backupPath = backupFile(target.configPath);
        const config = safeReadJSON(target.configPath);
        const alreadyRegistered = hasPhantomRegistration(config, target);

        if (alreadyRegistered) {
            return {
                agentId: target.agentId,
                agentName: target.agentName,
                success: true,
                configPath: target.configPath,
                action: 'skipped',
                message: 'Phantom MCP already registered',
            };
        }

        // Inject Phantom MCP config based on format
        injectPhantomConfig(config, target, mcpConfig);
        safeWriteJSON(target.configPath, config);

        return {
            agentId: target.agentId,
            agentName: target.agentName,
            success: true,
            configPath: target.configPath,
            action: backupPath ? 'updated' : 'created',
            message: `Phantom MCP registered successfully`,
            backupPath,
        };
    } catch (error) {
        return {
            agentId: target.agentId,
            agentName: target.agentName,
            success: false,
            configPath: target.configPath,
            action: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

function hasPhantomRegistration(config: Record<string, any>, target: RegistrationTarget): boolean {
    switch (target.format) {
        case 'mcp-standard':
        case 'cline':
        case 'continue': {
            const servers = config[target.configKey];
            return servers && typeof servers === 'object' && 'phantom' in servers;
        }
        case 'vscode': {
            const mcp = config['mcp'];
            return mcp && typeof mcp === 'object' &&
                mcp.servers && typeof mcp.servers === 'object' &&
                'phantom' in mcp.servers;
        }
        case 'zed': {
            const servers = config['context_servers'];
            return servers && typeof servers === 'object' && 'phantom' in servers;
        }
        default:
            return false;
    }
}

function injectPhantomConfig(
    config: Record<string, any>,
    target: RegistrationTarget,
    mcpConfig: { command: string; args: string[] }
): void {
    const phantomEntry = {
        command: mcpConfig.command,
        args: mcpConfig.args,
        env: {},
    };

    switch (target.format) {
        case 'mcp-standard':
        case 'cline': {
            if (!config[target.configKey]) config[target.configKey] = {};
            config[target.configKey].phantom = phantomEntry;
            break;
        }
        case 'continue': {
            if (!config.mcpServers) config.mcpServers = {};
            config.mcpServers.phantom = phantomEntry;
            break;
        }
        case 'vscode': {
            if (!config.mcp) config.mcp = {};
            if (!config.mcp.servers) config.mcp.servers = {};
            config.mcp.servers.phantom = {
                type: 'stdio',
                command: mcpConfig.command,
                args: mcpConfig.args,
            };
            break;
        }
        case 'zed': {
            if (!config.context_servers) config.context_servers = {};
            config.context_servers.phantom = {
                command: {
                    path: mcpConfig.command,
                    args: mcpConfig.args,
                },
                settings: {},
            };
            break;
        }
    }
}

/**
 * Register Phantom with all detected agents on the system
 */
export async function registerWithAllDetected(cwd: string): Promise<RegistrationSummary> {
    const discovery = new AgentDiscovery(cwd);
    const detected = await discovery.scanSystem();
    const detectedIds = new Set(detected.map(d => d.signature.id));
    const allTargets = getRegistrationTargets(cwd);

    // Only register with agents that were actually detected or whose config paths exist
    const relevantTargets = allTargets.filter(target =>
        detectedIds.has(target.agentId) || existsSync(dirname(target.configPath))
    );

    const results = relevantTargets.map(target => registerWithAgent(target));
    const mcpConfig = getPhantomMCPConfig();

    return {
        totalTargets: relevantTargets.length,
        successful: results.filter(r => r.success && r.action !== 'skipped').length,
        skipped: results.filter(r => r.action === 'skipped').length,
        errors: results.filter(r => !r.success).length,
        results,
        phantomServerCommand: mcpConfig.command,
        phantomServerArgs: mcpConfig.args,
    };
}

/**
 * Register Phantom with a specific agent by ID
 */
export function registerWithSpecificAgent(cwd: string, agentId: string): RegistrationResult {
    const targets = getRegistrationTargets(cwd);
    const target = targets.find(t => t.agentId === agentId);

    if (!target) {
        return {
            agentId,
            agentName: agentId,
            success: false,
            configPath: '',
            action: 'error',
            message: `Unknown agent: ${agentId}. Known agents: ${targets.map(t => t.agentId).join(', ')}`,
        };
    }

    return registerWithAgent(target);
}

/**
 * List all possible registration targets (for display purposes)
 */
export function listRegistrationTargets(cwd: string): Array<{
    agentId: string;
    agentName: string;
    configPath: string;
    exists: boolean;
    registered: boolean;
}> {
    const targets = getRegistrationTargets(cwd);
    return targets.map(target => {
        const config = safeReadJSON(target.configPath);
        return {
            agentId: target.agentId,
            agentName: target.agentName,
            configPath: target.configPath,
            exists: existsSync(target.configPath),
            registered: hasPhantomRegistration(config, target),
        };
    });
}
