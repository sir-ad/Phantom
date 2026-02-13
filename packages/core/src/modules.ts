// PHANTOM Core - Module System
// "I know kung fu." — Each module adds PM superpowers

import { MODULE_QUOTES } from './constants.js';
import { getConfig } from './config.js';

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

export class ModuleManager {
  getAvailableModules(): ModuleManifest[] {
    return BUILTIN_MODULES;
  }

  getInstalledModules(): ModuleManifest[] {
    const config = getConfig();
    const installed = config.get().installedModules;
    return BUILTIN_MODULES.filter(m => installed.includes(m.name));
  }

  getModule(name: string): ModuleManifest | undefined {
    // Strip @phantom/ prefix if present
    const cleanName = name.replace(/^@phantom\//, '');
    return BUILTIN_MODULES.find(m => m.name === cleanName);
  }

  isInstalled(name: string): boolean {
    const cleanName = name.replace(/^@phantom\//, '');
    return getConfig().isModuleInstalled(cleanName);
  }

  install(name: string): ModuleManifest {
    const cleanName = name.replace(/^@phantom\//, '');
    const module = this.getModule(cleanName);
    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }
    getConfig().installModule(cleanName);
    return module;
  }

  uninstall(name: string): void {
    const cleanName = name.replace(/^@phantom\//, '');
    getConfig().uninstallModule(cleanName);
  }

  getModuleCommands(name: string): ModuleCommand[] {
    const module = this.getModule(name);
    return module?.commands || [];
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
