// PHANTOM TUI - Main Dashboard
import { theme, box, gradientBar, doubleBox, separator } from '../theme/index.js';
import { PHANTOM_VERSION } from '@phantom-pm/core';
import type { AgentState } from '@phantom-pm/core';

export interface DashboardData {
  projectName: string;
  modelName: string;
  isLocal: boolean;
  contextHealth: number;
  activeAgents: number;
  totalAgents: number;
  modulesLoaded: number;
  totalModules: number;
  modelStatus: 'online' | 'offline' | 'error';
  privacyMode: string;
  uptime: string;
  sprintProgress: number;
  sprintNumber: number;
  totalSprints: number;
  featuresShipped: number;
  prdsActive: number;
  blockers: number;
  techDebt: number;
  userSatisfaction: number;
  npsScore: number;
  agentStates: AgentState[];
  liveFeed: FeedEntry[];
  installedModules: ModuleInfo[];
}

export interface FeedEntry {
  time: string;
  icon: string;
  message: string;
}

export interface ModuleInfo {
  name: string;
  version: string;
  installed: boolean;
}

function formatAgentStatus(state: AgentState): string {
  const icon = state.status === 'idle' ? theme.dim('◉') : theme.success('◉');
  const name = state.type.padEnd(14);
  const dots = '·····';

  if (state.status === 'idle') {
    return `  ${icon} ${theme.secondary(name)} ${theme.dim(dots)}  ${theme.dim('IDLE')}`;
  }

  const statusLabel = state.status.toUpperCase().padEnd(12);
  const task = (state.currentTask || '').slice(0, 30);
  const elapsed = state.elapsed ? `[${Math.round(state.elapsed / 60000)}m]` : '';

  return `  ${icon} ${theme.primary(name)} ${theme.dim(dots)}  ${theme.highlight(statusLabel)} ${theme.secondary(task)}  ${theme.dim(elapsed)}`;
}

export function renderDashboard(data: DashboardData): string {
  const lines: string[] = [];

  // Header
  const localBadge = data.isLocal ? theme.green('◈ LOCAL') : theme.cyan('◈ CLOUD');
  const header = `  ${theme.statusOn} ${theme.title('PHANTOM')} v${PHANTOM_VERSION}  │  Project: ${theme.highlight(data.projectName)}  │  Model: ${theme.secondary(data.modelName)}  │  ${localBadge}`;

  lines.push('╔' + '═'.repeat(76) + '╗');
  lines.push(`║${header.padEnd(76)}║`);
  lines.push('╠' + '═'.repeat(76) + '╣');
  lines.push('║' + ' '.repeat(76) + '║');

  // Operator Status + Product Pulse (side by side)
  const opBox = [
    `  ${theme.secondary('Context Health')}   ${gradientBar(data.contextHealth, 10)} ${data.contextHealth}%`,
    `  ${theme.secondary('Active Agents')}    ${data.activeAgents}/${data.totalAgents}`,
    `  ${theme.secondary('Modules Loaded')}   ${data.modulesLoaded}/${data.totalModules}`,
    `  ${theme.secondary('Model Status')}     ${data.modelStatus === 'online' ? theme.statusOn : theme.statusOff} ${data.modelStatus === 'online' ? 'Online' : 'Offline'}`,
    `  ${theme.secondary('Privacy Mode')}     ${theme.statusOn} ${data.privacyMode}`,
    ``,
    `  ${theme.dim('Uptime: ' + data.uptime)}`,
  ];

  const pulseBox = [
    `  ${theme.secondary(`Sprint ${data.sprintNumber}/${data.totalSprints}`)}     ${gradientBar(data.sprintProgress, 5)} ${data.sprintProgress}%`,
    `  ${theme.secondary('Features Shipped')}   ${data.featuresShipped} ${theme.check}`,
    `  ${theme.secondary('PRDs Active')}         ${data.prdsActive} 📋`,
    `  ${theme.secondary('Blockers')}            ${data.blockers} ${data.blockers > 0 ? theme.warning_icon : theme.check}`,
    `  ${theme.secondary('Tech Debt')}          ${data.techDebt}/10`,
    `  ${theme.secondary('User Satisfaction')}  ${data.userSatisfaction}/5`,
    `  ${theme.secondary('NPS Score')}           +${data.npsScore}`,
  ];

  lines.push(`║  ${box(opBox.join('\n'), 'OPERATOR STATUS', 37)}  ${box(pulseBox.join('\n'), 'PRODUCT PULSE', 33)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Agent Swarm
  const agentLines = data.agentStates.map(formatAgentStatus);
  lines.push(`║  ${box(agentLines.join('\n'), 'AGENT SWARM', 72)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Live Feed
  const feedLines = data.liveFeed.slice(0, 6).map(f =>
    `  ${theme.dim(f.time)}  ${f.icon} ${theme.secondary(f.message)}`
  );
  lines.push(`║  ${box(feedLines.join('\n'), 'LIVE FEED', 72)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Modules + Quick Actions (side by side)
  const moduleLines = data.installedModules.slice(0, 8).map(m => {
    const icon = m.installed ? theme.bullet : theme.dim('○');
    const status = m.installed ? `v${m.version}` : theme.dim('+INST');
    return `  ${icon} ${theme.secondary(m.name.padEnd(16))} ${status}`;
  });

  const quickActions = [
    `  ${theme.highlight('[P]')} New PRD    ${theme.highlight('[S]')} Swarm Analysis`,
    `  ${theme.highlight('[C]')} Context    ${theme.highlight('[B]')} Bridge Mode`,
    `  ${theme.highlight('[M]')} Modules    ${theme.highlight('[O]')} Oracle`,
    `  ${theme.highlight('[R]')} Reports    ${theme.highlight('[T]')} Time Machine`,
    `  ${theme.highlight('[H]')} Health     ${theme.highlight('[?]')} Help`,
    ``,
    `  ${theme.highlight('[I]')} Install Module`,
    `  ${theme.highlight('[U]')} Upgrade All`,
  ];

  lines.push(`║  ${box(moduleLines.join('\n'), 'MODULES', 29)}  ${box(quickActions.join('\n'), 'QUICK ACTIONS', 39)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Prompt
  lines.push(`║  ${theme.green('phantom >')} ${theme.dim('_')}${' '.repeat(62)}║`);
  lines.push('╚' + '═'.repeat(76) + '╝');

  return lines.join('\n');
}

export function getDefaultDashboardData(): DashboardData {
  return {
    projectName: 'Acme App',
    modelName: 'Claude 4.6',
    isLocal: true,
    contextHealth: 82,
    activeAgents: 3,
    totalAgents: 7,
    modulesLoaded: 8,
    totalModules: 40,
    modelStatus: 'online',
    privacyMode: 'Full Local',
    uptime: '2h 34m',
    sprintProgress: 78,
    sprintNumber: 14,
    totalSprints: 20,
    featuresShipped: 12,
    prdsActive: 4,
    blockers: 1,
    techDebt: 3.2,
    userSatisfaction: 4.3,
    npsScore: 42,
    agentStates: [
      { type: 'Strategist', status: 'analyzing', currentTask: 'competitive landscape', elapsed: 120000 },
      { type: 'Analyst', status: 'processing', currentTask: 'user metrics data', elapsed: 60000 },
      { type: 'Builder', status: 'idle' },
      { type: 'Designer', status: 'reviewing', currentTask: 'checkout flow UX', elapsed: 180000 },
      { type: 'Researcher', status: 'idle' },
      { type: 'Communicator', status: 'idle' },
      { type: 'Operator', status: 'monitoring', currentTask: 'sprint velocity' },
    ],
    liveFeed: [
      { time: '10:42', icon: theme.check, message: 'PRD v2.3 auto-updated: Checkout Redesign' },
      { time: '10:38', icon: theme.statusOn, message: 'Swarm complete: "Add referral program" → STRONG YES 91%' },
      { time: '10:35', icon: theme.lightning, message: 'Context refresh: 14 new commits ingested' },
      { time: '10:30', icon: '📋', message: 'Sprint 14 auto-planned: 11 stories, 29 points' },
      { time: '10:22', icon: theme.warning_icon, message: 'Risk detected: API rate limit approaching' },
      { time: '10:15', icon: theme.check, message: 'Competitor alert: Rival launched pricing page' },
    ],
    installedModules: [
      { name: 'PRD Forge', version: '2.1', installed: true },
      { name: 'Story Writer', version: '1.8', installed: true },
      { name: 'Sprint Planner', version: '1.5', installed: true },
      { name: 'Figma Bridge', version: '1.2', installed: true },
      { name: 'Competitive', version: '2.0', installed: true },
      { name: 'Analytics Lens', version: '1.0', installed: true },
      { name: 'Oracle', version: '1.0', installed: false },
      { name: 'Experiment Lab', version: '1.0', installed: false },
    ],
  };
}
