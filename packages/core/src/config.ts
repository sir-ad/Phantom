// PHANTOM Core - Configuration Manager
import { join, resolve } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';

export interface ModelConfig {
  provider: 'ollama' | 'anthropic' | 'openai' | 'gemini' | 'custom';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface IntegrationConfig {
  name: string;
  connected: boolean;
  detectedPath?: string;
  lastConnectedAt?: string;
  config: Record<string, string>;
}

export interface InstallationConfig {
  channel: 'stable' | 'beta' | 'nightly';
  version: string;
}

export interface MCPConfig {
  enabled: boolean;
  server_mode: 'stdio' | 'socket';
}

export interface SecurityConfig {
  audit_log_path: string;
}

export interface MemoryConfig {
  enabled: boolean;
}


export interface MemoryConfig {
  enabled: boolean;
}

export interface AutonomyConfig {
  heartbeatEnabled: boolean;
  heartbeatIntervalMin: number;
  toolRules: Record<string, 'auto-approve' | 'require-human' | 'blocked'>;
}


export interface ProjectConfig {
  name: string;
  path: string;
  contextPaths: string[];
  createdAt: string;
  lastAccessed: string;
}

export interface APIKeyConfig {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  google?: string;
  github?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  linear?: string;
  figma?: string;
  slack?: string;
  telegram?: string;
  discord?: string;
}

export interface PhantomConfig {
  version: string;
  firstRun: boolean;
  dataMode: 'local' | 'cloud' | 'hybrid';
  encryption: boolean;
  telemetry: boolean;
  autoUpdate: boolean;
  permissionLevel: 'L1' | 'L2' | 'L3';
  primaryModel: ModelConfig;
  fallbackModel?: ModelConfig;
  visionModel?: ModelConfig;
  integrations: IntegrationConfig[];
  projects: ProjectConfig[];
  activeProject?: string;
  installedModules: string[];
  theme: 'matrix' | 'cyberpunk' | 'minimal';
  installation: InstallationConfig;
  mcp: MCPConfig;
  memory?: MemoryConfig;
  security: SecurityConfig;

  apiKeys: APIKeyConfig;
  selfHealing: boolean;
  progressiveDisclosure: boolean;
  autoDiscovery: boolean;
  autonomy: AutonomyConfig;
}

const DEFAULT_CONFIG: PhantomConfig = {
  version: '1.0.0',
  firstRun: true,
  dataMode: 'local',
  encryption: true,
  telemetry: false,
  autoUpdate: true,
  permissionLevel: 'L2',
  primaryModel: {
    provider: 'ollama',
    model: 'llama3.1:70b',
    status: 'disconnected',
  },
  integrations: [],
  projects: [],
  installedModules: [],
  theme: 'matrix',
  installation: {
    channel: 'stable',
    version: '1.0.0',
  },
  mcp: {
    enabled: false,
    server_mode: 'stdio',
  },
  security: {
    audit_log_path: join(homedir(), '.phantom', 'logs', 'audit.log'),
  },
  apiKeys: {},
  selfHealing: true,
  progressiveDisclosure: true,
  autoDiscovery: true,
  autonomy: {
    heartbeatEnabled: false,
    heartbeatIntervalMin: 30,
    toolRules: {
      'executeBash': 'require-human',
      'executePhantomCommand': 'require-human'
    }
  }
};

export class ConfigManager {
  private configDir: string;
  private configPath: string;
  private config: PhantomConfig;

  constructor() {
    this.configDir = resolve(process.env.PHANTOM_HOME || join(homedir(), '.phantom'));
    this.configPath = join(this.configDir, 'config.json');
    this.config = this.load();
  }

  private ensureDir(): void {
    if (!existsSync(this.configDir)) {
      try {
        mkdirSync(this.configDir, { recursive: true });
      } catch {
        // Sandbox-safe fallback for environments where home directory is not writable.
        this.configDir = resolve(join(process.cwd(), '.phantom'));
        this.configPath = join(this.configDir, 'config.json');
        if (!existsSync(this.configDir)) {
          mkdirSync(this.configDir, { recursive: true });
        }
      }
    }
    // Create subdirectories
    const subdirs = ['modules', 'context', 'cache', 'logs', 'exports'];
    for (const dir of subdirs) {
      const path = join(this.configDir, dir);
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    }
  }

  private load(): PhantomConfig {
    this.ensureDir();
    if (existsSync(this.configPath)) {
      try {
        const raw = readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<PhantomConfig> & {
          mcp?: Partial<MCPConfig> & { serverMode?: MCPConfig['server_mode'] };
          security?: Partial<SecurityConfig> & { auditLogPath?: string };
        };
        const normalizedMcp: Partial<MCPConfig> = {
          enabled: parsed.mcp?.enabled,
          server_mode: parsed.mcp?.server_mode ?? parsed.mcp?.serverMode,
        };
        const normalizedSecurity: Partial<SecurityConfig> = {
          audit_log_path: parsed.security?.audit_log_path ?? parsed.security?.auditLogPath,
        };
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          primaryModel: { ...DEFAULT_CONFIG.primaryModel, ...parsed.primaryModel },
          fallbackModel: parsed.fallbackModel || DEFAULT_CONFIG.fallbackModel,
          visionModel: parsed.visionModel || DEFAULT_CONFIG.visionModel,
          installation: { ...DEFAULT_CONFIG.installation, ...parsed.installation },
          mcp: { ...DEFAULT_CONFIG.mcp, ...normalizedMcp },
          security: { ...DEFAULT_CONFIG.security, ...normalizedSecurity },
          selfHealing: parsed.selfHealing ?? DEFAULT_CONFIG.selfHealing,
          progressiveDisclosure: parsed.progressiveDisclosure ?? DEFAULT_CONFIG.progressiveDisclosure,
          autoDiscovery: parsed.autoDiscovery ?? DEFAULT_CONFIG.autoDiscovery,
          autonomy: { ...DEFAULT_CONFIG.autonomy, ...parsed.autonomy },
        };
      } catch {
        return { ...DEFAULT_CONFIG };
      }
    }
    return { ...DEFAULT_CONFIG };
  }

  save(): void {
    this.ensureDir();
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  get(): PhantomConfig {
    return this.config;
  }

  getAPIKey(service: keyof APIKeyConfig): string | undefined {
    return this.config.apiKeys[service];
  }

  setAPIKey(service: keyof APIKeyConfig, value: string): void {
    this.config.apiKeys[service] = value;
    this.save();
  }

  removeAPIKey(service: keyof APIKeyConfig): void {
    delete this.config.apiKeys[service];
    this.save();
  }

  getAllAPIKeys(): APIKeyConfig {
    return { ...this.config.apiKeys };
  }

  clearAPIKeys(): void {
    this.config.apiKeys = {};
    this.save();
  }

  set<K extends keyof PhantomConfig>(key: K, value: PhantomConfig[K]): void {
    this.config[key] = value;
    this.save();
  }

  isFirstRun(): boolean {
    return this.config.firstRun;
  }

  completeFirstRun(): void {
    this.config.firstRun = false;
    this.save();
  }

  addProject(project: ProjectConfig): void {
    this.config.projects.push(project);
    this.config.activeProject = project.name;
    this.save();
  }

  getActiveProject(): ProjectConfig | undefined {
    return this.config.projects.find(p => p.name === this.config.activeProject);
  }

  installModule(moduleName: string): void {
    if (!this.config.installedModules.includes(moduleName)) {
      this.config.installedModules.push(moduleName);
      this.save();
    }
  }

  uninstallModule(moduleName: string): void {
    this.config.installedModules = this.config.installedModules.filter(m => m !== moduleName);
    this.save();
  }

  isModuleInstalled(moduleName: string): boolean {
    return this.config.installedModules.includes(moduleName);
  }

  getConfigDir(): string {
    return this.configDir;
  }
}

// Singleton
let instance: ConfigManager | null = null;

export function getConfig(): ConfigManager {
  if (!instance) {
    instance = new ConfigManager();
  }
  return instance;
}
