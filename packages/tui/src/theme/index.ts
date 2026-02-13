// PHANTOM TUI - Matrix Theme
import chalk from 'chalk';

export const theme = {
  // Colors
  green: chalk.hex('#00FF41'),
  ghostGray: chalk.hex('#8B949E'),
  orange: chalk.hex('#FF6B35'),
  cyan: chalk.hex('#00D4FF'),
  red: chalk.hex('#FF2D55'),
  border: chalk.hex('#21262D'),
  dim: chalk.hex('#484F58'),
  white: chalk.white,
  bold: chalk.bold,

  // Semantic
  primary: chalk.hex('#00FF41'),
  secondary: chalk.hex('#8B949E'),
  accent: chalk.hex('#00D4FF'),
  warning: chalk.hex('#FF6B35'),
  error: chalk.hex('#FF2D55'),
  success: chalk.hex('#00FF41'),
  info: chalk.hex('#00D4FF'),

  // Combined
  title: chalk.hex('#00FF41').bold,
  subtitle: chalk.hex('#8B949E'),
  highlight: chalk.hex('#00D4FF').bold,
  muted: chalk.hex('#484F58'),

  // Status indicators
  statusOn: chalk.hex('#00FF41')('◉'),
  statusOff: chalk.hex('#484F58')('○'),
  statusWarn: chalk.hex('#FF6B35')('◉'),
  statusError: chalk.hex('#FF2D55')('◉'),
  bullet: chalk.hex('#00FF41')('✦'),
  check: chalk.hex('#00FF41')('✓'),
  cross: chalk.hex('#FF2D55')('✗'),
  arrow: chalk.hex('#00D4FF')('❯'),
  warning_icon: chalk.hex('#FF6B35')('⚠'),
  lightning: chalk.hex('#FF6B35')('⚡'),
};

export function box(content: string, title?: string, width: number = 60): string {
  const lines = content.split('\n');
  const maxLen = Math.max(width - 4, ...lines.map(l => stripAnsi(l).length));
  const top = title
    ? `┌─ ${theme.title(title)} ${'─'.repeat(Math.max(0, maxLen - stripAnsi(title).length - 2))}┐`
    : `┌${'─'.repeat(maxLen + 2)}┐`;
  const bottom = `└${'─'.repeat(maxLen + 2)}┘`;

  const padded = lines.map(line => {
    const visible = stripAnsi(line).length;
    const pad = Math.max(0, maxLen - visible);
    return `│ ${line}${' '.repeat(pad)} │`;
  });

  return [top, ...padded, bottom].join('\n');
}

export function doubleBox(content: string, title?: string, width: number = 76): string {
  const lines = content.split('\n');
  const maxLen = Math.max(width - 4, ...lines.map(l => stripAnsi(l).length));
  const top = title
    ? `╔══ ${theme.title(title)} ${'═'.repeat(Math.max(0, maxLen - stripAnsi(title).length - 3))}╗`
    : `╔${'═'.repeat(maxLen + 2)}╗`;
  const bottom = `╚${'═'.repeat(maxLen + 2)}╝`;

  const padded = lines.map(line => {
    const visible = stripAnsi(line).length;
    const pad = Math.max(0, maxLen - visible);
    return `║ ${line}${' '.repeat(pad)} ║`;
  });

  return [top, ...padded, bottom].join('\n');
}

export function progressBar(progress: number, width: number = 20, filled = '■', empty = '░'): string {
  const filledCount = Math.round((progress / 100) * width);
  const emptyCount = width - filledCount;
  const bar = filled.repeat(filledCount) + empty.repeat(emptyCount);
  return theme.green(bar);
}

export function gradientBar(progress: number, width: number = 20): string {
  const filledCount = Math.round((progress / 100) * width);
  const emptyCount = width - filledCount;
  return theme.green('▓'.repeat(filledCount)) + theme.dim('░'.repeat(emptyCount));
}

export function separator(width: number = 76, char: string = '─'): string {
  return theme.border(char.repeat(width));
}

export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function matrixRain(width: number = 60, height: number = 5): string {
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  const lines: string[] = [];
  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.7) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        line += Math.random() > 0.5 ? theme.green(char) : theme.dim(char);
      } else {
        line += ' ';
      }
    }
    lines.push(line);
  }
  return lines.join('\n');
}
