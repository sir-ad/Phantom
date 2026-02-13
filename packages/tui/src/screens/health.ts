// PHANTOM TUI - Health Dashboard
import { theme, box, gradientBar, doubleBox } from '../theme/index.js';

export interface HealthData {
  cpu: number;
  memory: { used: number; total: number };
  disk: number;
  vectorDbSize: string;
  modelLatency: number;
  contextDocs: number;
  agentPool: { active: number; total: number };
  uptime: string;
  primaryModel: {
    provider: string;
    model: string;
    status: 'connected' | 'disconnected';
    latency: number;
    cost: string;
    tokensToday: number;
  };
  fallbackModel?: {
    provider: string;
    model: string;
    status: 'connected' | 'disconnected';
    latency: number;
    cost: string;
    tokensToday: number;
    apiKeyPreview: string;
  };
  visionModel?: {
    provider: string;
    model: string;
    status: 'connected' | 'disconnected';
  };
  integrations: {
    name: string;
    connected: boolean;
    details?: string;
  }[];
  security: {
    dataMode: string;
    encryption: string;
    credentialStore: string;
    telemetry: boolean;
    autoUpdate: boolean;
    permissionLevel: string;
    lastAudit: string;
    auditStatus: string;
  };
}

export function renderHealthDashboard(data: HealthData): string {
  const lines: string[] = [];

  // Header
  lines.push('╔' + '═'.repeat(76) + '╗');
  lines.push(`║  ${theme.statusOn} ${theme.title('PHANTOM HEALTH DASHBOARD')}${' '.repeat(33)}${theme.dim('[ESC] Back')}     ║`);
  lines.push('╠' + '═'.repeat(76) + '╣');
  lines.push('║' + ' '.repeat(76) + '║');

  // System Health
  const sysLines = [
    '',
    `  ${theme.secondary('CPU Usage')}        ${gradientBar(data.cpu, 15)}   ${data.cpu}%    ${theme.secondary('Memory')}     ${data.memory.used} GB / ${data.memory.total}`,
    `  ${theme.secondary('Disk Usage')}       ${gradientBar(data.disk, 15)}   ${data.disk}%    ${theme.secondary('Vector DB')}  ${data.vectorDbSize}`,
    `  ${theme.secondary('Model Latency')}    ${gradientBar(Math.min(100, data.modelLatency / 5), 15)}   ${data.modelLatency}ms  ${theme.secondary('Context')}    ${data.contextDocs.toLocaleString()} docs`,
    `  ${theme.secondary('Agent Pool')}       ${gradientBar((data.agentPool.active / data.agentPool.total) * 100, 15)}   ${data.agentPool.active}/${data.agentPool.total}    ${theme.secondary('Uptime')}     ${data.uptime}`,
    '',
  ];
  lines.push(`║  ${box(sysLines.join('\n'), 'SYSTEM HEALTH', 72)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Model Configuration
  const modelLines: string[] = [''];

  // Primary model
  modelLines.push(`  ${theme.title('Primary Model')}`);
  modelLines.push(`  ┌${'─'.repeat(62)}┐`);
  modelLines.push(`  │  Provider:  ${theme.highlight(data.primaryModel.provider.padEnd(35))} ${theme.dim('[CHANGE]')} │`);
  modelLines.push(`  │  Model:     ${theme.highlight(data.primaryModel.model.padEnd(35))} ${theme.dim('[CHANGE]')} │`);
  const pStatus = data.primaryModel.status === 'connected' ? theme.statusOn : theme.statusOff;
  modelLines.push(`  │  Status:    ${pStatus} ${data.primaryModel.status === 'connected' ? 'Connected' : 'Disconnected'}    Latency: ${data.primaryModel.latency}ms${''.padEnd(18)} │`);
  modelLines.push(`  │  Cost:      ${data.primaryModel.cost.padEnd(18)} Tokens today: ${data.primaryModel.tokensToday.toLocaleString()}${''.padEnd(8)} │`);
  modelLines.push(`  └${'─'.repeat(62)}┘`);
  modelLines.push('');

  // Fallback model
  if (data.fallbackModel) {
    modelLines.push(`  ${theme.title('Fallback Model')}`);
    modelLines.push(`  ┌${'─'.repeat(62)}┐`);
    modelLines.push(`  │  Provider:  ${theme.highlight(data.fallbackModel.provider.padEnd(35))} ${theme.dim('[CHANGE]')} │`);
    modelLines.push(`  │  Model:     ${theme.highlight(data.fallbackModel.model.padEnd(35))} ${theme.dim('[CHANGE]')} │`);
    modelLines.push(`  │  API Key:   ${theme.dim(data.fallbackModel.apiKeyPreview.padEnd(35))} ${theme.dim('[UPDATE]')} │`);
    const fStatus = data.fallbackModel.status === 'connected' ? theme.statusOn : theme.statusOff;
    modelLines.push(`  │  Status:    ${fStatus} ${data.fallbackModel.status === 'connected' ? 'Connected' : 'Disconnected'}    Latency: ${data.fallbackModel.latency}ms${''.padEnd(18)} │`);
    modelLines.push(`  │  Cost:      ${data.fallbackModel.cost.padEnd(18)} Tokens today: ${data.fallbackModel.tokensToday.toLocaleString()}${''.padEnd(8)} │`);
    modelLines.push(`  └${'─'.repeat(62)}┘`);
    modelLines.push('');
  }

  // Vision model
  if (data.visionModel) {
    modelLines.push(`  ${theme.title('Vision Model')} ${theme.dim('(for screenshots/Figma)')}`);
    modelLines.push(`  ┌${'─'.repeat(62)}┐`);
    modelLines.push(`  │  Provider:  ${theme.highlight(data.visionModel.provider.padEnd(35))} ${theme.dim('[CHANGE]')} │`);
    modelLines.push(`  │  Model:     ${theme.highlight(data.visionModel.model.padEnd(35))} ${theme.dim('[CHANGE]')} │`);
    const vStatus = data.visionModel.status === 'connected' ? theme.statusOn : theme.statusOff;
    modelLines.push(`  │  Status:    ${vStatus} ${data.visionModel.status === 'connected' ? 'Connected' : 'Disconnected'}${''.padEnd(41)} │`);
    modelLines.push(`  └${'─'.repeat(62)}┘`);
    modelLines.push('');
  }

  modelLines.push(`  ${theme.dim('[+ Add Model]')}  ${theme.dim('[Test All Connections]')}  ${theme.dim('[Auto-Route Settings]')}`);
  modelLines.push('');

  lines.push(`║  ${box(modelLines.join('\n'), 'MODEL CONFIGURATION', 72)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Integrations
  const intLines = [''];
  for (const int of data.integrations) {
    const icon = int.connected ? theme.statusOn : theme.statusOff;
    const name = int.name.padEnd(16);
    const status = int.connected ? 'Connected' : 'Not Connected';
    const details = int.details ? `    ${int.details}` : '';
    const action = int.connected ? theme.dim('[CONFIGURE]') : theme.dim('[CONNECT]');
    intLines.push(`  ${icon} ${theme.secondary(name)} ${status.padEnd(16)} ${details.padEnd(24)} ${action}`);
  }
  intLines.push('');
  lines.push(`║  ${box(intLines.join('\n'), 'INTEGRATIONS STATUS', 72)}  ║`);
  lines.push('║' + ' '.repeat(76) + '║');

  // Security & Privacy
  const secLines = [
    '',
    `  ${theme.secondary('Data Mode:')}           ${theme.statusOn} ${data.security.dataMode}${''.padEnd(16)} ${theme.dim('[CHANGE]')}`,
    `  ${theme.secondary('Encryption:')}          ${theme.statusOn} ${data.security.encryption}`,
    `  ${theme.secondary('Credential Store:')}    ${theme.statusOn} ${data.security.credentialStore}`,
    `  ${theme.secondary('Telemetry:')}           ${data.security.telemetry ? theme.statusOn : theme.statusOff} ${data.security.telemetry ? 'Enabled' : 'Disabled'}${''.padEnd(20)} ${theme.dim(data.security.telemetry ? '[DISABLE]' : '[ENABLE]')}`,
    `  ${theme.secondary('Auto-Update:')}         ${theme.statusOn} ${data.security.autoUpdate ? 'Enabled (stable channel)' : 'Disabled'}${''.padEnd(6)} ${theme.dim('[CHANGE]')}`,
    `  ${theme.secondary('Permission Level:')}    ${data.security.permissionLevel}${''.padEnd(6)} ${theme.dim('[CHANGE]')}`,
    '',
    `  ${theme.secondary('Last Security Audit:')} ${data.security.lastAudit}  ${theme.check} ${data.security.auditStatus}`,
    `  ${theme.dim('[Run Security Audit]')}  ${theme.dim('[Export Audit Log]')}  ${theme.dim('[Reset All]')}`,
    '',
  ];
  lines.push(`║  ${box(secLines.join('\n'), 'SECURITY & PRIVACY', 72)}  ║`);

  lines.push('╚' + '═'.repeat(76) + '╝');

  return lines.join('\n');
}

export function getDefaultHealthData(): HealthData {
  return {
    cpu: 22,
    memory: { used: 1.2, total: 8 },
    disk: 42,
    vectorDbSize: '234 MB',
    modelLatency: 120,
    contextDocs: 18432,
    agentPool: { active: 3, total: 7 },
    uptime: '14d 6h',
    primaryModel: {
      provider: 'Ollama (local)',
      model: 'llama3.1:70b',
      status: 'connected',
      latency: 89,
      cost: '$0.00 (local)',
      tokensToday: 45203,
    },
    fallbackModel: {
      provider: 'Anthropic',
      model: 'claude-opus-4-6',
      status: 'connected',
      latency: 340,
      cost: '$2.47 today',
      tokensToday: 12891,
      apiKeyPreview: 'sk-ant-...****',
    },
    visionModel: {
      provider: 'OpenAI',
      model: 'gpt-4o',
      status: 'connected',
    },
    integrations: [
      { name: 'GitHub', connected: true, details: 'repo: acme/app' },
      { name: 'Figma', connected: true, details: 'team: Acme Design' },
      { name: 'Linear', connected: true, details: 'workspace: Acme' },
      { name: 'Slack', connected: true, details: '#product-team' },
      { name: 'Telegram', connected: false },
      { name: 'WhatsApp', connected: false },
      { name: 'Teams', connected: false },
      { name: 'Mixpanel', connected: false },
      { name: 'Notion', connected: false },
    ],
    security: {
      dataMode: 'Full Local (no cloud)',
      encryption: 'AES-256 at rest',
      credentialStore: 'OS Keychain',
      telemetry: false,
      autoUpdate: true,
      permissionLevel: 'L2 (prompt for external access)',
      lastAudit: '2 days ago',
      auditStatus: 'All clear',
    },
  };
}
