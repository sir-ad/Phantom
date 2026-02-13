import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const CLI = ['packages/cli/dist/index.js'];
const PHANTOM_HOME = join(process.cwd(), '.tmp-phantom-home');

function runCli(args) {
  return spawnSync(process.execPath, [...CLI, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PHANTOM_HOME,
    },
  });
}

test('cli --help exits cleanly', () => {
  const result = runCli(['--help']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /Usage: phantom/i);
});

test('cli --version exits cleanly', () => {
  const result = runCli(['--version']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /1\.0\.0/);
});

test('cli doctor command exits cleanly', () => {
  const result = runCli(['doctor']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /PHANTOM DOCTOR/i);
});

test('cli status --json returns valid payload', () => {
  const result = runCli(['status', '--json']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);

  const payload = JSON.parse(result.stdout);
  assert.equal(typeof payload.version, 'string');
  assert.equal(typeof payload.firstRun, 'boolean');
  assert.ok(Array.isArray(payload.installedModules));
  assert.ok(Array.isArray(payload.integrations));
});

test('cli integrate scan exits cleanly', () => {
  const result = runCli(['integrate', 'scan']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /INTEGRATION SCAN|No integrations detected/i);
});

test('cli integrate doctor exits cleanly', () => {
  const result = runCli(['integrate', 'doctor']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /INTEGRATION DOCTOR/i);
});

test('cli mcp tools exits cleanly', () => {
  const result = runCli(['mcp', 'tools']);
  assert.equal(result.status, 0, `expected exit code 0, got ${result.status}\n${result.stderr}`);
  assert.match(result.stdout, /MCP TOOLS/i);
  assert.match(result.stdout, /context\.add/i);
});
