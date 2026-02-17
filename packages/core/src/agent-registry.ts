// PHANTOM Core - Agent Registry System
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { AgentDiscovery, type DetectedAgent, type AgentSignature } from './agent-discovery.js';
import { getConfig } from './config.js';

export interface RegisteredAgent {
  id: string;
  signature: AgentSignature;
  registrationDate: string;
  lastDetection: string;
  detectionCount: number;
  status: 'connected' | 'available' | 'offline' | 'unknown' | 'running' | 'installed';
  phantomIntegration: {
    level: 'aware' | 'integrated' | 'enhanced' | 'full';
    featuresEnabled: string[];
    lastSync: string;
  };
  capabilities: ExtendedCapability[];
  performance: {
    responseTime: number;
    reliability: number; // 0-100
    lastActive: string;
  };
  connections: AgentConnection[];
}

export interface ExtendedCapability {
  name: string;
  description: string;
  strength: number; // 0-100
  lastUsed: string;
  usageCount: number;
}

export interface AgentConnection {
  targetAgentId: string;
  connectionType: 'direct' | 'mediated' | 'shared-context';
  strength: number; // 0-100
  lastInteraction: string;
  dataFlow: {
    sent: number; // bytes
    received: number; // bytes
  };
}

export interface EnhancementPlan {
  feature: string;
  description: string;
  benefits: string[];
  implementation: string;
  effort: 'low' | 'medium' | 'high';
}

interface AgentRegistryPayloadV2 {
  schemaVersion: 2;
  updatedAt: string;
  agents: Record<string, RegisteredAgent>;
}

const REGISTRY_SCHEMA_VERSION = 2;
const OFFLINE_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export class AgentRegistry {
  private discovery: AgentDiscovery;
  private registryPath: string;
  private agents: Map<string, RegisteredAgent> = new Map();

  constructor() {
    this.discovery = new AgentDiscovery();
    const configDir = getConfig().getConfigDir();
    this.registryPath = join(configDir, 'agents', 'registry.json');
    this.loadRegistry();
  }

  /**
   * Scan system and register newly detected agents
   */
  async scanAndRegister(): Promise<RegisteredAgent[]> {
    const detectedAgents = await this.discovery.scanSystem();
    const newlyRegistered: RegisteredAgent[] = [];
    const seenAgentIds = new Set<string>();

    for (const detected of detectedAgents) {
      seenAgentIds.add(detected.signature.id);
      const existing = this.agents.get(detected.signature.id);
      
      if (existing) {
        // Update existing registration
        existing.lastDetection = detected.lastSeen;
        existing.detectionCount += 1;
        existing.status = detected.status;
        this.updateCapabilities(existing, detected);
      } else {
        // Register new agent
        const newAgent = this.createRegistration(detected);
        this.agents.set(detected.signature.id, newAgent);
        newlyRegistered.push(newAgent);
      }
    }

    this.reconcileOfflineAgents(seenAgentIds);
    this.saveRegistry();
    return newlyRegistered;
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): RegisteredAgent[] {
    this.reconcileOfflineAgents(new Set<string>());
    return Array.from(this.agents.values())
      .sort((a, b) => b.performance.reliability - a.performance.reliability);
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): RegisteredAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: RegisteredAgent['status']): RegisteredAgent[] {
    return this.getAllAgents().filter(agent => agent.status === status);
  }

  /**
   * Get enhancement suggestions for an agent
   */
  getEnhancementSuggestions(agentId: string): EnhancementPlan[] {
    const agent = this.getAgent(agentId);
    if (!agent) return [];

    const signature = this.discovery.getAgentDetails(agentId);
    if (!signature) return [];

    return signature.phantomFeatures.map(feature => {
      const plan = this.mapFeatureToPlan(feature, agent);
      return {
        feature,
        description: plan.description,
        benefits: plan.benefits,
        implementation: plan.implementation,
        effort: plan.effort
      };
    });
  }

  /**
   * Enable Phantom integration for an agent
   */
  enableIntegration(agentId: string, level: 'integrated' | 'enhanced' | 'full'): boolean {
    const agent = this.getAgent(agentId);
    if (!agent) return false;

    agent.phantomIntegration.level = level;
    agent.phantomIntegration.featuresEnabled = this.getFeaturesForLevel(level);
    agent.phantomIntegration.lastSync = new Date().toISOString();
    
    this.saveRegistry();
    return true;
  }

  /**
   * Record agent interaction/connection
   */
  recordConnection(fromAgentId: string, toAgentId: string, connectionType: AgentConnection['connectionType'], dataSize: number = 0): boolean {
    const fromAgent = this.getAgent(fromAgentId);
    const toAgent = this.getAgent(toAgentId);
    
    if (!fromAgent || !toAgent) return false;

    // Update from agent's outgoing connection
    let connection = fromAgent.connections.find(c => c.targetAgentId === toAgentId);
    if (!connection) {
      connection = {
        targetAgentId: toAgentId,
        connectionType,
        strength: 50,
        lastInteraction: new Date().toISOString(),
        dataFlow: { sent: 0, received: 0 }
      };
      fromAgent.connections.push(connection);
    }

    connection.lastInteraction = new Date().toISOString();
    connection.dataFlow.sent += dataSize;
    connection.strength = Math.min(100, connection.strength + Math.log(dataSize + 1));

    // Update to agent's incoming connection
    let reverseConnection = toAgent.connections.find(c => c.targetAgentId === fromAgentId);
    if (!reverseConnection) {
      reverseConnection = {
        targetAgentId: fromAgentId,
        connectionType,
        strength: 50,
        lastInteraction: new Date().toISOString(),
        dataFlow: { sent: 0, received: 0 }
      };
      toAgent.connections.push(reverseConnection);
    }

    reverseConnection.lastInteraction = new Date().toISOString();
    reverseConnection.dataFlow.received += dataSize;
    reverseConnection.strength = Math.min(100, reverseConnection.strength + Math.log(dataSize + 1));

    this.saveRegistry();
    return true;
  }

  /**
   * Get network topology information
   */
  getNetworkTopology(): {
    agents: RegisteredAgent[];
    connections: { from: string; to: string; strength: number }[];
    clusters: { name: string; agents: string[] }[];
  } {
    const agents = this.getAllAgents();
    const dedupConnections = new Map<string, { from: string; to: string; strength: number }>();
    
    // Collect all connections
    for (const agent of agents) {
      for (const conn of agent.connections) {
        const key = [agent.id, conn.targetAgentId].sort().join('::');
        const existing = dedupConnections.get(key);
        const candidate = {
          from: agent.id,
          to: conn.targetAgentId,
          strength: conn.strength
        };
        if (!existing || candidate.strength > existing.strength) {
          dedupConnections.set(key, candidate);
        }
      }
    }

    // Simple clustering by integration level
    const clusters = [
      {
        name: 'Fully Integrated',
        agents: agents.filter(a => a.phantomIntegration.level === 'full').map(a => a.id)
      },
      {
        name: 'Enhanced Integration',
        agents: agents.filter(a => a.phantomIntegration.level === 'enhanced').map(a => a.id)
      },
      {
        name: 'Basic Awareness',
        agents: agents.filter(a => a.phantomIntegration.level === 'integrated').map(a => a.id)
      }
    ].filter(cluster => cluster.agents.length > 0);

    return { agents, connections: Array.from(dedupConnections.values()), clusters };
  }

  getHealthReport(): {
    totalAgents: number;
    connected: number;
    running: number;
    offline: number;
    stale: string[];
    issues: string[];
  } {
    const agents = this.getAllAgents();
    const stale: string[] = [];
    const issues: string[] = [];
    const now = Date.now();

    for (const agent of agents) {
      const ageMs = now - new Date(agent.lastDetection).getTime();
      if (Number.isFinite(ageMs) && ageMs > OFFLINE_THRESHOLD_MS) {
        stale.push(agent.id);
      }
      if (agent.performance.reliability < 30) {
        issues.push(`${agent.id}:low-reliability`);
      }
    }

    return {
      totalAgents: agents.length,
      connected: agents.filter(agent => agent.status === 'connected').length,
      running: agents.filter(agent => agent.status === 'running').length,
      offline: agents.filter(agent => agent.status === 'offline').length,
      stale,
      issues,
    };
  }

  /**
   * Create initial registration for detected agent
   */
  private createRegistration(detected: DetectedAgent): RegisteredAgent {
    return {
      id: detected.signature.id,
      signature: detected.signature,
      registrationDate: detected.lastSeen,
      lastDetection: detected.lastSeen,
      detectionCount: 1,
      status: detected.status,
      phantomIntegration: {
        level: 'aware',
        featuresEnabled: [],
        lastSync: new Date().toISOString()
      },
      capabilities: detected.signature.capabilities.map(cap => ({
        name: cap,
        description: `Capability: ${cap}`,
        strength: detected.confidence,
        lastUsed: detected.lastSeen,
        usageCount: 0
      })),
      performance: {
        responseTime: 0,
        reliability: detected.confidence,
        lastActive: detected.lastSeen
      },
      connections: []
    };
  }

  /**
   * Update agent capabilities based on new detection
   */
  private updateCapabilities(agent: RegisteredAgent, detected: DetectedAgent): void {
    // Boost reliability based on consistent detection
    agent.performance.reliability = Math.min(100, 
      agent.performance.reliability + (detected.confidence * 0.1)
    );
    
    agent.performance.lastActive = detected.lastSeen;
  }

  private reconcileOfflineAgents(seenAgentIds: Set<string>): void {
    const now = Date.now();
    for (const agent of this.agents.values()) {
      if (seenAgentIds.has(agent.id)) continue;
      const lastSeenMs = new Date(agent.lastDetection).getTime();
      const stale = Number.isFinite(lastSeenMs) && now - lastSeenMs > OFFLINE_THRESHOLD_MS;
      if (stale) {
        agent.status = 'offline';
      }
    }
  }

  /**
   * Map Phantom features to implementation plans
   */
  private mapFeatureToPlan(feature: string, agent: RegisteredAgent): {
    description: string;
    benefits: string[];
    implementation: string;
    effort: 'low' | 'medium' | 'high';
  } {
    const plans: Record<string, any> = {
      'context-sharing': {
        description: 'Share project context between PHANTOM and this agent',
        benefits: [
          'Reduced redundant context explanation',
          'Consistent understanding across tools',
          'Automatic context synchronization'
        ],
        implementation: 'Enable MCP context.add tool integration',
        effort: 'low'
      },
      'swarm-analysis': {
        description: 'Bring multi-agent analysis to this agent\'s workflow',
        benefits: [
          '7-perspective product analysis',
          'Deterministic decision support',
          'Risk assessment automation'
        ],
        implementation: 'Add phantom swarm command to agent context menu',
        effort: 'medium'
      },
      'prd-integration': {
        description: 'Generate and sync PRDs directly in this agent',
        benefits: [
          'Automated requirement generation',
          'Live PRD updates during development',
          'Cross-tool consistency'
        ],
        implementation: 'Create agent extension/plugin for PRD commands',
        effort: 'high'
      },
      'smart-nudges': {
        description: 'Receive contextual suggestions from PHANTOM',
        benefits: [
          'Workflow optimization tips',
          'Integration opportunity alerts',
          'Performance enhancement suggestions'
        ],
        implementation: 'Implement real-time notification system',
        effort: 'medium'
      },
      'live-context': {
        description: 'Real-time context synchronization',
        benefits: [
          'Instant project state awareness',
          'Automatic file change detection',
          'Dynamic context updates'
        ],
        implementation: 'WebSocket-based context streaming',
        effort: 'high'
      }
    };

    return plans[feature] || {
      description: `Enable ${feature} integration`,
      benefits: ['Enhanced workflow capabilities'],
      implementation: 'Custom integration development',
      effort: 'medium'
    };
  }

  /**
   * Get features available for integration level
   */
  private getFeaturesForLevel(level: 'integrated' | 'enhanced' | 'full'): string[] {
    const baseFeatures = ['context-sharing', 'smart-nudges'];
    
    if (level === 'enhanced' || level === 'full') {
      baseFeatures.push('swarm-analysis', 'prd-integration');
    }
    
    if (level === 'full') {
      baseFeatures.push('live-context');
    }
    
    return baseFeatures;
  }

  /**
   * Load registry from disk
   */
  private loadRegistry(): void {
    try {
      if (existsSync(this.registryPath)) {
        const parsed = JSON.parse(readFileSync(this.registryPath, 'utf8')) as
          | AgentRegistryPayloadV2
          | Record<string, RegisteredAgent>;
        const payload = this.migrateRegistry(parsed);
        for (const [id, agent] of Object.entries(payload.agents)) {
          this.agents.set(id, this.normalizeAgent(agent));
        }
      }
    } catch (error) {
      // Start with empty registry
      this.agents.clear();
    }
  }

  /**
   * Save registry to disk
   */
  private saveRegistry(): void {
    try {
      const dir = dirname(this.registryPath);
      mkdirSync(dir, { recursive: true });
      const payload: AgentRegistryPayloadV2 = {
        schemaVersion: REGISTRY_SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        agents: Object.fromEntries(this.agents),
      };
      writeFileSync(this.registryPath, JSON.stringify(payload, null, 2));
    } catch (error) {
      console.warn('Failed to save agent registry:', error);
    }
  }

  private migrateRegistry(
    payload: AgentRegistryPayloadV2 | Record<string, RegisteredAgent>
  ): AgentRegistryPayloadV2 {
    if (typeof (payload as AgentRegistryPayloadV2).schemaVersion === 'number') {
      return payload as AgentRegistryPayloadV2;
    }

    return {
      schemaVersion: REGISTRY_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      agents: payload as Record<string, RegisteredAgent>,
    };
  }

  private normalizeAgent(agent: RegisteredAgent): RegisteredAgent {
    const normalized = { ...agent };
    if (!normalized.phantomIntegration) {
      normalized.phantomIntegration = {
        level: 'aware',
        featuresEnabled: [],
        lastSync: new Date().toISOString(),
      };
    }
    if (!Array.isArray(normalized.connections)) {
      normalized.connections = [];
    }
    return normalized;
  }
}
