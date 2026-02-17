// PHANTOM Agent/MCP Discovery and Registration
import { spawnSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { AgentDiscovery } from '@phantom-pm/core';

type SupportedAgent = 'claude-code' | 'cursor' | 'zed' | 'vscode' | 'codex' | 'gemini-cli';

interface AgentAdapter {
  type: SupportedAgent;
  name: string;
  configPathByPlatform: Partial<Record<NodeJS.Platform, string>>;
}

interface InstalledAgent {
  type: SupportedAgent;
  name: string;
  installed: boolean;
  running: boolean;
  confidence: number;
  status: 'running' | 'installed' | 'available';
}

interface RegisteredAgent extends InstalledAgent {
  configPath: string;
  registered: boolean;
  registrationError?: string;
}

interface HealthReport {
  timestamp: string;
  mcp_server: {
    status: 'running' | 'not_responding';
  };
  agents: RegisteredAgent[];
  issues: string[];
}

const ADAPTERS: Record<SupportedAgent, AgentAdapter> = {
  'claude-code': {
    type: 'claude-code',
    name: 'Claude Code',
    configPathByPlatform: {
      darwin: join(homedir(), '.claude', 'settings.json'),
      linux: join(homedir(), '.claude', 'settings.json'),
      win32: join(homedir(), '.claude', 'settings.json'),
    },
  },
  cursor: {
    type: 'cursor',
    name: 'Cursor',
    configPathByPlatform: {
      darwin: join(homedir(), '.cursor', 'settings.json'),
      linux: join(homedir(), '.cursor', 'settings.json'),
      win32: join(homedir(), '.cursor', 'settings.json'),
    },
  },
  zed: {
    type: 'zed',
    name: 'Zed Editor',
    configPathByPlatform: {
      darwin: join(homedir(), '.config', 'zed', 'settings.json'),
      linux: join(homedir(), '.config', 'zed', 'settings.json'),
      win32: join(homedir(), '.config', 'zed', 'settings.json'),
    },
  },
  vscode: {
    type: 'vscode',
    name: 'Visual Studio Code',
    configPathByPlatform: {
      darwin: join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'settings.json'),
      linux: join(homedir(), '.config', 'Code', 'User', 'settings.json'),
      win32: join(homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json'),
    },
  },
  codex: {
    type: 'codex',
    name: 'Codex AI',
    configPathByPlatform: {
      darwin: join(homedir(), 'Library', 'Application Support', 'Codex', 'User', 'settings.json'),
      linux: join(homedir(), '.config', 'Codex', 'User', 'settings.json'),
      win32: join(homedir(), 'AppData', 'Roaming', 'Codex', 'User', 'settings.json'),
    },
  },
  'gemini-cli': {
    type: 'gemini-cli',
    name: 'Gemini CLI',
    configPathByPlatform: {
      darwin: join(homedir(), '.gemini', 'settings.json'),
      linux: join(homedir(), '.gemini', 'settings.json'),
      win32: join(homedir(), '.gemini', 'settings.json'),
    },
  },
};

function getConfigPath(type: SupportedAgent): string {
  const adapter = ADAPTERS[type];
  const fromPlatform = adapter.configPathByPlatform[process.platform];
  if (fromPlatform) return fromPlatform;
  return Object.values(adapter.configPathByPlatform)[0] || join(homedir(), `.${type}`, 'settings.json');
}

function stripJsonComments(input: string): string {
  let result = '';
  let index = 0;
  let inString = false;
  let escaped = false;

  while (index < input.length) {
    const current = input[index];
    const next = input[index + 1];

    if (inString) {
      result += current;
      if (escaped) {
        escaped = false;
      } else if (current === '\\') {
        escaped = true;
      } else if (current === '"') {
        inString = false;
      }
      index += 1;
      continue;
    }

    if (current === '"') {
      inString = true;
      result += current;
      index += 1;
      continue;
    }

    if (current === '/' && next === '/') {
      while (index < input.length && input[index] !== '\n') {
        index += 1;
      }
      continue;
    }

    if (current === '/' && next === '*') {
      index += 2;
      while (index < input.length) {
        if (input[index] === '*' && input[index + 1] === '/') {
          index += 2;
          break;
        }
        index += 1;
      }
      continue;
    }

    result += current;
    index += 1;
  }

  return result;
}

function parseJsonc(input: string): unknown {
  const withoutComments = stripJsonComments(input);
  const normalized = withoutComments.replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(normalized);
}

function readAgentConfig(configPath: string): { data: Record<string, unknown>; error?: string } {
  if (!existsSync(configPath)) {
    return { data: {} };
  }

  try {
    const raw = readFileSync(configPath, 'utf8');
    const parsed = parseJsonc(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { data: {}, error: 'Config is not an object' };
    }
    return { data: parsed as Record<string, unknown> };
  } catch (error) {
    return {
      data: {},
      error: error instanceof Error ? error.message : 'Failed to parse config',
    };
  }
}

function createBackup(configPath: string): string | null {
  if (!existsSync(configPath)) return null;
  const backupPath = `${configPath}.bak.${Date.now()}`;
  copyFileSync(configPath, backupPath);
  return backupPath;
}

function restoreBackup(configPath: string, backupPath: string | null): void {
  if (!backupPath || !existsSync(backupPath)) return;
  copyFileSync(backupPath, configPath);
}

export class PhantomDiscovery {
  static get AGENT_CONFIG_PATHS(): Record<SupportedAgent, string> {
    return {
      'claude-code': getConfigPath('claude-code'),
      cursor: getConfigPath('cursor'),
      zed: getConfigPath('zed'),
      vscode: getConfigPath('vscode'),
      codex: getConfigPath('codex'),
      'gemini-cli': getConfigPath('gemini-cli'),
    };
  }

  private static get AGENT_NAMES(): Record<SupportedAgent, string> {
    return {
      'claude-code': ADAPTERS['claude-code'].name,
      cursor: ADAPTERS.cursor.name,
      zed: ADAPTERS.zed.name,
      vscode: ADAPTERS.vscode.name,
      codex: ADAPTERS.codex.name,
      'gemini-cli': ADAPTERS['gemini-cli'].name,
    };
  }

  static async detectPhantom(): Promise<boolean> {
    try {
      const result = spawnSync('phantom', ['--version'], {
        stdio: 'pipe',
        timeout: 5000,
      });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  static async detectInstalledAgents(): Promise<InstalledAgent[]> {
    const discovery = new AgentDiscovery(process.cwd());

    const detected = await discovery.scanSystem();
    const detectedMap = new Map(detected.map(item => [item.signature.id, item]));

    return (Object.keys(ADAPTERS) as SupportedAgent[]).map(type => {
      const found = detectedMap.get(type);
      return {
        type,
        name: ADAPTERS[type].name,
        installed: Boolean(found),
        running: found?.status === 'running',
        confidence: found?.confidence || 0,
        status: found?.status || 'available',
      };
    });
  }

  static async detectRegisteredAgents(): Promise<RegisteredAgent[]> {
    const installed = await this.detectInstalledAgents();

    return installed.map(agent => {
      const configPath = this.AGENT_CONFIG_PATHS[agent.type];
      const parsed = readAgentConfig(configPath);
      const mcpServers = parsed.data.mcpServers as Record<string, unknown> | undefined;
      const registered = Boolean(mcpServers && typeof mcpServers === 'object' && mcpServers.phantom);

      return {
        ...agent,
        configPath,
        registered,
        ...(parsed.error ? { registrationError: parsed.error } : {}),
      };
    });
  }

  static async registerAgent(type: SupportedAgent): Promise<{ success: boolean; message: string }> {
    const configPath = this.AGENT_CONFIG_PATHS[type];
    const agentName = this.AGENT_NAMES[type];
    let backupPath: string | null = null;

    try {
      mkdirSync(dirname(configPath), { recursive: true });

      backupPath = createBackup(configPath);
      const parsed = readAgentConfig(configPath);
      const config = parsed.data;
      const mcpServers = (config.mcpServers && typeof config.mcpServers === 'object')
        ? (config.mcpServers as Record<string, unknown>)
        : {};

      if (mcpServers.phantom) {
        return { success: true, message: `${agentName} already registered` };
      }

      const nextConfig = {
        ...config,
        mcpServers: {
          ...mcpServers,
          phantom: {
            command: 'phantom',
            args: ['mcp', 'serve'],
            description: 'PHANTOM PM Operating System - Product management superpowers',
            capabilities: [
              'Generate PRDs',
              'Analyze product decisions',
              'Create user stories',
              'Plan sprints',
              'Access product context',
            ],
          },
        },
      };

      writeFileSync(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`, 'utf8');
      return { success: true, message: `Registered with ${agentName}` };
    } catch (error) {
      restoreBackup(configPath, backupPath);
      return {
        success: false,
        message: error instanceof Error ? `Failed to register ${agentName}: ${error.message}` : `Failed to register ${agentName}`,
      };
    }
  }

  static async registerWithAgent(type: SupportedAgent): Promise<boolean> {
    const result = await this.registerAgent(type);
    if (result.success) {
      console.log(`✓ ${result.message}`);
      return true;
    }
    console.log(`○ ${result.message}`);
    return false;
  }

  static async registerAll(agentTypes?: SupportedAgent[]): Promise<{ total: number; success: number; failed: number }> {
    const targets = agentTypes || (await this.detectInstalledAgents()).filter(agent => agent.installed).map(agent => agent.type);
    const uniqueTargets = Array.from(new Set(targets));

    let success = 0;
    for (const target of uniqueTargets) {
      const result = await this.registerAgent(target);
      if (result.success) {
        success += 1;
        console.log(`✓ ${result.message}`);
      } else {
        console.log(`○ ${result.message}`);
      }
    }

    return {
      total: uniqueTargets.length,
      success,
      failed: uniqueTargets.length - success,
    };
  }

  static async forceRegisterAgents(agentTypes: SupportedAgent[]): Promise<void> {
    const summary = await this.registerAll(agentTypes);
    console.log(`✓ Successfully registered with ${summary.success}/${summary.total} agents`);
  }

  static async autoRegisterAll(): Promise<void> {
    console.log('🔍 Detecting installed AI agents...\n');
    const installed = await this.detectInstalledAgents();
    const detected = installed.filter(agent => agent.installed);

    if (detected.length === 0) {
      console.log('No supported AI agents detected.');
      console.log('Creating baseline configs for common agents...\n');
      await this.forceRegisterAgents(['codex', 'cursor', 'claude-code']);
      return;
    }

    console.log(`Found ${detected.length} installed agent${detected.length > 1 ? 's' : ''}:`);
    for (const agent of detected) {
      console.log(`  ✓ ${agent.name} (${agent.status}, confidence ${agent.confidence}%)`);
    }
    console.log('');

    const summary = await this.registerAll(detected.map(agent => agent.type));
    console.log(`\n🎯 Registration complete!`);
    console.log(`✓ Successfully registered with ${summary.success}/${summary.total} agents`);
  }

  static getSuggestedInstall(): string {
    return `
# PHANTOM not found. Install with:
npm install -g @phantom-pm/cli

# Or:
curl -fsSL https://raw.githubusercontent.com/PhantomPM/phantom/main/scripts/install.sh | sh
    `.trim();
  }

  static async healthReport(): Promise<HealthReport> {
    const mcpRunning = await this.detectPhantom();
    const agents = await this.detectRegisteredAgents();

    const issues: string[] = [];
    for (const agent of agents) {
      if (agent.installed && !agent.registered) {
        issues.push(`${agent.type}:detected_not_registered`);
      }
      if (agent.registrationError) {
        issues.push(`${agent.type}:config_error`);
      }
    }

    return {
      timestamp: new Date().toISOString(),
      mcp_server: {
        status: mcpRunning ? 'running' : 'not_responding',
      },
      agents,
      issues,
    };
  }

  static async healthCheck(): Promise<void> {
    const report = await this.healthReport();
    console.log('🏥 PHANTOM Health Check\n');
    console.log(`◉ MCP Server: ${report.mcp_server.status === 'running' ? 'Running' : 'Not responding'}`);

    for (const agent of report.agents) {
      const status = agent.installed
        ? (agent.registered ? 'Connected' : 'Installed but not registered')
        : 'Not installed';
      console.log(`◉ ${agent.name}: ${status}`);
    }

    if (report.issues.length > 0) {
      console.log('\nIssues:');
      for (const issue of report.issues) {
        console.log(`  - ${issue}`);
      }
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  PhantomDiscovery.autoRegisterAll().catch(console.error);
}
