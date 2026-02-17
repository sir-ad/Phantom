// PHANTOM Module - Story Writer
// Real AI-powered user story generation from PRDs

import { getAIManager } from '../../core/dist/ai/manager.js';
import { getContextEngine } from '../../core/dist/context.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  storyPoints: number; // Fibonacci: 1, 2, 3, 5, 8, 13
  epic?: string;
  labels: string[];
  dependencies?: string[];
  technicalNotes?: string;
}

export interface StorySprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  stories: UserStory[];
  capacity: number; // Total story points
  velocity?: number; // Actual completed points
}

export interface StoryWriterConfig {
  outputDir: string;
  includeEpics?: boolean;
  includeTechnicalNotes?: boolean;
  storyPointScale?: 'fibonacci' | 't-shirt' | 'hours';
  defaultPriority?: 'medium';
}

export class StoryWriterModule {
  private config: StoryWriterConfig;
  private aiManager: ReturnType<typeof getAIManager>;

  constructor(config: Partial<StoryWriterConfig> = {}) {
    this.config = {
      outputDir: process.cwd(),
      includeEpics: true,
      includeTechnicalNotes: true,
      storyPointScale: 'fibonacci',
      defaultPriority: 'medium',
      ...config,
    };
    this.aiManager = getAIManager();
  }

  async generateStoriesFromFeature(feature: string, count: number = 5): Promise<UserStory[]> {
    console.log(`Generating ${count} user stories for feature: ${feature}`);
    
    // Get project context for technical insights
    const context = getContextEngine();
    const projectContext = await context.search(feature);
    
    // Generate stories using AI
    const stories = await this.generateStoriesWithAIForFeature(feature, projectContext, count);
    
    return stories;
  }

  async generateStoriesFromPRD(prdPath: string, sprintCount: number = 2): Promise<StorySprint[]> {
    if (!existsSync(prdPath)) {
      throw new Error(`PRD file not found: ${prdPath}`);
    }

    console.log(`Generating user stories from PRD: ${prdPath}`);
    
    // Read PRD content
    const { readFileSync } = await import('fs');
    const prdContent = readFileSync(prdPath, 'utf8');
    
    // Get project context for technical insights
    const context = getContextEngine();
    const projectContext = await context.search(prdContent.slice(0, 200));
    
    // Generate stories using AI
    const stories = await this.generateStoriesWithAI(prdContent, projectContext);
    
    // Organize into sprints
    const sprints = this.organizeIntoSprints(stories, sprintCount);
    
    // Save output
    this.saveStories(sprints, prdPath);
    
    return sprints;
  }

  private async generateStoriesWithAI(prdContent: string, context: any[]): Promise<UserStory[]> {
    const systemPrompt = `You are a product manager and technical writer generating user stories from a PRD.
    
Your task is to create detailed, actionable user stories with acceptance criteria.
Follow INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable).

Context about the project:
${context.map(c => `- ${c.relativePath}: ${c.content?.slice(0, 200) || 'No content'}`).join('\n')}

Generate user stories in the following JSON format:
{
  "stories": [
    {
      "title": "As a [user type], I want [goal] so that [benefit]",
      "description": "Detailed description including user flow",
      "acceptanceCriteria": ["AC1", "AC2", "AC3"],
      "priority": "high|medium|low",
      "storyPoints": 1|2|3|5|8|13,
      "labels": ["feature", "ux", "backend", "etc"],
      "epic": "Epic name if applicable",
      "technicalNotes": "Technical considerations"
    }
  ]
}`;

    const userPrompt = `Please generate comprehensive user stories from this PRD:

PRD Content:
${prdContent.slice(0, 8000)} // Limit token count

Please generate at least 8-12 user stories covering all major features. Include technical stories for backend work, infrastructure, and testing.`;

    try {
      const response = await this.aiManager.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 4000,
      });

      // Parse AI response
      const content = response.content.trim();
      let parsedStories: any[] = [];
      
      // Try to extract JSON from response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          parsedStories = parsed.stories || [];
        } catch {
          // Fall back to manual parsing
        }
      }

      // If no JSON found, try to parse as markdown
      if (parsedStories.length === 0) {
        parsedStories = this.parseStoriesFromMarkdown(content);
      }

      // Format stories with IDs
      return parsedStories.map((story: any, index: number) => ({
        id: `story_${Date.now()}_${index}`,
        title: story.title || `Story ${index + 1}`,
        description: story.description || '',
        acceptanceCriteria: Array.isArray(story.acceptanceCriteria) ? story.acceptanceCriteria : [],
        priority: (['high', 'medium', 'low'].includes(story.priority?.toLowerCase()) 
          ? story.priority.toLowerCase() 
          : this.config.defaultPriority) as 'high' | 'medium' | 'low',
        storyPoints: typeof story.storyPoints === 'number' ? story.storyPoints : this.estimateStoryPoints(story),
        epic: story.epic,
        labels: Array.isArray(story.labels) ? story.labels : ['feature'],
        technicalNotes: story.technicalNotes,
      }));

    } catch (error) {
      console.error('Failed to generate stories with AI:', error);
      return this.generateFallbackStories(prdContent);
    }
  }

  private parseStoriesFromMarkdown(content: string): any[] {
    const stories: any[] = [];
    const lines = content.split('\n');
    
    let currentStory: any = null;
    
    for (const line of lines) {
      if (line.startsWith('## ') || line.match(/^Story \d+:/)) {
        if (currentStory) stories.push(currentStory);
        currentStory = {
          title: line.replace(/^## |^Story \d+: /, '').trim(),
          acceptanceCriteria: [],
          labels: [],
        };
      } else if (line.startsWith('**Description:**') && currentStory) {
        currentStory.description = line.replace('**Description:**', '').trim();
      } else if (line.startsWith('- [ ]') && currentStory) {
        currentStory.acceptanceCriteria.push(line.replace('- [ ]', '').trim());
      } else if (line.startsWith('**Priority:**') && currentStory) {
        currentStory.priority = line.replace('**Priority:**', '').trim().toLowerCase();
      } else if (line.startsWith('**Points:**') && currentStory) {
        const points = parseInt(line.replace('**Points:**', '').trim());
        currentStory.storyPoints = isNaN(points) ? 3 : points;
      }
    }
    
    if (currentStory) stories.push(currentStory);
    return stories;
  }

  private async generateStoriesWithAIForFeature(feature: string, context: any[], count: number): Promise<UserStory[]> {
    const systemPrompt = `You are a product manager and technical writer generating user stories for a feature.
    
Your task is to create detailed, actionable user stories with acceptance criteria.
Follow INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable).

Context about the project:
${context.map(c => `- ${c.relativePath}: ${c.content?.slice(0, 200) || 'No content'}`).join('\n')}

Generate exactly ${count} user stories in the following JSON format:
{
  "stories": [
    {
      "title": "As a [user type], I want [goal] so that [benefit]",
      "description": "Detailed description including user flow",
      "acceptanceCriteria": ["AC1", "AC2", "AC3"],
      "priority": "high|medium|low",
      "storyPoints": 1|2|3|5|8|13,
      "labels": ["feature", "ux", "backend", "etc"],
      "epic": "Epic name if applicable",
      "technicalNotes": "Technical considerations"
    }
  ]
}`;

    const userPrompt = `Please generate ${count} comprehensive user stories for this feature:
"${feature}"

Please generate diverse stories covering different aspects:
- Core user functionality
- Edge cases and error scenarios
- Technical implementation stories
- Testing and quality assurance stories
- User experience and accessibility stories`;

    try {
      const response = await this.aiManager.complete({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 4000,
      });

      // Parse AI response
      const content = response.content.trim();
      let parsedStories: any[] = [];
      
      // Try to extract JSON from response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1]);
          parsedStories = parsed.stories || [];
        } catch {
          // Fall back to manual parsing
        }
      }

      // If no JSON found, try to parse as markdown
      if (parsedStories.length === 0) {
        parsedStories = this.parseStoriesFromMarkdown(content);
      }

      // Format stories with IDs
      return parsedStories.map((story: any, index: number) => ({
        id: `story_${Date.now()}_${index}`,
        title: story.title || `Story ${index + 1}`,
        description: story.description || '',
        acceptanceCriteria: Array.isArray(story.acceptanceCriteria) ? story.acceptanceCriteria : [],
        priority: (['high', 'medium', 'low'].includes(story.priority?.toLowerCase()) 
          ? story.priority.toLowerCase() 
          : this.config.defaultPriority) as 'high' | 'medium' | 'low',
        storyPoints: typeof story.storyPoints === 'number' ? story.storyPoints : this.estimateStoryPoints(story),
        epic: story.epic,
        labels: Array.isArray(story.labels) ? story.labels : ['feature'],
        technicalNotes: story.technicalNotes,
      }));

    } catch (error) {
      console.error('Failed to generate stories with AI:', error);
      return this.generateFallbackStoriesForFeature(feature);
    }
  }

  private generateFallbackStoriesForFeature(feature: string): UserStory[] {
    // Simple fallback when AI fails
    const stories: UserStory[] = [
      {
        id: `fallback_${Date.now()}_0`,
        title: `As a user, I want to use the ${feature} feature`,
        description: `Basic implementation of ${feature} functionality`,
        acceptanceCriteria: [
          `${feature} is accessible to users`,
          `${feature} performs its core function`,
          `${feature} handles basic error cases`,
        ],
        priority: 'high',
        storyPoints: 5,
        labels: ['feature', 'fallback'],
      },
      {
        id: `fallback_${Date.now()}_1`,
        title: `As a user, I want the ${feature} feature to be reliable`,
        description: `Quality assurance and testing for ${feature}`,
        acceptanceCriteria: [
          `${feature} passes unit tests`,
          `${feature} passes integration tests`,
          `${feature} handles edge cases gracefully`,
        ],
        priority: 'medium',
        storyPoints: 3,
        labels: ['testing', 'fallback'],
      },
      {
        id: `fallback_${Date.now()}_2`,
        title: `As a developer, I want to document the ${feature} feature`,
        description: `Technical documentation for ${feature}`,
        acceptanceCriteria: [
          `${feature} has API documentation`,
          `${feature} has usage examples`,
          `${feature} has troubleshooting guide`,
        ],
        priority: 'low',
        storyPoints: 2,
        labels: ['documentation', 'fallback'],
      },
    ];

    return stories;
  }

  async saveStoriesToFile(stories: UserStory[], filename: string): Promise<string> {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { join } = await import('path');
    
    const outputDir = this.config.outputDir;
    mkdirSync(outputDir, { recursive: true });
    
    const filepath = join(outputDir, filename);
    
    // Generate markdown content
    let md = `# User Stories\n\n`;
    md += `*Generated on: ${new Date().toISOString()}*\n\n`;
    md += `**Total Stories:** ${stories.length}\n`;
    md += `**Total Story Points:** ${stories.reduce((sum, story) => sum + story.storyPoints, 0)}\n\n`;
    md += `---\n\n`;
    
    stories.forEach((story, index) => {
      md += `## ${index + 1}. ${story.title}\n\n`;
      md += `**ID:** ${story.id}\n`;
      md += `**Priority:** ${story.priority}\n`;
      md += `**Story Points:** ${story.storyPoints}\n`;
      md += `**Labels:** ${story.labels.join(', ')}\n\n`;
      
      if (story.epic) {
        md += `**Epic:** ${story.epic}\n\n`;
      }
      
      md += `${story.description}\n\n`;
      
      md += `**Acceptance Criteria:**\n`;
      story.acceptanceCriteria.forEach((ac, i) => {
        md += `- [ ] ${ac}\n`;
      });
      md += `\n`;
      
      if (story.technicalNotes) {
        md += `**Technical Notes:**\n${story.technicalNotes}\n\n`;
      }
      
      md += `---\n\n`;
    });
    
    writeFileSync(filepath, md, 'utf-8');
    
    return filepath;
  }

  private estimateStoryPoints(story: any): number {
    // Simple estimation based on description length and acceptance criteria count
    const descLength = story.description?.length || 0;
    const acCount = story.acceptanceCriteria?.length || 0;
    
    if (descLength > 500 || acCount > 5) return 8;
    if (descLength > 200 || acCount > 3) return 5;
    if (descLength > 100 || acCount > 2) return 3;
    if (descLength > 50 || acCount > 1) return 2;
    return 1;
  }

  private generateFallbackStories(prdContent: string): UserStory[] {
    // Simple fallback when AI fails
    const features = this.extractFeaturesFromPRD(prdContent);
    
    return features.map((feature, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      title: `Implement ${feature}`,
      description: `User story for ${feature} feature`,
      acceptanceCriteria: [
        `${feature} is implemented`,
        `${feature} is tested`,
        `${feature} is documented`,
      ],
      priority: index === 0 ? 'high' : 'medium',
      storyPoints: index === 0 ? 5 : 3,
      labels: ['feature', 'fallback'],
    }));
  }

  private extractFeaturesFromPRD(prdContent: string): string[] {
    const features: string[] = [];
    const lines = prdContent.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('feature') || line.includes('## ')) {
        const feature = line.replace(/^## |^### |\*\*/g, '').trim();
        if (feature && !feature.includes('Table of Contents') && feature.length > 3) {
          features.push(feature);
        }
      }
    }
    
    return features.slice(0, 8); // Limit to 8 features
  }

  private organizeIntoSprints(stories: UserStory[], sprintCount: number): StorySprint[] {
    // Sort by priority and story points
    const sortedStories = [...stories].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || b.storyPoints - a.storyPoints;
    });
    
    const sprints: StorySprint[] = [];
    const sprintCapacity = 21; // Standard 3-week sprint capacity
    const today = new Date();
    
    for (let i = 0; i < sprintCount; i++) {
      const sprint: StorySprint = {
        id: `sprint_${i + 1}`,
        name: `Sprint ${i + 1}`,
        startDate: new Date(today.getTime() + i * 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + (i + 1) * 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal: `Implement core features batch ${i + 1}`,
        stories: [],
        capacity: sprintCapacity,
      };
      
      let usedCapacity = 0;
      let storyIndex = 0;
      
      while (storyIndex < sortedStories.length && usedCapacity + sortedStories[storyIndex].storyPoints <= sprintCapacity) {
        sprint.stories.push(sortedStories[storyIndex]);
        usedCapacity += sortedStories[storyIndex].storyPoints;
        storyIndex++;
      }
      
      // Remove assigned stories
      sortedStories.splice(0, storyIndex);
      
      if (sprint.stories.length > 0) {
        sprints.push(sprint);
      }
    }
    
    // Add remaining stories to backlog
    if (sortedStories.length > 0 && sprints.length > 0) {
      sprints[sprints.length - 1].stories.push(...sortedStories);
    }
    
    return sprints;
  }

  private saveStories(sprints: StorySprint[], prdPath: string): void {
    const outputDir = this.config.outputDir;
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save as JSON
    const jsonOutput = join(outputDir, `stories_${timestamp}.json`);
    writeFileSync(jsonOutput, JSON.stringify({ sprints }, null, 2));
    console.log(`Saved stories to: ${jsonOutput}`);
    
    // Save as Markdown
    const mdOutput = join(outputDir, `stories_${timestamp}.md`);
    const mdContent = this.generateMarkdown(sprints, prdPath);
    writeFileSync(mdOutput, mdContent);
    console.log(`Saved markdown to: ${mdOutput}`);
  }

  private generateMarkdown(sprints: StorySprint[], prdPath: string): string {
    let md = `# User Stories\n\n`;
    md += `*Generated from: ${prdPath}*\n`;
    md += `*Generated on: ${new Date().toISOString()}*\n\n`;
    
    let totalPoints = 0;
    let totalStories = 0;
    
    for (const sprint of sprints) {
      md += `## ${sprint.name}\n\n`;
      md += `**Dates:** ${sprint.startDate} to ${sprint.endDate}\n`;
      md += `**Goal:** ${sprint.goal}\n`;
      md += `**Capacity:** ${sprint.capacity} story points\n\n`;
      
      for (const story of sprint.stories) {
        md += `### ${story.title}\n\n`;
        md += `**ID:** ${story.id}\n`;
        md += `**Priority:** ${story.priority}\n`;
        md += `**Story Points:** ${story.storyPoints}\n`;
        md += `**Labels:** ${story.labels.join(', ')}\n\n`;
        
        if (story.epic) {
          md += `**Epic:** ${story.epic}\n\n`;
        }
        
        md += `${story.description}\n\n`;
        
        md += `**Acceptance Criteria:**\n`;
        for (const ac of story.acceptanceCriteria) {
          md += `- [ ] ${ac}\n`;
        }
        md += `\n`;
        
        if (story.technicalNotes) {
          md += `**Technical Notes:**\n${story.technicalNotes}\n\n`;
        }
        
        totalPoints += story.storyPoints;
        totalStories++;
      }
      
      const sprintPoints = sprint.stories.reduce((sum, story) => sum + story.storyPoints, 0);
      md += `**Sprint Total:** ${sprintPoints} story points (${sprint.stories.length} stories)\n\n`;
    }
    
    md += `## Summary\n\n`;
    md += `**Total Stories:** ${totalStories}\n`;
    md += `**Total Story Points:** ${totalPoints}\n`;
    md += `**Average Points per Story:** ${(totalPoints / totalStories).toFixed(1)}\n`;
    md += `**Estimated Timeline:** ${sprints.length} sprints (~${sprints.length * 3} weeks)\n`;
    
    return md;
  }
}