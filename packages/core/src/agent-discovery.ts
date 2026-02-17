// PHANTOM Core - Unified Agent Discovery
import {
  DefaultDiscoveryEngine,
  DEFAULT_DISCOVERY_CONFIG_V2,
  type DiscoveryIssue,
  type DiscoveryTarget,
} from './discovery/index.js';

export type ExternalAgentType = 'llm' | 'assistant' | 'plugin' | 'ide' | 'terminal' | 'cli';

export interface AgentSignature {
  id: string;
  name: string;
  type: ExternalAgentType;
  description: string;
  capabilities: string[];
  detectionMethods: DetectionMethod[];
  integrationLevel: 'basic' | 'enhanced' | 'full';
  phantomFeatures: string[];
  configPaths?: string[];
  binaries?: string[];
  appPaths?: Partial<Record<NodeJS.Platform, string[]>>;
  processExclusions?: RegExp[];
}

export interface DetectionMethod {
  type: 'filesystem' | 'process' | 'env' | 'port' | 'network' | 'command' | 'binary' | 'app';
  pattern: string | RegExp;
  weight: number;
}

export interface DetectedAgent {
  signature: AgentSignature;
  detectedPaths: string[];
  detectedProcesses: ProcessInfo[];
  detectedEnvVars: string[];
  detectedVersions: string[];
  confidence: number;
  status: 'running' | 'installed' | 'available';
  lastSeen: string;
  detectionAttempts: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cmd: string;
  cwd?: string;
  version?: string;
}

export interface DiscoveryConfig {
  maxRetries: number;
  retryDelayMs: number;
  additionalPaths: string[];
  additionalEnvVars: string[];
  checkProcesses: boolean;
  processTimeoutMs: number;
  confidenceThreshold: number;
}

const DEFAULT_DISCOVERY_CONFIG: DiscoveryConfig = {
  maxRetries: DEFAULT_DISCOVERY_CONFIG_V2.maxRetries,
  retryDelayMs: DEFAULT_DISCOVERY_CONFIG_V2.retryDelayMs,
  additionalPaths: [],
  additionalEnvVars: [],
  checkProcesses: DEFAULT_DISCOVERY_CONFIG_V2.checkProcesses,
  processTimeoutMs: DEFAULT_DISCOVERY_CONFIG_V2.processTimeoutMs,
  confidenceThreshold: DEFAULT_DISCOVERY_CONFIG_V2.confidenceThreshold,
};

const MAC_APPS = {
  cursor: '/Applications/Cursor.app',
  codex: '/Applications/Codex.app',
  zed: '/Applications/Zed.app',
  vscode: '/Applications/Visual Studio Code.app',
};

// Unified signatures used by both CLI agent discovery and MCP registration status.
export const AGENT_SIGNATURES: AgentSignature[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    type: 'assistant',
    description: 'AI coding assistant by Anthropic',
    capabilities: ['coding', 'refactoring', 'explanation', 'debugging'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.claude', weight: 8 },
      { type: 'process', pattern: /(^|\/)claude(\s|$)/i, weight: 10 },
      { type: 'env', pattern: 'CLAUDE_', weight: 6 },
      { type: 'binary', pattern: 'claude', weight: 9 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['context-sharing', 'swarm-analysis', 'prd-integration'],
    configPaths: ['.claude/settings.json'],
    binaries: ['claude'],
    processExclusions: [/ollama\s+launch\s+claude/i],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    type: 'ide',
    description: 'AI-first code editor',
    capabilities: ['autocomplete', 'chat', 'inline-editing', 'refactoring'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.cursor', weight: 8 },
      { type: 'process', pattern: /Cursor\.app|(^|\/)cursor(\s|$)/i, weight: 10 },
      { type: 'binary', pattern: 'cursor', weight: 8 },
      { type: 'app', pattern: MAC_APPS.cursor, weight: 8 },
    ],
    integrationLevel: 'full',
    phantomFeatures: ['live-context', 'smart-nudges', 'auto-prd'],
    configPaths: ['.cursor/settings.json'],
    binaries: ['cursor'],
    appPaths: {
      darwin: [MAC_APPS.cursor],
      linux: ['/usr/share/cursor', '/opt/Cursor'],
      win32: ['C:\\Program Files\\Cursor\\Cursor.exe'],
    },
    processExclusions: [/CursorUIViewService/i, /TextInputUIMacHelper/i],
  },
  {
    id: 'codex',
    name: 'Codex',
    type: 'assistant',
    description: 'Open-source AI coding assistant',
    capabilities: ['code-gen', 'api-integration', 'workflow-automation'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.codex', weight: 8 },
      { type: 'process', pattern: /Codex\.app|(^|\/)codex(\s|$)/i, weight: 10 },
      { type: 'binary', pattern: 'codex', weight: 9 },
      { type: 'app', pattern: MAC_APPS.codex, weight: 8 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['workflow-sync', 'api-bridging', 'automation'],
    configPaths: ['Library/Application Support/Codex/User/settings.json'],
    binaries: ['codex'],
    appPaths: {
      darwin: [MAC_APPS.codex],
      linux: ['/opt/codex', '/usr/share/codex'],
      win32: ['C:\\Program Files\\Codex\\Codex.exe'],
    },
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    type: 'ide',
    description: 'Code editor with AI extension ecosystem',
    capabilities: ['editing', 'debugging', 'extensions', 'terminal'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.vscode', weight: 6 },
      { type: 'process', pattern: /Visual Studio Code\.app|(^|\/)code(\s|$)/i, weight: 8 },
      { type: 'binary', pattern: 'code', weight: 7 },
      { type: 'app', pattern: MAC_APPS.vscode, weight: 7 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['extension-api', 'terminal-integration', 'workspace-sync'],
    configPaths: ['.vscode/settings.json', 'Library/Application Support/Code/User/settings.json'],
    binaries: ['code'],
    appPaths: {
      darwin: [MAC_APPS.vscode],
      linux: ['/usr/share/code', '/opt/visual-studio-code'],
      win32: ['C:\\Program Files\\Microsoft VS Code\\Code.exe'],
    },
  },
  {
    id: 'zed',
    name: 'Zed',
    type: 'ide',
    description: 'High-performance editor',
    capabilities: ['editing', 'collaboration', 'performance'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.zed', weight: 7 },
      { type: 'process', pattern: /Zed\.app|(^|\/)zed(\s|$)/i, weight: 8 },
      { type: 'binary', pattern: 'zed', weight: 7 },
      { type: 'app', pattern: MAC_APPS.zed, weight: 7 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['collaboration-sync', 'performance-monitoring'],
    configPaths: ['.config/zed/settings.json'],
    binaries: ['zed'],
    appPaths: {
      darwin: [MAC_APPS.zed],
      linux: ['/usr/share/zed', '/opt/zed'],
      win32: ['C:\\Program Files\\Zed\\Zed.exe'],
    },
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    type: 'cli',
    description: 'Google Gemini command-line client',
    capabilities: ['research', 'multimodal', 'analysis'],
    detectionMethods: [
      { type: 'binary', pattern: 'gemini', weight: 9 },
      { type: 'process', pattern: /(^|\/)gemini(\s|$)/i, weight: 7 },
      { type: 'env', pattern: 'GOOGLE_API_KEY', weight: 6 },
      { type: 'env', pattern: 'GEMINI_', weight: 6 },
    ],
    integrationLevel: 'basic',
    phantomFeatures: ['research-assistant', 'content-analysis'],
    binaries: ['gemini'],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    type: 'ide',
    description: 'AI-native code editor by Codeium',
    capabilities: ['autocomplete', 'chat', 'flows', 'inline-editing'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.windsurf', weight: 8 },
      { type: 'process', pattern: /Windsurf\.app|(^|\/)windsurf(\s|$)/i, weight: 10 },
      { type: 'binary', pattern: 'windsurf', weight: 8 },
      { type: 'app', pattern: '/Applications/Windsurf.app', weight: 8 },
    ],
    integrationLevel: 'full',
    phantomFeatures: ['live-context', 'smart-nudges', 'auto-prd', 'swarm-analysis'],
    configPaths: ['.windsurf/mcp_config.json'],
    binaries: ['windsurf'],
    appPaths: {
      darwin: ['/Applications/Windsurf.app'],
      linux: ['/usr/share/windsurf', '/opt/Windsurf'],
      win32: ['C:\\Program Files\\Windsurf\\Windsurf.exe'],
    },
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    type: 'assistant',
    description: 'Anthropic Claude desktop application',
    capabilities: ['chat', 'analysis', 'coding', 'mcp-client'],
    detectionMethods: [
      { type: 'app', pattern: '/Applications/Claude.app', weight: 10 },
      { type: 'process', pattern: /Claude\.app|(^|\/)Claude(\s|$)/i, weight: 9 },
      { type: 'filesystem', pattern: 'claude_desktop_config.json', weight: 8 },
      { type: 'env', pattern: 'ANTHROPIC_API_KEY', weight: 5 },
    ],
    integrationLevel: 'full',
    phantomFeatures: ['context-sharing', 'swarm-analysis', 'prd-integration', 'smart-nudges'],
    configPaths: ['Library/Application Support/Claude/claude_desktop_config.json'],
    appPaths: {
      darwin: ['/Applications/Claude.app'],
      win32: ['C:\\Users\\*\\AppData\\Local\\AnthropicClaude\\claude.exe'],
    },
  },
  {
    id: 'antigravity',
    name: 'Antigravity (Gemini Code Assist)',
    type: 'assistant',
    description: 'Google DeepMind advanced agentic coding assistant',
    capabilities: ['coding', 'refactoring', 'debugging', 'planning', 'mcp-client'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.gemini', weight: 9 },
      { type: 'binary', pattern: 'gemini-code-assist', weight: 10 },
      { type: 'env', pattern: 'GEMINI_', weight: 5 },
      { type: 'env', pattern: 'GOOGLE_CLOUD_PROJECT', weight: 4 },
    ],
    integrationLevel: 'full',
    phantomFeatures: ['context-sharing', 'swarm-analysis', 'prd-integration', 'live-context'],
    configPaths: ['.gemini/settings.json'],
  },
  {
    id: 'cline',
    name: 'Cline',
    type: 'plugin',
    description: 'Autonomous coding agent for VS Code',
    capabilities: ['coding', 'terminal', 'browser', 'mcp-client'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.cline', weight: 8 },
      { type: 'filesystem', pattern: '.vscode/cline_mcp_settings.json', weight: 9 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['context-sharing', 'swarm-analysis', 'prd-integration'],
    configPaths: ['.vscode/cline_mcp_settings.json'],
  },
  {
    id: 'continue',
    name: 'Continue',
    type: 'plugin',
    description: 'Open-source AI code assistant for VS Code and JetBrains',
    capabilities: ['autocomplete', 'chat', 'editing', 'mcp-client'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.continue', weight: 8 },
      { type: 'filesystem', pattern: '.continue/config.json', weight: 9 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['context-sharing', 'smart-nudges'],
    configPaths: ['.continue/config.json'],
  },
  {
    id: 'aider',
    name: 'Aider',
    type: 'cli',
    description: 'AI pair programming in your terminal',
    capabilities: ['coding', 'refactoring', 'git-integration'],
    detectionMethods: [
      { type: 'binary', pattern: 'aider', weight: 9 },
      { type: 'filesystem', pattern: '.aider', weight: 7 },
      { type: 'process', pattern: /(^|\/)aider(\s|$)/i, weight: 8 },
    ],
    integrationLevel: 'basic',
    phantomFeatures: ['context-sharing', 'prd-integration'],
    binaries: ['aider'],
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    type: 'plugin',
    description: 'AI pair programmer by GitHub/OpenAI',
    capabilities: ['autocomplete', 'chat', 'inline-editing'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.github-copilot', weight: 7 },
      { type: 'env', pattern: 'COPILOT_', weight: 6 },
      { type: 'filesystem', pattern: '.vscode/extensions/github.copilot', weight: 8 },
    ],
    integrationLevel: 'basic',
    phantomFeatures: ['context-sharing'],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    type: 'llm',
    description: 'Run large language models locally',
    capabilities: ['inference', 'embeddings', 'local-ai'],
    detectionMethods: [
      { type: 'binary', pattern: 'ollama', weight: 10 },
      { type: 'process', pattern: /(^|\/)ollama(\s|$)/i, weight: 9 },
      { type: 'port', pattern: '11434', weight: 8 },
      { type: 'env', pattern: 'OLLAMA_', weight: 6 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['local-inference', 'context-sharing', 'swarm-analysis'],
    binaries: ['ollama'],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    type: 'llm',
    description: 'Desktop application for running local LLMs',
    capabilities: ['inference', 'model-management', 'local-ai'],
    detectionMethods: [
      { type: 'app', pattern: '/Applications/LM Studio.app', weight: 9 },
      { type: 'process', pattern: /LM Studio\.app|(^|\/)lms(\s|$)/i, weight: 8 },
      { type: 'port', pattern: '1234', weight: 7 },
      { type: 'binary', pattern: 'lms', weight: 8 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['local-inference', 'context-sharing'],
    binaries: ['lms'],
    appPaths: {
      darwin: ['/Applications/LM Studio.app'],
      win32: ['C:\\Users\\*\\AppData\\Local\\LM Studio\\LM Studio.exe'],
    },
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    type: 'cli',
    description: 'Open-source terminal-based AI coding assistant',
    capabilities: ['coding', 'terminal', 'mcp-client'],
    detectionMethods: [
      { type: 'binary', pattern: 'opencode', weight: 9 },
      { type: 'filesystem', pattern: '.opencode', weight: 8 },
      { type: 'process', pattern: /(^|\/)opencode(\s|$)/i, weight: 8 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['context-sharing', 'swarm-analysis', 'prd-integration'],
    binaries: ['opencode'],
    configPaths: ['.opencode/config.json'],
  },
];

function signatureToTarget(signature: AgentSignature): DiscoveryTarget {
  const filesystemSignals = [
    ...signature.detectionMethods
      .filter(method => method.type === 'filesystem' && typeof method.pattern === 'string')
      .map(method => method.pattern as string),
    ...(signature.configPaths || []),
  ];

  const processSignals = signature.detectionMethods
    .filter(method => method.type === 'process' && method.pattern instanceof RegExp)
    .map(method => method.pattern as RegExp);

  const envSignals = signature.detectionMethods
    .filter(method => method.type === 'env')
    .map(method => method.pattern);

  const binarySignals = [
    ...signature.detectionMethods
      .filter(method => method.type === 'binary' && typeof method.pattern === 'string')
      .map(method => method.pattern as string),
    ...(signature.binaries || []),
  ];

  return {
    id: signature.id,
    name: signature.name,
    filesystemSignals,
    processSignals,
    envSignals,
    binaries: Array.from(new Set(binarySignals)),
    appPaths: signature.appPaths,
    processExclusions: signature.processExclusions || [],
  };
}

export class AgentDiscovery {
  private readonly cwd: string;
  private readonly config: DiscoveryConfig;
  private lastIssues: DiscoveryIssue[] = [];

  constructor(workingDirectory: string = process.cwd(), config: Partial<DiscoveryConfig> = {}) {
    this.cwd = workingDirectory;
    this.config = { ...DEFAULT_DISCOVERY_CONFIG, ...config };
  }

  async scanSystem(): Promise<DetectedAgent[]> {
    const targets = AGENT_SIGNATURES.map(signatureToTarget);
    let attempt = 1;

    while (attempt <= this.config.maxRetries) {
      try {
        const engine = new DefaultDiscoveryEngine(targets, this.cwd, {
          ...DEFAULT_DISCOVERY_CONFIG_V2,
          maxRetries: this.config.maxRetries,
          retryDelayMs: this.config.retryDelayMs,
          confidenceThreshold: this.config.confidenceThreshold,
          checkProcesses: this.config.checkProcesses,
          processTimeoutMs: this.config.processTimeoutMs,
          additionalPaths: this.config.additionalPaths,
          additionalEnvPatterns: this.config.additionalEnvVars,
          processExclusionPatterns: [/CursorUIViewService/i, /TextInputUIMacHelper/i],
        });

        const { detected, issues } = await engine.scan();
        this.lastIssues = issues;

        const normalized = detected
          .map(item => {
            const signature = AGENT_SIGNATURES.find(candidate => candidate.id === item.agentId);
            if (!signature) return null;

            const detectedProcesses: ProcessInfo[] = item.evidence
              .filter(evidence => evidence.provider === 'process')
              .map(evidence => ({
                pid: Number((evidence.metadata?.pid as number) || 0),
                name: String((evidence.metadata?.executable as string) || ''),
                cmd: String((evidence.metadata?.command as string) || evidence.detail),
              }))
              .filter(proc => Number.isFinite(proc.pid) && proc.pid > 0);

            const detectedPaths = item.evidence
              .filter(evidence => evidence.provider === 'filesystem' || evidence.provider === 'app' || evidence.provider === 'binary')
              .map(evidence => evidence.detail);

            const detectedEnvVars = item.evidence
              .filter(evidence => evidence.provider === 'env')
              .map(evidence => evidence.detail);

            return {
              signature,
              detectedPaths: Array.from(new Set(detectedPaths)),
              detectedProcesses,
              detectedEnvVars: Array.from(new Set(detectedEnvVars)),
              detectedVersions: item.versions,
              confidence: item.confidence,
              status: item.status,
              lastSeen: item.detectedAt,
              detectionAttempts: attempt,
            } satisfies DetectedAgent;
          })
          .filter((agent): agent is DetectedAgent => agent !== null)
          .sort((a, b) => b.confidence - a.confidence);

        return normalized;
      } catch (error) {
        this.lastIssues = [
          {
            level: 'error',
            code: 'DISCOVERY_SCAN_FAILED',
            message: error instanceof Error ? error.message : 'Agent discovery failed',
          },
        ];

        if (attempt >= this.config.maxRetries) {
          throw error;
        }

        const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      attempt += 1;
    }

    return [];
  }

  getLastIssues(): DiscoveryIssue[] {
    return [...this.lastIssues];
  }

  getAgentDetails(agentId: string): AgentSignature | undefined {
    return AGENT_SIGNATURES.find(signature => signature.id === agentId);
  }

  getAllSignatures(): AgentSignature[] {
    return [...AGENT_SIGNATURES];
  }
}
