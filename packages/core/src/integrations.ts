// PHANTOM Core - Integration detection and adapter baseline
import { existsSync } from 'fs';
import { join } from 'path';
import { getConfig, type IntegrationConfig } from './config.js';

export const KNOWN_INTEGRATION_TARGETS = [
  'github',
  'figma',
  'linear',
  'slack',
  'cursor',
  'vscode',
  'claude-code',
  'codex',
] as const;

export type IntegrationTarget = typeof KNOWN_INTEGRATION_TARGETS[number];

export interface IntegrationScanResult {
  target: IntegrationTarget;
  detected: boolean;
  detectedPath?: string;
  reason: string;
}

export interface IntegrationDoctorResult {
  target: IntegrationTarget;
  configured: boolean;
  connected: boolean;
  detected: boolean;
  healthy: boolean;
  reason: string;
  detectedPath?: string;
  configuredAt?: string;
}

type Detector = {
  path: string;
  reason: string;
};

export interface IntegrationAdapter {
  target: IntegrationTarget;
  detect(cwd: string): Detector | null;
  configure(cwd: string): IntegrationConfig;
  validate(cwd: string): IntegrationDoctorResult;
  rollback(): boolean;
}

function detectTarget(cwd: string, target: IntegrationTarget): Detector | null {
  switch (target) {
    case 'github': {
      const path = join(cwd, '.git');
      if (existsSync(path)) return { path, reason: 'git metadata found' };
      return null;
    }
    case 'vscode': {
      const path = join(cwd, '.vscode');
      if (existsSync(path)) return { path, reason: 'VS Code workspace settings found' };
      return null;
    }
    case 'cursor': {
      const path = join(cwd, '.cursor');
      if (existsSync(path)) return { path, reason: 'Cursor workspace settings found' };
      return null;
    }
    case 'claude-code': {
      const path = join(cwd, '.claude');
      if (existsSync(path)) return { path, reason: 'Claude config directory found' };
      return null;
    }
    case 'codex': {
      const path = join(cwd, '.codex');
      if (existsSync(path)) return { path, reason: 'Codex config directory found' };
      return null;
    }
    case 'linear': {
      const path = join(cwd, 'linear.json');
      if (existsSync(path)) return { path, reason: 'Linear config file found' };
      return null;
    }
    case 'figma': {
      const path = join(cwd, 'figma.json');
      if (existsSync(path)) return { path, reason: 'Figma config file found' };
      return null;
    }
    case 'slack': {
      const path = join(cwd, 'slack.json');
      if (existsSync(path)) return { path, reason: 'Slack config file found' };
      return null;
    }
  }
}

function buildAdapter(target: IntegrationTarget): IntegrationAdapter {
  return {
    target,
    detect(cwd: string) {
      return detectTarget(cwd, target);
    },
    configure(cwd: string) {
      const cfgMgr = getConfig();
      const cfg = cfgMgr.get();
      const detection = detectTarget(cwd, target);
      const now = new Date().toISOString();

      const nextIntegration: IntegrationConfig = {
        name: target,
        connected: true,
        detectedPath: detection?.path,
        lastConnectedAt: now,
        config: {
          target,
          configured_at: now,
          ...(detection ? { detected_path: detection.path } : {}),
        },
      };

      const existing = cfg.integrations.find(i => i.name === target);
      const next = existing
        ? cfg.integrations.map(i => (i.name === target ? { ...i, ...nextIntegration } : i))
        : [...cfg.integrations, nextIntegration];

      cfgMgr.set('integrations', next);
      return nextIntegration;
    },
    validate(cwd: string) {
      const cfg = getConfig().get();
      const configured = cfg.integrations.find(i => i.name === target);
      const detection = detectTarget(cwd, target);
      const detected = Boolean(detection);
      const connected = Boolean(configured?.connected);
      const healthy = connected && detected;

      let reason = 'Not configured';
      if (configured && !detection) reason = 'Configured but no workspace signal found';
      if (!configured && detection) reason = 'Detected but not configured';
      if (healthy) reason = 'Configured and detected';

      return {
        target,
        configured: Boolean(configured),
        connected,
        detected,
        healthy,
        reason,
        detectedPath: detection?.path || configured?.detectedPath,
        configuredAt: configured?.lastConnectedAt || configured?.config?.configured_at,
      };
    },
    rollback() {
      const cfgMgr = getConfig();
      const cfg = cfgMgr.get();
      const hasEntry = cfg.integrations.some(i => i.name === target);
      if (!hasEntry) return false;
      cfgMgr.set(
        'integrations',
        cfg.integrations.filter(i => i.name !== target)
      );
      return true;
    },
  };
}

const ADAPTERS: Record<IntegrationTarget, IntegrationAdapter> = {
  github: buildAdapter('github'),
  figma: buildAdapter('figma'),
  linear: buildAdapter('linear'),
  slack: buildAdapter('slack'),
  cursor: buildAdapter('cursor'),
  vscode: buildAdapter('vscode'),
  'claude-code': buildAdapter('claude-code'),
  codex: buildAdapter('codex'),
};

export function getAdapter(target: IntegrationTarget): IntegrationAdapter {
  return ADAPTERS[target];
}

export function scanIntegrations(cwd: string): IntegrationScanResult[] {
  return KNOWN_INTEGRATION_TARGETS.map((target) => {
    const detection = ADAPTERS[target].detect(cwd);
    if (!detection) {
      return {
        target,
        detected: false,
        reason: 'No workspace signal found',
      };
    }

    return {
      target,
      detected: true,
      detectedPath: detection.path,
      reason: detection.reason,
    };
  });
}

export function connectIntegration(target: IntegrationTarget, cwd: string): IntegrationConfig {
  return ADAPTERS[target].configure(cwd);
}

export function doctorIntegrations(cwd: string): IntegrationDoctorResult[] {
  return KNOWN_INTEGRATION_TARGETS.map(target => ADAPTERS[target].validate(cwd));
}

export function rollbackIntegration(target: IntegrationTarget): boolean {
  return ADAPTERS[target].rollback();
}

export function isKnownIntegrationTarget(value: string): value is IntegrationTarget {
  return KNOWN_INTEGRATION_TARGETS.includes(value as IntegrationTarget);
}
