// PHANTOM Modules package
// This package hosts built-in module implementations.

export const MODULES_PACKAGE_VERSION = '1.0.0';

export function describeModulesPackage(): string {
  return 'Phantom modules package - Real module implementations.';
}

// Export module implementations
export { generatePRD, runPRDForge, type GeneratedPRD, type PRDGenerationOptions } from './prd-forge.js';
export { StoryWriterModule, type UserStory, type StorySprint, type StoryWriterConfig } from './story-writer.js';
export { SprintPlannerModule, runSprintPlanner, type SprintPlan, type SprintStory, type TeamMember, type SprintPlannerConfig } from './sprint-planner.js';
export { BridgeModule, runBridge, type TranslationResult, type TechnicalSpecification } from './bridge.js';
export { SwarmModule, runSwarm, type SwarmAnalysis, type SwarmAgent } from './swarm.js';
export { CompetitiveModule, runCompetitive, type CompetitiveAnalysis, type Competitor, type MarketTrend } from './competitive.js';
export { AnalyticsLensModule, runAnalyticsLens, type Dashboard, type Report, type Metric } from './analytics-lens.js';

// New module exports
export { OracleModule, runOracle, type PredictionResult, type SimulationResult, type ForecastResult, type RiskAssessment } from './oracle.js';
export { ExperimentLabModule, runExperimentLab, type ExperimentDesign, type ExperimentResult, type SampleSizeCalculation } from './experiment-lab.js';
export { UXAuditorModule, runUXAuditor, type UXAuditResult, type UXScoreBreakdown, type WCAGCompliance } from './ux-auditor.js';
export { TimeMachineModule, runTimeMachine, type ProductSnapshot, type SnapshotComparison, type WhatIfScenario } from './time-machine.js';
export { FigmaBridgeModule, runFigmaBridge, type DesignAnalysis, type SyncResult, type FigmaFile } from './figma-bridge.js';

// Additional type exports
export { VariantDataPoint, type VariantResult } from './experiment-lab.js';
export { UXIssue, type UXRecommendation } from './ux-auditor.js';
