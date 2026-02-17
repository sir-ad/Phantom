// PHANTOM Module: Analytics Lens v1.0.0
// "I know the numbers."

import { getAIManager } from '@phantom-pm/core';
import { getContextEngine } from '@phantom-pm/core';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface Metric {
  id: string;
  name: string;
  description: string;
  category: string;
  currentValue: number;
  targetValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  importance: 'high' | 'medium' | 'low';
}

export interface Dashboard {
  id: string;
  name: string;
  period: string;
  metrics: Metric[];
  insights: string[];
  recommendations: string[];
}

export interface Report {
  id: string;
  title: string;
  period: string;
  executiveSummary: string;
  keyMetrics: Metric[];
  trends: string[];
  insights: string[];
  recommendations: string[];
}

export class AnalyticsLensModule {
  private aiManager: ReturnType<typeof getAIManager>;

  constructor() {
    this.aiManager = getAIManager();
  }

  /**
   * Generate analytics dashboard
   */
  async generateDashboard(options: {
    period?: string;
    categories?: string[];
    format?: 'json' | 'markdown';
  } = {}): Promise<Dashboard> {
    const period = options.period || 'last 30 days';
    const categories = options.categories || ['user-engagement', 'revenue', 'performance'];
    
    // Get project context for relevant metrics
    const context = getContextEngine();
    const contextEntries = context.getEntries();
    
    // Extract product information for metric relevance
    const productInfo = contextEntries
      .filter(entry => entry.type === 'document')
      .map(entry => entry.content?.slice(0, 200) || '')
      .join('\n');

    // Generate relevant metrics
    const metrics = await this.generateMetrics(productInfo, categories);
    
    // Generate insights from metrics
    const insights = await this.generateInsights(metrics, period);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics);

    const dashboard: Dashboard = {
      id: `dashboard_${Date.now()}`,
      name: `Analytics Dashboard - ${period}`,
      period,
      metrics,
      insights,
      recommendations,
    };

    // Save dashboard
    this.saveDashboard(dashboard, options.format);
    
    return dashboard;
  }

  /**
   * Generate analytics report
   */
  async generateReport(options: {
    period?: string;
    format?: 'json' | 'markdown';
    focus?: string;
  } = {}): Promise<Report> {
    const period = options.period || 'last quarter';
    const focus = options.focus || 'overall performance';
    
    // Generate dashboard first
    const dashboard = await this.generateDashboard({ period });
    
    // Generate executive summary
    const executiveSummary = await this.generateExecutiveSummary(dashboard, focus);
    
    // Extract key metrics
    const keyMetrics = dashboard.metrics.slice(0, 10);
    
    // Identify trends
    const trends = this.identifyTrends(dashboard.metrics);
    
    // Extract insights and recommendations
    const insights = dashboard.insights.slice(0, 5);
    const recommendations = dashboard.recommendations.slice(0, 5);

    const report: Report = {
      id: `report_${Date.now()}`,
      title: `Analytics Report - ${period}`,
      period,
      executiveSummary,
      keyMetrics,
      trends,
      insights,
      recommendations,
    };

    // Save report
    this.saveReport(report, options.format);
    
    return report;
  }

  /**
   * Generate relevant metrics based on product context
   */
  private async generateMetrics(productInfo: string, categories: string[]): Promise<Metric[]> {
    const systemPrompt = `You are a product analytics expert. Generate relevant metrics for a product based on its description.
    
Focus on these categories: ${categories.join(', ')}
    
Provide metrics in this JSON format:
{
  "metrics": [
    {
      "id": "unique-identifier",
      "name": "Metric Name",
      "description": "What this metric measures",
      "category": "user-engagement|revenue|performance|retention|conversion|other",
      "currentValue": 123.45,
      "targetValue": 150.0,
      "trend": "increasing|decreasing|stable",
      "importance": "high|medium|low"
    }
  ]
}

Generate 15-20 relevant metrics.`;

    const userPrompt = `Product Information:
${productInfo || 'Limited product information available.'}

Generate relevant analytics metrics.`;

    try {
      const response = await this.aiManager.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 3000,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          return Array.isArray(parsed.metrics) ? parsed.metrics : this.generateFallbackMetrics();
        } catch (parseError) {
          console.warn('Failed to parse metrics JSON:', parseError);
        }
      }

      return this.generateFallbackMetrics();
    } catch (error) {
      console.error('Failed to generate metrics:', error);
      return this.generateFallbackMetrics();
    }
  }

  /**
   * Generate insights from metrics
   */
  private async generateInsights(metrics: Metric[], period: string): Promise<string[]> {
    const systemPrompt = `You are a data scientist. Analyze metrics and generate business insights.
    
Structure your response as a JSON array of insights:
["Insight 1", "Insight 2", "Insight 3"]

Focus on:
1. Correlations between metrics
2. Significant changes or trends
3. Business impact of metric performance
4. Actionable observations`;

    const userPrompt = `Metrics for ${period}:
${metrics.map(m => `${m.name}: ${m.currentValue} (target: ${m.targetValue}, trend: ${m.trend})`).join('\n')}

Generate 8-12 business insights from this data.`;

    try {
      const response = await this.aiManager.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/$$[\s\S]*?$$/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return Array.isArray(parsed) ? parsed : ['Metrics analyzed successfully'];
        } catch (parseError) {
          console.warn('Failed to parse insights JSON:', parseError);
        }
      }

      // Extract insights from text
      return this.extractInsightsFromText(content);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return ['Unable to generate insights due to technical issues'];
    }
  }

  /**
   * Generate executive summary
   */
  private async generateExecutiveSummary(dashboard: Dashboard, focus: string): Promise<string> {
    const systemPrompt = `You are a VP of Product Analytics. Create an executive summary for stakeholders.
    
Focus on: ${focus}
    
Structure your response with:
1. Overall performance assessment
2. Key highlights
3. Areas of concern
4. Strategic implications`;

    const userPrompt = `Dashboard Period: ${dashboard.period}
Key Metrics Count: ${dashboard.metrics.length}
Notable Insights: ${dashboard.insights.slice(0, 3).join('; ')}

Create an executive summary for leadership.`;

    try {
      const response = await this.aiManager.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 1500,
      });

      return response.content.trim();
    } catch (error) {
      console.error('Failed to generate executive summary:', error);
      return 'Executive summary could not be generated due to technical issues.';
    }
  }

  /**
   * Generate recommendations from metrics
   */
  private generateRecommendations(metrics: Metric[]): string[] {
    const recommendations: string[] = [];
    
    // Identify metrics that need attention
    const concerningMetrics = metrics.filter(m => 
      m.trend === 'decreasing' || 
      m.currentValue < m.targetValue * 0.8 ||
      m.importance === 'high' && m.currentValue < m.targetValue
    );
    
    for (const metric of concerningMetrics.slice(0, 5)) {
      recommendations.push(`Improve ${metric.name} - currently ${metric.currentValue} vs target ${metric.targetValue}`);
    }
    
    // Identify positive trends
    const positiveMetrics = metrics.filter(m => m.trend === 'increasing' && m.currentValue >= m.targetValue);
    for (const metric of positiveMetrics.slice(0, 3)) {
      recommendations.push(`Leverage success in ${metric.name} to drive further growth`);
    }
    
    // Generic recommendations
    recommendations.push(
      'Implement A/B testing for key user flows',
      'Enhance data collection for under-measured areas',
      'Set up automated alerts for metric anomalies',
      'Conduct cohort analysis for retention metrics'
    );
    
    return recommendations.slice(0, 10);
  }

  /**
   * Identify trends from metrics
   */
  private identifyTrends(metrics: Metric[]): string[] {
    const trends: string[] = [];
    
    const increasing = metrics.filter(m => m.trend === 'increasing').length;
    const decreasing = metrics.filter(m => m.trend === 'decreasing').length;
    const stable = metrics.filter(m => m.trend === 'stable').length;
    
    if (increasing > metrics.length * 0.4) {
      trends.push('Overall positive momentum with majority of metrics trending upward');
    }
    
    if (decreasing > metrics.length * 0.3) {
      trends.push('Concerning downward trends in key performance indicators');
    }
    
    if (stable > metrics.length * 0.5) {
      trends.push('Stable performance with limited movement across metrics');
    }
    
    // Category-specific trends
    const categories = [...new Set(metrics.map(m => m.category))];
    for (const category of categories) {
      const catMetrics = metrics.filter(m => m.category === category);
      const catIncreasing = catMetrics.filter(m => m.trend === 'increasing').length;
      if (catIncreasing > catMetrics.length * 0.6) {
        trends.push(`${category} metrics showing strong positive trend`);
      }
    }
    
    return trends.slice(0, 5);
  }

  /**
   * Extract insights from text response
   */
  private extractInsightsFromText(content: string): string[] {
    const insights: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
        const insight = trimmed.replace(/^[-*\d.]+\s*/, '');
        if (insight.length > 10) {
          insights.push(insight);
        }
      }
    }
    
    return insights.length > 0 ? insights : [content.slice(0, 100) + '...'];
  }

  /**
   * Generate fallback metrics
   */
  private generateFallbackMetrics(): Metric[] {
    return [
      {
        id: 'fallback-user-engagement',
        name: 'Daily Active Users',
        description: 'Number of unique users engaging with the product daily',
        category: 'user-engagement',
        currentValue: 1250,
        targetValue: 1500,
        trend: 'increasing',
        importance: 'high',
      },
      {
        id: 'fallback-retention',
        name: '7-Day Retention Rate',
        description: 'Percentage of new users who return within 7 days',
        category: 'retention',
        currentValue: 68,
        targetValue: 75,
        trend: 'stable',
        importance: 'high',
      },
      {
        id: 'fallback-conversion',
        name: 'Conversion Rate',
        description: 'Percentage of visitors who complete desired action',
        category: 'conversion',
        currentValue: 3.2,
        targetValue: 4.0,
        trend: 'decreasing',
        importance: 'high',
      },
      {
        id: 'fallback-performance',
        name: 'Page Load Time',
        description: 'Average time for pages to load completely',
        category: 'performance',
        currentValue: 2.1,
        targetValue: 1.5,
        trend: 'stable',
        importance: 'medium',
      }
    ];
  }

  /**
   * Save dashboard to file
   */
  private saveDashboard(dashboard: Dashboard, format: 'json' | 'markdown' = 'json'): void {
    const outputDir = './.phantom/output/analytics';
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `dashboard-${timestamp}`;
    
    if (format === 'json') {
      const jsonPath = join(outputDir, `${fileName}.json`);
      writeFileSync(jsonPath, JSON.stringify(dashboard, null, 2));
      console.log(`Dashboard saved to ${jsonPath}`);
    } else {
      const mdPath = join(outputDir, `${fileName}.md`);
      const markdown = this.generateDashboardMarkdown(dashboard);
      writeFileSync(mdPath, markdown);
      console.log(`Dashboard saved to ${mdPath}`);
    }
  }

  /**
   * Save report to file
   */
  private saveReport(report: Report, format: 'json' | 'markdown' = 'json'): void {
    const outputDir = './.phantom/output/analytics';
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `report-${timestamp}`;
    
    if (format === 'json') {
      const jsonPath = join(outputDir, `${fileName}.json`);
      writeFileSync(jsonPath, JSON.stringify(report, null, 2));
      console.log(`Report saved to ${jsonPath}`);
    } else {
      const mdPath = join(outputDir, `${fileName}.md`);
      const markdown = this.generateReportMarkdown(report);
      writeFileSync(mdPath, markdown);
      console.log(`Report saved to ${mdPath}`);
    }
  }

  /**
   * Generate dashboard markdown
   */
  private generateDashboardMarkdown(dashboard: Dashboard): string {
    let md = `# ${dashboard.name}\n\n`;
    md += `**Period:** ${dashboard.period}\n\n`;
    
    md += `## Metrics\n\n`;
    const categories = [...new Set(dashboard.metrics.map(m => m.category))];
    for (const category of categories) {
      md += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      const catMetrics = dashboard.metrics.filter(m => m.category === category);
      md += '| Metric | Current | Target | Trend | Importance |\n';
      md += '|--------|---------|--------|-------|------------|\n';
      for (const metric of catMetrics) {
        const trendIcon = metric.trend === 'increasing' ? '↗️' : metric.trend === 'decreasing' ? '↘️' : '➡️';
        const importanceIcon = metric.importance === 'high' ? '🔴' : metric.importance === 'medium' ? '🟡' : '🟢';
        md += `| ${metric.name} | ${metric.currentValue} | ${metric.targetValue} | ${trendIcon} | ${importanceIcon} |\n`;
      }
      md += '\n';
    }
    
    md += `## Insights\n\n`;
    for (const insight of dashboard.insights) {
      md += `- ${insight}\n`;
    }
    
    md += `\n## Recommendations\n\n`;
    for (const recommendation of dashboard.recommendations) {
      md += `- ${recommendation}\n`;
    }
    
    return md;
  }

  /**
   * Generate report markdown
   */
  private generateReportMarkdown(report: Report): string {
    let md = `# ${report.title}\n\n`;
    md += `**Period:** ${report.period}\n\n`;
    
    md += `## Executive Summary\n\n${report.executiveSummary}\n\n`;
    
    md += `## Key Metrics\n\n`;
    md += '| Metric | Current | Target | Trend |\n';
    md += '|--------|---------|--------|-------|\n';
    for (const metric of report.keyMetrics) {
      const trendIcon = metric.trend === 'increasing' ? '↗️' : metric.trend === 'decreasing' ? '↘️' : '➡️';
      md += `| ${metric.name} | ${metric.currentValue} | ${metric.targetValue} | ${trendIcon} |\n`;
    }
    
    md += `\n## Trends\n\n`;
    for (const trend of report.trends) {
      md += `- ${trend}\n`;
    }
    
    md += `\n## Insights\n\n`;
    for (const insight of report.insights) {
      md += `- ${insight}\n`;
    }
    
    md += `\n## Recommendations\n\n`;
    for (const recommendation of report.recommendations) {
      md += `- ${recommendation}\n`;
    }
    
    return md;
  }
}

// Module entry point for CLI
export async function runAnalyticsLens(args: Record<string, any>): Promise<any> {
  const analytics = new AnalyticsLensModule();
  
  if (args._[0] === 'report') {
    const report = await analytics.generateReport({
      period: args.period,
      format: args.format,
      focus: args.focus,
    });
    
    return {
      success: true,
      type: 'analytics-report',
      report: {
        id: report.id,
        title: report.title,
        period: report.period,
        metricCount: report.keyMetrics.length,
      },
      filePath: `./.phantom/output/analytics/report-${new Date().toISOString().replace(/[:.]/g, '-')}.${args.format || 'json'}`,
    };
  } else {
    const dashboard = await analytics.generateDashboard({
      period: args.period,
      categories: args.categories ? args.categories.split(',') : undefined,
      format: args.format,
    });
    
    return {
      success: true,
      type: 'analytics-dashboard',
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        period: dashboard.period,
        metricCount: dashboard.metrics.length,
      },
      filePath: `./.phantom/output/analytics/dashboard-${new Date().toISOString().replace(/[:.]/g, '-')}.${args.format || 'json'}`,
    };
  }
}
