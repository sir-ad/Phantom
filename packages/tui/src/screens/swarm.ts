// PHANTOM TUI - Swarm Analysis Screen
import { theme, box, doubleBox, gradientBar, formatDuration } from '../theme/index.js';
import type { SwarmResult, AgentResult, AgentState } from '@phantom-pm/core';
import { AGENT_TYPES } from '@phantom-pm/core';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function renderSwarmProgress(question: string, states: AgentState[]): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(theme.title('  ⚡ SWARM ACTIVATED'));
  lines.push(theme.secondary(`  Question: "${question}"`));
  lines.push('');

  for (const state of states) {
    const icon = state.status === 'complete'
      ? theme.check
      : state.status === 'idle'
        ? theme.dim('○')
        : theme.statusOn;

    const statusText = state.status === 'complete'
      ? theme.success('COMPLETE')
      : state.status === 'idle'
        ? theme.dim('WAITING')
        : theme.highlight(state.status.toUpperCase());

    const elapsed = state.elapsed ? theme.dim(` [${formatDuration(state.elapsed)}]`) : '';

    lines.push(`  ${icon} ${theme.secondary(state.type.padEnd(14))} ${statusText}${elapsed}`);
  }

  lines.push('');
  const complete = states.filter(s => s.status === 'complete').length;
  lines.push(`  ${theme.secondary(`Progress: ${complete}/${states.length} agents complete`)}`);
  lines.push('');

  return lines.join('\n');
}

export function renderSwarmResult(result: SwarmResult): string {
  const lines: string[] = [];

  // Verdict color
  const verdictColor = result.consensus.includes('YES') ? theme.success : result.consensus.includes('NO') ? theme.error : theme.warning;

  lines.push('');
  const header = [
    '',
    `  ${theme.title('⚡ SWARM RESULT')} ${theme.dim(`(${result.agentResults.length} agents, ${formatDuration(result.totalDuration)})`)}`,
    '',
    `  Question: ${theme.highlight(`"${result.question}"`)}`,
    '',
    `  Verdict: ${verdictColor(result.consensus)} (${result.overallConfidence}% confidence)`,
    '',
  ].join('\n');

  console.log(doubleBox(header, undefined, 70));
  console.log('');

  // Individual agent results
  for (const agentResult of result.agentResults) {
    const verdictIcon = agentResult.verdict === 'yes'
      ? theme.success('YES')
      : agentResult.verdict === 'no'
        ? theme.error('NO')
        : theme.warning('MAYBE');

    const confidence = gradientBar(agentResult.confidence, 10);

    lines.push(`  ${theme.highlight(agentResult.agent.padEnd(14))} ${verdictIcon.padEnd(6)} ${confidence} ${agentResult.confidence}%`);
    lines.push(`  ${theme.secondary(agentResult.summary)}`);

    for (const detail of agentResult.details) {
      lines.push(`    ${theme.dim('•')} ${theme.dim(detail)}`);
    }
    lines.push('');
  }

  // Recommendation
  lines.push('  ' + '─'.repeat(66));
  lines.push('');
  lines.push(`  ${theme.title('RECOMMENDATION:')}`);
  lines.push(`  ${theme.secondary(result.recommendation)}`);
  lines.push('');

  return lines.join('\n');
}

export async function runSwarmAnimation(question: string): Promise<void> {
  console.log('');
  console.log(theme.title('  ⚡ SWARM ACTIVATED'));
  console.log(theme.secondary(`  Deploying 7 agents for: "${question}"`));
  console.log('');

  const agents = [...AGENT_TYPES];
  const statuses = ['DEPLOYING', 'ANALYZING', 'PROCESSING', 'SYNTHESIZING', 'COMPLETE'];

  for (const agent of agents) {
    for (const status of statuses) {
      const icon = status === 'COMPLETE' ? theme.check : theme.statusOn;
      const statusColor = status === 'COMPLETE' ? theme.success : theme.highlight;
      process.stdout.write(`\r  ${icon} ${theme.secondary(agent.padEnd(14))} ${statusColor(status.padEnd(14))}`);
      await sleep(80 + Math.random() * 120);
    }
    console.log('');
  }

  console.log('');
}
