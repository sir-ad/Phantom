// PHANTOM Module: Experiment Lab v1.0.0
// A/B test design and analysis
// "I know the truth."

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getAIManager, getConfig } from '@phantom-pm/core';

export interface ExperimentDesign {
  id: string;
  name: string;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  variants: Variant[];
  sampleSize: number;
  duration: number;
  confidenceLevel: number;
  targeting?: TargetingCriteria;
  createdAt: string;
  status: 'draft' | 'running' | 'completed' | 'stopped';
}

export interface Variant {
  name: string;
  allocation: number;
  description: string;
}

export interface TargetingCriteria {
  userSegments?: string[];
  trafficPercentage?: number;
  devices?: string[];
  regions?: string[];
}

export interface ExperimentResult {
  experimentId: string;
  totalParticipants: number;
  duration: number;
  variantResults: VariantResult[];
  winner?: string;
  statisticalSignificance: boolean;
  pValue: number;
  effectSize: number;
  confidence: number;
  recommendations: string[];
}

export interface VariantResult {
  name: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  lift: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface SampleSizeCalculation {
  baselineRate: number;
  minimumDetectableEffect: number;
  confidenceLevel: number;
  power: number;
  sampleSize: number;
  duration: number;
  estimatedTraffic: number;
}

export interface RolloutStrategy {
  phases: RolloutPhase[];
  totalDuration: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RolloutPhase {
  name: string;
  trafficPercentage: number;
  duration: number;
  criteria: string[];
}

export interface VariantDataPoint {
  participants: number;
  conversions: number;
}

export class ExperimentLabModule {
  private outputDir: string;
  private experiments: Map<string, ExperimentDesign> = new Map();

  constructor() {
    const configDir = getConfig().getConfigDir();
    this.outputDir = join(configDir, 'experiments');
    this.ensureOutputDir();
    this.loadExperiments();
  }

  private ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private loadExperiments(): void {
    // Load existing experiments from disk
    // Implementation would scan the outputDir for experiment files
  }

  /**
   * Design a new experiment
   */
  async designExperiment(
    hypothesis: string,
    primaryMetric: string,
    options: {
      variants?: string[];
      secondaryMetrics?: string[];
      sampleSize?: number;
      duration?: number;
      confidenceLevel?: number;
    } = {}
  ): Promise<ExperimentDesign> {
    const ai = getAIManager();

    const systemPrompt = `You are an experiment design AI for product teams.
Analyze the hypothesis and metric, then design a rigorous A/B test.

Respond in JSON format:
{
  "name": "Experiment name",
  "hypothesis": "Refined hypothesis",
  "primaryMetric": "metric name",
  "secondaryMetrics": ["metric1", "metric2"],
  "variants": [
    { "name": "control", "allocation": 50, "description": "Current version" },
    { "name": "treatment", "allocation": 50, "description": "New version" }
  ],
  "sampleSize": number,
  "duration": number (days),
  "confidenceLevel": 0.95,
  "targeting": {
    "userSegments": ["segment1"],
    "trafficPercentage": 100
  },
  "considerations": ["consideration 1", "consideration 2"]
}`;

    const userPrompt = `Design an experiment for:

Hypothesis: ${hypothesis}
Primary Metric: ${primaryMetric}
${options.secondaryMetrics ? `Secondary Metrics: ${options.secondaryMetrics.join(', ')}` : ''}

Provide a detailed experimental design.`;

    try {
      const response = await ai.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        maxTokens: 2000,
      });

      const parsed = this.parseExperimentDesign(response.content);
      const fallbackVariants: Variant[] = [
        { name: 'control', allocation: 50, description: 'Current version' },
        { name: 'treatment', allocation: 50, description: 'New version' },
      ];
      const experiment: ExperimentDesign = {
        id: `exp_${Date.now().toString(36)}`,
        name: parsed.name || `Experiment: ${hypothesis.slice(0, 50)}`,
        hypothesis: parsed.hypothesis || hypothesis,
        primaryMetric: parsed.primaryMetric || primaryMetric,
        secondaryMetrics: parsed.secondaryMetrics || options.secondaryMetrics || [],
        variants: (parsed.variants && parsed.variants.length > 0) ? parsed.variants : fallbackVariants,
        sampleSize: parsed.sampleSize || options.sampleSize || 1000,
        duration: parsed.duration || options.duration || 14,
        confidenceLevel: parsed.confidenceLevel || 0.95,
        targeting: parsed.targeting,
        createdAt: new Date().toISOString(),
        status: 'draft',
      };

      this.saveExperiment(experiment);
      return experiment;
    } catch (error) {
      return this.createFallbackExperiment(hypothesis, primaryMetric, options);
    }
  }

  /**
   * Calculate required sample size
   */
  calculateSampleSize(params: {
    baselineRate: number;
    minimumDetectableEffect: number;
    confidenceLevel?: number;
    power?: number;
    estimatedTraffic?: number;
  }): SampleSizeCalculation {
    const {
      baselineRate,
      minimumDetectableEffect,
      confidenceLevel = 0.95,
      power = 0.8,
      estimatedTraffic = 1000,
    } = params;

    // Z-scores for confidence level and power
    const zAlpha = this.getZScore(confidenceLevel);
    const zBeta = this.getZScore(power);

    // Calculate sample size per variant
    const p1 = baselineRate;
    const p2 = baselineRate + minimumDetectableEffect;
    const p = (p1 + p2) / 2;

    const numerator = 2 * p * (1 - p) * Math.pow(zAlpha + zBeta, 2);
    const denominator = Math.pow(minimumDetectableEffect, 2);
    const sampleSize = Math.ceil(numerator / denominator);

    // Calculate duration based on traffic
    const duration = Math.ceil((sampleSize * 2) / estimatedTraffic);

    return {
      baselineRate,
      minimumDetectableEffect,
      confidenceLevel,
      power,
      sampleSize,
      duration,
      estimatedTraffic,
    };
  }

  /**
   * Analyze experiment results
   */
  async analyzeResults(
    experimentId: string,
    variantData: Record<string, VariantDataPoint>
  ): Promise<ExperimentResult> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const variantResults: VariantResult[] = [];
    const controlData = variantData.control || variantData[Object.keys(variantData)[0]];

    if (!controlData) {
      throw new Error('Control variant data required');
    }

    const controlRate = controlData.conversions / controlData.participants;

    for (const [variantName, data] of Object.entries(variantData)) {
      const rate = data.conversions / data.participants;
      const lift = ((rate - controlRate) / controlRate) * 100;

      // Calculate confidence interval using normal approximation
      const se = Math.sqrt(
        (rate * (1 - rate)) / data.participants +
        (controlRate * (1 - controlRate)) / controlData.participants
      );
      const zScore = 1.96; // 95% confidence

      variantResults.push({
        name: variantName,
        participants: data.participants,
        conversions: data.conversions,
        conversionRate: rate,
        lift,
        confidenceInterval: {
          lower: lift - zScore * se * 100,
          upper: lift + zScore * se * 100,
        },
      });
    }

    // Calculate statistical significance using chi-square test
    const totalParticipants = Object.values(variantData).reduce((sum, d) => sum + d.participants, 0);
    const pValue = this.calculatePValue(variantData);
    const statisticalSignificance = pValue < 0.05;

    // Find winner
    const winner = variantResults
      .filter(v => v.name !== 'control')
      .sort((a, b) => b.conversionRate - a.conversionRate)[0];

    // Calculate Cohen's d effect size
    const effectSize = this.calculateEffectSize(controlData, variantData[winner?.name || '']);

    return {
      experimentId,
      totalParticipants,
      duration: experiment.duration,
      variantResults,
      winner: statisticalSignificance ? winner?.name : undefined,
      statisticalSignificance,
      pValue,
      effectSize,
      confidence: experiment.confidenceLevel,
      recommendations: this.generateRecommendations(variantResults, statisticalSignificance, experiment),
    };
  }

  /**
   * Create rollout strategy
   */
  async createRolloutStrategy(
    experimentId: string,
    options: { phases?: number; gradual?: boolean } = {}
  ): Promise<RolloutStrategy> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const phaseCount = options.phases || 3;
    const gradual = options.gradual !== false;

    const phases: RolloutPhase[] = [];
    const trafficPerPhase = gradual ? 100 / phaseCount : 100;

    for (let i = 0; i < phaseCount; i++) {
      const phase: RolloutPhase = {
        name: `Phase ${i + 1}`,
        trafficPercentage: Math.min(100, trafficPerPhase * (i + 1)),
        duration: Math.ceil(experiment.duration / phaseCount),
        criteria: [
          'Monitor error rates',
          'Track key metrics',
          'Check for anomalies',
        ],
      };
      phases.push(phase);
    }

    return {
      phases,
      totalDuration: phases.reduce((sum, p) => sum + p.duration, 0),
      riskLevel: this.assessRiskLevel(experiment),
    };
  }

  /**
   * Get experiment by ID
   */
  getExperiment(id: string): ExperimentDesign | undefined {
    return this.experiments.get(id);
  }

  /**
   * List all experiments
   */
  listExperiments(): ExperimentDesign[] {
    return Array.from(this.experiments.values());
  }

  // Private helper methods
  private getZScore(confidence: number): number {
    // Standard normal distribution z-scores
    const zScores: Record<number, number> = {
      0.8: 0.84,
      0.9: 1.28,
      0.95: 1.96,
      0.99: 2.58,
    };
    return zScores[confidence] || 1.96;
  }

  private calculatePValue(variantData: Record<string, { participants: number; conversions: number }>): number {
    // Chi-square test approximation
    const values = Object.values(variantData);
    if (values.length < 2) return 1;

    const totalParticipants = values.reduce((sum, v) => sum + v.participants, 0);
    const totalConversions = values.reduce((sum, v) => sum + v.conversions, 0);
    const overallRate = totalConversions / totalParticipants;

    let chiSquare = 0;
    for (const data of values) {
      const expectedConversions = data.participants * overallRate;
      const observedConversions = data.conversions;
      chiSquare += Math.pow(observedConversions - expectedConversions, 2) / expectedConversions;
    }

    // Approximate p-value from chi-square
    return Math.max(0, Math.min(1, 1 / (1 + chiSquare)));
  }

  private calculateEffectSize(
    control: { participants: number; conversions: number },
    treatment: { participants: number; conversions: number }
  ): number {
    if (!treatment) return 0;

    const p1 = control.conversions / control.participants;
    const p2 = treatment.conversions / treatment.participants;
    const pooledP = (control.conversions + treatment.conversions) /
      (control.participants + treatment.participants);

    return (p2 - p1) / Math.sqrt(pooledP * (1 - pooledP));
  }

  private generateRecommendations(
    results: VariantResult[],
    significant: boolean,
    experiment: ExperimentDesign
  ): string[] {
    const recommendations: string[] = [];

    if (significant) {
      const winner = results.sort((a, b) => b.conversionRate - a.conversionRate)[0];
      recommendations.push(`Winner: ${winner.name} with ${winner.lift.toFixed(2)}% lift`);
      recommendations.push('Roll out the winning variant');
      recommendations.push('Monitor long-term impact');
    } else {
      recommendations.push('No significant difference detected');
      recommendations.push('Consider running longer or with larger sample');
      recommendations.push('Review hypothesis and metric selection');
    }

    return recommendations;
  }

  private assessRiskLevel(experiment: ExperimentDesign): 'low' | 'medium' | 'high' {
    if (experiment.targeting?.trafficPercentage === 100) {
      return 'high';
    }
    if (experiment.duration < 7) {
      return 'medium';
    }
    return 'low';
  }

  private parseExperimentDesign(content: string): Partial<ExperimentDesign> {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // Fallback
    }
    return {};
  }

  private createFallbackExperiment(
    hypothesis: string,
    primaryMetric: string,
    options: {
      variants?: string[];
      secondaryMetrics?: string[];
      sampleSize?: number;
      duration?: number;
    }
  ): ExperimentDesign {
    const id = `exp_${Date.now().toString(36)}`;
    const variants: Variant[] = [
      { name: 'control', allocation: 50, description: 'Current version' },
      { name: 'treatment', allocation: 50, description: 'New version' },
    ];

    if (options.variants) {
      const allocation = 100 / (options.variants.length + 1);
      variants.length = 0;
      variants.push({ name: 'control', allocation, description: 'Current version' });
      options.variants.forEach((v, i) => {
        variants.push({ name: `variant_${i + 1}`, allocation, description: v });
      });
    }

    return {
      id,
      name: `Experiment: ${hypothesis.slice(0, 50)}`,
      hypothesis,
      primaryMetric,
      secondaryMetrics: options.secondaryMetrics || [],
      variants,
      sampleSize: options.sampleSize || 1000,
      duration: options.duration || 14,
      confidenceLevel: 0.95,
      createdAt: new Date().toISOString(),
      status: 'draft' as const,
    };
  }

  private saveExperiment(experiment: ExperimentDesign): void {
    const fileName = `${experiment.id}.json`;
    const filePath = join(this.outputDir, fileName);
    writeFileSync(filePath, JSON.stringify(experiment, null, 2));
    this.experiments.set(experiment.id, experiment);
  }
}

// Module entry point for CLI
export async function runExperimentLab(args: Record<string, unknown>): Promise<unknown> {
  const lab = new ExperimentLabModule();
  const command = args.command || args._[0];

  switch (command) {
    case 'design': {
      const hypothesis = args.hypothesis || args._[1];
      if (!hypothesis || typeof hypothesis !== 'string') {
        throw new Error('Hypothesis is required');
      }
      const primaryMetric = typeof args.metric === 'string' ? args.metric : 'conversion_rate';
      const result = await lab.designExperiment(hypothesis, primaryMetric, {
        secondaryMetrics: typeof args.metrics === 'string' ? args.metrics.split(',') : undefined,
      });
      return {
        success: true,
        experiment: result,
      };
    }

    case 'analyze': {
      const experimentId = args.experimentId || args._[1];
      if (!experimentId || typeof experimentId !== 'string') {
        throw new Error('Experiment ID is required');
      }
      const variantData = typeof args.data === 'string'
        ? JSON.parse(args.data) as Record<string, { participants: number; conversions: number }>
        : {};
      const result = await lab.analyzeResults(experimentId, variantData);
      return {
        success: true,
        analysis: result,
      };
    }

    case 'sample-size': {
      const baselineRate = typeof args.baseline === 'number' ? args.baseline : 0.2;
      const mde = typeof args.mde === 'number' ? args.mde : 0.05;
      const result = lab.calculateSampleSize({
        baselineRate,
        minimumDetectableEffect: mde,
        confidenceLevel: typeof args.confidence === 'number' ? args.confidence : 0.95,
        power: typeof args.power === 'number' ? args.power : 0.8,
      });
      return {
        success: true,
        calculation: result,
      };
    }

    case 'rollout': {
      const experimentId = args.experimentId || args._[1];
      if (!experimentId || typeof experimentId !== 'string') {
        throw new Error('Experiment ID is required');
      }
      const result = await lab.createRolloutStrategy(experimentId, {
        phases: typeof args.phases === 'number' ? args.phases : 3,
        gradual: args.gradual !== false,
      });
      return {
        success: true,
        strategy: result,
      };
    }

    default:
      throw new Error(`Unknown experiment-lab command: ${String(command)}`);
  }
}

export default ExperimentLabModule;
