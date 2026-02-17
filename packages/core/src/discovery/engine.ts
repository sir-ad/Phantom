import type {
  DetectedAgentV2,
  DetectionEvidence,
  DiscoveryConfigV2,
  DiscoveryEngine,
  DiscoveryIssue,
  DiscoveryTarget,
} from './types.js';
import {
  detectAppSignals,
  detectBinarySignals,
  detectEnvSignals,
  detectFilesystemSignals,
  detectProcessSignals,
} from './providers.js';

const DEFAULT_WEIGHTS: Record<'filesystem' | 'process' | 'env' | 'binary' | 'app', number> = {
  filesystem: 6,
  process: 10,
  env: 4,
  binary: 8,
  app: 7,
};

export const DEFAULT_DISCOVERY_CONFIG_V2: DiscoveryConfigV2 = {
  maxRetries: 3,
  retryDelayMs: 500,
  confidenceThreshold: 20,
  checkProcesses: true,
  processTimeoutMs: 5000,
  additionalPaths: [],
  additionalEnvPatterns: [],
  processExclusionPatterns: [],
};

export class DefaultDiscoveryEngine implements DiscoveryEngine {
  constructor(
    private readonly targets: DiscoveryTarget[],
    private readonly cwd: string,
    private readonly config: DiscoveryConfigV2
  ) {}

  async scan(): Promise<{ detected: DetectedAgentV2[]; issues: DiscoveryIssue[] }> {
    const detected: DetectedAgentV2[] = [];
    const issues: DiscoveryIssue[] = [];

    for (const target of this.targets) {
      const result = await this.scanTarget(target);
      issues.push(...result.issues);
      if (result.detected) {
        detected.push(result.detected);
      }
    }

    return {
      detected: detected.sort((a, b) => b.confidence - a.confidence),
      issues,
    };
  }

  private async scanTarget(target: DiscoveryTarget): Promise<{ detected: DetectedAgentV2 | null; issues: DiscoveryIssue[] }> {
    const issues: DiscoveryIssue[] = [];
    const evidence: DetectionEvidence[] = [];
    const versions = new Set<string>();
    const weights = {
      ...DEFAULT_WEIGHTS,
      ...(target.weights || {}),
    };

    const possibleWeights: number[] = [];
    const matchedWeights: number[] = [];

    if (target.filesystemSignals && target.filesystemSignals.length > 0) {
      possibleWeights.push(weights.filesystem);
      const fsEvidence = detectFilesystemSignals(this.cwd, target.filesystemSignals, this.config.additionalPaths);
      if (fsEvidence.length > 0) {
        evidence.push(...fsEvidence);
        matchedWeights.push(weights.filesystem);
      }
    }

    if (target.envSignals && target.envSignals.length > 0) {
      possibleWeights.push(weights.env);
      const envEvidence = detectEnvSignals(target.envSignals, this.config.additionalEnvPatterns);
      if (envEvidence.length > 0) {
        evidence.push(...envEvidence);
        matchedWeights.push(weights.env);
      }
    }

    if (target.binaries && target.binaries.length > 0) {
      possibleWeights.push(weights.binary);
      const { evidence: binaryEvidence, versions: foundVersions } = detectBinarySignals(
        target.binaries,
        this.config.processTimeoutMs
      );
      if (binaryEvidence.length > 0) {
        evidence.push(...binaryEvidence);
        matchedWeights.push(weights.binary);
      }
      for (const version of foundVersions) versions.add(version);
    }

    if (target.appPaths && Object.keys(target.appPaths).length > 0) {
      possibleWeights.push(weights.app);
      const appEvidence = detectAppSignals(target.appPaths);
      if (appEvidence.length > 0) {
        evidence.push(...appEvidence);
        matchedWeights.push(weights.app);
      }
    }

    if (this.config.checkProcesses && target.processSignals && target.processSignals.length > 0) {
      possibleWeights.push(weights.process);
      const processExclusions = [
        ...this.config.processExclusionPatterns,
        ...(target.processExclusions || []),
      ];
      const processResult = detectProcessSignals(
        target.processSignals,
        processExclusions,
        this.config.processTimeoutMs
      );
      issues.push(
        ...processResult.issues.map(issue => ({
          ...issue,
          agentId: target.id,
        }))
      );
      if (processResult.evidence.length > 0) {
        evidence.push(...processResult.evidence);
        matchedWeights.push(weights.process);
      }
    }

    const maxWeight = possibleWeights.reduce((sum, value) => sum + value, 0);
    const score = matchedWeights.reduce((sum, value) => sum + value, 0);
    const confidence = maxWeight > 0 ? Math.round((score / maxWeight) * 100) : 0;

    if (confidence < this.config.confidenceThreshold || evidence.length === 0) {
      return { detected: null, issues };
    }

    const status = evidence.some(item => item.provider === 'process')
      ? 'running'
      : (evidence.some(item => item.provider === 'filesystem' || item.provider === 'binary' || item.provider === 'app')
        ? 'installed'
        : 'available');

    return {
      detected: {
        agentId: target.id,
        name: target.name,
        confidence,
        status,
        evidence,
        versions: Array.from(versions),
        detectedAt: new Date().toISOString(),
      },
      issues,
    };
  }
}
