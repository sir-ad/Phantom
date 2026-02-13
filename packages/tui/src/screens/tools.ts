// PHANTOM TUI - Tool Palette
import { theme, doubleBox, box } from '../theme/index.js';

export interface ToolCategory {
  name: string;
  icon: string;
  tools: { name: string; description: string }[];
  security: string;
}

export function renderToolPalette(categories: ToolCategory[]): string {
  const lines: string[] = [];

  for (const cat of categories) {
    const toolLines = cat.tools.map(t =>
      `  ${theme.statusOn} ${theme.secondary(t.name.padEnd(20))} — ${theme.dim(t.description)}`
    );
    toolLines.push(`  🔒 ${theme.dim(cat.security)}`);

    lines.push(box(toolLines.join('\n'), cat.name, 58));
    lines.push('');
  }

  const content = lines.join('\n');
  return doubleBox(content, 'TOOL PALETTE                                    [ESC] Close', 62);
}

export function getDefaultToolCategories(): ToolCategory[] {
  return [
    {
      name: 'BROWSER',
      icon: '🌐',
      tools: [
        { name: 'Research Mode', description: 'Search & summarize web pages' },
        { name: 'Competitor Watch', description: 'Monitor competitor websites' },
        { name: 'Scrape & Analyze', description: 'Extract structured data' },
        { name: 'Screenshot Page', description: 'Capture any URL for analysis' },
      ],
      security: 'Sandboxed: No cookies, no auth, no tracking',
    },
    {
      name: 'TERMINAL',
      icon: '⌨️',
      tools: [
        { name: 'Git Operations', description: 'Commits, PRs, branch analysis' },
        { name: 'Build & Test', description: 'Run builds, check test status' },
        { name: 'Deploy Status', description: 'Check deployment pipelines' },
        { name: 'Script Runner', description: 'Run approved scripts' },
      ],
      security: 'Allowlist: Only pre-approved commands',
    },
    {
      name: 'FILE SYSTEM',
      icon: '📁',
      tools: [
        { name: 'Project Browser', description: 'Navigate project files' },
        { name: 'Asset Manager', description: 'Manage generated artifacts' },
        { name: 'Config Editor', description: 'Edit phantom configuration' },
        { name: 'Export Engine', description: 'Export to PDF, PPTX, HTML' },
      ],
      security: 'Scoped: Only project directory + ~/.phantom',
    },
    {
      name: 'COMMUNICATION',
      icon: '💬',
      tools: [
        { name: 'Slack Bot', description: 'Post updates, gather feedback' },
        { name: 'Telegram Bot', description: 'Mobile PM companion' },
        { name: 'WhatsApp Bot', description: 'Quick status checks' },
        { name: 'Teams Bot', description: 'Enterprise communication' },
        { name: 'Email Drafter', description: 'Draft stakeholder updates' },
      ],
      security: 'Draft-first: All messages require approval',
    },
    {
      name: 'DATA & ANALYTICS',
      icon: '📊',
      tools: [
        { name: 'Metrics Dashboard', description: 'Pull from analytics platforms' },
        { name: 'SQL Explorer', description: 'Query product databases (R/O)' },
        { name: 'API Tester', description: 'Test product APIs' },
        { name: 'Log Analyzer', description: 'Parse application logs' },
      ],
      security: 'Read-only: No mutations to production data',
    },
  ];
}
