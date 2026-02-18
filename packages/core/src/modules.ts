// PHANTOM Core - Module System
// "I know kung fu." — Each module adds PM superpowers

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
