// ╔══════════════════════════════════════════════════════════════════╗
// ║  PHANTOM MODULE SYSTEM — "I know kung fu."                       ║
// ║                                                                  ║
// ║  Each module is an installable PM superpower. 23 built-in,       ║
// ║  infinite possible. Every module follows the same contract:      ║
// ║  take a command + args → return a ModuleResult.                  ║
// ║                                                                  ║
// ║  The ModuleManager loads, validates, and executes modules.       ║
// ║  Runtime modules are lazy-loaded from @phantom-pm/modules.       ║
// ╚══════════════════════════════════════════════════════════════════╝

import { MODULE_QUOTES } from './constants.js';
import { getConfig } from './config.js';

// Import types for story-writer module
interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'high' | 'medium' | 'low';
  storyPoints: number;
  epic?: string;
  labels: string[];
  dependencies?: string[];
  technicalNotes?: string;
}

interface StorySprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  stories: UserStory[];
  capacity: number;
  velocity?: number;
}

export interface ModuleManifest {
  name: string;
  version: string;
  description: string;
  quote: string;
  author: string;
  commands: ModuleCommand[];
  dependencies: string[];
  size: string;
}

export interface ModuleCommand {
  name: string;
  description: string;
  usage: string;
  args?: CommandArg[];
}

export interface CommandArg {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
}

export interface ModuleRuntime {
  name: string;
  version: string;
  execute(command: string, args: Record<string, unknown>): Promise<ModuleResult>;
  close(): Promise<void>;
}

export interface ModuleResult {
  success: boolean;
  [key: string]: any;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export type ModuleCommandHandler = (args: Record<string, unknown>) => Promise<ModuleResult>;

export interface Module {
  name: string;
  version: string;
  execute(command: string, args: Record<string, unknown>): Promise<ModuleResult>;
  getCommands(): ModuleCommand[];
  validateConfig(): boolean;
}

export class ModuleLoadError extends Error {
  constructor(moduleName: string, message: string) {
    super(`Failed to load module '${moduleName}': ${message}`);
    this.name = 'ModuleLoadError';
  }
}

// Explicit interface for @phantom-pm/modules to avoid compile-time dependency.
// Core is built BEFORE modules in the workspace build order, so we can't use
// `typeof import('@phantom-pm/modules')` here — it would fail on fresh checkouts/CI.
// The actual package is loaded dynamically at runtime via `import('@phantom-pm/modules')`.
interface ModulesPackageAPI {
  runPRDForge(args: Record<string, unknown>): Promise<ModuleResult>;
  StoryWriterModule: new () => {
    generateStoriesFromFeature(feature: string, count: number): Promise<UserStory[]>;
    generateStoriesFromPRD(prdPath: string, sprintCount: number): Promise<StorySprint[]>;
    saveStoriesToFile(stories: UserStory[], output: string): Promise<void>;
  };
  runSprintPlanner(args: Record<string, unknown>): Promise<ModuleResult>;
  runCompetitive(args: Record<string, unknown>): Promise<ModuleResult>;
  runAnalyticsLens(args: Record<string, unknown>): Promise<ModuleResult>;
  runOracle(args: Record<string, unknown>): Promise<ModuleResult>;
  runExperimentLab(args: Record<string, unknown>): Promise<ModuleResult>;
  runUXAuditor(args: Record<string, unknown>): Promise<ModuleResult>;
  runTimeMachine(args: Record<string, unknown>): Promise<ModuleResult>;
  runFigmaBridge(args: Record<string, unknown>): Promise<ModuleResult>;
  runBridge(args: Record<string, unknown>): Promise<ModuleResult>;
  runSwarm(args: Record<string, unknown>): Promise<ModuleResult>;
  [key: string]: unknown;
}

type ModulesPackage = ModulesPackageAPI;

// Built-in module registry
export const BUILTIN_MODULES: ModuleManifest[] = [
  {
    name: 'prd-forge',
    version: '2.1.0',
    description: 'Generate comprehensive Product Requirements Documents from natural language',
    quote: MODULE_QUOTES['prd-forge'] || 'I know PRDs.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'prd create',
        description: 'Generate a new PRD',
        usage: 'phantom prd create "Feature Name"',
        args: [{ name: 'title', description: 'Feature title', required: true, type: 'string' }],
      },
      {
        name: 'prd list',
        description: 'List all PRDs',
        usage: 'phantom prd list',
      },
      {
        name: 'prd update',
        description: 'Update an existing PRD',
        usage: 'phantom prd update <id>',
        args: [{ name: 'id', description: 'PRD identifier', required: true, type: 'string' }],
      },
      {
        name: 'prd export',
        description: 'Export PRD to PDF/Markdown',
        usage: 'phantom prd export <id> --format pdf',
        args: [{ name: 'id', description: 'PRD identifier', required: true, type: 'string' }],
      },
    ],
    dependencies: [],
    size: '2.4 MB',
  },
  {
    name: 'story-writer',
    version: '1.8.0',
    description: 'Auto-generate user stories with acceptance criteria from PRDs or natural language',
    quote: MODULE_QUOTES['story-writer'] || 'I know user stories.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'story create',
        description: 'Generate user stories from a description',
        usage: 'phantom story create "Feature Description"',
        args: [{ name: 'description', description: 'Feature description', required: true, type: 'string' }],
      },
      {
        name: 'story from-prd',
        description: 'Generate stories from a PRD',
        usage: 'phantom story from-prd <prd-id>',
        args: [{ name: 'prd-id', description: 'PRD to extract stories from', required: true, type: 'string' }],
      },
    ],
    dependencies: [],
    size: '1.8 MB',
  },
  {
    name: 'sprint-planner',
    version: '1.5.0',
    description: 'AI-powered sprint planning with velocity tracking and capacity management',
    quote: MODULE_QUOTES['sprint-planner'] || 'I know velocity.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'sprint plan',
        description: 'Plan the next sprint',
        usage: 'phantom sprint plan',
      },
      {
        name: 'sprint status',
        description: 'Show current sprint status',
        usage: 'phantom sprint status',
      },
      {
        name: 'sprint retro',
        description: 'Generate retrospective',
        usage: 'phantom sprint retro',
      },
    ],
    dependencies: [],
    size: '1.2 MB',
  },
  {
    name: 'competitive',
    version: '2.0.0',
    description: 'Monitor competitors, analyze market positioning, and track feature parity',
    quote: MODULE_QUOTES['competitive'] || 'I know your enemies.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'competitive analyze',
        description: 'Run competitive analysis',
        usage: 'phantom competitive analyze <competitor>',
        args: [{ name: 'competitor', description: 'Competitor name or URL', required: true, type: 'string' }],
      },
      {
        name: 'competitive watch',
        description: 'Monitor competitor changes',
        usage: 'phantom competitive watch <competitor>',
      },
    ],
    dependencies: [],
    size: '3.1 MB',
  },
  {
    name: 'analytics-lens',
    version: '1.0.0',
    description: 'Connect to analytics platforms and surface actionable product insights',
    quote: MODULE_QUOTES['analytics-lens'] || 'I know the numbers.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'analytics dashboard',
        description: 'Show analytics dashboard',
        usage: 'phantom analytics dashboard',
      },
      {
        name: 'analytics report',
        description: 'Generate analytics report',
        usage: 'phantom analytics report --period 30d',
      },
    ],
    dependencies: [],
    size: '2.7 MB',
  },
  {
    name: 'oracle',
    version: '1.0.0',
    description: 'Predictive intelligence — feature success prediction, Monte Carlo simulations, forecasting',
    quote: MODULE_QUOTES['oracle'] || 'I know the future.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'oracle predict',
        description: 'Predict feature success',
        usage: 'phantom oracle predict "Feature Name"',
      },
      {
        name: 'oracle simulate',
        description: 'Run Monte Carlo simulation',
        usage: 'phantom oracle simulate "Scenario"',
      },
      {
        name: 'oracle forecast',
        description: 'Revenue/adoption forecast',
        usage: 'phantom oracle forecast --metric revenue --period 6m',
      },
      {
        name: 'oracle risk',
        description: 'Risk identification',
        usage: 'phantom oracle risk',
      },
    ],
    dependencies: [],
    size: '4.2 MB',
  },
  {
    name: 'figma-bridge',
    version: '1.2.0',
    description: 'Connect Figma designs to PRDs, user stories, and development tasks',
    quote: MODULE_QUOTES['figma-bridge'] || 'I know design.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'figma sync',
        description: 'Sync Figma designs',
        usage: 'phantom figma sync <file-key>',
      },
      {
        name: 'figma analyze',
        description: 'Analyze Figma design for UX issues',
        usage: 'phantom figma analyze <file-key>',
      },
    ],
    dependencies: [],
    size: '2.9 MB',
  },
  {
    name: 'experiment-lab',
    version: '1.0.0',
    description: 'Design and analyze A/B tests, feature experiments, and rollout strategies',
    quote: MODULE_QUOTES['experiment-lab'] || 'I know the truth.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'experiment design',
        description: 'Design an experiment',
        usage: 'phantom experiment design "Hypothesis"',
      },
      {
        name: 'experiment analyze',
        description: 'Analyze experiment results',
        usage: 'phantom experiment analyze <id>',
      },
    ],
    dependencies: [],
    size: '2.1 MB',
  },
  {
    name: 'ux-auditor',
    version: '1.0.0',
    description: 'Automated UX audits from screenshots with WCAG compliance checking',
    quote: MODULE_QUOTES['ux-auditor'] || 'I know the user.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'ux audit',
        description: 'Run UX audit on screenshots',
        usage: 'phantom ux audit ./screenshots/',
      },
      {
        name: 'ux score',
        description: 'Get UX score for a screen',
        usage: 'phantom ux score ./screenshot.png',
      },
    ],
    dependencies: [],
    size: '3.5 MB',
  },
  {
    name: 'time-machine',
    version: '1.0.0',
    description: 'Version and compare product decisions over time, what-if analysis',
    quote: MODULE_QUOTES['time-machine'] || 'I know the past.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'timemachine snapshot',
        description: 'Create a product snapshot',
        usage: 'phantom timemachine snapshot',
      },
      {
        name: 'timemachine compare',
        description: 'Compare two snapshots',
        usage: 'phantom timemachine compare <id1> <id2>',
      },
    ],
    dependencies: [],
    size: '1.6 MB',
  },
  {
    name: 'bridge',
    version: '1.0.0',
    description: 'Bidirectional PM ↔ Dev translation engine',
    quote: MODULE_QUOTES['bridge'] || 'I know both worlds.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'bridge translate',
        description: 'Translate PM-speak to Dev-speak or vice versa',
        usage: 'phantom bridge translate "Business requirement text"',
      },
      {
        name: 'bridge spec',
        description: 'Generate technical spec from PRD',
        usage: 'phantom bridge spec <prd-id>',
      },
    ],
    dependencies: [],
    size: '1.9 MB',
  },
  {
    name: 'swarm',
    version: '1.0.0',
    description: 'Deploy 7 specialized PM agents to analyze any product question in parallel',
    quote: MODULE_QUOTES['swarm'] || 'We know everything.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'swarm analyze',
        description: 'Run swarm analysis on a question',
        usage: 'phantom swarm "Should we add feature X?"',
      },
      {
        name: 'swarm config',
        description: 'Configure agent parameters',
        usage: 'phantom swarm config',
      },
    ],
    dependencies: [],
    size: '5.1 MB',
  },
  // ─── BETA SUPERPOWERS ───────────────────────────────────────────
  // "What if I told you... these modules change everything?"
  {
    name: 'autopilot',
    version: '0.1.0-beta',
    description: 'Autonomous task execution — breaks goals into steps and executes them without babysitting',
    quote: MODULE_QUOTES['autopilot'] || 'I do not need your permission.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'autopilot run',
        description: 'Execute a product goal autonomously',
        usage: 'phantom autopilot run "Launch dark mode"',
        args: [{ name: 'goal', description: 'Product goal to achieve', required: true, type: 'string' }],
      },
      {
        name: 'autopilot plan',
        description: 'Generate execution plan without running',
        usage: 'phantom autopilot plan "Improve onboarding flow"',
        args: [{ name: 'goal', description: 'Goal to plan for', required: true, type: 'string' }],
      },
      {
        name: 'autopilot status',
        description: 'Check status of running autopilot tasks',
        usage: 'phantom autopilot status',
      },
    ],
    dependencies: [],
    size: '3.8 MB',
  },
  {
    name: 'mind-map',
    version: '0.1.0-beta',
    description: 'Visual product thinking — generate interactive concept maps from ideas, PRDs, or conversations',
    quote: MODULE_QUOTES['mind-map'] || 'I see the connections you cannot.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'mindmap create',
        description: 'Generate a mind map from a topic',
        usage: 'phantom mindmap create "Mobile App Strategy"',
        args: [{ name: 'topic', description: 'Central topic', required: true, type: 'string' }],
      },
      {
        name: 'mindmap from-prd',
        description: 'Generate mind map from an existing PRD',
        usage: 'phantom mindmap from-prd <prd-id>',
        args: [{ name: 'prd-id', description: 'PRD to visualize', required: true, type: 'string' }],
      },
      {
        name: 'mindmap export',
        description: 'Export mind map to Markdown or Mermaid',
        usage: 'phantom mindmap export <id> --format mermaid',
      },
    ],
    dependencies: [],
    size: '2.5 MB',
  },
  {
    name: 'scope-guard',
    version: '0.1.0-beta',
    description: 'Scope creep detection — analyzes PRDs and backlogs for feature bloat, complexity drift, and gold plating',
    quote: MODULE_QUOTES['scope-guard'] || 'Your scope is showing.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'scope analyze',
        description: 'Analyze a PRD or backlog for scope creep',
        usage: 'phantom scope analyze <prd-id>',
        args: [{ name: 'target', description: 'PRD or backlog to analyze', required: true, type: 'string' }],
      },
      {
        name: 'scope compare',
        description: 'Compare two versions of a PRD for scope drift',
        usage: 'phantom scope compare <prd-v1> <prd-v2>',
      },
      {
        name: 'scope guard',
        description: 'Enable real-time scope monitoring on a project',
        usage: 'phantom scope guard --watch',
      },
    ],
    dependencies: [],
    size: '2.2 MB',
  },
  {
    name: 'retro-ai',
    version: '0.1.0-beta',
    description: 'AI-powered retrospectives — learns from sprint data to generate insights no human would catch',
    quote: MODULE_QUOTES['retro-ai'] || 'Those who cannot remember the past are condemned to repeat it.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'retro generate',
        description: 'Generate AI retrospective from sprint data',
        usage: 'phantom retro generate',
      },
      {
        name: 'retro trends',
        description: 'Analyze retrospective trends across sprints',
        usage: 'phantom retro trends --sprints 5',
      },
      {
        name: 'retro action-items',
        description: 'Extract and prioritize action items',
        usage: 'phantom retro action-items',
      },
    ],
    dependencies: [],
    size: '2.8 MB',
  },
  {
    name: 'stakeholder-sim',
    version: '0.1.0-beta',
    description: 'Simulate stakeholder reactions before you present — predict objections, questions, and approval paths',
    quote: MODULE_QUOTES['stakeholder-sim'] || 'I know what they will say before they say it.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'stakeholder simulate',
        description: 'Simulate a stakeholder review session',
        usage: 'phantom stakeholder simulate <prd-id>',
        args: [{ name: 'prd-id', description: 'PRD to present', required: true, type: 'string' }],
      },
      {
        name: 'stakeholder personas',
        description: 'Configure stakeholder personas',
        usage: 'phantom stakeholder personas --add "VP Engineering"',
      },
      {
        name: 'stakeholder brief',
        description: 'Generate a stakeholder-ready briefing',
        usage: 'phantom stakeholder brief <prd-id>',
      },
    ],
    dependencies: [],
    size: '3.2 MB',
  },

  // ─── CONSULTING SUPERPOWERS ──────────────────────────────────────
  // "What would McKinsey do? Now you can find out."

  {
    name: 'mece-lens',
    version: '0.1.0-beta',
    description: 'MECE validation — ensures your feature sets, problem breakdowns, and strategies are mutually exclusive & collectively exhaustive',
    quote: MODULE_QUOTES['mece-lens'] || 'I know the gaps.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'mece analyze',
        description: 'Validate a feature set or problem breakdown for MECE compliance',
        usage: 'phantom mece analyze "User authentication features"',
        args: [{ name: 'topic', description: 'Feature set or problem to validate', required: true, type: 'string' }],
      },
      {
        name: 'mece decompose',
        description: 'Break a problem into MECE categories',
        usage: 'phantom mece decompose "Revenue growth strategy"',
        args: [{ name: 'problem', description: 'Problem to decompose', required: true, type: 'string' }],
      },
      {
        name: 'mece gaps',
        description: 'Identify missing categories in a breakdown',
        usage: 'phantom mece gaps --input roadmap.md',
      },
    ],
    dependencies: [],
    size: '2.1 MB',
  },
  {
    name: 'issue-tree',
    version: '0.1.0-beta',
    description: 'Hypothesis-driven problem solving — decomposes complex problems into testable issue trees with structured hypotheses',
    quote: MODULE_QUOTES['issue-tree'] || 'I know the root cause.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'issue-tree build',
        description: 'Generate an issue tree from a problem statement',
        usage: 'phantom issue-tree build "Why is user retention dropping?"',
        args: [{ name: 'problem', description: 'Problem statement to decompose', required: true, type: 'string' }],
      },
      {
        name: 'issue-tree hypotheses',
        description: 'Generate testable hypotheses from an issue tree',
        usage: 'phantom issue-tree hypotheses --tree issue-tree.json',
      },
      {
        name: 'issue-tree prioritize',
        description: 'Rank hypotheses by impact and testability',
        usage: 'phantom issue-tree prioritize --tree issue-tree.json',
      },
    ],
    dependencies: [],
    size: '2.4 MB',
  },
  {
    name: 'bcg-matrix',
    version: '0.1.0-beta',
    description: 'BCG Growth-Share Matrix — classifies features/products into Stars, Cash Cows, Question Marks, and Dogs',
    quote: MODULE_QUOTES['bcg-matrix'] || 'I know your portfolio.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'bcg analyze',
        description: 'Run BCG matrix analysis on a feature portfolio',
        usage: 'phantom bcg analyze --features features.json',
      },
      {
        name: 'bcg classify',
        description: 'Classify a single feature into a BCG quadrant',
        usage: 'phantom bcg classify "Dark mode" --growth high --share low',
        args: [
          { name: 'feature', description: 'Feature name to classify', required: true, type: 'string' },
          { name: 'growth', description: 'Market growth rate (high/low)', required: true, type: 'string' },
          { name: 'share', description: 'Market share (high/low)', required: true, type: 'string' },
        ],
      },
      {
        name: 'bcg recommend',
        description: 'Generate investment recommendations based on BCG analysis',
        usage: 'phantom bcg recommend --portfolio analysis.json',
      },
    ],
    dependencies: [],
    size: '2.6 MB',
  },
  {
    name: 'deck-forge',
    version: '0.1.0-beta',
    description: 'Pyramid Principle presentations — generates structured slide outlines using situation→complication→resolution flow',
    quote: MODULE_QUOTES['deck-forge'] || 'I know the pyramid.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'deck create',
        description: 'Generate a structured presentation outline from a topic',
        usage: 'phantom deck create "Q4 Product Strategy Review"',
        args: [{ name: 'topic', description: 'Presentation topic', required: true, type: 'string' }],
      },
      {
        name: 'deck from-prd',
        description: 'Generate a stakeholder deck from an existing PRD',
        usage: 'phantom deck from-prd --input prd.md --audience executives',
        args: [{ name: 'audience', description: 'Target audience (executives/engineering/board)', required: false, type: 'string' }],
      },
      {
        name: 'deck outline',
        description: 'Generate a SCR (Situation-Complication-Resolution) outline',
        usage: 'phantom deck outline "We need to pivot our pricing strategy"',
        args: [{ name: 'thesis', description: 'Core thesis or message', required: true, type: 'string' }],
      },
    ],
    dependencies: [],
    size: '3.0 MB',
  },
  {
    name: 'exec-brief',
    version: '0.1.0-beta',
    description: 'Executive one-pager generator — creates C-suite ready briefs from PRDs, data, and analysis',
    quote: MODULE_QUOTES['exec-brief'] || 'I know what the C-suite needs.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'brief generate',
        description: 'Generate a one-page executive brief',
        usage: 'phantom brief generate --input prd.md --format ceo',
        args: [{ name: 'format', description: 'Brief format (ceo/board/investor/team)', required: false, type: 'string' }],
      },
      {
        name: 'brief summarize',
        description: 'Condense any document into a 5-bullet executive summary',
        usage: 'phantom brief summarize --input analysis.md',
      },
      {
        name: 'brief kpis',
        description: 'Extract and format KPIs for executive reporting',
        usage: 'phantom brief kpis --input metrics.json --period Q4',
      },
    ],
    dependencies: [],
    size: '2.3 MB',
  },
  {
    name: 'porter-scan',
    version: '0.1.0-beta',
    description: 'Porter\'s Five Forces analysis — evaluates competitive landscape, supplier power, buyer power, substitutes, and new entrants',
    quote: MODULE_QUOTES['porter-scan'] || 'I know the five forces.',
    author: 'PhantomPM',
    commands: [
      {
        name: 'porter analyze',
        description: 'Run a full Five Forces competitive analysis',
        usage: 'phantom porter analyze "Project management SaaS market"',
        args: [{ name: 'market', description: 'Market or industry to analyze', required: true, type: 'string' }],
      },
      {
        name: 'porter threats',
        description: 'Assess threat level from new entrants and substitutes',
        usage: 'phantom porter threats --market "AI coding tools"',
        args: [{ name: 'market', description: 'Market to assess', required: true, type: 'string' }],
      },
      {
        name: 'porter moat',
        description: 'Evaluate your competitive moat strength',
        usage: 'phantom porter moat --product "Phantom PM"',
        args: [{ name: 'product', description: 'Product to evaluate', required: true, type: 'string' }],
      },
    ],
    dependencies: [],
    size: '2.5 MB',
  },
];

type ModuleName = (typeof BUILTIN_MODULES)[number]['name'];

interface ModuleExecutionContext {
  modulesPkg: ModulesPackage;
  command: string;
  args: Record<string, unknown>;
}

interface RuntimeDefinition {
  name: ModuleName;
  version: string;
  aliases?: Record<string, string>;
  handler: (ctx: ModuleExecutionContext) => Promise<ModuleResult>;
}

const MODULE_OUTPUT_ROOT = './.phantom/output';

function normalizeModuleName(name: string): string {
  const withoutScope = name
    .replace(/^@phantom-pm\//, '')
    .replace(/^@phantom\//, '');

  const aliases: Record<string, string> = {
    timemachine: 'time-machine',
    ux: 'ux-auditor',
    figma: 'figma-bridge',
    experiment: 'experiment-lab',
  };

  return aliases[withoutScope] || withoutScope;
}

function normalizeCommandName(commandName: string): string {
  return commandName.trim().replace(/\s+/g, ' ').toLowerCase();
}

function positional(args: Record<string, unknown>, index: number): string | undefined {
  const values = args._;
  if (!Array.isArray(values)) return undefined;
  const value = values[index];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function argString(args: Record<string, unknown>, key: string, fallbackIndex?: number): string | undefined {
  const value = args[key];
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof fallbackIndex === 'number') return positional(args, fallbackIndex);
  return undefined;
}

function argNumber(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = args[key];
  if (typeof value === 'number' && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function unsupportedCommand(moduleName: string, command: string, allowed: string[]): never {
  throw new Error(
    `Command not implemented for ${moduleName}: ${command}. Supported: ${allowed.join(', ')}`
  );
}

const MODULE_RUNTIME_DEFINITIONS: Record<ModuleName, RuntimeDefinition> = {
  'prd-forge': {
    name: 'prd-forge',
    version: '2.1.0',
    aliases: {
      'create': 'prd create',
      'prd create': 'prd create',
    },
    handler: async ({ modulesPkg, command, args }) => {
      if (command !== 'prd create') {
        unsupportedCommand('prd-forge', command, ['prd create']);
      }
      const output = argString(args, 'output') || `${MODULE_OUTPUT_ROOT}/prds`;
      return modulesPkg.runPRDForge({ ...args, output }) as Promise<ModuleResult>;
    },
  },
  'story-writer': {
    name: 'story-writer',
    version: '1.8.0',
    aliases: {
      'story create': 'story create',
      'stories generate': 'story create',
      'story from-prd': 'story from-prd',
      'stories from-prd': 'story from-prd',
    },
    handler: async ({ modulesPkg, command, args }) => {
      const writer = new modulesPkg.StoryWriterModule();

      if (command === 'story create') {
        const feature = argString(args, 'feature', 1) || argString(args, 'description', 1) || 'Untitled feature';
        const count = Math.max(1, argNumber(args, 'count', 5));
        const output = argString(args, 'output') || `${MODULE_OUTPUT_ROOT}/stories`;
        const stories = await writer.generateStoriesFromFeature(feature, count);
        await writer.saveStoriesToFile(stories, output);
        return {
          success: true,
          stories,
          totalPoints: stories.reduce((sum: number, story: UserStory) => sum + story.storyPoints, 0),
          filePath: output,
        };
      }

      if (command === 'story from-prd') {
        const prdPath = argString(args, 'prdPath', 1) || '';
        const sprintCount = Math.max(1, argNumber(args, 'sprintCount', 2));
        const sprints = await writer.generateStoriesFromPRD(prdPath, sprintCount);
        const totalStories = sprints.reduce((sum: number, sprint: StorySprint) => sum + sprint.stories.length, 0);
        const totalPoints = sprints.reduce(
          (sum: number, sprint: StorySprint) => sum + sprint.stories.reduce((inner: number, story: UserStory) => inner + story.storyPoints, 0),
          0
        );
        return {
          success: true,
          sprints,
          totalStories,
          totalPoints,
          outputPath: `${MODULE_OUTPUT_ROOT}/stories`,
        };
      }

      unsupportedCommand('story-writer', command, ['story create', 'story from-prd']);
    },
  },
  'sprint-planner': {
    name: 'sprint-planner',
    version: '1.5.0',
    aliases: {
      'sprint plan': 'sprint plan',
      'sprint retro': 'sprint retro',
      'sprint retrospective': 'sprint retro',
    },
    handler: async ({ modulesPkg, command, args }) => {
      if (command === 'sprint plan') {
        return modulesPkg.runSprintPlanner({ ...args, _: ['plan'] }) as Promise<ModuleResult>;
      }
      if (command === 'sprint retro') {
        return modulesPkg.runSprintPlanner({ ...args, _: ['retro'] }) as Promise<ModuleResult>;
      }
      unsupportedCommand('sprint-planner', command, ['sprint plan', 'sprint retro']);
    },
  },
  'competitive': {
    name: 'competitive',
    version: '2.0.0',
    aliases: {
      'competitive analyze': 'competitive analyze',
      'competitive watch': 'competitive watch',
    },
    handler: async ({ modulesPkg, command, args }) => {
      if (command === 'competitive watch') {
        const competitor = argString(args, 'competitor', 1);
        return modulesPkg.runCompetitive({ ...args, competitor, _: ['watch', competitor] }) as Promise<ModuleResult>;
      }

      if (command === 'competitive analyze') {
        const subject = argString(args, 'subject') || argString(args, 'competitor') || argString(args, 'topic') || '';
        return modulesPkg.runCompetitive({
          ...args,
          subject,
          _: subject ? subject.split(/\s+/).filter(Boolean) : [],
        }) as Promise<ModuleResult>;
      }

      unsupportedCommand('competitive', command, ['competitive analyze', 'competitive watch']);
    },
  },
  'analytics-lens': {
    name: 'analytics-lens',
    version: '1.0.0',
    aliases: {
      'analytics dashboard': 'analytics dashboard',
      'analytics report': 'analytics report',
    },
    handler: async ({ modulesPkg, command, args }) => {
      if (command === 'analytics dashboard') {
        return modulesPkg.runAnalyticsLens({ ...args, _: ['dashboard'] }) as Promise<ModuleResult>;
      }
      if (command === 'analytics report') {
        return modulesPkg.runAnalyticsLens({ ...args, _: ['report'] }) as Promise<ModuleResult>;
      }
      unsupportedCommand('analytics-lens', command, ['analytics dashboard', 'analytics report']);
    },
  },
  oracle: {
    name: 'oracle',
    version: '1.0.0',
    aliases: {
      'oracle predict': 'oracle predict',
      'oracle simulate': 'oracle simulate',
      'oracle forecast': 'oracle forecast',
      'oracle risk': 'oracle risk',
    },
    handler: async ({ modulesPkg, command, args }) => {
      const subCommand = command.replace(/^oracle\s+/, '');
      return modulesPkg.runOracle({ ...args, command: subCommand }) as Promise<ModuleResult>;
    },
  },
  'experiment-lab': {
    name: 'experiment-lab',
    version: '1.0.0',
    aliases: {
      'experiment design': 'experiment design',
      'experiment analyze': 'experiment analyze',
      'experiment sample-size': 'experiment sample-size',
      'experiment rollout': 'experiment rollout',
    },
    handler: async ({ modulesPkg, command, args }) => {
      const subCommand = command.replace(/^experiment\s+/, '');
      return modulesPkg.runExperimentLab({ ...args, command: subCommand }) as Promise<ModuleResult>;
    },
  },
  'ux-auditor': {
    name: 'ux-auditor',
    version: '1.0.0',
    aliases: {
      'ux audit': 'ux audit',
      'ux score': 'ux score',
      'ux compare': 'ux compare',
      'ux wcag': 'ux wcag',
    },
    handler: async ({ modulesPkg, command, args }) => {
      const subCommand = command.replace(/^ux\s+/, '');
      return modulesPkg.runUXAuditor({ ...args, command: subCommand }) as Promise<ModuleResult>;
    },
  },
  'time-machine': {
    name: 'time-machine',
    version: '1.0.0',
    aliases: {
      'timemachine snapshot': 'timemachine snapshot',
      'timemachine compare': 'timemachine compare',
      'timemachine list': 'timemachine list',
      'timemachine whatif': 'timemachine whatif',
      'time-machine snapshot': 'timemachine snapshot',
      'time-machine compare': 'timemachine compare',
      'time-machine list': 'timemachine list',
      'time-machine whatif': 'timemachine whatif',
    },
    handler: async ({ modulesPkg, command, args }) => {
      const subCommand = command
        .replace(/^timemachine\s+/, '')
        .replace(/^time-machine\s+/, '');
      return modulesPkg.runTimeMachine({ ...args, command: subCommand }) as Promise<ModuleResult>;
    },
  },
  'figma-bridge': {
    name: 'figma-bridge',
    version: '1.2.0',
    aliases: {
      'figma sync': 'figma sync',
      'figma analyze': 'figma analyze',
      'figma stories': 'figma stories',
      'figma prd': 'figma prd',
      'figma list': 'figma list',
    },
    handler: async ({ modulesPkg, command, args }) => {
      const subCommand = command.replace(/^figma\s+/, '');
      return modulesPkg.runFigmaBridge({ ...args, command: subCommand }) as Promise<ModuleResult>;
    },
  },
  bridge: {
    name: 'bridge',
    version: '1.0.0',
    aliases: {
      'bridge translate': 'bridge translate',
      'bridge spec': 'bridge spec',
    },
    handler: async ({ modulesPkg, command, args }) => {
      if (command === 'bridge spec') {
        const requirements = argString(args, 'requirements', 1);
        return modulesPkg.runBridge({ ...args, requirements, _: ['spec', requirements] }) as Promise<ModuleResult>;
      }
      if (command === 'bridge translate') {
        const intent = argString(args, 'intent', 1) || '';
        return modulesPkg.runBridge({ ...args, intent, _: ['translate', intent] }) as Promise<ModuleResult>;
      }
      unsupportedCommand('bridge', command, ['bridge translate', 'bridge spec']);
    },
  },
  swarm: {
    name: 'swarm',
    version: '1.0.0',
    aliases: {
      'swarm analyze': 'swarm analyze',
      swarm: 'swarm analyze',
    },
    handler: async ({ modulesPkg, args }) => {
      const question = argString(args, 'question') || '';
      return modulesPkg.runSwarm({ ...args, question }) as Promise<ModuleResult>;
    },
  },
};

export class ModuleManager {
  private runtimeModules: Map<string, ModuleRuntime> = new Map();

  getAvailableModules(): ModuleManifest[] {
    return BUILTIN_MODULES;
  }

  getInstalledModules(): ModuleManifest[] {
    const config = getConfig();
    const installed = config.get().installedModules;
    return BUILTIN_MODULES.filter(m => installed.includes(m.name));
  }

  getModule(name: string): ModuleManifest | undefined {
    const cleanName = normalizeModuleName(name);
    return BUILTIN_MODULES.find(m => m.name === cleanName);
  }

  isInstalled(name: string): boolean {
    const cleanName = normalizeModuleName(name);
    return getConfig().isModuleInstalled(cleanName);
  }

  async install(name: string): Promise<ModuleManifest> {
    const cleanName = normalizeModuleName(name);
    const module = this.getModule(cleanName);
    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }

    await this.loadModuleRuntime(cleanName);
    getConfig().installModule(cleanName);
    return module;
  }

  uninstall(name: string): void {
    const cleanName = normalizeModuleName(name);
    const runtime = this.runtimeModules.get(cleanName);
    if (runtime) {
      runtime.close();
      this.runtimeModules.delete(cleanName);
    }
    getConfig().uninstallModule(cleanName);
  }

  getModuleCommands(name: string): ModuleCommand[] {
    const module = this.getModule(name);
    return module?.commands || [];
  }

  async executeCommand(moduleName: string, commandName: string, args: Record<string, unknown>): Promise<ModuleResult> {
    const cleanName = normalizeModuleName(moduleName);
    if (!this.runtimeModules.has(cleanName)) {
      await this.loadModuleRuntime(cleanName);
    }

    const runtime = this.runtimeModules.get(cleanName);
    if (!runtime) {
      throw new Error(`Module runtime not available: ${moduleName}`);
    }

    return runtime.execute(commandName, args);
  }

  private async loadModuleRuntime(moduleName: string): Promise<void> {
    const cleanName = normalizeModuleName(moduleName);
    if (!MODULE_RUNTIME_DEFINITIONS[cleanName as ModuleName]) {
      throw new ModuleLoadError(
        cleanName,
        `Available modules: ${Object.keys(MODULE_RUNTIME_DEFINITIONS).join(', ')}`
      );
    }

    try {
      // Use variable indirection so TypeScript doesn't resolve the module at compile time.
      // @phantom-pm/modules is built AFTER core in the workspace build order.
      const modulePath = '@phantom-pm/modules';
      const modulesPkg = (await import(modulePath)) as ModulesPackage;
      const runtime = this.createRuntime(cleanName, modulesPkg);
      this.runtimeModules.set(cleanName, runtime);
    } catch (error) {
      throw new ModuleLoadError(cleanName, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private createRuntime(moduleName: string, modulesPkg: ModulesPackage): ModuleRuntime {
    const definition = MODULE_RUNTIME_DEFINITIONS[moduleName as ModuleName];
    if (!definition) {
      throw new ModuleLoadError(
        moduleName,
        `Available modules: ${Object.keys(MODULE_RUNTIME_DEFINITIONS).join(', ')}`
      );
    }

    return {
      name: definition.name,
      version: definition.version,
      execute: async (command, args) => {
        const normalized = normalizeCommandName(command);
        const canonical = definition.aliases?.[normalized] || normalized;
        return definition.handler({
          modulesPkg,
          command: canonical,
          args,
        });
      },
      close: async () => { },
    };
  }
}

// Singleton
let instance: ModuleManager | null = null;

export function getModuleManager(): ModuleManager {
  if (!instance) {
    instance = new ModuleManager();
  }
  return instance;
}
