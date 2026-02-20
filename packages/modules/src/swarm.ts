// PHANTOM Module: Swarm v1.0.0
// "We know everything."

import { getAIManager } from '@phantom-pm/core';
import { getContextEngine } from '@phantom-pm/core';

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  expertise: string;
  perspective: string;
}

export interface SwarmAnalysis {
  question: string;
  agents: SwarmAgent[];
  responses: Array<{
    agentId: string;
    agentName: string;
    response: string;
    confidence: number; // 0-100
  }>;
  consensus: string;
  dissent: string[];
  recommendations: string[];
  evidence: string[];
}

export class SwarmModule {
  private aiManager: ReturnType<typeof getAIManager>;
  private agents: SwarmAgent[];

  constructor() {
    this.aiManager = getAIManager();
    this.agents = this.getDefaultAgents();
  }

  /**
   * Get default swarm agents with different perspectives
   */
  private getDefaultAgents(): SwarmAgent[] {
    return [
      {
        id: 'product-manager',
        name: 'Product Manager',
        role: 'Strategic Decision Maker',
        expertise: 'Market analysis, user needs, business value',
        perspective: 'Focus on user value, business impact, and strategic alignment',
      },
      {
        id: 'engineer',
        name: 'Senior Engineer',
        role: 'Technical Feasibility Expert',
        expertise: 'System architecture, implementation complexity, scalability',
        perspective: 'Focus on technical feasibility, maintainability, and performance',
      },
      {
        id: 'designer',
        name: 'UX Designer',
        role: 'User Experience Specialist',
        expertise: 'Usability, accessibility, user psychology',
        perspective: 'Focus on user experience, accessibility, and intuitive design',
      },
      {
        id: 'analyst',
        name: 'Data Analyst',
        role: 'Metrics and Insights Expert',
        expertise: 'Data interpretation, KPIs, user behavior analysis',
        perspective: 'Focus on data-driven decisions, measurable outcomes, and user insights',
      },
      {
        id: 'security',
        name: 'Security Specialist',
        role: 'Risk and Compliance Expert',
        expertise: 'Cybersecurity, compliance, threat modeling',
        perspective: 'Focus on security implications, privacy, and regulatory compliance',
      },
      {
        id: 'support',
        name: 'Customer Support Lead',
        role: 'User Advocacy Expert',
        expertise: 'Customer pain points, support trends, user feedback',
        perspective: 'Focus on customer satisfaction, ease of use, and supportability',
      },
      {
        id: 'finance',
        name: 'Finance Manager',
        role: 'Cost and Revenue Expert',
        expertise: 'Budget analysis, ROI calculation, cost optimization',
        perspective: 'Focus on financial impact, cost efficiency, and revenue potential',
      },
    ];
  }

  /**
   * Run swarm analysis on a question
   */
  async analyze(question: string): Promise<SwarmAnalysis> {
    // Get project context for informed analysis
    const context = getContextEngine();
    const contextEntries = context.getEntries();
    
    // Extract relevant context snippets
    const contextSnippets = contextEntries
      .slice(0, 10)
      .map(entry => `${entry.relativePath}: ${entry.content?.slice(0, 100) || 'No content'}`);
    
    const contextSummary = contextSnippets.length > 0 
      ? `Relevant project context:\n${contextSnippets.join('\n')}`
      : 'No specific project context available.';

    // Run parallel analysis with all agents
    const responses = await Promise.all(
      this.agents.map(agent => this.getAgentResponse(agent, question, contextSummary))
    );

    // Generate consensus view
    const consensus = await this.generateConsensus(question, responses);
    
    // Identify dissenting opinions
    const dissent = this.identifyDissent(responses);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(responses);
    
    // Extract evidence
    const evidence = this.extractEvidence(responses);

    return {
      question,
      agents: this.agents,
      responses,
      consensus,
      dissent,
      recommendations,
      evidence,
    };
  }

  /**
   * Get response from a specific agent
   */
  private async getAgentResponse(
    agent: SwarmAgent,
    question: string,
    context: string
  ): Promise<SwarmAnalysis['responses'][0]> {
    const systemPrompt = `You are ${agent.name}, a ${agent.role} with expertise in ${agent.expertise}.
    
Your unique perspective: ${agent.perspective}

Instructions:
1. Analyze the question from your specific viewpoint
2. Reference the provided context when relevant
3. Provide a concise, actionable response (2-3 paragraphs)
4. End with a confidence rating (0-100)

Format your response as:
[Your analysis here]

CONFIDENCE: [0-100]%`;

    const userPrompt = `Question: ${question}

${context}`;

    try {
      const response = await this.aiManager.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 1500,
      });

      // Extract confidence rating
      const confidenceMatch = response.content.match(/CONFIDENCE:\s*(\d+)%/i);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

      // Remove confidence line from response
      const cleanResponse = response.content.replace(/\n\s*CONFIDENCE:.*$/i, '').trim();

      return {
        agentId: agent.id,
        agentName: agent.name,
        response: cleanResponse,
        confidence,
      };
    } catch (error) {
      console.error(`Failed to get response from ${agent.name}:`, error);
      return {
        agentId: agent.id,
        agentName: agent.name,
        response: `Unable to provide analysis due to technical issues. Default recommendation would be to gather more information before proceeding.`,
        confidence: 25,
      };
    }
  }

  /**
   * Generate consensus view from all responses
   */
  private async generateConsensus(
    question: string,
    responses: SwarmAnalysis['responses']
  ): Promise<string> {
    const systemPrompt = `You are a decision synthesis expert. Analyze multiple perspectives and create a balanced consensus view.
    
Responses from different experts:
${responses.map(r => `${r.agentName}: ${r.response}`).join('\n\n')}

Create a cohesive summary that:
1. Identifies areas of agreement
2. Highlights key insights from each perspective
3. Provides a balanced recommendation
4. Keeps it concise (2-3 paragraphs)`;

    const userPrompt = `Question: ${question}
    
Synthesize a consensus view from these expert perspectives.`;

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

      return response.content.trim();
    } catch (error) {
      console.error('Failed to generate consensus:', error);
      return 'Unable to synthesize consensus due to technical issues. Please review individual expert opinions.';
    }
  }

  /**
   * Identify dissenting opinions
   */
  private identifyDissent(responses: SwarmAnalysis['responses']): string[] {
    // Find responses with significantly different confidence levels or content
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    const dissenting = responses.filter(r => Math.abs(r.confidence - avgConfidence) > 30);
    
    return dissenting.map(r => `${r.agentName} has a significantly different confidence level (${r.confidence}%)`);
  }

  /**
   * Generate recommendations from responses
   */
  private generateRecommendations(responses: SwarmAnalysis['responses']): string[] {
    // Extract key action items from responses
    const recommendations: string[] = [];
    
    for (const response of responses) {
      // Look for imperative statements that suggest actions
      const lines = response.response.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.startsWith('Should') ||
          trimmed.startsWith('Must') ||
          trimmed.startsWith('Consider') ||
          trimmed.startsWith('Recommend') ||
          trimmed.includes('would recommend') ||
          trimmed.includes('should consider')
        ) {
          const rec = trimmed.replace(/^[^a-zA-Z]+/, ''); // Remove leading punctuation/whitespace
          if (rec.length > 10 && rec.length < 150) {
            recommendations.push(`[${response.agentName}] ${rec}`);
          }
        }
      }
    }
    
    // Deduplicate and limit recommendations
    return [...new Set(recommendations)].slice(0, 10);
  }

  /**
   * Extract evidence from responses
   */
  private extractEvidence(responses: SwarmAnalysis['responses']): string[] {
    // Extract factual statements and data points
    const evidence: string[] = [];
    
    for (const response of responses) {
      const lines = response.response.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Look for statements that appear to be facts or data
        if (
          trimmed.includes('research shows') ||
          trimmed.includes('data indicates') ||
          trimmed.includes('studies suggest') ||
          trimmed.match(/\d+%/) ||
          trimmed.match(/\d+\s*(users|customers|clients)/i)
        ) {
          evidence.push(`[${response.agentName}] ${trimmed}`);
        }
      }
    }
    
    return [...new Set(evidence)].slice(0, 15);
  }
}

// Module entry point for CLI
export async function runSwarm(args: Record<string, any>): Promise<any> {
  const swarm = new SwarmModule();
  
  const question = args.question || args._.join(' ');
  if (!question) {
    throw new Error('Question is required for swarm analysis');
  }
  
  const analysis = await swarm.analyze(question);
  
  return {
    success: true,
    type: 'swarm-analysis',
    analysis: {
      question: analysis.question,
      agentCount: analysis.agents.length,
      consensusLength: analysis.consensus.length,
      recommendationCount: analysis.recommendations.length,
    },
    detailed: args.verbose ? analysis : undefined,
  };
}