import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  DefaultDiscoveryEngine,
  DEFAULT_DISCOVERY_CONFIG_V2,
} from '../packages/core/dist/discovery/index.js';

const CLI = ['packages/cli/dist/index.js'];

function runCli(args, phantomHome) {
  return spawnSync(process.execPath, [...CLI, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PHANTOM_HOME: phantomHome,
    },
  });
}

test('discovery confidence uses matched weight over total possible weight', async () => {
  const root = mkdtempSync(join(tmpdir(), 'phantom-discovery-'));
  mkdirSync(join(root, '.test-agent-signal'), { recursive: true });

  const target = {
    id: 'test-agent',
    name: 'Test Agent',
    filesystemSignals: ['.test-agent-signal'],
    envSignals: ['TEST_AGENT_'],
    weights: {
      filesystem: 6,
      env: 4,
    },
  };

  const engine = new DefaultDiscoveryEngine([target], root, {
    ...DEFAULT_DISCOVERY_CONFIG_V2,
    checkProcesses: false,
    confidenceThreshold: 1,
  });

  const { detected } = await engine.scan();
  assert.equal(detected.length, 1);
  assert.equal(detected[0].confidence, 60);
  assert.equal(detected[0].status, 'installed');
});

test('discovery reaches 100 confidence when all configured signals match', async () => {
  const root = mkdtempSync(join(tmpdir(), 'phantom-discovery-'));
  mkdirSync(join(root, '.test-agent-signal'), { recursive: true });
  process.env.TEST_AGENT_TOKEN = 'present';

  try {
    const target = {
      id: 'test-agent',
      name: 'Test Agent',
      filesystemSignals: ['.test-agent-signal'],
      envSignals: ['TEST_AGENT_'],
      weights: {
        filesystem: 6,
        env: 4,
      },
    };

    const engine = new DefaultDiscoveryEngine([target], root, {
      ...DEFAULT_DISCOVERY_CONFIG_V2,
      checkProcesses: false,
      confidenceThreshold: 1,
    });

    const { detected } = await engine.scan();
    assert.equal(detected.length, 1);
    assert.equal(detected[0].confidence, 100);
  } finally {
    delete process.env.TEST_AGENT_TOKEN;
  }
});

test('cli agents scan --json includes detected/registered/health/issues fields', () => {
  const phantomHome = join(process.cwd(), '.tmp-agent-discovery-json');
  const result = runCli(['agents', 'scan', '--json'], phantomHome);
  assert.equal(result.status, 0, `exit=${result.status}\n${result.stderr}`);

  const payload = JSON.parse(result.stdout);
  assert.equal(Array.isArray(payload.detected), true);
  assert.equal(Array.isArray(payload.registered), true);
  assert.equal(typeof payload.health, 'object');
  assert.equal(Array.isArray(payload.issues), true);
});
