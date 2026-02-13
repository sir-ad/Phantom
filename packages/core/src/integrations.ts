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

export function scanIntegrations(cwd: string): IntegrationScanResult[] {
  return KNOWN_INTEGRATION_TARGETS.map((target) => {
    const detection = detectTarget(cwd, target);
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
  let next: IntegrationConfig[];
  if (existing) {
    next = cfg.integrations.map(i => (i.name === target ? { ...i, ...nextIntegration } : i));
  } else {
    next = [...cfg.integrations, nextIntegration];
  }

  cfgMgr.set('integrations', next);
  return nextIntegration;
}

export function doctorIntegrations(cwd: string): IntegrationDoctorResult[] {
  const cfg = getConfig().get();
  const byName = new Map(cfg.integrations.map(i => [i.name, i]));

  return KNOWN_INTEGRATION_TARGETS.map((target) => {
    const configured = byName.get(target);
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
  });
}

export function isKnownIntegrationTarget(value: string): value is IntegrationTarget {
  return KNOWN_INTEGRATION_TARGETS.includes(value as IntegrationTarget);
}
