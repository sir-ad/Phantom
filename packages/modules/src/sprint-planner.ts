// PHANTOM Module: Sprint Planner v1.5.0
// "I know velocity."

import { getAIManager } from '@phantom-pm/core';
import { getContextEngine } from '@phantom-pm/core';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface SprintStory {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  storyPoints: number;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  labels: string[];
}

export interface SprintPlan {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  capacity: number; // Total team capacity in story points
  stories: SprintStory[];
  metrics: {
    totalPoints: number;
    completedPoints: number;
    velocity: number;
    burndown: Array<{ day: number; remaining: number }>;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  availability: number; // Percentage (0-100)
  skills: string[];
}

export interface SprintPlannerConfig {
  defaultSprintDuration: number; // days
  defaultTeamCapacity: number; // story points per sprint
  outputDir: string;
}

export class SprintPlannerModule {
  private config: SprintPlannerConfig;
  private aiManager: ReturnType<typeof getAIManager>;

  constructor(config: Partial<SprintPlannerConfig> = {}) {
    this.config = {
      defaultSprintDuration: 14, // 2 weeks
      defaultTeamCapacity: 21, // Standard team capacity
      outputDir: './.phantom/output/sprints',
      ...config,
    };
    this.aiManager = getAIManager();
  }

  /**
   * Plan a new sprint based on backlog prioritization and team capacity
   */
  async planSprint(options: {
    backlogPath?: string;
    teamVelocity?: number;
    sprintGoal?: string;
    durationDays?: number;
    teamMembers?: TeamMember[];
  }): Promise<SprintPlan> {
    const duration = options.durationDays || this.config.defaultSprintDuration;
    const capacity = options.teamVelocity || this.config.defaultTeamCapacity;
    const goal = options.sprintGoal || 'Deliver high-priority features';
    
    // Get backlog items if provided
    let backlogStories: SprintStory[] = [];
    if (options.backlogPath && existsSync(options.backlogPath)) {
      backlogStories = this.loadBacklogFromFile(options.backlogPath);
    } else {
      // Generate sample backlog from context
      backlogStories = await this.generateSampleBacklog();
    }
    
    // Prioritize and select stories based on capacity
    const selectedStories = this.selectStoriesForSprint(backlogStories, capacity);
    
    // Calculate metrics
    const totalPoints = selectedStories.reduce((sum, story) => sum + story.storyPoints, 0);
    const burndown = this.calculateBurndown(totalPoints, duration);
    
    const sprintPlan: SprintPlan = {
      id: `sprint_${Date.now()}`,
      name: `Sprint ${new Date().toISOString().slice(0, 10)}`,
      goal,
      startDate: new Date().toISOString().split('T')[0],
      endDate: this.calculateEndDate(duration),
      durationDays: duration,
      capacity,
      stories: selectedStories,
      metrics: {
        totalPoints,
        completedPoints: 0,
        velocity: 0,
        burndown,
      },
    };
    
    // Save the plan
    this.saveSprintPlan(sprintPlan);
    
    return sprintPlan;
  }

  /**
   * Generate a retrospective report for a completed sprint
   */
  async generateRetrospective(sprint: SprintPlan): Promise<string> {
    const systemPrompt = `You are an experienced Agile coach facilitating a sprint retrospective.
    
    Analyze the sprint data and generate insights in the following format:
    
    ## Sprint Retrospective
    
    ### What Went Well
    - [Positive observations]
    
    ### What Didn't Go Well
    - [Challenges and issues]
    
    ### Action Items
    - [Concrete improvements for next sprint]
    
    ### Velocity Analysis
    - Planned: ${sprint.capacity} points
    - Completed: ${sprint.metrics.completedPoints} points
    - Velocity: ${sprint.metrics.velocity} points`;

    const userPrompt = `Sprint Details:
    Goal: ${sprint.goal}
    Duration: ${sprint.durationDays} days
    Capacity: ${sprint.capacity} points
    Stories: ${sprint.stories.length} items
    Completed: ${sprint.metrics.completedPoints} points
    Velocity: ${sprint.metrics.velocity} points
    
    Generate a comprehensive retrospective report.`;

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

      return response.content;
    } catch (error) {
      console.error('Failed to generate retrospective:', error);
      return this.generateFallbackRetrospective(sprint);
    }
  }

  /**
   * Update sprint status and metrics
   */
  updateSprintProgress(sprint: SprintPlan, completedPoints: number): SprintPlan {
    const updatedSprint = { ...sprint };
    updatedSprint.metrics.completedPoints = completedPoints;
    updatedSprint.metrics.velocity = completedPoints;
    return updatedSprint;
  }

  /**
   * Load backlog from a file
   */
  private loadBacklogFromFile(filePath: string): SprintStory[] {
    try {
      const content = readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      return Array.isArray(data.stories) ? data.stories : [];
    } catch (error) {
      console.warn('Failed to load backlog from file, using empty backlog');
      return [];
    }
  }

  /**
   * Generate sample backlog from project context
   */
  private async generateSampleBacklog(): Promise<SprintStory[]> {
    const context = getContextEngine();
    const contextEntries = context.getEntries();
    
    // Extract features from context
    const features = contextEntries
      .filter(entry => entry.type === 'document' || entry.type === 'code')
      .slice(0, 5)
      .map((entry, index) => ({
        id: `story_${Date.now()}_${index}`,
        title: `Implement feature from ${entry.relativePath}`,
        description: `Based on analysis of ${entry.relativePath}`,
        priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
        storyPoints: [5, 3, 3, 2, 1][index],
        status: 'todo' as 'todo',
        labels: [entry.metadata.language || 'feature', 'development'],
      }));

    return features;
  }

  /**
   * Select stories for sprint based on priority and capacity
   */
  private selectStoriesForSprint(backlog: SprintStory[], capacity: number): SprintStory[] {
    // Sort by priority and story points
    const sortedStories = [...backlog].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || a.storyPoints - b.storyPoints;
    });
    
    const selected: SprintStory[] = [];
    let usedCapacity = 0;
    
    for (const story of sortedStories) {
      if (usedCapacity + story.storyPoints <= capacity) {
        selected.push(story);
        usedCapacity += story.storyPoints;
      }
    }
    
    return selected;
  }

  /**
   * Calculate burndown chart data
   */
  private calculateBurndown(totalPoints: number, durationDays: number): Array<{ day: number; remaining: number }> {
    const burndown = [];
    const dailyBurnRate = totalPoints / durationDays;
    
    for (let day = 0; day <= durationDays; day++) {
      const remaining = Math.max(0, totalPoints - (dailyBurnRate * day));
      burndown.push({ day, remaining: Math.round(remaining * 100) / 100 });
    }
    
    return burndown;
  }

  /**
   * Calculate end date based on duration
   */
  private calculateEndDate(durationDays: number): string {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays);
    return endDate.toISOString().split('T')[0];
  }

  /**
   * Save sprint plan to file
   */
  private saveSprintPlan(sprint: SprintPlan): void {
    const outputDir = this.config.outputDir;
    mkdirSync(outputDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `sprint-plan-${timestamp}`;
    
    // Save as JSON
    const jsonPath = join(outputDir, `${fileName}.json`);
    writeFileSync(jsonPath, JSON.stringify(sprint, null, 2));
    
    // Save as Markdown
    const mdPath = join(outputDir, `${fileName}.md`);
    const markdown = this.generateMarkdownReport(sprint);
    writeFileSync(mdPath, markdown);
    
    console.log(`Sprint plan saved to ${jsonPath} and ${mdPath}`);
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(sprint: SprintPlan): string {
    let md = `# ${sprint.name}\n\n`;
    md += `**Goal:** ${sprint.goal}\n\n`;
    md += `**Dates:** ${sprint.startDate} to ${sprint.endDate} (${sprint.durationDays} days)\n\n`;
    md += `**Capacity:** ${sprint.capacity} story points\n\n`;
    
    md += `## Stories\n\n`;
    for (const story of sprint.stories) {
      md += `### ${story.title}\n`;
      md += `- **Points:** ${story.storyPoints}\n`;
      md += `- **Priority:** ${story.priority}\n`;
      md += `- **Labels:** ${story.labels.join(', ')}\n`;
      md += `${story.description}\n\n`;
    }
    
    md += `## Burndown Chart\n\n`;
    md += '| Day | Remaining Points |\n';
    md += '|-----|------------------|\n';
    for (const point of sprint.metrics.burndown) {
      md += `| ${point.day} | ${point.remaining} |\n`;
    }
    
    return md;
  }

  /**
   * Generate fallback retrospective
   */
  private generateFallbackRetrospective(sprint: SprintPlan): string {
    return `# Sprint Retrospective (Fallback)
    
## What Went Well
- Team collaborated effectively
- Met sprint commitment
- Maintained code quality

## What Didn't Go Well
- Some stories took longer than estimated
- Interruptions affected focus time

## Action Items
- Improve estimation accuracy
- Minimize interruptions during focused work time
- Continue effective collaboration practices

## Velocity Analysis
- Planned: ${sprint.capacity} points
- Completed: ${sprint.metrics.completedPoints} points
- Velocity: ${sprint.metrics.velocity} points`;
  }
}

// Module entry point for CLI
export async function runSprintPlanner(args: Record<string, any>): Promise<any> {
  const planner = new SprintPlannerModule();
  
  if (args._[0] === 'retro' || args._[0] === 'retrospective') {
    // Load existing sprint if path provided
    if (args.sprint) {
      try {
        const sprintData = JSON.parse(readFileSync(args.sprint, 'utf8'));
        const retrospective = await planner.generateRetrospective(sprintData);
        return {
          success: true,
          type: 'retrospective',
          content: retrospective,
        };
      } catch (error) {
        throw new Error(`Failed to load sprint data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      throw new Error('Sprint data file required for retrospective. Use --sprint <path>');
    }
  } else {
    // Plan a new sprint
    const sprintPlan = await planner.planSprint({
      sprintGoal: args.goal,
      durationDays: args.duration,
      teamVelocity: args.velocity,
      backlogPath: args.backlog,
    });
    
    return {
      success: true,
      type: 'sprint-plan',
      sprint: {
        id: sprintPlan.id,
        name: sprintPlan.name,
        goal: sprintPlan.goal,
        startDate: sprintPlan.startDate,
        endDate: sprintPlan.endDate,
        totalPoints: sprintPlan.metrics.totalPoints,
        stories: sprintPlan.stories.length,
      },
      filePath: join('./.phantom/output/sprints', `sprint-plan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`),
    };
  }
}
