// PHANTOM Module: Oracle v1.0.0
// Predictive intelligence for product decisions
// "I know the future."

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getAIManager, getConfig } from '@phantom-pm/core';

export interface PredictionInput {
  featureName: string;
  description?: string;
  targetMarket?: string;
  similarFeatures?: string[];
  historicalData?: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  date: string;
  metric: string;
  value: number;
}

export interface PredictionResult {
  featureName: string;
  successProbability: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
  generatedAt: string;
}

export interface SimulationScenario {
  name: string;
  variables: Record<string, number>;
  iterations: number;
}

export interface SimulationResult {
  scenario: string;
  outcomes: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
    percentiles: Record<string, number>;
  };
  distribution: number[];
  confidence: number;
}

export interface ForecastInput {
  metric: 'revenue' | 'adoption' | 'retention' | 'engagement' | 'custom';
  historicalData: HistoricalDataPoint[];
  periodMonths: number;
}

export interface ForecastResult {
  metric: string;
  projections: {
    month: number;
    predicted: number;
    lowerBound: number;
    upperBound: number;
  }[];
  totalProjected: number;
  growthRate: number;
  confidence: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  categories: {
    market: RiskCategory;
    technical: RiskCategory;
    execution: RiskCategory;
    financial: RiskCategory;
  };
  mitigations: string[];
}

export interface RiskCategory {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

export class OracleModule {
  private outputDir: string;

  constructor() {
    const configDir = getConfig().getConfigDir();
    this.outputDir = join(configDir, 'oracle');
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Predict feature success probability using AI and historical patterns
   */
  async predictFeatureSuccess(input: PredictionInput): Promise<PredictionResult> {
    const ai = getAIManager();

    const systemPrompt = `You are a predictive analytics AI for product management.
Analyze the feature and provide:
1. Success probability (0-100%)
2. Confidence interval
3. Key positive and negative factors
4. Actionable recommendations

Respond in JSON format:
{
  "successProbability": number,
  "confidenceInterval": { "lower": number, "upper": number },
  "factors": {
    "positive": ["factor 1", "factor 2"],
    "negative": ["risk 1", "risk 2"]
  },
  "recommendations": ["action 1", "action 2"]
}`;

    const userPrompt = `Analyze this feature for success prediction:

Feature: ${input.featureName}
Description: ${input.description || 'Not provided'}
Target Market: ${input.targetMarket || 'General'}
Similar Features: ${input.similarFeatures?.join(', ') || 'None specified'}

Provide a detailed prediction with probability and factors.`;

    try {
      const response = await ai.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        maxTokens: 2000,
      });

      const parsed = this.parsePredictionResponse(response.content);
      const result: PredictionResult = {
        featureName: input.featureName,
        ...parsed,
        generatedAt: new Date().toISOString(),
      };

      this.savePrediction(result);
      return result;
    } catch (error) {
      return this.createFallbackPrediction(input);
    }
  }

  /**
   * Run Monte Carlo simulation for scenario planning
   */
  async runMonteCarloSimulation(scenario: SimulationScenario): Promise<SimulationResult> {
    const { iterations, variables } = scenario;
    const results: number[] = [];

    // Monte Carlo simulation
    for (let i = 0; i < iterations; i++) {
      const outcome = this.simulateIteration(variables);
      results.push(outcome);
    }

    // Calculate statistics
    const sorted = [...results].sort((a, b) => a - b);
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const stdDev = Math.sqrt(variance);

    // Calculate percentiles
    const percentiles: Record<string, number> = {};
    [10, 25, 50, 75, 90, 95, 99].forEach(p => {
      const index = Math.floor((p / 100) * sorted.length);
      percentiles[`p${p}`] = sorted[index];
    });

    // Sample distribution (100 points for visualization)
    const distribution: number[] = [];
    const step = Math.floor(iterations / 100);
    for (let i = 0; i < sorted.length; i += step) {
      distribution.push(sorted[i]);
    }

    return {
      scenario: scenario.name,
      outcomes: {
        mean,
        median,
        stdDev,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        percentiles,
      },
      distribution,
      confidence: this.calculateConfidence(stdDev, mean),
    };
  }

  /**
   * Generate forecast for a metric over time
   */
  async generateForecast(input: ForecastInput): Promise<ForecastResult> {
    const { metric, historicalData, periodMonths } = input;

    if (historicalData.length < 3) {
      throw new Error('At least 3 data points required for forecasting');
    }

    // Calculate trend
    const trend = this.calculateTrend(historicalData);
    const volatility = this.calculateVolatility(historicalData);

    // Generate projections
    const lastValue = historicalData[historicalData.length - 1].value;
    const projections = [];
    let totalProjected = 0;

    for (let month = 1; month <= periodMonths; month++) {
      const predicted = lastValue + (trend.slope * month);
      const volatilityFactor = volatility * Math.sqrt(month);
      const lowerBound = predicted - (1.96 * volatilityFactor);
      const upperBound = predicted + (1.96 * volatilityFactor);

      projections.push({
        month,
        predicted,
        lowerBound: Math.max(0, lowerBound),
        upperBound,
      });

      totalProjected += predicted;
    }

    // Calculate growth rate
    const firstValue = historicalData[0].value;
    const growthRate = ((lastValue - firstValue) / firstValue) * 100;

    return {
      metric,
      projections,
      totalProjected,
      growthRate,
      confidence: this.calculateForecastConfidence(historicalData, trend),
    };
  }

  /**
   * Assess risks for a project or feature
   */
  async assessRisks(projectDescription: string): Promise<RiskAssessment> {
    const ai = getAIManager();

    const systemPrompt = `You are a risk assessment AI for product management.
Analyze the project and provide risk scores and mitigations.

Respond in JSON format:
{
  "overallRisk": "low|medium|high|critical",
  "score": number (0-100),
  "categories": {
    "market": { "score": number, "level": "low|medium|high", "factors": ["factor1", "factor2"] },
    "technical": { "score": number, "level": "low|medium|high", "factors": ["factor1", "factor2"] },
    "execution": { "score": number, "level": "low|medium|high", "factors": ["factor1", "factor2"] },
    "financial": { "score": number, "level": "low|medium|high", "factors": ["factor1", "factor2"] }
  },
  "mitigations": ["action 1", "action 2"]
}`;

    const userPrompt = `Assess risks for this project:

${projectDescription}

Provide a comprehensive risk assessment.`;

    try {
      const response = await ai.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      return this.parseRiskResponse(response.content);
    } catch (error) {
      return this.createFallbackRiskAssessment();
    }
  }

  // Private helper methods
  private simulateIteration(variables: Record<string, number>): number {
    let outcome = 0;
    for (const [key, value] of Object.entries(variables)) {
      // Add randomness with normal distribution
      const randomFactor = this.normalRandom();
      outcome += value * (1 + randomFactor * 0.2);
    }
    return Math.max(0, outcome);
  }

  private normalRandom(): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private calculateTrend(data: HistoricalDataPoint[]): { slope: number; intercept: number } {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i].value;
      sumXY += i * data[i].value;
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculateVolatility(data: HistoricalDataPoint[]): number {
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculateConfidence(stdDev: number, mean: number): number {
    const cv = stdDev / mean;
    return Math.max(0, Math.min(100, (1 - cv) * 100));
  }

  private calculateForecastConfidence(data: HistoricalDataPoint[], trend: { slope: number }): number {
    // Higher confidence with more data and clearer trend
    const dataPoints = Math.min(1, data.length / 12);
    const trendStrength = Math.min(1, Math.abs(trend.slope) / (data[data.length - 1].value * 0.1));
    return Math.round((dataPoints * 0.6 + trendStrength * 0.4) * 100);
  }

  private parsePredictionResponse(content: string): Omit<PredictionResult, 'featureName' | 'generatedAt'> {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // Fallback parsing
    }

    // Default fallback
    return {
      successProbability: 50,
      confidenceInterval: { lower: 30, upper: 70 },
      factors: {
        positive: ['Market opportunity identified'],
        negative: ['Limited historical data'],
      },
      recommendations: ['Gather more data', 'Validate assumptions'],
    };
  }

  private parseRiskResponse(content: string): RiskAssessment {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // Fallback
    }
    return this.createFallbackRiskAssessment();
  }

  private createFallbackPrediction(input: PredictionInput): PredictionResult {
    return {
      featureName: input.featureName,
      successProbability: 60,
      confidenceInterval: { lower: 40, upper: 80 },
      factors: {
        positive: ['New feature opportunity', 'Market demand'],
        negative: ['Execution risk', 'Resource constraints'],
      },
      recommendations: ['Conduct user research', 'Define success metrics'],
      generatedAt: new Date().toISOString(),
    };
  }

  private createFallbackRiskAssessment(): RiskAssessment {
    return {
      overallRisk: 'medium',
      score: 50,
      categories: {
        market: { score: 50, level: 'medium', factors: ['Competitive landscape'] },
        technical: { score: 50, level: 'medium', factors: ['Implementation complexity'] },
        execution: { score: 50, level: 'medium', factors: ['Team capacity'] },
        financial: { score: 50, level: 'medium', factors: ['Budget constraints'] },
      },
      mitigations: ['Regular risk reviews', 'Contingency planning'],
    };
  }

  private savePrediction(result: PredictionResult): void {
    const fileName = `prediction_${result.featureName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.json`;
    const filePath = join(this.outputDir, fileName);
    writeFileSync(filePath, JSON.stringify(result, null, 2));
  }
}

// Module entry point for CLI
export async function runOracle(args: Record<string, unknown>): Promise<unknown> {
  const oracle = new OracleModule();
  const command = args.command || args._[0];

  switch (command) {
    case 'predict': {
      const feature = args.feature || args._[1];
      if (!feature || typeof feature !== 'string') {
        throw new Error('Feature name is required for prediction');
      }
      const result = await oracle.predictFeatureSuccess({
        featureName: feature,
        description: typeof args.description === 'string' ? args.description : undefined,
      });
      return {
        success: true,
        prediction: result,
      };
    }

    case 'simulate': {
      const scenario = typeof args.scenario === 'string' ? args.scenario : 'default';
      const iterations = typeof args.iterations === 'number' ? args.iterations : 10000;
      const result = await oracle.runMonteCarloSimulation({
        name: scenario,
        variables: typeof args.variables === 'object' ? args.variables as Record<string, number> : {},
        iterations,
      });
      return {
        success: true,
        simulation: result,
      };
    }

    case 'forecast': {
      const metric = typeof args.metric === 'string' ? args.metric : 'revenue';
      const periodMonths = typeof args.period === 'number' ? args.period : 6;
      const historicalData = typeof args.data === 'string'
        ? JSON.parse(args.data) as HistoricalDataPoint[]
        : [];

      const result = await oracle.generateForecast({
        metric: metric as 'revenue' | 'adoption' | 'retention' | 'engagement' | 'custom',
        historicalData,
        periodMonths,
      });
      return {
        success: true,
        forecast: result,
      };
    }

    case 'risk': {
      const project = typeof args.project === 'string' ? args.project : '';
      const result = await oracle.assessRisks(project);
      return {
        success: true,
        risk: result,
      };
    }

    default:
      throw new Error(`Unknown oracle command: ${String(command)}`);
  }
}

export default OracleModule;
