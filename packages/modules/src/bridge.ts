// PHANTOM Module: Bridge v1.0.0
// "I know both worlds."

import { getAIManager } from '@phantom-pm/core';

export interface TranslationResult {
  technicalTasks: string[];
  acceptanceCriteria: string[];
  risks: string[];
  evidence: string[];
  technicalSpec?: TechnicalSpecification;
}

export interface TechnicalSpecification {
  architecture: string;
  dataModel: string;
  apiEndpoints: string[];
  dependencies: string[];
  deployment: string;
}

export class BridgeModule {
  private aiManager: ReturnType<typeof getAIManager>;

  constructor() {
    this.aiManager = getAIManager();
  }

  /**
   * Translate PM intent to technical tasks
   */
  async translatePmToDev(pmIntent: string, constraints: string[] = []): Promise<TranslationResult> {
    const systemPrompt = `You are a senior technical product manager who speaks both PM and engineering languages fluently.
    
Your task is to translate high-level PM intent into concrete technical tasks and specifications.

For each translation, provide:
1. Technical tasks (concrete implementation steps)
2. Acceptance criteria (measurable outcomes)
3. Risks (technical challenges and mitigations)
4. Evidence (supporting data or context)

Format your response as JSON:
{
  "technicalTasks": ["Task 1", "Task 2", "..."],
  "acceptanceCriteria": ["AC 1", "AC 2", "..."],
  "risks": ["Risk 1", "Risk 2", "..."],
  "evidence": ["Evidence 1", "Evidence 2", "..."]
}`;

    const userPrompt = `Translate this PM intent into technical terms:
"${pmIntent}"

Additional constraints to consider:
${constraints.length > 0 ? constraints.map(c => `- ${c}`).join('\n') : 'None'}`;

    try {
      const response = await this.aiManager.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 3000,
      });

      // Try to parse JSON from response
      const content = response.content.trim();
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          return {
            technicalTasks: Array.isArray(parsed.technicalTasks) ? parsed.technicalTasks : [],
            acceptanceCriteria: Array.isArray(parsed.acceptanceCriteria) ? parsed.acceptanceCriteria : [],
            risks: Array.isArray(parsed.risks) ? parsed.risks : [],
            evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
          };
        } catch (parseError) {
          console.warn('Failed to parse JSON response:', parseError);
        }
      }

      // Fallback to extracting from markdown/text
      return this.extractTranslationFromText(content);
    } catch (error) {
      console.error('Failed to translate PM to Dev:', error);
      return this.generateFallbackTranslation(pmIntent);
    }
  }

  /**
   * Generate technical specification from requirements
   */
  async generateTechnicalSpec(requirements: string): Promise<TechnicalSpecification> {
    const systemPrompt = `You are a senior software architect. Create a technical specification from requirements.
    
Respond in this exact JSON format:
{
  "architecture": "High-level architectural approach",
  "dataModel": "Core data entities and relationships",
  "apiEndpoints": ["Endpoint 1", "Endpoint 2"],
  "dependencies": ["Library 1", "Service 2"],
  "deployment": "Deployment strategy and considerations"
}`;

    const userPrompt = `Generate a technical specification for:
"${requirements}"`;

    try {
      const response = await this.aiManager.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 2500,
      });

      const content = response.content.trim();
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          return {
            architecture: parsed.architecture || 'Not specified',
            dataModel: parsed.dataModel || 'Not specified',
            apiEndpoints: Array.isArray(parsed.apiEndpoints) ? parsed.apiEndpoints : [],
            dependencies: Array.isArray(parsed.dependencies) ? parsed.dependencies : [],
            deployment: parsed.deployment || 'Not specified',
          };
        } catch (parseError) {
          console.warn('Failed to parse tech spec JSON:', parseError);
        }
      }

      return this.generateFallbackTechSpec();
    } catch (error) {
      console.error('Failed to generate technical spec:', error);
      return this.generateFallbackTechSpec();
    }
  }

  /**
   * Extract translation from text response
   */
  private extractTranslationFromText(content: string): TranslationResult {
    const lines = content.split('\n');
    const tasks: string[] = [];
    const criteria: string[] = [];
    const risks: string[] = [];
    const evidence: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes('Technical Tasks') || trimmed.includes('Tasks')) {
        currentSection = 'tasks';
      } else if (trimmed.includes('Acceptance Criteria') || trimmed.includes('Criteria')) {
        currentSection = 'criteria';
      } else if (trimmed.includes('Risks') || trimmed.includes('Risk')) {
        currentSection = 'risks';
      } else if (trimmed.includes('Evidence')) {
        currentSection = 'evidence';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
        const item = trimmed.replace(/^[-*\d.]+\s*/, '');
        switch (currentSection) {
          case 'tasks': tasks.push(item); break;
          case 'criteria': criteria.push(item); break;
          case 'risks': risks.push(item); break;
          case 'evidence': evidence.push(item); break;
        }
      }
    }
    
    return {
      technicalTasks: tasks.length > 0 ? tasks : ['Implement core functionality'],
      acceptanceCriteria: criteria.length > 0 ? criteria : ['Functionality is working as expected'],
      risks: risks.length > 0 ? risks : ['No major risks identified'],
      evidence: evidence.length > 0 ? evidence : ['Requirements are clearly defined'],
    };
  }

  /**
   * Generate fallback translation
   */
  private generateFallbackTranslation(pmIntent: string): TranslationResult {
    return {
      technicalTasks: [
        `Implement core functionality for "${pmIntent}"`,
        'Create unit tests for new functionality',
        'Update documentation and API references',
        'Perform security review of implementation',
      ],
      acceptanceCriteria: [
        'All unit tests pass',
        'Code reviewed and approved',
        'Integration tests successful',
        'Performance meets requirements',
      ],
      risks: [
        'Implementation complexity may exceed estimates',
        'Integration with existing systems',
        'Performance under load',
      ],
      evidence: [
        `PM intent: ${pmIntent}`,
        'Standard development practices apply',
        'Team has relevant experience',
      ],
    };
  }

  /**
   * Generate fallback technical specification
   */
  private generateFallbackTechSpec(): TechnicalSpecification {
    return {
      architecture: 'Standard microservices architecture with REST APIs',
      dataModel: 'Entity-relationship model following domain-driven design principles',
      apiEndpoints: ['/api/v1/resource', '/api/v1/resource/{id}'],
      dependencies: ['Database ORM', 'Authentication service', 'Logging framework'],
      deployment: 'Containerized deployment with Kubernetes orchestration',
    };
  }
}

// Module entry point for CLI
export async function runBridge(args: Record<string, any>): Promise<any> {
  const bridge = new BridgeModule();
  
  if (args._[0] === 'spec') {
    // Generate technical specification
    const requirements = args.requirements || args._[1];
    if (!requirements) {
      throw new Error('Requirements are required for technical specification');
    }
    
    const spec = await bridge.generateTechnicalSpec(requirements);
    return {
      success: true,
      type: 'technical-spec',
      specification: spec,
    };
  } else {
    // Translate PM to Dev
    const intent = args.intent || args._[0];
    if (!intent) {
      throw new Error('PM intent is required for translation');
    }
    
    const constraints = args.constraints ? args.constraints.split(',') : [];
    const translation = await bridge.translatePmToDev(intent, constraints);
    
    return {
      success: true,
      type: 'translation',
      translation,
    };
  }
}