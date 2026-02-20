// PHANTOM Module: Competitive Analysis v2.0.0
// "I know your enemies."

import { getAIManager } from '@phantom-pm/core';
import { getContextEngine } from '@phantom-pm/core';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface Competitor {
  id: string;
  name: string;
  website: string;
  description: string;
  marketPosition: string;
  strengths: string[];
  weaknesses: string[];
  recentMoves: string[];
  pricing: string;
  targetAudience: string;
}

export interface CompetitiveAnalysis {
  subject: string;
  date: string;
  competitors: Competitor[];
  marketOverview: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendations: string[];
  evidence: string[];
}

export interface MarketTrend {
  id: string;
  trend: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: 'short-term' | 'medium-term' | 'long-term';
  sources: string[];
}

export class CompetitiveModule {
  private aiManager: ReturnType<typeof getAIManager>;

  constructor() {
    this.aiManager = getAIManager();
  }

  /**
   * Analyze a specific competitor or market segment
   */
  async analyze(subject: string, options: {
    includeTrends?: boolean;
    depth?: 'brief' | 'detailed' | 'comprehensive';
  } = {}): Promise<CompetitiveAnalysis> {
    const depth = options.depth || 'detailed';
    
    // Get project context for comparison
    const context = getContextEngine();
    const contextEntries = context.getEntries();
    
    // Extract relevant context for comparison
    const productContext = contextEntries
      .filter(entry => entry.type === 'document' || entry.type === 'code')
      .slice(0, 5)
      .map(entry => `${entry.relativePath}: ${entry.content?.slice(0, 100) || 'No content'}`)
      .join('\n');

    // Research competitors
    const competitors = await this.researchCompetitors(subject, depth);
    
    // Generate market overview
    const marketOverview = await this.generateMarketOverview(subject, competitors);
    
    // Perform SWOT analysis
    const swotAnalysis = await this.performSWOTAnalysis(subject, competitors, productContext);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(competitors, swotAnalysis);
    
    // Extract evidence
    const evidence = this.extractEvidence(competitors);

    const analysis: CompetitiveAnalysis = {
      subject,
      date: new Date().toISOString(),
      competitors,
      marketOverview,
      swotAnalysis,
      recommendations,
      evidence,
    };

    // Save analysis
    this.saveAnalysis(analysis);
    
    return analysis;
  }

  /**
   * Watch for competitor changes and updates
   */
  async watch(competitorName: string): Promise<string> {
    // In a real implementation, this would set up monitoring
    // For now, we'll simulate a watch report
    return `Watching ${competitorName} for updates. This feature would monitor:
- Product releases and feature updates
- Pricing changes
- Marketing campaigns
- Funding announcements
- Leadership changes
- Customer reviews and sentiment

Reports would be generated weekly or when significant changes occur.`;
  }

  /**
   * Research competitors in a market space
   */
  private async researchCompetitors(subject: string, depth: string): Promise<Competitor[]> {
    const systemPrompt = `You are a competitive intelligence analyst. Research competitors in the "${subject}" market.
    
Provide information in this JSON format:
{
  "competitors": [
    {
      "id": "unique-identifier",
      "name": "Company Name",
      "website": "https://company.com",
      "description": "Brief company description",
      "marketPosition": "Market leader/challenger/niche player",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "recentMoves": ["Recent move 1", "Recent move 2"],
      "pricing": "Pricing model and range",
      "targetAudience": "Primary customer segments"
    }
  ]
}

Research ${depth === 'brief' ? '3-4' : depth === 'detailed' ? '5-7' : '8-10'} key competitors.`;

    const userPrompt = `Research competitors in the "${subject}" market space.`;

    try {
      const response = await this.aiManager.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: depth === 'brief' ? 2000 : depth === 'detailed' ? 3500 : 5000,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          return Array.isArray(parsed.competitors) ? parsed.competitors : this.generateFallbackCompetitors(subject);
        } catch (parseError) {
          console.warn('Failed to parse competitors JSON:', parseError);
        }
      }

      return this.generateFallbackCompetitors(subject);
    } catch (error) {
      console.error('Failed to research competitors:', error);
      return this.generateFallbackCompetitors(subject);
    }
  }

  /**
   * Generate market overview
   */
  private async generateMarketOverview(subject: string, competitors: Competitor[]): Promise<string> {
    const systemPrompt = `You are a market research analyst. Create a comprehensive market overview based on competitor data.
    
Structure your response with these sections:
1. Market Size and Growth
2. Key Trends
3. Competitive Landscape
4. Barriers to Entry
5. Customer Segments`;

    const userPrompt = `Subject: ${subject}
Competitors: ${competitors.map(c => c.name).join(', ')}

Create a market overview based on this competitive landscape.`;

    try {
      const response = await this.aiManager.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 1500,
      });

      return response.content.trim();
    } catch (error) {
      console.error('Failed to generate market overview:', error);
      return `Market overview for ${subject} could not be generated due to technical issues. 
Typical market factors to consider would include size, growth rate, key players, and emerging trends.`;
    }
  }

  /**
   * Perform SWOT analysis
   */
  private async performSWOTAnalysis(
    subject: string,
    competitors: Competitor[],
    productContext: string
  ): Promise<CompetitiveAnalysis['swotAnalysis']> {
    const systemPrompt = `You are a strategic planning consultant. Perform a SWOT analysis comparing our product (based on context) with competitors.
    
Provide exactly 5 items for each category:
- Strengths: Internal advantages
- Weaknesses: Internal disadvantages
- Opportunities: External favorable factors
- Threats: External unfavorable factors

Format as JSON:
{
  "strengths": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "weaknesses": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "opportunities": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "threats": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]
}`;

    const userPrompt = `Our Product Context:
${productContext || 'Limited context available'}

Competitors in ${subject} market:
${competitors.map(c => `${c.name}: ${c.description}`).join('\n')}

Perform SWOT analysis.`;

    try {
      const response = await this.aiManager.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          return {
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
            opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities.slice(0, 5) : [],
            threats: Array.isArray(parsed.threats) ? parsed.threats.slice(0, 5) : [],
          };
        } catch (parseError) {
          console.warn('Failed to parse SWOT JSON:', parseError);
        }
      }

      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      };
    } catch (error) {
      console.error('Failed to perform SWOT analysis:', error);
      return {
        strengths: ['Strong product-market fit', 'Innovative technology'],
        weaknesses: ['Limited market awareness', 'Smaller team size'],
        opportunities: ['Market growth', 'Adjacent segments'],
        threats: ['Established competitors', 'Economic uncertainty'],
      };
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    competitors: Competitor[],
    swot: CompetitiveAnalysis['swotAnalysis']
  ): string[] {
    const recommendations: string[] = [];
    
    // Based on competitor strengths
    for (const competitor of competitors.slice(0, 3)) {
      if (competitor.strengths.length > 0) {
        recommendations.push(`Differentiate from ${competitor.name}'s strength: ${competitor.strengths[0]}`);
      }
    }
    
    // Based on SWOT analysis
    if (swot.opportunities.length > 0) {
      recommendations.push(`Capitalize on opportunity: ${swot.opportunities[0]}`);
    }
    
    if (swot.threats.length > 0) {
      recommendations.push(`Mitigate threat: ${swot.threats[0]}`);
    }
    
    // Generic recommendations
    recommendations.push(
      'Monitor competitor pricing changes monthly',
      'Track feature releases and customer feedback',
      'Identify potential acquisition targets or partnerships'
    );
    
    return recommendations.slice(0, 10);
  }

  /**
   * Extract evidence
   */
  private extractEvidence(competitors: Competitor[]): string[] {
    const evidence: string[] = [];
    
    for (const competitor of competitors) {
      evidence.push(`[${competitor.name}] Market position: ${competitor.marketPosition}`);
      if (competitor.recentMoves.length > 0) {
        evidence.push(`[${competitor.name}] Recent move: ${competitor.recentMoves[0]}`);
      }
    }
    
    return evidence.slice(0, 15);
  }

  /**
   * Generate fallback competitors
   */
  private generateFallbackCompetitors(subject: string): Competitor[] {
    return [
      {
        id: 'generic-1',
        name: `Leading ${subject} Provider`,
        website: 'https://example.com',
        description: `Market leader in ${subject} solutions`,
        marketPosition: 'Market leader',
        strengths: ['Brand recognition', 'Large customer base'],
        weaknesses: ['Slow innovation', 'High prices'],
        recentMoves: ['Launched new feature', 'Expanded to new market'],
        pricing: 'Premium tiered pricing',
        targetAudience: 'Enterprise customers',
      },
      {
        id: 'generic-2',
        name: `Innovative ${subject} Startup`,
        website: 'https://startup-example.com',
        description: `Disruptive newcomer in ${subject} space`,
        marketPosition: 'Challenger',
        strengths: ['Cutting-edge technology', 'Agile development'],
        weaknesses: ['Limited resources', 'Unproven track record'],
        recentMoves: ['Raised Series A funding', 'Hired key executives'],
        pricing: 'Competitive entry-level pricing',
        targetAudience: 'Mid-market companies',
      }
    ];
  }

  /**
   * Save analysis to file
   */
  private saveAnalysis(analysis: CompetitiveAnalysis): void {
    const outputDir = './.phantom/output/competitive';
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `competitive-analysis-${timestamp}`;
    
    // Save as JSON
    const jsonPath = join(outputDir, `${fileName}.json`);
    writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
    
    // Save as Markdown
    const mdPath = join(outputDir, `${fileName}.md`);
    const markdown = this.generateMarkdownReport(analysis);
    writeFileSync(mdPath, markdown);
    
    console.log(`Competitive analysis saved to ${jsonPath} and ${mdPath}`);
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(analysis: CompetitiveAnalysis): string {
    let md = `# Competitive Analysis: ${analysis.subject}\n\n`;
    md += `**Date:** ${analysis.date}\n\n`;
    
    md += `## Market Overview\n\n${analysis.marketOverview}\n\n`;
    
    md += `## Competitors\n\n`;
    for (const competitor of analysis.competitors) {
      md += `### ${competitor.name}\n`;
      md += `- **Website:** ${competitor.website}\n`;
      md += `- **Market Position:** ${competitor.marketPosition}\n`;
      md += `- **Description:** ${competitor.description}\n`;
      md += `- **Strengths:** ${competitor.strengths.join(', ')}\n`;
      md += `- **Weaknesses:** ${competitor.weaknesses.join(', ')}\n`;
      md += `- **Recent Moves:** ${competitor.recentMoves.join(', ')}\n`;
      md += `- **Pricing:** ${competitor.pricing}\n`;
      md += `- **Target Audience:** ${competitor.targetAudience}\n\n`;
    }
    
    md += `## SWOT Analysis\n\n`;
    md += `### Strengths\n`;
    for (const strength of analysis.swotAnalysis.strengths) {
      md += `- ${strength}\n`;
    }
    md += `\n### Weaknesses\n`;
    for (const weakness of analysis.swotAnalysis.weaknesses) {
      md += `- ${weakness}\n`;
    }
    md += `\n### Opportunities\n`;
    for (const opportunity of analysis.swotAnalysis.opportunities) {
      md += `- ${opportunity}\n`;
    }
    md += `\n### Threats\n`;
    for (const threat of analysis.swotAnalysis.threats) {
      md += `- ${threat}\n`;
    }
    
    md += `\n## Recommendations\n\n`;
    for (const recommendation of analysis.recommendations) {
      md += `- ${recommendation}\n`;
    }
    
    return md;
  }
}

// Module entry point for CLI
export async function runCompetitive(args: Record<string, any>): Promise<any> {
  const competitive = new CompetitiveModule();
  
  if (args._[0] === 'watch') {
    const competitor = args._[1] || args.competitor;
    if (!competitor) {
      throw new Error('Competitor name is required for watch command');
    }
    
    const report = await competitive.watch(competitor);
    return {
      success: true,
      type: 'watch-report',
      competitor,
      report,
    };
  } else {
    const subject = args._.join(' ') || args.subject;
    if (!subject) {
      throw new Error('Market subject is required for analysis');
    }
    
    const analysis = await competitive.analyze(subject, {
      includeTrends: args.trends,
      depth: args.depth || 'detailed',
    });
    
    return {
      success: true,
      type: 'competitive-analysis',
      analysis: {
        subject: analysis.subject,
        competitorCount: analysis.competitors.length,
        date: analysis.date,
      },
      filePath: `./.phantom/output/competitive/competitive-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
    };
  }
}
