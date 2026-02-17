// PHANTOM Module: Time Machine v1.0.0
// Version and compare product decisions over time
// "I know the past."

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { getConfig, getContextEngine } from '@phantom-pm/core';

export interface ProductSnapshot {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  context: SnapshotContext;
  decisions: ProductDecision[];
  metrics: SnapshotMetrics;
  tags: string[];
  linkedPrdId?: string;
}

export interface SnapshotContext {
  projectName: string;
  indexedFiles: number;
  activeModules: string[];
  configHash: string;
}

export interface ProductDecision {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'technical' | 'design' | 'process' | 'strategy';
  status: 'proposed' | 'approved' | 'implemented' | 'rejected' | 'reverted';
  impact: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
  rationale: string;
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotMetrics {
  contextCoverage: number;
  moduleCount: number;
  decisionCount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SnapshotComparison {
  snapshotA: ProductSnapshot;
  snapshotB: ProductSnapshot;
  addedDecisions: ProductDecision[];
  removedDecisions: ProductDecision[];
  changedDecisions: DecisionChange[];
  contextDiff: ContextDiff;
  metricChanges: MetricChange[];
  summary: string;
}

export interface DecisionChange {
  decision: ProductDecision;
  fieldChanges: FieldChange[];
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface ContextDiff {
  filesAdded: string[];
  filesRemoved: string[];
  modulesAdded: string[];
  modulesRemoved: string[];
  configChanged: boolean;
}

export interface MetricChange {
  metric: string;
  oldValue: number;
  newValue: number;
  changePercent: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  baseSnapshotId: string;
  hypotheticalDecision: ProductDecision;
  projectedOutcomes: ProjectedOutcome[];
  riskAssessment: RiskAssessment;
  recommendation: string;
}

export interface ProjectedOutcome {
  metric: string;
  currentValue: number;
  projectedValue: number;
  confidence: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
}

export interface RiskFactor {
  category: string;
  description: string;
  likelihood: number;
  impact: number;
}

export class TimeMachineModule {
  private snapshotsDir: string;
  private scenariosDir: string;
  private snapshots: Map<string, ProductSnapshot> = new Map();

  constructor() {
    const configDir = getConfig().getConfigDir();
    this.snapshotsDir = join(configDir, 'time-machine', 'snapshots');
    this.scenariosDir = join(configDir, 'time-machine', 'scenarios');
    this.ensureDirectories();
    this.loadSnapshots();
  }

  private ensureDirectories(): void {
    if (!existsSync(this.snapshotsDir)) {
      mkdirSync(this.snapshotsDir, { recursive: true });
    }
    if (!existsSync(this.scenariosDir)) {
      mkdirSync(this.scenariosDir, { recursive: true });
    }
  }

  private loadSnapshots(): void {
    if (!existsSync(this.snapshotsDir)) return;

    const files = readdirSync(this.snapshotsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const content = readFileSync(join(this.snapshotsDir, file), 'utf8');
        const snapshot = JSON.parse(content) as ProductSnapshot;
        this.snapshots.set(snapshot.id, snapshot);
      } catch {
        // Skip invalid files
      }
    }
  }

  /**
   * Create a new product snapshot
   */
  async createSnapshot(
    name: string,
    description: string,
    options: {
      tags?: string[];
      decisions?: ProductDecision[];
    } = {}
  ): Promise<ProductSnapshot> {
    const config = getConfig();
    const context = getContextEngine();
    const configData = config.get();
    const contextStats = context.getStats();

    const snapshot: ProductSnapshot = {
      id: `snap_${Date.now().toString(36)}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      context: {
        projectName: configData.activeProject || 'unknown',
        indexedFiles: contextStats.totalFiles,
        activeModules: configData.installedModules,
        configHash: this.hashConfig(configData),
      },
      decisions: options.decisions || this.extractRecentDecisions(),
      metrics: {
        contextCoverage: contextStats.healthScore,
        moduleCount: configData.installedModules.length,
        decisionCount: (options.decisions || []).length,
        riskLevel: this.assessRiskLevel(options.decisions || []),
      },
      tags: options.tags || [],
    };

    this.saveSnapshot(snapshot);
    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * Compare two snapshots
   */
  async compareSnapshots(snapshotIdA: string, snapshotIdB: string): Promise<SnapshotComparison> {
    const snapshotA = this.snapshots.get(snapshotIdA);
    const snapshotB = this.snapshots.get(snapshotIdB);

    if (!snapshotA || !snapshotB) {
      throw new Error('One or both snapshots not found');
    }

    // Find added/removed/changed decisions
    const decisionIdsA = new Set(snapshotA.decisions.map(d => d.id));
    const decisionIdsB = new Set(snapshotB.decisions.map(d => d.id));

    const addedDecisions = snapshotB.decisions.filter(d => !decisionIdsA.has(d.id));
    const removedDecisions = snapshotA.decisions.filter(d => !decisionIdsB.has(d.id));

    const changedDecisions: DecisionChange[] = [];
    for (const decisionA of snapshotA.decisions) {
      const decisionB = snapshotB.decisions.find(d => d.id === decisionA.id);
      if (decisionB) {
        const changes = this.compareDecisions(decisionA, decisionB);
        if (changes.length > 0) {
          changedDecisions.push({
            decision: decisionB,
            fieldChanges: changes,
          });
        }
      }
    }

    // Context diff
    const contextDiff: ContextDiff = {
      filesAdded: [],
      filesRemoved: [],
      modulesAdded: snapshotB.context.activeModules.filter(m => !snapshotA.context.activeModules.includes(m)),
      modulesRemoved: snapshotA.context.activeModules.filter(m => !snapshotB.context.activeModules.includes(m)),
      configChanged: snapshotA.context.configHash !== snapshotB.context.configHash,
    };

    // Metric changes
    const metricChanges: MetricChange[] = [
      {
        metric: 'context_coverage',
        oldValue: snapshotA.metrics.contextCoverage,
        newValue: snapshotB.metrics.contextCoverage,
        changePercent: ((snapshotB.metrics.contextCoverage - snapshotA.metrics.contextCoverage) / snapshotA.metrics.contextCoverage) * 100,
      },
      {
        metric: 'module_count',
        oldValue: snapshotA.metrics.moduleCount,
        newValue: snapshotB.metrics.moduleCount,
        changePercent: ((snapshotB.metrics.moduleCount - snapshotA.metrics.moduleCount) / snapshotA.metrics.moduleCount) * 100,
      },
      {
        metric: 'decision_count',
        oldValue: snapshotA.metrics.decisionCount,
        newValue: snapshotB.metrics.decisionCount,
        changePercent: snapshotA.metrics.decisionCount > 0
          ? ((snapshotB.metrics.decisionCount - snapshotA.metrics.decisionCount) / snapshotA.metrics.decisionCount) * 100
          : 0,
      },
    ];

    return {
      snapshotA,
      snapshotB,
      addedDecisions,
      removedDecisions,
      changedDecisions,
      contextDiff,
      metricChanges,
      summary: this.generateComparisonSummary(addedDecisions, removedDecisions, changedDecisions, metricChanges),
    };
  }

  /**
   * Create a what-if scenario
   */
  async createWhatIfScenario(
    baseSnapshotId: string,
    hypotheticalDecision: ProductDecision,
    scenarioName: string
  ): Promise<WhatIfScenario> {
    const baseSnapshot = this.snapshots.get(baseSnapshotId);
    if (!baseSnapshot) {
      throw new Error(`Snapshot not found: ${baseSnapshotId}`);
    }

    // Analyze the hypothetical decision
    const projectedOutcomes = this.projectOutcomes(baseSnapshot, hypotheticalDecision);

    const scenario: WhatIfScenario = {
      id: `whatif_${Date.now().toString(36)}`,
      name: scenarioName,
      baseSnapshotId,
      hypotheticalDecision,
      projectedOutcomes,
      riskAssessment: this.assessScenarioRisk(hypotheticalDecision, projectedOutcomes),
      recommendation: this.generateRecommendation(hypotheticalDecision, projectedOutcomes),
    };

    this.saveScenario(scenario);
    return scenario;
  }

  /**
   * Get decision history
   */
  getDecisionHistory(decisionId?: string): ProductDecision[] | ProductDecision | undefined {
    if (decisionId) {
      for (const snapshot of this.snapshots.values()) {
        const decision = snapshot.decisions.find(d => d.id === decisionId);
        if (decision) {
          return decision;
        }
      }
      return undefined;
    }

    // Return all unique decisions
    const allDecisions: ProductDecision[] = [];
    const seen = new Set<string>();
    for (const snapshot of this.snapshots.values()) {
      for (const decision of snapshot.decisions) {
        if (!seen.has(decision.id)) {
          seen.add(decision.id);
          allDecisions.push(decision);
        }
      }
    }
    return allDecisions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * List all snapshots
   */
  listSnapshots(): ProductSnapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get snapshot by ID
   */
  getSnapshot(id: string): ProductSnapshot | undefined {
    return this.snapshots.get(id);
  }

  /**
   * Find snapshots by tag
   */
  findSnapshotsByTag(tag: string): ProductSnapshot[] {
    return this.listSnapshots().filter(s => s.tags.includes(tag));
  }

  // Private helper methods
  private saveSnapshot(snapshot: ProductSnapshot): void {
    const filePath = join(this.snapshotsDir, `${snapshot.id}.json`);
    writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  }

  private saveScenario(scenario: WhatIfScenario): void {
    const filePath = join(this.scenariosDir, `${scenario.id}.json`);
    writeFileSync(filePath, JSON.stringify(scenario, null, 2));
  }

  private hashConfig(config: unknown): string {
    // Simple hash for comparison
    const str = JSON.stringify(config);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private extractRecentDecisions(): ProductDecision[] {
    // Would integrate with actual decision tracking
    return [];
  }

  private assessRiskLevel(decisions: ProductDecision[]): 'low' | 'medium' | 'high' {
    if (decisions.length === 0) return 'low';

    const criticalCount = decisions.filter(d => d.impact === 'critical').length;
    const highCount = decisions.filter(d => d.impact === 'high').length;

    if (criticalCount > 2 || (criticalCount > 0 && highCount > 2)) {
      return 'high';
    }
    if (criticalCount > 0 || highCount > 3) {
      return 'medium';
    }
    return 'low';
  }

  private compareDecisions(a: ProductDecision, b: ProductDecision): FieldChange[] {
    const changes: FieldChange[] = [];
    const fields: (keyof ProductDecision)[] = ['status', 'title', 'description', 'impact', 'rationale'];

    for (const field of fields) {
      if (JSON.stringify(a[field]) !== JSON.stringify(b[field])) {
        changes.push({
          field,
          oldValue: a[field],
          newValue: b[field],
        });
      }
    }

    return changes;
  }

  private generateComparisonSummary(
    added: ProductDecision[],
    removed: ProductDecision[],
    changed: DecisionChange[],
    metricChanges: MetricChange[]
  ): string {
    const parts: string[] = [];

    if (added.length > 0) {
      parts.push(`${added.length} new decision${added.length > 1 ? 's' : ''} added`);
    }
    if (removed.length > 0) {
      parts.push(`${removed.length} decision${removed.length > 1 ? 's' : ''} removed`);
    }
    if (changed.length > 0) {
      parts.push(`${changed.length} decision${changed.length > 1 ? 's' : ''} modified`);
    }

    const significantChanges = metricChanges.filter(m => Math.abs(m.changePercent) > 10);
    if (significantChanges.length > 0) {
      parts.push(`${significantChanges.length} significant metric change${significantChanges.length > 1 ? 's' : ''}`);
    }

    return parts.join('; ') || 'No significant changes detected';
  }

  private projectOutcomes(
    _snapshot: ProductSnapshot,
    decision: ProductDecision
  ): ProjectedOutcome[] {
    // Simplified projection based on decision characteristics
    const outcomes: ProjectedOutcome[] = [];

    if (decision.category === 'feature') {
      outcomes.push({
        metric: 'user_engagement',
        currentValue: 100,
        projectedValue: decision.impact === 'high' ? 130 : decision.impact === 'medium' ? 115 : 105,
        confidence: decision.impact === 'high' ? 60 : 75,
      });
    }

    if (decision.category === 'technical') {
      outcomes.push({
        metric: 'performance',
        currentValue: 100,
        projectedValue: decision.impact === 'high' ? 140 : decision.impact === 'medium' ? 120 : 110,
        confidence: 80,
      });
    }

    outcomes.push({
      metric: 'time_to_market',
      currentValue: 30,
      projectedValue: decision.impact === 'critical' ? 45 : decision.impact === 'high' ? 38 : 32,
      confidence: 70,
    });

    return outcomes;
  }

  private assessScenarioRisk(decision: ProductDecision, outcomes: ProjectedOutcome[]): RiskAssessment {
    const factors: RiskFactor[] = [];

    if (decision.impact === 'critical') {
      factors.push({
        category: 'scope',
        description: 'High impact decision with broad scope',
        likelihood: 0.7,
        impact: 0.8,
      });
    }

    if (decision.status === 'proposed') {
      factors.push({
        category: 'uncertainty',
        description: 'Decision still in proposal phase',
        likelihood: 0.6,
        impact: 0.5,
      });
    }

    const lowConfidenceOutcomes = outcomes.filter(o => o.confidence < 70);
    if (lowConfidenceOutcomes.length > 0) {
      factors.push({
        category: 'prediction',
        description: `${lowConfidenceOutcomes.length} uncertain outcome projection${lowConfidenceOutcomes.length > 1 ? 's' : ''}`,
        likelihood: 0.5,
        impact: 0.4,
      });
    }

    const overallRisk = factors.length > 2 ? 'high' : factors.length > 0 ? 'medium' : 'low';

    return {
      overallRisk,
      factors,
    };
  }

  private generateRecommendation(decision: ProductDecision, outcomes: ProjectedOutcome[]): string {
    const positiveOutcomes = outcomes.filter(o => o.projectedValue > o.currentValue);
    const negativeOutcomes = outcomes.filter(o => o.projectedValue < o.currentValue);

    if (positiveOutcomes.length > negativeOutcomes.length) {
      return `Proceed with "${decision.title}". Projected positive impact on ${positiveOutcomes.map(o => o.metric).join(', ')}.`;
    } else {
      return `Reconsider "${decision.title}". Potential risks in ${negativeOutcomes.map(o => o.metric).join(', ')}.`;
    }
  }
}

// Module entry point for CLI
export async function runTimeMachine(args: Record<string, unknown>): Promise<unknown> {
  const tm = new TimeMachineModule();
  const command = args.command || args._[0];

  switch (command) {
    case 'snapshot': {
      const name = typeof args.name === 'string' ? args.name : `Snapshot ${new Date().toISOString()}`;
      const description = typeof args.description === 'string' ? args.description : 'Auto-generated snapshot';
      const result = await tm.createSnapshot(name, description, {
        tags: typeof args.tags === 'string' ? args.tags.split(',') : undefined,
      });
      return {
        success: true,
        snapshot: result,
      };
    }

    case 'compare': {
      const id1 = args.id1 || args._[1];
      const id2 = args.id2 || args._[2];
      if (!id1 || !id2 || typeof id1 !== 'string' || typeof id2 !== 'string') {
        throw new Error('Two snapshot IDs are required for comparison');
      }
      const result = await tm.compareSnapshots(id1, id2);
      return {
        success: true,
        comparison: result,
      };
    }

    case 'list': {
      const snapshots = tm.listSnapshots();
      return {
        success: true,
        snapshots,
        count: snapshots.length,
      };
    }

    case 'whatif': {
      const baseSnapshotId = args.baseId || args._[1];
      if (!baseSnapshotId || typeof baseSnapshotId !== 'string') {
        throw new Error('Base snapshot ID is required');
      }
      const scenarioName = typeof args.name === 'string' ? args.name : 'What-if scenario';
      const fallbackDecision: ProductDecision = {
        id: `dec_${Date.now()}`,
        title: 'Hypothetical Decision',
        description: 'Proposed change',
        category: 'feature',
        status: 'proposed',
        impact: 'medium',
        stakeholders: [],
        rationale: 'What-if analysis',
        tradeoffs: { pros: [], cons: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const decision: ProductDecision =
        typeof args.decision === 'object' && args.decision
          ? (args.decision as ProductDecision)
          : fallbackDecision;
      const result = await tm.createWhatIfScenario(baseSnapshotId, decision, scenarioName);
      return {
        success: true,
        scenario: result,
      };
    }

    default:
      throw new Error(`Unknown time-machine command: ${String(command)}`);
  }
}

export default TimeMachineModule;
