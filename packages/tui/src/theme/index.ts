// PHANTOM TUI - Matrix Theme
import chalk from 'chalk';

// Exact color palette from specification
export const PHANTOM_THEME = {
  // Background layers
  bg: {
    primary: '#0D1117',    // Deep space black (main background)
    secondary: '#161B22',  // Darker container backgrounds
    tertiary: '#21262D',   // Subtle borders/dividers
    overlay: '#1A1E24',    // Modal/popup backgrounds
  },
  
  // Text hierarchy
  text: {
    primary: '#E6EDF3',    // Clean white (main content)
    secondary: '#8B949E',  // Ghost gray (secondary text)
    muted: '#6E7681',      // Subtle text (hints, placeholders)
    dim: '#484F58',        // Very dim (disabled states)
  },
  
  // Brand colors (Matrix-Cyberpunk)
  brand: {
    matrixGreen: '#00FF41',   // Primary brand (Matrix green)
    phantomOrange: '#FF6B35', // Warnings/highlights
    cyberBlue: '#00D4FF',     // Links/actions
    neonRed: '#FF2D55',       // Critical/errors
    ghostWhite: '#F0F6FC',    // Emphasis text
  },
  
  // Semantic colors
  semantic: {
    success: '#00FF41',    // Matrix green
    warning: '#FF6B35',    // Phantom orange
    error: '#FF2D55',      // Neon red
    info: '#00D4FF',       // Cyber blue
  },
  
  // Interactive states
  interactive: {
    hover: '#1A3A2A',      // Dark green highlight
    active: '#00FF41',     // Matrix green
    focus: '#00D4FF',      // Cyber blue
    disabled: '#484F58',   // Dim gray
  },
  
  // Special effects
  effects: {
    glow: '#00FF4140',         // Matrix green with 25% opacity
    glowStrong: '#00FF4180',   // Matrix green with 50% opacity
    shadow: '#00000080',       // Black with 50% opacity
    glassMorph: '#16161680',   // Dark glass effect
  },
} as const;

// Typography system
export const PHANTOM_FONTS = {
  // Font families
  families: {
    display: 'JetBrains Mono',     // ASCII art, logos, headers
    mono: 'Fira Code',             // Code, commands, technical
    body: 'Inter',                 // Regular text (fallback)
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  // Font sizes (in pixels for terminal)
  sizes: {
    xs: 10,    // Tiny hints
    sm: 12,    // Small labels
    base: 14,  // Default text
    lg: 16,    // Emphasized text
    xl: 20,    // Section headers
    '2xl': 24, // Large headers
    '3xl': 32, // ASCII logo
  },
  
  // Font weights
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Enhanced theme with exact specification colors
export const theme = {
  // Colors (using exact hex values from spec)
  green: chalk.hex('#00FF41'),
  ghostGray: chalk.hex('#8B949E'),
  orange: chalk.hex('#FF6B35'),
  cyan: chalk.hex('#00D4FF'),
  red: chalk.hex('#FF2D55'),
  border: chalk.hex('#21262D'),
  dim: chalk.hex('#484F58'),
  white: chalk.hex('#E6EDF3'),
  bold: chalk.bold,

  // Semantic (using exact specification)
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

// ASCII Logo constants from specification
export const PHANTOM_LOGO_ASCII = `
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
`;

export const PHANTOM_LOGO_SMALL = `
 ▄▄▄· ██   ██   ▄▄▄· ▐ ▄ ▄▄▄▄▄      • ▌ ▄ ·.
▐█ ▄█▐█ ▀. ▐█ ▀.▐█ ▀█ •█▌▐█•██  ▄█▀▄ ·██ ▐███▪
 ██▀·▄▀▀▀█▄▄▀▀▀█▄▄█▀▀█▐█▐▐▌ ▐█.▪▐█▌.▐▌▐█ ▌▐▌▐█·
▐█▪·•▐█▄▪▐█▐█▄▪▐█▐█ ▪▐▌██▐█▌ ▐█▌·▐█▌.▐▌██ ██▌▐█▌
.▀    ▀▀▀▀  ▀▀▀▀  ▀  ▀ ▀▀ █▪ ▀▀▀  ▀█▄▀▪▀▀  █▪▀▀▀
`;

// Enhanced Matrix rain with specification characters
export function matrixRain(width: number = 60, height: number = 5): string {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
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

// Animated Matrix rain effect
export function animatedMatrixRain(frames: number = 10, width: number = 60, height: number = 3): string[] {
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
  const animations: string[] = [];
  
  for (let frame = 0; frame < frames; frame++) {
    const lines: string[] = [];
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        // Animate by changing probability based on frame
        const intensity = 0.3 + (Math.sin(frame * 0.5 + x * 0.1) * 0.2);
        if (Math.random() > (1 - intensity)) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          line += theme.green(char);
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }
    animations.push(lines.join('\n'));
  }
  
  return animations;
}
