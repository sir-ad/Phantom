export type DetectionProvider = 'filesystem' | 'process' | 'env' | 'binary' | 'app';

export interface DetectionEvidence {
  provider: DetectionProvider;
  detail: string;
  confidenceWeight: number;
  metadata?: Record<string, unknown>;
}

export interface DiscoveryIssue {
  level: 'warn' | 'error';
  code: string;
  message: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

export interface DetectedAgentV2 {
  agentId: string;
  name: string;
  confidence: number;
  status: 'running' | 'installed' | 'available';
  evidence: DetectionEvidence[];
  versions: string[];
  detectedAt: string;
}

export interface DiscoveryConfigV2 {
  maxRetries: number;
  retryDelayMs: number;
  confidenceThreshold: number;
  checkProcesses: boolean;
  processTimeoutMs: number;
  additionalPaths: string[];
  additionalEnvPatterns: Array<string | RegExp>;
  processExclusionPatterns: RegExp[];
}

export interface DiscoveryTarget {
  id: string;
  name: string;
  filesystemSignals?: string[];
  envSignals?: Array<string | RegExp>;
  processSignals?: RegExp[];
  processExclusions?: RegExp[];
  binaries?: string[];
  appPaths?: Partial<Record<NodeJS.Platform, string[]>>;
  weights?: Partial<Record<DetectionProvider, number>>;
}

export interface DiscoveryEngine {
  scan(): Promise<{ detected: DetectedAgentV2[]; issues: DiscoveryIssue[] }>;
}
