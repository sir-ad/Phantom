// PHANTOM TUI - Nudges & Achievements
import { theme, box } from '../theme/index.js';

export interface Nudge {
  icon: string;
  title: string;
  message: string;
  actions: string[];
}

export interface Achievement {
  title: string;
  description: string;
  next?: string;
}

export interface Streak {
  days: number;
  target: number;
}

export function renderNudge(nudge: Nudge): string {
  const actionStr = nudge.actions.map(a => theme.dim(`[${a}]`)).join('  ');

  const content = [
    '',
    `  ${nudge.icon} ${theme.secondary(nudge.title)}`,
    `     ${theme.secondary(nudge.message)}`,
    '',
    `     ${actionStr}`,
    '',
  ].join('\n');

  return box(content, 'PHANTOM NUDGE', 62);
}

export function renderAchievement(achievement: Achievement): string {
  const content = [
    `  🏆 ${theme.title('ACHIEVEMENT UNLOCKED')}`,
    '',
    `  ${theme.highlight(`"${achievement.title}"`)}`,
    `  ${theme.secondary(achievement.description)}`,
    '',
    achievement.next ? `  ${theme.dim(`Next: "${achievement.next}"`)}` : '',
  ].filter(Boolean).join('\n');

  return `╔${'═'.repeat(44)}╗\n${content.split('\n').map(l => `║  ${l}${''.padEnd(Math.max(0, 40 - l.length))}  ║`).join('\n')}\n╚${'═'.repeat(44)}╝`;
}

export function renderStreak(streak: Streak): string {
  const filled = Math.round((streak.days / streak.target) * 14);
  const bar = theme.green('▓'.repeat(filled)) + theme.dim('░'.repeat(14 - filled));

  const content = [
    `  🔥 ${theme.title(`${streak.days}-day shipping streak`)}`,
    `  ${bar} ${streak.days}/${streak.target} days`,
    `  ${theme.secondary('Keep going, Operator.')}`,
  ].join('\n');

  return box(content, undefined, 35);
}

export function renderSimulation(title: string): string {
  const content = [
    '',
    `  ${theme.dim('Creating 10,000 synthetic user sessions...')}`,
    '',
    `  ${theme.secondary('Without emails:')}  Cart abandonment rate: ${theme.error('68.2%')}`,
    `  ${theme.secondary('With emails:')}     Cart abandonment rate: ${theme.success('52.1%')}`,
    `  ${theme.secondary('Delta:')}           ${theme.success('-16.1%')} abandonment (${theme.success('-23.6%')} relative)`,
    '',
    `  ${theme.secondary('Revenue Impact:')}  ${theme.highlight('+$34K - $89K / month')}`,
    `  ${theme.secondary('Implementation:')}  3-5 story points`,
    `  ${theme.secondary('ROI Timeline:')}    Positive after 2 weeks`,
    '',
    `  ${theme.secondary('Optimal email timing:')}`,
    `  ├── 1st email: 1 hour after abandonment (${theme.success('12%')} recovery)`,
    `  ├── 2nd email: 24 hours (${theme.success('8%')} recovery)`,
    `  └── 3rd email: 72 hours with discount (${theme.success('4%')} recovery)`,
    '',
    `  ${theme.secondary('Confidence:')} 74% (based on industry benchmarks + your data)`,
    '',
  ].join('\n');

  return box(content, 'SIMULATION RESULTS', 62);
}

export function getExampleNudges(): Nudge[] {
  return [
    {
      icon: '⚡',
      title: "You've been writing this PRD for 45 minutes.",
      message: 'Want me to auto-generate the technical requirements\n     section based on your codebase?',
      actions: ['Yes, generate', 'No thanks', 'Remind me later'],
    },
    {
      icon: '📊',
      title: 'Sprint 14 ends in 2 days. 3 stories still in progress.',
      message: "Based on velocity, you'll likely miss 1 story.\n     Want me to draft a scope adjustment proposal?",
      actions: ['Draft proposal', 'Show analysis', 'Dismiss'],
    },
    {
      icon: '🔍',
      title: 'Competitor "RivalApp" just pushed a major update.',
      message: '3 new features overlap with your Q2 roadmap.\n     Want me to run a competitive impact analysis?',
      actions: ['Run analysis', 'Show changes', 'Dismiss'],
    },
    {
      icon: '💡',
      title: 'I noticed 12 similar user complaints in the last week.',
      message: 'Pattern: "checkout flow is confusing"\n     This matches PRD-47 (Checkout Redesign) — currently\n     deprioritized.',
      actions: ['Reprioritize', 'View complaints', 'Create story'],
    },
  ];
}
