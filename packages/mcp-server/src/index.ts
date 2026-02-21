import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import {
  generatePRD,
  getConfig,
  getContextEngine,
  getModuleManager,
  getSwarm,
  prdToMarkdown,
  runDeterministicSimulation,
  AgentDiscovery,
  AGENT_SIGNATURES,
  registerWithAllDetected,
  registerWithSpecificAgent,
  listRegistrationTargets,
  getAIManager,
} from '@phantom-pm/core';
import { BrowserAgent } from '@phantom-pm/browser-agent';

let globalBrowserAgent: BrowserAgent | null = null;
async function getBrowserAgent(): Promise<BrowserAgent> {
  if (!globalBrowserAgent) {
    globalBrowserAgent = new BrowserAgent(getAIManager(), { headless: true });
    await globalBrowserAgent.init();
  }
  return globalBrowserAgent;
}

export type PhantomToolName =
  | 'context.add'
  | 'context.search'
  | 'prd.generate'
  | 'swarm.analyze'
  | 'bridge.translate_pm_to_dev'
  | 'phantom_generate_prd'
  | 'phantom_swarm_analyze'
  | 'phantom_create_stories'
  | 'phantom_plan_sprint'
  | 'phantom_analyze_product'
  | 'phantom_discover_agents'
  | 'phantom_register_self'
  | 'phantom_simulate'
  | 'phantom_browser_goto'
  | 'phantom_browser_screenshot'
  | 'phantom_browser_dom'
  | 'phantom_browser_inject_css'
  | 'phantom_opencode_terminal'
  | 'phantom_opencode_file_manage'
  | 'phantom_opencode_ls';

type PhantomErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_TOOL'
  | 'INVALID_ARGUMENT'
  | 'TOOL_EXECUTION_ERROR'
  | 'RESOURCE_NOT_FOUND';

interface ToolError {
  code: PhantomErrorCode;
  message: string;
}

export interface ToolRequest {
  tool: PhantomToolName;
  arguments: Record<string, unknown>;
  request_id: string;
}

export interface ToolResponse {
  request_id: string;
  status: 'ok' | 'error';
  result?: unknown;
  errors?: ToolError[];
}

export interface ToolDefinition {
  name: PhantomToolName;
  description: string;
  input_schema: {
    type: 'object';
    required: string[];
    properties: Record<string, { type: string; description: string }>;
  };
}

interface ResourceDefinition {
  uri: string;
  title: string;
  description: string;
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'context.add',
    description: 'Index a path into the local PHANTOM context engine',
    input_schema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: { type: 'string', description: 'Absolute or relative path to index' },
        mode: { type: 'string', description: 'Reserved for future indexing mode options' },
      },
    },
  },
  {
    name: 'context.search',
    description: 'Search indexed context by path and content',
    input_schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Search query text' },
        limit: { type: 'number', description: 'Maximum number of results' },
      },
    },
  },
  {
    name: 'prd.generate',
    description: 'Generate a PRD document from a title',
    input_schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', description: 'PRD title' },
        output_path: { type: 'string', description: 'Optional file path to write markdown output' },
      },
    },
  },
  {
    name: 'swarm.analyze',
    description: 'Run deterministic swarm analysis for a product decision',
    input_schema: {
      type: 'object',
      required: ['question'],
      properties: {
        question: { type: 'string', description: 'Decision question' },
      },
    },
  },
  {
    name: 'phantom_generate_prd',
    description: 'Generate a PRD for a feature name (agent-friendly alias)',
    input_schema: {
      type: 'object',
      required: ['featureName'],
      properties: {
        featureName: { type: 'string', description: 'Feature name or initiative title' },
        output_path: { type: 'string', description: 'Optional file path to write markdown output' },
      },
    },
  },
  {
    name: 'phantom_swarm_analyze',
    description: 'Run deterministic swarm analysis (agent-friendly alias)',
    input_schema: {
      type: 'object',
      required: ['question'],
      properties: {
        question: { type: 'string', description: 'Decision question' },
      },
    },
  },
  {
    name: 'phantom_create_stories',
    description: 'Create user stories from a feature request',
    input_schema: {
      type: 'object',
      required: ['feature'],
      properties: {
        feature: { type: 'string', description: 'Feature name' },
        count: { type: 'number', description: 'Number of stories to create' },
      },
    },
  },
  {
    name: 'phantom_plan_sprint',
    description: 'Create a lightweight sprint plan from priorities and velocity',
    input_schema: {
      type: 'object',
      required: [],
      properties: {
        velocity: { type: 'number', description: 'Sprint capacity in story points' },
        priorities: { type: 'array', description: 'Ordered backlog priorities' },
      },
    },
  },
  {
    name: 'phantom_analyze_product',
    description: 'Analyze product/project state from local context and modules',
    input_schema: {
      type: 'object',
      required: [],
      properties: {
        focus: { type: 'string', description: 'Optional analysis focus area' },
      },
    },
  },
  {
    name: 'bridge.translate_pm_to_dev',
    description: 'Translate PM intent into dev-ready tasks',
    input_schema: {
      type: 'object',
      required: ['pm_intent'],
      properties: {
        pm_intent: { type: 'string', description: 'PM goal or product intent' },
        product_constraints: {
          type: 'string',
          description: 'Optional comma-delimited constraints to honor',
        },
      },
    },
  },
  {
    name: 'phantom_discover_agents',
    description: 'Discover all AI agents, IDEs, and LLMs installed on this system. Returns detected agents with confidence scores and capabilities.',
    input_schema: {
      type: 'object',
      required: [],
      properties: {
        include_offline: { type: 'boolean', description: 'Include agents that are installed but not running' },
      },
    },
  },
  {
    name: 'phantom_register_self',
    description: 'Register Phantom MCP server with a target agent. Writes config so the agent can connect to Phantom.',
    input_schema: {
      type: 'object',
      required: [],
      properties: {
        target: { type: 'string', description: 'Agent ID to register with (e.g. cursor, claude-code). Omit to register with all detected agents.' },
      },
    },
  },
  {
    name: 'phantom_simulate',
    description: 'Run a deterministic product simulation for a scenario. Returns baseline, projected metrics, and confidence.',
    input_schema: {
      type: 'object',
      required: ['scenario'],
      properties: {
        scenario: { type: 'string', description: 'Product scenario to simulate (e.g. "Add dark mode", "Launch premium tier")' },
      },
    },
  },
  {
    name: 'phantom_browser_goto',
    description: 'Navigate the Phantom BrowserAgent (OpenClaws) to a URL for visual UI inspection and generative modification.',
    input_schema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', description: 'URL to navigate to (e.g., http://localhost:3000)' },
      },
    },
  },
  {
    name: 'phantom_browser_screenshot',
    description: 'Take a screenshot of the active BrowserAgent session. Base64 encoded output.',
    input_schema: {
      type: 'object',
      required: [],
      properties: {
        full_page: { type: 'boolean', description: 'Capture full scrollable page' },
      },
    },
  },
  {
    name: 'phantom_browser_dom',
    description: 'Export a cleaned text version of the DOM from the BrowserAgent for AI traversal.',
    input_schema: {
      type: 'object',
      required: [],
      properties: {},
    },
  },
  {
    name: 'phantom_browser_inject_css',
    description: 'Inject raw CSS into the active BrowserAgent session for Generative UI previews.',
    input_schema: {
      type: 'object',
      required: ['css'],
      properties: {
        css: { type: 'string', description: 'Raw CSS to inject' },
      },
    },
  },
  {
    name: 'phantom_opencode_terminal',
    description: 'Execute read-only or safe terminal commands (inspired by OpenCode).',
    input_schema: {
      type: 'object',
      required: ['command'],
      properties: {
        command: { type: 'string', description: 'Terminal command to execute' },
        cwd: { type: 'string', description: 'Working directory for the command' },
      },
    },
  },
  {
    name: 'phantom_opencode_file_manage',
    description: 'Read or write file contents directly.',
    input_schema: {
      type: 'object',
      required: ['action', 'path'],
      properties: {
        action: { type: 'string', description: '"read" or "write"' },
        path: { type: 'string', description: 'Absolute or relative file path' },
        content: { type: 'string', description: 'Content to write (if action is "write")' },
      },
    },
  },
  {
    name: 'phantom_opencode_ls',
    description: 'List directory contents.',
    input_schema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: { type: 'string', description: 'Directory path to list' },
      },
    },
  },
];

const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'phantom://status/summary',
    title: 'Status Summary',
    description: 'Current Phantom runtime status and core configuration summary.',
  },
  {
    uri: 'phantom://projects/summary',
    title: 'Project Summary',
    description: 'Tracked projects and active context metadata.',
  },
  {
    uri: 'phantom://modules/summary',
    title: 'Module Summary',
    description: 'Installed and available module inventory.',
  },
  {
    uri: 'phantom://self/capabilities',
    title: 'Phantom Capabilities',
    description: 'Complete self-description of Phantom tools, resources, supported agents, and integration points. Use this to learn what Phantom can do.',
  },
];

export type MCPMode = 'core' | 'standard' | 'all';

const CORE_TOOLS: PhantomToolName[] = [
  'context.add',
  'context.search',
  'phantom_analyze_product',
  'phantom_discover_agents',
  'phantom_register_self',
];

const STANDARD_TOOLS: PhantomToolName[] = [
  ...CORE_TOOLS,
  'prd.generate',
  'phantom_generate_prd',
  'phantom_create_stories',
  'phantom_plan_sprint',
  'phantom_simulate',
];

const ALL_TOOLS: PhantomToolName[] = [
  ...STANDARD_TOOLS,
  'swarm.analyze',
  'phantom_swarm_analyze',
  'bridge.translate_pm_to_dev',
  'phantom_browser_goto',
  'phantom_browser_screenshot',
  'phantom_browser_dom',
  'phantom_browser_inject_css',
  'phantom_opencode_terminal',
  'phantom_opencode_file_manage',
  'phantom_opencode_ls',
];

function getToolsForMode(mode: MCPMode): ToolDefinition[] {
  const allowed = mode === 'all' ? ALL_TOOLS : mode === 'standard' ? STANDARD_TOOLS : CORE_TOOLS;
  return TOOL_DEFINITIONS.filter(t => allowed.includes(t.name));
}

function parseStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidArgument(key, 'must be a non-empty string');
  }
  return value.trim();
}

function parseNumberArg(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = args[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw invalidArgument(key, 'must be a finite number');
  }
  return Math.max(1, Math.floor(value));
}

function parseStringArrayArg(args: Record<string, unknown>, key: string): string[] {
  const value = args[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw invalidArgument(key, 'must be an array of strings');
  }
  const parsed = value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean);
  return parsed;
}

function parseOptionalStringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidArgument(key, 'must be a non-empty string');
  }
  return value.trim();
}

function buildPrdResponse(title: string, outputPath: unknown): unknown {
  const prd = generatePRD(title);
  const markdown = prdToMarkdown(prd);

  if (typeof outputPath === 'string' && outputPath.trim().length > 0) {
    const targetPath = outputPath.trim();
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `${markdown}\n`, 'utf8');
    return {
      prd_id: prd.id,
      sections: prd.sections.map(section => section.title),
      evidence: prd.evidence,
      output_path: targetPath,
      markdown,
    };
  }

  return {
    prd_id: prd.id,
    sections: prd.sections.map(section => section.title),
    evidence: prd.evidence,
    markdown,
  };
}

function createStories(feature: string, requestedCount: number): unknown {
  const count = Math.max(1, Math.min(requestedCount, 12));
  const baseStories = [
    'As a user, I can discover the feature entry point from the main workflow.',
    'As a user, I can complete the feature flow with clear success and error states.',
    'As an admin, I can monitor feature adoption and failures.',
    'As a PM, I can measure success metrics after release.',
    'As an engineer, I can observe logs/traces for debugging.',
  ];
  const stories = Array.from({ length: count }).map((_, index) => {
    const template = baseStories[index % baseStories.length];
    const points = [2, 3, 5, 8][index % 4];
    return {
      id: `story-${index + 1}`,
      title: `${feature} — Story ${index + 1}`,
      description: template,
      points,
      acceptance_criteria: [
        'Given prerequisite setup, when action is taken, then expected outcome is shown.',
        'Error states are recoverable and user-readable.',
        'Telemetry fields required for PM reporting are emitted.',
      ],
    };
  });

  return {
    feature,
    count,
    stories,
  };
}

function planSprint(velocity: number, priorities: string[]): unknown {
  const capacity = Math.max(1, velocity);
  const items = priorities.length > 0 ? priorities : ['stability-improvements', 'core-feature-delivery', 'quality-hardening'];
  const stories = items.map((item, index) => ({
    id: `plan-${index + 1}`,
    title: item,
    points: [2, 3, 5, 8][index % 4],
    priority: index + 1,
  }));
  const totalPoints = stories.reduce((sum, story) => sum + story.points, 0);

  return {
    sprint_goal: `Deliver ${items[0]} while preserving velocity and quality`,
    capacity,
    total_points: totalPoints,
    within_capacity: totalPoints <= capacity,
    stories,
    recommendations: totalPoints > capacity
      ? ['Reduce scope by dropping low-priority stories', 'Split large stories before sprint start']
      : ['Lock sprint scope and track execution daily'],
  };
}

function analyzeProduct(focus: string | undefined): unknown {
  const cfg = getConfig().get();
  const contextStats = getContextEngine().getStats();
  const modules = getModuleManager();
  const availableModules = modules.getAvailableModules();
  const activeFocus = focus || 'overall';

  return {
    focus: activeFocus,
    project: cfg.activeProject || null,
    context: {
      files_indexed: contextStats.totalFiles,
      health_score: contextStats.healthScore,
      projects: cfg.projects.length,
    },
    modules: {
      installed: cfg.installedModules,
      available_count: availableModules.length,
    },
    recommendations: [
      'Keep context health above 80 before major roadmap decisions.',
      'Run swarm analysis on high-impact product questions.',
      'Generate PRDs and stories before sprint planning to reduce ambiguity.',
    ],
  };
}

function invalidArgument(field: string, rule: string): Error {
  return new Error(`INVALID_ARGUMENT:${field}:${rule}`);
}

function parseError(error: unknown): ToolError {
  if (error instanceof Error) {
    if (error.message.startsWith('INVALID_ARGUMENT:')) {
      return { code: 'INVALID_ARGUMENT', message: error.message.replace(/^INVALID_ARGUMENT:/, '') };
    }
    return { code: 'TOOL_EXECUTION_ERROR', message: error.message };
  }
  return { code: 'TOOL_EXECUTION_ERROR', message: 'Unknown tool execution error' };
}

function bridgeTranslate(pmIntent: string, constraintsRaw?: unknown): {
  technical_tasks: string[];
  acceptance_criteria: string[];
  risks: string[];
  evidence: string[];
} {
  const lower = pmIntent.toLowerCase();
  const constraints =
    typeof constraintsRaw === 'string'
      ? constraintsRaw
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
      : [];

  const technicalTasks = [
    `Define implementation plan for "${pmIntent}"`,
    'Specify API/data model changes with backward-compatibility notes',
    'Implement deterministic business logic and error handling',
    'Add unit/integration coverage for affected command paths',
    'Update operational docs and runbook references',
  ];
  if (lower.includes('checkout') || lower.includes('payment')) {
    technicalTasks.push('Validate payment edge-cases and rollback criteria in staging');
  }
  if (lower.includes('auth') || lower.includes('login')) {
    technicalTasks.push('Verify auth/session boundaries and permission regression tests');
  }

  const acceptanceCriteria = [
    'Output is deterministic for identical input and context state',
    'Command-level JSON contract remains schema valid',
    'Observed errors include actionable remediation notes',
    'Release checks (build/test/installer/reality gate) pass',
  ];

  const risks = [
    'Scope drift if PM intent is not narrowed to a deliverable slice',
    'Dependency uncertainty if external service contracts change',
    'Regression risk without coverage in changed command paths',
  ];
  if (constraints.length > 0) {
    risks.push(`Constraint pressure: ${constraints.join(', ')}`);
  }

  return {
    technical_tasks: technicalTasks,
    acceptance_criteria: acceptanceCriteria,
    risks,
    evidence: [
      `constraints.count=${constraints.length}`,
      `intent.length=${pmIntent.length}`,
    ],
  };
}

function isToolRequest(payload: unknown): payload is ToolRequest {
  if (typeof payload !== 'object' || payload === null) return false;
  const record = payload as Record<string, unknown>;
  if (typeof record.tool !== 'string') return false;
  if (typeof record.request_id !== 'string') return false;
  if (typeof record.arguments !== 'object' || record.arguments === null) return false;
  return TOOL_DEFINITIONS.some(def => def.name === record.tool);
}

export class PhantomMCPServer {
  private mode: MCPMode;

  constructor(mode: MCPMode = 'standard') {
    this.mode = mode;
  }

  listTools(): ToolDefinition[] {
    return getToolsForMode(this.mode);
  }

  listResources(): ResourceDefinition[] {
    return RESOURCES;
  }

  readResource(uri: string): unknown {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    switch (uri) {
      case 'phantom://status/summary':
        return {
          version: cfg.version,
          first_run: cfg.firstRun,
          active_project: cfg.activeProject || null,
          installed_modules: cfg.installedModules.length,
          integrations: cfg.integrations.length,
          mcp: cfg.mcp,
        };
      case 'phantom://projects/summary':
        return {
          active_project: cfg.activeProject || null,
          projects: cfg.projects,
          context_stats: getContextEngine().getStats(),
        };
      case 'phantom://modules/summary': {
        const mm = getModuleManager();
        return {
          installed: cfg.installedModules,
          available: mm.getAvailableModules().map(mod => ({
            name: mod.name,
            version: mod.version,
            description: mod.description,
          })),
        };
      }
      case 'phantom://self/capabilities': {
        return {
          name: 'Phantom',
          description: 'The invisible force behind every great product. Open-source PM operating system for the terminal age.',
          version: cfg.version,
          tools: TOOL_DEFINITIONS.map(t => ({ name: t.name, description: t.description })),
          resources: RESOURCES.map(r => ({ uri: r.uri, title: r.title, description: r.description })),
          known_agents: AGENT_SIGNATURES.length,
          agent_types: ['ide', 'cli', 'assistant', 'plugin', 'llm'],
          features: [
            'Context engine — index project files for AI-powered analysis',
            'PRD generation — generate product requirement documents',
            'Swarm analysis — multi-agent consensus on product decisions',
            'Agent discovery — detect all AI tools on your system',
            'Auto-registration — inject MCP config into agent settings',
            'Product simulation — deterministic scenario modeling',
            'Integration management — GitHub, Figma, Linear, Slack, and more',
            'Sprint planning — velocity-based sprint capacity planning',
            'User stories — generate acceptance-criteria-rich stories',
            'PM-to-dev bridge — translate product intent into dev tasks',
          ],
        };
      }
      default:
        throw new Error(`RESOURCE_NOT_FOUND:${uri}`);
    }
  }

  async invoke(request: ToolRequest): Promise<ToolResponse> {
    try {
      switch (request.tool) {
        case 'context.add': {
          const path = parseStringArg(request.arguments, 'path');
          const stats = await getContextEngine().addPath(path);
          return ok(request.request_id, { stats });
        }
        case 'context.search': {
          const query = parseStringArg(request.arguments, 'query');
          const limit = parseNumberArg(request.arguments, 'limit', 20);
          const matches = await getContextEngine()
            .search(query)
            .then(results => results.slice(0, limit)
              .map((entry: any) => ({
                id: entry.id,
                path: entry.path,
                relative_path: entry.relativePath,
                type: entry.type,
                snippet: entry.content?.slice(0, 200) || '',
              })));
          return ok(request.request_id, { matches });
        }
        case 'prd.generate': {
          const title = parseStringArg(request.arguments, 'title');
          return ok(request.request_id, buildPrdResponse(title, request.arguments.output_path));
        }
        case 'phantom_generate_prd': {
          const featureName = parseOptionalStringArg(request.arguments, 'featureName');
          const title = featureName || parseStringArg(request.arguments, 'title');
          return ok(request.request_id, buildPrdResponse(title, request.arguments.output_path));
        }
        case 'swarm.analyze':
        case 'phantom_swarm_analyze': {
          const question = parseStringArg(request.arguments, 'question');
          const result = await getSwarm().runSwarm(question);
          return ok(request.request_id, { swarm_result: result, consensus: result.consensus });
        }
        case 'phantom_create_stories': {
          const feature = parseStringArg(request.arguments, 'feature');
          const count = parseNumberArg(request.arguments, 'count', 5);
          return ok(request.request_id, createStories(feature, count));
        }
        case 'phantom_plan_sprint': {
          const velocity = parseNumberArg(request.arguments, 'velocity', 20);
          const priorities = parseStringArrayArg(request.arguments, 'priorities');
          return ok(request.request_id, planSprint(velocity, priorities));
        }
        case 'phantom_analyze_product': {
          const focus = parseOptionalStringArg(request.arguments, 'focus');
          return ok(request.request_id, analyzeProduct(focus));
        }
        case 'bridge.translate_pm_to_dev': {
          const pmIntent = parseStringArg(request.arguments, 'pm_intent');
          const bridge = bridgeTranslate(pmIntent, request.arguments.product_constraints);
          return ok(request.request_id, bridge);
        }
        case 'phantom_discover_agents': {
          const discovery = new AgentDiscovery(process.cwd());
          const detected = await discovery.scanSystem();
          const agents = detected.map(agent => ({
            id: agent.signature.id,
            name: agent.signature.name,
            type: agent.signature.type,
            capabilities: agent.signature.capabilities,
            confidence: agent.confidence,
            status: agent.status,
            integration_level: agent.signature.integrationLevel,
            phantom_features: agent.signature.phantomFeatures,
          }));
          return ok(request.request_id, {
            total: agents.length,
            agents,
            all_known_signatures: AGENT_SIGNATURES.length,
          });
        }
        case 'phantom_register_self': {
          const target = parseOptionalStringArg(request.arguments, 'target');
          const cwd = process.cwd();
          if (target) {
            const result = registerWithSpecificAgent(cwd, target);
            return ok(request.request_id, result);
          }
          const summary = await registerWithAllDetected(cwd);
          return ok(request.request_id, summary);
        }
        case 'phantom_simulate': {
          const scenario = parseStringArg(request.arguments, 'scenario');
          const result = runDeterministicSimulation(scenario);
          return ok(request.request_id, result);
        }
        case 'phantom_browser_goto': {
          const url = parseStringArg(request.arguments, 'url');
          const agent = await getBrowserAgent();
          await agent.goto(url);
          return ok(request.request_id, { status: 'Navigated successfully', url });
        }
        case 'phantom_browser_screenshot': {
          const agent = await getBrowserAgent();
          const isFullPage = !!request.arguments.full_page;
          const screenshot = await agent.getScreenshot(isFullPage);
          return ok(request.request_id, {
            image: screenshot.toString('base64'),
            type: 'image/png'
          });
        }
        case 'phantom_browser_dom': {
          const agent = await getBrowserAgent();
          const dom = await agent.getDOMTree();
          return ok(request.request_id, { dom });
        }
        case 'phantom_browser_inject_css': {
          const css = parseStringArg(request.arguments, 'css');
          const agent = await getBrowserAgent();
          await agent.injectCSS(css);
          return ok(request.request_id, { status: 'CSS Inject success' });
        }
        case 'phantom_opencode_terminal': {
          const command = parseStringArg(request.arguments, 'command');
          const execCwd = parseOptionalStringArg(request.arguments, 'cwd') || process.cwd();
          try {
            const output = execSync(command, { cwd: execCwd, encoding: 'utf-8', stdio: 'pipe' });
            return ok(request.request_id, { output });
          } catch (error: any) {
            return ok(request.request_id, { error: error.message, stdout: error.stdout?.toString(), stderr: error.stderr?.toString() });
          }
        }
        case 'phantom_opencode_file_manage': {
          const action = parseStringArg(request.arguments, 'action');
          const targetPath = resolve(process.cwd(), parseStringArg(request.arguments, 'path'));
          if (action === 'read') {
            try {
              const content = readFileSync(targetPath, 'utf-8');
              return ok(request.request_id, { content });
            } catch (e: any) {
              return err(request.request_id, [{ code: 'RESOURCE_NOT_FOUND', message: e.message }]);
            }
          } else if (action === 'write') {
            const content = parseStringArg(request.arguments, 'content');
            mkdirSync(dirname(targetPath), { recursive: true });
            writeFileSync(targetPath, content, 'utf-8');
            return ok(request.request_id, { status: 'File written successfully' });
          } else {
            return err(request.request_id, [{ code: 'INVALID_ARGUMENT', message: 'action must be read or write' }]);
          }
        }
        case 'phantom_opencode_ls': {
          const rawPath = parseStringArg(request.arguments, 'path');
          const targetPath = resolve(process.cwd(), rawPath);
          try {
            const files = readdirSync(targetPath);
            return ok(request.request_id, { files });
          } catch (e: any) {
            return err(request.request_id, [{ code: 'RESOURCE_NOT_FOUND', message: e.message }]);
          }
        }
        default:
          return err(request.request_id, [{ code: 'INVALID_TOOL', message: `Unknown tool: ${request.tool}` }]);
      }
    } catch (error) {
      return err(request.request_id, [parseError(error)]);
    }
  }
}

function ok(requestId: string, result: unknown): ToolResponse {
  return {
    request_id: requestId,
    status: 'ok',
    result,
  };
}

function err(requestId: string, errors: ToolError[]): ToolResponse {
  return {
    request_id: requestId,
    status: 'error',
    errors,
  };
}

function parseJsonLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

type JsonRpcId = string | number;

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  id?: JsonRpcId | null;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: JsonRpcId | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

function toRequestId(value: JsonRpcId | null | undefined): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return 'unknown';
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(item => redactSecrets(item));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => {
      if (/(token|secret|api.?key|password|authorization)/i.test(key)) {
        return [key, '[REDACTED]'];
      }
      return [key, redactSecrets(val)];
    });
    return Object.fromEntries(entries);
  }
  return value;
}

function isDebugEnabled(): boolean {
  return process.env.PHANTOM_MCP_DEBUG === '1';
}

function debugLog(direction: 'in' | 'out', payload: unknown): void {
  if (!isDebugEnabled()) return;
  const serialized = JSON.stringify(redactSecrets(payload));
  process.stderr.write(`[phantom-mcp][${direction}] ${serialized}\n`);
}

function jsonRpcOk(id: JsonRpcId | null, result: unknown): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

function jsonRpcErr(id: JsonRpcId | null, code: number, message: string, data?: unknown): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {}),
    },
  };
}

function isJsonRpcRequest(payload: unknown): payload is JsonRpcRequest {
  if (!payload || typeof payload !== 'object') return false;
  const record = payload as Record<string, unknown>;
  return record.jsonrpc === '2.0' && typeof record.method === 'string';
}

function normalizeToolSchema(definition: ToolDefinition): {
  name: string;
  description: string;
  inputSchema: ToolDefinition['input_schema'];
} {
  return {
    name: definition.name,
    description: definition.description,
    inputSchema: definition.input_schema,
  };
}

function normalizeResourceSchema(resource: ResourceDefinition): {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
} {
  return {
    uri: resource.uri,
    name: resource.title,
    description: resource.description,
    mimeType: 'application/json',
  };
}

async function handleJsonRpcRequest(server: PhantomMCPServer, request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const id = (request.id ?? null) as JsonRpcId | null;
  const method = request.method;
  const params = request.params;

  if (id === null) {
    if (method === 'notifications/initialized') {
      return null;
    }
  }

  if (method === 'initialize') {
    return jsonRpcOk(id, {
      protocolVersion: '2025-06-18',
      capabilities: {
        tools: {},
        resources: {},
      },
      serverInfo: {
        name: 'phantom-mcp',
        version: '1.0.1',
      },
    });
  }

  if (method === 'ping') {
    return jsonRpcOk(id, {});
  }

  if (method === 'tools/list') {
    return jsonRpcOk(id, {
      tools: server.listTools().map(normalizeToolSchema),
    });
  }

  if (method === 'tools/call') {
    if (!params || typeof params !== 'object') {
      return jsonRpcErr(id, -32602, 'Invalid params: expected object');
    }
    const record = params as Record<string, unknown>;
    const name = record.name;
    const args = record.arguments;

    if (typeof name !== 'string' || !name.trim()) {
      return jsonRpcErr(id, -32602, 'Invalid params: name must be non-empty string');
    }
    if (args !== undefined && (!args || typeof args !== 'object' || Array.isArray(args))) {
      return jsonRpcErr(id, -32602, 'Invalid params: arguments must be object');
    }

    const toolResponse = await server.invoke({
      tool: name as PhantomToolName,
      request_id: toRequestId(id),
      arguments: (args as Record<string, unknown>) || {},
    });

    if (toolResponse.status === 'error') {
      return jsonRpcOk(id, {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({ errors: toolResponse.errors ?? [] }),
          },
        ],
        structuredContent: {
          errors: toolResponse.errors ?? [],
        },
      });
    }

    return jsonRpcOk(id, {
      isError: false,
      content: [
        {
          type: 'text',
          text: JSON.stringify(toolResponse.result ?? {}),
        },
      ],
      structuredContent: toolResponse.result ?? {},
    });
  }

  if (method === 'resources/list') {
    return jsonRpcOk(id, {
      resources: server.listResources().map(normalizeResourceSchema),
    });
  }

  if (method === 'resources/read') {
    if (!params || typeof params !== 'object') {
      return jsonRpcErr(id, -32602, 'Invalid params: expected object');
    }

    const record = params as Record<string, unknown>;
    const uri = record.uri;
    if (typeof uri !== 'string' || !uri.trim()) {
      return jsonRpcErr(id, -32602, 'Invalid params: uri must be non-empty string');
    }

    try {
      const value = server.readResource(uri);
      return jsonRpcOk(id, {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(value),
          },
        ],
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('RESOURCE_NOT_FOUND:')) {
        return jsonRpcErr(id, -32001, 'Resource not found', {
          uri: error.message.replace(/^RESOURCE_NOT_FOUND:/, ''),
        });
      }
      return jsonRpcErr(id, -32603, 'Failed to read resource', parseError(error));
    }
  }

  return jsonRpcErr(id, -32601, `Method not found: ${method}`);
}

export async function runLegacyJsonlServer(toolMode: MCPMode = 'standard'): Promise<void> {
  const server = new PhantomMCPServer(toolMode);
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const payload = parseJsonLine(trimmed);
    if (!payload || typeof payload !== 'object') {
      process.stdout.write(`${JSON.stringify(err('unknown', [{ code: 'INVALID_REQUEST', message: 'Invalid JSON payload' }]))}\n`);
      continue;
    }

    const record = payload as Record<string, unknown>;
    const action = record.action;
    const requestId = typeof record.request_id === 'string' ? record.request_id : 'unknown';

    if (action === 'tools.list') {
      process.stdout.write(`${JSON.stringify(ok(requestId, { tools: server.listTools() }))}\n`);
      continue;
    }
    if (action === 'resources.list') {
      process.stdout.write(`${JSON.stringify(ok(requestId, { resources: server.listResources() }))}\n`);
      continue;
    }
    if (action === 'resources.read') {
      if (typeof record.uri !== 'string' || record.uri.length === 0) {
        process.stdout.write(
          `${JSON.stringify(err(requestId, [{ code: 'INVALID_ARGUMENT', message: 'uri:must be a non-empty string' }]))}\n`
        );
        continue;
      }
      try {
        const value = server.readResource(record.uri);
        process.stdout.write(`${JSON.stringify(ok(requestId, { uri: record.uri, value }))}\n`);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('RESOURCE_NOT_FOUND:')) {
          process.stdout.write(
            `${JSON.stringify(err(requestId, [{ code: 'RESOURCE_NOT_FOUND', message: error.message.replace(/^RESOURCE_NOT_FOUND:/, '') }]))}\n`
          );
        } else {
          process.stdout.write(`${JSON.stringify(err(requestId, [parseError(error)]))}\n`);
        }
      }
      continue;
    }

    if (isToolRequest(payload)) {
      const response = await server.invoke(payload);
      process.stdout.write(`${JSON.stringify(response)}\n`);
      continue;
    }

    process.stdout.write(
      `${JSON.stringify(
        err(requestId, [{ code: 'INVALID_REQUEST', message: 'Payload must be a valid tool request or supported action' }])
      )}\n`
    );
  }
}

export async function runStdioServer(transportMode: 'stdio' | 'legacy-jsonl' = 'stdio', toolMode: MCPMode = 'standard'): Promise<void> {
  if (transportMode === 'legacy-jsonl') {
    await runLegacyJsonlServer(toolMode);
    return;
  }

  const server = new PhantomMCPServer(toolMode);
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const payload = parseJsonLine(trimmed);

    if (!isJsonRpcRequest(payload)) {
      const response = jsonRpcErr(null, -32600, 'Invalid Request');
      debugLog('out', response);
      process.stdout.write(`${JSON.stringify(response)}\n`);
      continue;
    }

    debugLog('in', payload);
    const response = await handleJsonRpcRequest(server, payload);
    if (!response || payload.id === undefined || payload.id === null) {
      continue;
    }

    debugLog('out', response);
    process.stdout.write(`${JSON.stringify(response)}\n`);
  }
}

export { PhantomDiscovery } from './discovery.js';
export { AutonomousWorkflow, AgentMessaging } from './workflows.js';
