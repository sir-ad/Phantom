import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import type { DetectionEvidence, DiscoveryIssue } from './types.js';

export interface ProcessMatch {
  pid: number;
  command: string;
  executable: string;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function detectFilesystemSignals(cwd: string, signals: string[], additionalPaths: string[]): DetectionEvidence[] {
  const evidence: DetectionEvidence[] = [];
  const roots = new Set<string>();

  let current = resolve(cwd);
  roots.add(current);
  while (true) {
    const next = resolve(current, '..');
    if (next === current) break;
    roots.add(next);
    current = next;
  }

  if (process.env.HOME) {
    roots.add(process.env.HOME);
  }

  for (const extra of additionalPaths) {
    roots.add(resolve(extra));
  }

  for (const signal of signals) {
    for (const root of roots) {
      const candidate = signal.startsWith('/') ? signal : join(root, signal);
      if (existsSync(candidate)) {
        evidence.push({
          provider: 'filesystem',
          detail: candidate,
          confidenceWeight: 1,
        });
      }
    }
  }

  return unique(evidence.map(item => item.detail)).map(detail => ({
    provider: 'filesystem',
    detail,
    confidenceWeight: 1,
  }));
}

function parseUnixProcesses(output: string): ProcessMatch[] {
  const matches: ProcessMatch[] = [];
  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const firstSpace = trimmed.indexOf(' ');
    if (firstSpace <= 0) continue;
    const pidRaw = trimmed.slice(0, firstSpace).trim();
    const command = trimmed.slice(firstSpace + 1).trim();
    const pid = Number.parseInt(pidRaw, 10);
    if (!Number.isFinite(pid) || !command) continue;
    const executable = command.split(/\s+/)[0] || command;
    matches.push({ pid, command, executable });
  }
  return matches;
}

function parseWindowsProcesses(output: string): ProcessMatch[] {
  const matches: ProcessMatch[] = [];
  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes('"')) continue;
    const cols = trimmed.split('","').map(item => item.replace(/^"|"$/g, ''));
    if (cols.length < 2) continue;
    const executable = cols[0];
    const pid = Number.parseInt(cols[1], 10);
    if (!Number.isFinite(pid)) continue;
    matches.push({ pid, command: executable, executable });
  }
  return matches;
}

export function detectProcessSignals(
  patterns: RegExp[],
  exclusions: RegExp[],
  timeoutMs: number
): { evidence: DetectionEvidence[]; issues: DiscoveryIssue[]; matches: ProcessMatch[] } {
  const issues: DiscoveryIssue[] = [];
  const matches: ProcessMatch[] = [];

  try {
    if (process.platform === 'win32') {
      const output = execSync('tasklist /fo csv /v', {
        encoding: 'utf8',
        timeout: timeoutMs,
      });
      matches.push(...parseWindowsProcesses(output));
    } else {
      const output = execSync('ps ax -o pid=,command=', {
        encoding: 'utf8',
        timeout: timeoutMs,
      });
      matches.push(...parseUnixProcesses(output));
    }
  } catch (error) {
    issues.push({
      level: 'warn',
      code: 'PROCESS_SCAN_FAILED',
      message: error instanceof Error ? error.message : 'Process scan failed',
    });
    return { evidence: [], issues, matches: [] };
  }

  const evidence: DetectionEvidence[] = [];
  for (const match of matches) {
    const blocked = exclusions.some(rule => rule.test(match.command));
    if (blocked) continue;
    for (const pattern of patterns) {
      if (pattern.test(match.command)) {
        evidence.push({
          provider: 'process',
          detail: `${match.pid}:${match.command}`,
          confidenceWeight: 1,
          metadata: {
            pid: match.pid,
            command: match.command,
            executable: match.executable,
          },
        });
      }
    }
  }

  return { evidence, issues, matches };
}

export function detectEnvSignals(signals: Array<string | RegExp>, additionalSignals: Array<string | RegExp>): DetectionEvidence[] {
  const allSignals = [...signals, ...additionalSignals];
  const keys = Object.keys(process.env);
  const evidence: DetectionEvidence[] = [];

  for (const signal of allSignals) {
    const regex = typeof signal === 'string' ? new RegExp(`^${signal}`) : signal;
    for (const key of keys) {
      if (regex.test(key) && process.env[key]) {
        evidence.push({
          provider: 'env',
          detail: key,
          confidenceWeight: 1,
        });
      }
    }
  }

  return unique(evidence.map(item => item.detail)).map(detail => ({
    provider: 'env',
    detail,
    confidenceWeight: 1,
  }));
}

function getBinaryVersion(binary: string, timeoutMs: number): string | null {
  const commands = [
    `${binary} --version`,
    `${binary} -v`,
  ];

  for (const command of commands) {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: timeoutMs,
      });
      const match = output.match(/(\d+\.\d+(?:\.\d+)?)/);
      if (match) return `${binary}@${match[1]}`;
      if (output.trim()) return `${binary}@unknown`;
    } catch {
      // continue
    }
  }

  return null;
}

export function detectBinarySignals(binaries: string[], timeoutMs: number): { evidence: DetectionEvidence[]; versions: string[] } {
  const whichCmd = process.platform === 'win32' ? 'where' : 'which';
  const evidence: DetectionEvidence[] = [];
  const versions: string[] = [];

  for (const binary of binaries) {
    try {
      const path = execSync(`${whichCmd} ${binary}`, {
        encoding: 'utf8',
        timeout: timeoutMs,
      }).split('\n')[0].trim();

      if (!path) continue;
      evidence.push({
        provider: 'binary',
        detail: path,
        confidenceWeight: 1,
        metadata: { binary },
      });

      const version = getBinaryVersion(binary, timeoutMs);
      if (version) {
        versions.push(version);
      }
    } catch {
      // binary not found
    }
  }

  return { evidence, versions: unique(versions) };
}

export function detectAppSignals(appPaths: Partial<Record<NodeJS.Platform, string[]>>): DetectionEvidence[] {
  const platformPaths = appPaths[process.platform] || [];
  const evidence: DetectionEvidence[] = [];

  for (const appPath of platformPaths) {
    if (existsSync(appPath)) {
      evidence.push({
        provider: 'app',
        detail: appPath,
        confidenceWeight: 1,
      });
    }
  }

  return evidence;
}
