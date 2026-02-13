import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const CLI = ['packages/cli/dist/index.js'];
const PHANTOM_HOME = join(process.cwd(), '.tmp-phantom-home-reality');
const TMP_DIR = join(process.cwd(), '.tmp-test-artifacts');
const SCREEN_FILE = join(TMP_DIR, 'screen.png');

mkdirSync(TMP_DIR, { recursive: true });
writeFileSync(SCREEN_FILE, 'not-a-real-png-but-valid-file');

function runCli(args) {
  return spawnSync(process.execPath, [...CLI, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PHANTOM_HOME,
    },
  });
}

test('runtime paths contain no demo markers', () => {
  const files = [
    'packages/cli/src/index.tsx',
    'packages/core/src/agents.ts',
    'packages/core/src/runtime.ts',
  ];
  const forbiddenPatterns = [
    /Demo Mode/i,
    /illustrative/i,
    /getExampleNudges/,
    /getExampleScreenAnalysis/,
    /getExampleUXAudit/,
    /Math\.random/,
  ];

  for (const file of files) {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(source),
        false,
        `Forbidden pattern ${pattern} found in ${file}`
      );
    }
  }
});

test('cli help does not expose demo command', () => {
  const result = runCli(['--help']);
  assert.equal(result.status, 0, `help failed: ${result.stderr}`);
  assert.equal(/\bdemo\b/i.test(result.stdout), false, 'demo command must not be present');
});

test('swarm output is deterministic for identical input', () => {
  const first = runCli(['swarm', 'Should we add dark mode?', '--json']);
  const second = runCli(['swarm', 'Should we add dark mode?', '--json']);
  assert.equal(first.status, 0, `first call failed: ${first.stderr}`);
  assert.equal(second.status, 0, `second call failed: ${second.stderr}`);
  assert.deepEqual(JSON.parse(first.stdout), JSON.parse(second.stdout));
});

test('simulate output is deterministic for identical input', () => {
  const first = runCli(['simulate', 'Wishlist launch', '--json']);
  const second = runCli(['simulate', 'Wishlist launch', '--json']);
  assert.equal(first.status, 0, `first call failed: ${first.stderr}`);
  assert.equal(second.status, 0, `second call failed: ${second.stderr}`);
  assert.deepEqual(JSON.parse(first.stdout), JSON.parse(second.stdout));
});

test('screen analyze --json returns evidence-based payload', () => {
  const result = runCli(['screen', 'analyze', SCREEN_FILE, '--json']);
  assert.equal(result.status, 0, `screen analyze failed: ${result.stderr}`);
  const payload = JSON.parse(result.stdout);
  assert.equal(typeof payload.filename, 'string');
  assert.equal(typeof payload.score, 'number');
  assert.ok(Array.isArray(payload.issues));
  assert.ok(Array.isArray(payload.recommendations));
});
