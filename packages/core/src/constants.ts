// PHANTOM Core - Theme & Constants
// Matrix-Cyberpunk color palette

export const COLORS = {
  background: '#0D1117',
  primary: '#00FF41',      // Matrix green
  secondary: '#8B949E',    // Ghost gray
  accent1: '#FF6B35',      // Phantom orange
  accent2: '#00D4FF',      // Cyber blue
  accent3: '#FF2D55',      // Neon red
  border: '#21262D',       // Subtle dark gray
  selection: '#1A3A2A',    // Dark green highlight
  success: '#00FF41',      // Matrix green
  warning: '#FF6B35',      // Phantom orange
  error: '#FF2D55',        // Neon red
  info: '#00D4FF',         // Cyber blue
  dimmed: '#484F58',       // Dimmed text
} as const;

export const PHANTOM_VERSION = '1.0.0';

export const PHANTOM_ASCII = `
  ░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
  ░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
  ░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀`;

export const TAGLINE = 'The invisible force behind every great product.';
export const SUBTITLE = 'Open source PM operating system for the terminal age.';

export const MODULE_QUOTES: Record<string, string> = {
  'prd-forge':      'I know PRDs.',
  'story-writer':   'I know user stories.',
  'sprint-planner': 'I know velocity.',
  'competitive':    'I know your enemies.',
  'oracle':         'I know the future.',
  'figma-bridge':   'I know design.',
  'analytics-lens': 'I know the numbers.',
  'experiment-lab': 'I know the truth.',
  'ux-auditor':     'I know the user.',
  'time-machine':   'I know the past.',
  'bridge':         'I know both worlds.',
  'swarm':          'We know everything.',
};

export const AGENT_TYPES = [
  'Strategist',
  'Analyst',
  'Builder',
  'Designer',
  'Researcher',
  'Communicator',
  'Operator',
] as const;

export type AgentType = typeof AGENT_TYPES[number];

export const AGENT_DESCRIPTIONS: Record<AgentType, string> = {
  Strategist:    'Market positioning, competitive analysis, go-to-market strategy',
  Analyst:       'Data analysis, metrics interpretation, trend identification',
  Builder:       'Technical feasibility, effort estimation, architecture review',
  Designer:      'UX/UI analysis, usability heuristics, design system review',
  Researcher:    'User research synthesis, persona development, JTBD analysis',
  Communicator:  'Stakeholder updates, documentation, team alignment',
  Operator:      'Sprint management, velocity tracking, process optimization',
};

export const FRAMEWORKS = [
  { name: 'RICE Scoring',           desc: 'Reach, Impact, Confidence, Effort' },
  { name: 'MoSCoW',                 desc: 'Must, Should, Could, Won\'t' },
  { name: 'Kano Model',             desc: 'Delight, Performance, Basic' },
  { name: 'AARRR (Pirate Metrics)', desc: 'Acquisition through Revenue' },
  { name: 'Jobs-to-be-Done',        desc: 'Outcome-driven innovation' },
  { name: 'ICE Scoring',            desc: 'Impact, Confidence, Ease' },
  { name: 'Opportunity Scoring',    desc: 'Importance vs Satisfaction' },
  { name: 'Story Mapping',          desc: 'User activity mapping' },
  { name: 'Impact Mapping',         desc: 'Goal → Actor → Impact → Deliverable' },
  { name: 'Lean Canvas',            desc: '1-page business model' },
  { name: 'Value Proposition',      desc: 'Gains, Pains, Jobs' },
  { name: 'North Star Framework',   desc: 'Metric → Inputs → Work' },
] as const;

export const BOOT_SYSTEMS = [
  'Core Engine',
  'Context Engine',
  'Agent Swarm',
  'Security Layer',
  'Module System',
] as const;
