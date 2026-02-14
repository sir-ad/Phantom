// PHANTOM Core - Intelligent Nudging Engine
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { getConfig } from './config.js';
import { getContextEngine } from './context.js';
import { getSwarm } from './agents.js';
import { getModuleManager } from './modules.js';
import { type RegisteredAgent, type EnhancementPlan } from './agent-registry.js';

export type NudgeType = 'suggestion' | 'warning' | 'opportunity' | 'insight' | 'alert';
export type NudgePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Nudge {
  id: string;
  type: NudgeType;
  priority: NudgePriority;
  title: string;
  message: string;
  action: string;
  command?: string;
  context: NudgeContext;
  suggestions: string[];
  timestamp: string;
  dismissed: boolean;
  snoozeUntil?: string;
}

// Partial nudge interface for construction
interface PartialNudge {
  type: NudgeType;
  priority: NudgePriority;
  title: string;
  message: string;
  action: string;
  command?: string;
  context: NudgeContext;
  suggestions: string[];
}

export interface NudgeContext {
  project?: string;
  agent?: string;
  trigger: string;
  relatedFiles?: string[];
  metrics?: Record<string, number>;
}

export interface UserContext {
  activeProject: string | null;
  installedModules: string[];
  connectedAgents: string[];
  recentActions: string[];
  currentDirectory: string;
  timeOfDay: string;
  dayOfWeek: string;
}

export class NudgeEngine {
  private nudges: Nudge[] = [];
  private nudgeHistory: Nudge[] = [];
  private configPath: string;

  constructor() {
    const configDir = getConfig().getConfigDir();
    this.configPath = join(configDir, 'nudges', 'history.json');
    this.loadNudgeHistory();
  }

  /**
   * Generate contextual nudges based on current state
   */
  async generateNudges(userContext: UserContext): Promise<Nudge[]> {
    // Clear existing non-dismissed nudges
    this.nudges = this.nudges.filter(n => n.dismissed);
    
    // 1. Agent-related nudges
    const agentNudges = await this.generateAgentNudges(userContext);
    
    // 2. Project context nudges
    const contextNudges = await this.generateContextNudges(userContext);
    
    // 3. Workflow optimization nudges
    const workflowNudges = await this.generateWorkflowNudges(userContext);
    
    // 4. Integration opportunity nudges
    const integrationNudges = await this.generateIntegrationNudges(userContext);
    
    // Convert partial nudges to full nudges
    const timestamp = new Date().toISOString();
    const fullNudges: Nudge[] = [
      ...agentNudges,
      ...contextNudges,
      ...workflowNudges,
      ...integrationNudges
    ].map((partial, index) => ({
      ...partial,
      id: `nudge-${Date.now()}-${index}`,
      timestamp,
      dismissed: false
    }));
    
    this.nudges.push(...fullNudges);
    this.saveNudgeHistory();
    
    return fullNudges;
  }

  /**
   * Get current active nudges
   */
  getCurrentNudges(filter?: { type?: NudgeType; priority?: NudgePriority }): Nudge[] {
    let filtered = this.nudges.filter(n => !n.dismissed);
    
    if (filter?.type) {
      filtered = filtered.filter(n => n.type === filter.type);
    }
    
    if (filter?.priority) {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }
    
    return filtered.sort((a, b) => {
      // Sort by priority, then by recency
      const priorityOrder: Record<NudgePriority, number> = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
      };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  /**
   * Dismiss a nudge
   */
  dismissNudge(nudgeId: string): boolean {
    const nudge = this.nudges.find(n => n.id === nudgeId);
    if (nudge) {
      nudge.dismissed = true;
      this.nudgeHistory.push({ ...nudge });
      this.saveNudgeHistory();
      return true;
    }
    return false;
  }

  /**
   * Snooze a nudge
   */
  snoozeNudge(nudgeId: string, durationMinutes: number): boolean {
    const nudge = this.nudges.find(n => n.id === nudgeId);
    if (nudge) {
      const snoozeTime = new Date(Date.now() + durationMinutes * 60000);
      nudge.snoozeUntil = snoozeTime.toISOString();
      nudge.dismissed = true;
      this.saveNudgeHistory();
      return true;
    }
    return false;
  }

  /**
   * Get nudge statistics
   */
  getNudgeStats(): {
    totalGenerated: number;
    active: number;
    dismissed: number;
    byType: Record<NudgeType, number>;
    byPriority: Record<NudgePriority, number>;
  } {
    const allNudges = [...this.nudges, ...this.nudgeHistory];
    
    return {
      totalGenerated: allNudges.length,
      active: this.nudges.filter(n => !n.dismissed).length,
      dismissed: this.nudgeHistory.length,
      byType: allNudges.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<NudgeType, number>),
      byPriority: allNudges.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<NudgePriority, number>)
    };
  }

  /**
   * Generate agent-related nudges
   */
  private async generateAgentNudges(userContext: UserContext): Promise<PartialNudge[]> {
    const nudges: PartialNudge[] = [];
    
    // Check for newly detected agents
    if (userContext.connectedAgents.length > 0) {
      const firstAgent = userContext.connectedAgents[0];
      
      nudges.push({
        type: 'suggestion',
        priority: 'high',
        title: '🎉 New Agent Detected!',
        message: `PHANTOM has detected ${firstAgent} in your environment. Enable deeper integration to unlock enhanced capabilities.`,
        action: 'Enable integration features',
        command: `phantom agents integrate ${firstAgent}`,
        context: {
          agent: firstAgent,
          trigger: 'agent_detection'
        },
        suggestions: [
          'Share project context automatically',
          'Enable swarm analysis integration',
          'Sync PRD generation capabilities'
        ]
      });
    }
    
    // Suggest agent coordination
    if (userContext.connectedAgents.length > 1) {
      nudges.push({
        type: 'opportunity',
        priority: 'medium',
        title: '🤖 Agent Network Detected',
        message: `You have ${userContext.connectedAgents.length} AI agents active. Enable cross-agent coordination for maximum productivity.`,
        action: 'Configure agent network',
        command: 'phantom agents network',
        context: {
          trigger: 'multi_agent_detection'
        },
        suggestions: [
          'Set up communication channels between agents',
          'Enable shared context propagation',
          'Configure task delegation workflows'
        ]
      });
    }
    
    return nudges;
  }

  /**
   * Generate context-related nudges
   */
  private async generateContextNudges(userContext: UserContext): Promise<PartialNudge[]> {
    const nudges: PartialNudge[] = [];
    const context = getContextEngine();
    const stats = context.getStats();
    
    // Low context health
    if (stats.healthScore < 70 && stats.totalFiles > 0) {
      nudges.push({
        type: 'warning',
        priority: 'medium',
        title: '🔍 Context Coverage Improvement Needed',
        message: `Your project context health is ${stats.healthScore}%. Add documentation and design files for better analysis quality.`,
        action: 'Improve context coverage',
        command: 'phantom context add ./docs',
        context: {
          project: userContext.activeProject || undefined,
          trigger: 'low_context_health',
          metrics: { contextHealth: stats.healthScore }
        },
        suggestions: [
          'Add README.md and technical documentation',
          'Include design files and wireframes',
          'Add API specifications and schemas'
        ]
      });
    }
    
    // No active project
    if (!userContext.activeProject) {
      nudges.push({
        type: 'suggestion',
        priority: 'high',
        title: '🚀 No Active Project Detected',
        message: 'Set an active project to unlock context-aware features and personalized recommendations.',
        action: 'Set active project',
        command: 'phantom context add .',
        context: {
          trigger: 'no_active_project'
        },
        suggestions: [
          'Run phantom context add in your project directory',
          'PHANTOM will automatically analyze your codebase',
          'Get personalized product management insights'
        ]
      });
    }
    
    return nudges;
  }

  /**
   * Generate workflow optimization nudges
   */
  private async generateWorkflowNudges(userContext: UserContext): Promise<PartialNudge[]> {
    const nudges: PartialNudge[] = [];
    const modules = getModuleManager();
    const installedCount = userContext.installedModules.length;
    
    // No modules installed
    if (installedCount === 0) {
      nudges.push({
        type: 'suggestion',
        priority: 'high',
        title: '📦 Install Product Management Modules',
        message: 'Install PHANTOM modules to unlock specialized PM workflows like PRD generation, user story creation, and sprint planning.',
        action: 'Browse available modules',
        command: 'phantom modules',
        context: {
          trigger: 'no_modules_installed'
        },
        suggestions: [
          'prd-forge: Generate comprehensive PRDs',
          'story-writer: Create user stories automatically',
          'sprint-planner: AI-powered sprint planning'
        ]
      });
    }
    
    // Suggest swarm analysis for complex decisions
    if (userContext.recentActions.includes('prd') && installedCount > 0) {
      nudges.push({
        type: 'insight',
        priority: 'medium',
        title: '🧠 Use Swarm Analysis for Complex Decisions',
        message: 'Run multi-agent analysis to get 7 different perspectives on your product decisions.',
        action: 'Run swarm analysis',
        command: 'phantom swarm "Should we prioritize this feature?"',
        context: {
          trigger: 'complex_decision_point'
        },
        suggestions: [
          'Get strategic, technical, and user experience perspectives',
          'Identify hidden risks and opportunities',
          'Make data-driven product decisions'
        ]
      });
    }
    
    return nudges;
  }

  /**
   * Generate integration opportunity nudges
   */
  private async generateIntegrationNudges(userContext: UserContext): Promise<PartialNudge[]> {
    const nudges: PartialNudge[] = [];
    
    // Time-based suggestions
    const hour = new Date().getHours();
    
    if (hour >= 9 && hour <= 11) {
      // Morning - planning time
      nudges.push({
        type: 'suggestion',
        priority: 'medium',
        title: '🌅 Morning Planning Session',
        message: 'Start your day with strategic product planning. Generate today\'s priorities and roadmap.',
        action: 'Start planning session',
        command: 'phantom roadmap today',
        context: {
          trigger: 'morning_hours'
        },
        suggestions: [
          'Review yesterday\'s progress',
          'Set today\'s objectives',
          'Align team priorities'
        ]
      });
    }
    
    if (hour >= 14 && hour <= 16) {
      // Afternoon - review time
      nudges.push({
        type: 'insight',
        priority: 'medium',
        title: '📊 Afternoon Review Time',
        message: 'Review your product metrics and analyze recent user feedback.',
        action: 'Review metrics',
        command: 'phantom metrics review',
        context: {
          trigger: 'afternoon_hours'
        },
        suggestions: [
          'Analyze user engagement data',
          'Process customer feedback',
          'Review sprint progress'
        ]
      });
    }
    
    return nudges;
  }

  /**
   * Load nudge history from disk
   */
  private loadNudgeHistory(): void {
    try {
      if (existsSync(this.configPath)) {
        const data = JSON.parse(readFileSync(this.configPath, 'utf8'));
        this.nudgeHistory = data.history || [];
        this.nudges = data.current || [];
      }
    } catch (error) {
      this.nudgeHistory = [];
      this.nudges = [];
    }
  }

  /**
   * Save nudge history to disk
   */
  private saveNudgeHistory(): void {
    try {
      const dir = this.configPath.split('/').slice(0, -1).join('/');
      mkdirSync(dir, { recursive: true });
      
      const data = {
        history: this.nudgeHistory,
        current: this.nudges
      };
      
      writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Failed to save nudge history:', error);
    }
  }
}