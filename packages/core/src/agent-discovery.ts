// PHANTOM Core - Universal Agent Discovery System
import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

export type ExternalAgentType = 'llm' | 'assistant' | 'plugin' | 'ide' | 'terminal';

export interface AgentSignature {
  id: string;
  name: string;
  type: ExternalAgentType;
  description: string;
  capabilities: string[];
  detectionMethods: DetectionMethod[];
  integrationLevel: 'basic' | 'enhanced' | 'full';
  phantomFeatures: string[];
}

export interface DetectionMethod {
  type: 'filesystem' | 'process' | 'env' | 'port' | 'network';
  pattern: string | RegExp;
  weight: number; // 1-10 confidence level
}

export interface DetectedAgent {
  signature: AgentSignature;
  detectedPaths: string[];
  detectedProcesses: ProcessInfo[];
  detectedEnvVars: string[];
  confidence: number; // 0-100
  status: 'running' | 'installed' | 'available';
  lastSeen: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cmd: string;
  cwd?: string;
}

// Universal agent signatures database
export const AGENT_SIGNATURES: AgentSignature[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    type: 'assistant',
    description: 'AI coding assistant by Anthropic',
    capabilities: ['coding', 'refactoring', 'explanation', 'debugging'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.claude', weight: 8 },
      { type: 'process', pattern: /claude/i, weight: 9 },
      { type: 'env', pattern: 'CLAUDE_', weight: 7 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['context-sharing', 'swarm-analysis', 'prd-integration']
  },
  {
    id: 'cursor',
    name: 'Cursor',
    type: 'ide',
    description: 'AI-first code editor',
    capabilities: ['autocomplete', 'chat', 'inline-editing', 'refactoring'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.cursor', weight: 8 },
      { type: 'process', pattern: /cursor/i, weight: 9 },
      { type: 'env', pattern: 'CURSOR_', weight: 6 },
    ],
    integrationLevel: 'full',
    phantomFeatures: ['live-context', 'smart-nudges', 'auto-prd']
  },
  {
    id: 'codex',
    name: 'Codex',
    type: 'assistant',
    description: 'Open-source AI coding assistant',
    capabilities: ['code-gen', 'api-integration', 'workflow-automation'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.codex', weight: 8 },
      { type: 'process', pattern: /codex/i, weight: 7 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['workflow-sync', 'api-bridging', 'automation']
  },
  {
    id: 'gemini',
    name: 'Gemini',
    type: 'llm',
    description: 'Google\'s multimodal AI model',
    capabilities: ['general', 'multimodal', 'research', 'analysis'],
    detectionMethods: [
      { type: 'env', pattern: 'GOOGLE_API_KEY', weight: 9 },
      { type: 'env', pattern: 'GEMINI_', weight: 8 },
    ],
    integrationLevel: 'basic',
    phantomFeatures: ['research-assistant', 'content-analysis']
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    type: 'llm',
    description: 'OpenAI\'s conversational AI',
    capabilities: ['conversation', 'writing', 'brainstorming', 'analysis'],
    detectionMethods: [
      { type: 'env', pattern: 'OPENAI_API_KEY', weight: 9 },
      { type: 'env', pattern: 'CHATGPT_', weight: 7 },
    ],
    integrationLevel: 'basic',
    phantomFeatures: ['conversation-bridge', 'idea-generation']
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    type: 'ide',
    description: 'Popular code editor with AI extensions',
    capabilities: ['editing', 'debugging', 'extensions', 'terminal'],
    detectionMethods: [
      { type: 'filesystem', pattern: '.vscode', weight: 6 },
      { type: 'process', pattern: /code(\.exe)?$/, weight: 8 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['extension-api', 'terminal-integration', 'workspace-sync']
  },
  {
    id: 'zed',
    name: 'Zed',
    type: 'ide',
    description: 'High-performance code editor',
    capabilities: ['editing', 'collaboration', 'performance'],
    detectionMethods: [
      { type: 'process', pattern: /(^|\/)zed(\.exe)?(\s|$)/i, weight: 8 },
      { type: 'filesystem', pattern: '.zed', weight: 7 },
    ],
    integrationLevel: 'enhanced',
    phantomFeatures: ['collaboration-sync', 'performance-monitoring']
  }
];

export class AgentDiscovery {
  private cwd: string;

  constructor(workingDirectory: string = process.cwd()) {
    this.cwd = workingDirectory;
  }

  /**
   * Scan system for all detectable agents
   */
  async scanSystem(): Promise<DetectedAgent[]> {
    const detections: DetectedAgent[] = [];
    
    for (const signature of AGENT_SIGNATURES) {
      const detection = await this.detectAgent(signature);
      if (detection) {
        detections.push(detection);
      }
    }
    
    return detections.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect a specific agent by signature
   */
  private async detectAgent(signature: AgentSignature): Promise<DetectedAgent | null> {
    const detectedPaths: string[] = [];
    const detectedProcesses: ProcessInfo[] = [];
    const detectedEnvVars: string[] = [];
    let totalWeight = 0;
    let maxPossibleWeight = 0;

    // Filesystem detection
    for (const method of signature.detectionMethods.filter(m => m.type === 'filesystem')) {
      maxPossibleWeight += method.weight;
      const paths = this.scanFileSystem(method.pattern as string);
      if (paths.length > 0) {
        detectedPaths.push(...paths);
        totalWeight += method.weight;
      }
    }

    // Process detection
    for (const method of signature.detectionMethods.filter(m => m.type === 'process')) {
      maxPossibleWeight += method.weight;
      const processes = await this.scanProcesses(method.pattern as RegExp);
      if (processes.length > 0) {
        detectedProcesses.push(...processes);
        totalWeight += method.weight;
      }
    }

    // Environment variable detection
    for (const method of signature.detectionMethods.filter(m => m.type === 'env')) {
      maxPossibleWeight += method.weight;
      const envVars = this.scanEnvironment(method.pattern as string | RegExp);
      if (envVars.length > 0) {
        detectedEnvVars.push(...envVars);
        totalWeight += method.weight;
      }
    }

    if (totalWeight === 0) {
      return null;
    }

    const confidence = Math.round((totalWeight / maxPossibleWeight) * 100);
    const status = detectedProcesses.length > 0 ? 'running' : 'installed';

    return {
      signature,
      detectedPaths,
      detectedProcesses,
      detectedEnvVars,
      confidence,
      status,
      lastSeen: new Date().toISOString()
    };
  }

  /**
   * Scan filesystem for agent indicators
   */
  private scanFileSystem(pattern: string): string[] {
    const found = new Set<string>();
    
    // Check current working directory and parents
    let current = this.cwd;
    while (current !== '/' && current !== '.') {
      const fullPath = join(current, pattern);
      if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
        found.add(fullPath);
      }
      current = resolve(current, '..');
    }

    // Check home directory
    const homePath = join(process.env.HOME || '', pattern);
    if (existsSync(homePath) && statSync(homePath).isDirectory()) {
      found.add(homePath);
    }

    return Array.from(found);
  }

  /**
   * Scan running processes for agent indicators
   */
  private async scanProcesses(pattern: RegExp): Promise<ProcessInfo[]> {
    try {
      // Try ps command (Unix/Linux/macOS)
      const output = execSync('ps aux', { encoding: 'utf8' });
      const lines = output.split('\n');
      
      const processes: ProcessInfo[] = [];
      
      for (const line of lines.slice(1)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          const pid = parseInt(parts[1]);
          const cmd = parts.slice(10).join(' ');
          
          if (pattern.test(cmd) && !isNaN(pid)) {
            processes.push({
              pid,
              name: cmd.split(' ')[0],
              cmd
            });
          }
        }
      }
      
      return processes;
    } catch (error) {
      // Fallback: try Windows tasklist
      try {
        const output = execSync('tasklist /fo csv /v', { encoding: 'utf8' });
        const lines = output.split('\n');
        
        const processes: ProcessInfo[] = [];
        
        for (const line of lines.slice(1)) {
          if (line.includes('"')) {
            const parts = line.split('","');
            if (parts.length >= 9) {
              const name = parts[0].replace(/"/g, '');
              const pid = parseInt(parts[1]);
              const cmd = parts[8].replace(/"/g, '');
              
              if (pattern.test(name) && !isNaN(pid)) {
                processes.push({
                  pid,
                  name,
                  cmd
                });
              }
            }
          }
        }
        
        return processes;
      } catch (fallbackError) {
        return [];
      }
    }
  }

  /**
   * Scan environment variables for agent indicators
   */
  private scanEnvironment(pattern: string | RegExp): string[] {
    const found: string[] = [];
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const [key, value] of Object.entries(process.env)) {
      if (regex.test(key) && value) {
        found.push(`${key}=${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
      }
    }
    
    return found;
  }

  /**
   * Get detailed information about a detected agent
   */
  getAgentDetails(agentId: string): AgentSignature | undefined {
    return AGENT_SIGNATURES.find(sig => sig.id === agentId);
  }

  /**
   * Get all known agent signatures
   */
  getAllSignatures(): AgentSignature[] {
    return [...AGENT_SIGNATURES];
  }
}
