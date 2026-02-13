import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PhantomMCPServer } from '../packages/mcp-server/dist/index.js';

const TMP_DIR = join(process.cwd(), '.tmp-mcp-contract');
mkdirSync(TMP_DIR, { recursive: true });
writeFileSync(join(TMP_DIR, 'sample.txt'), 'phantom mcp contract fixture');

test('mcp tools list includes required contracts', () => {
  const server = new PhantomMCPServer();
  const names = server.listTools().map(tool => tool.name).sort();
  assert.deepEqual(names, [
    'bridge.translate_pm_to_dev',
    'context.add',
    'context.search',
    'prd.generate',
    'swarm.analyze',
  ]);
});

test('mcp resources list/read works', () => {
  const server = new PhantomMCPServer();
  const resources = server.listResources();
  assert.equal(resources.length >= 3, true);
  const status = server.readResource('phantom://status/summary');
  assert.equal(typeof status, 'object');
});

test('mcp context.add and context.search contracts', async () => {
  const server = new PhantomMCPServer();

  const addResponse = await server.invoke({
    tool: 'context.add',
    request_id: 'ctx-add',
    arguments: { path: TMP_DIR },
  });
  assert.equal(addResponse.status, 'ok');

  const searchResponse = await server.invoke({
    tool: 'context.search',
    request_id: 'ctx-search',
    arguments: { query: 'contract', limit: 5 },
  });
  assert.equal(searchResponse.status, 'ok');
  assert.equal(Array.isArray(searchResponse.result.matches), true);
});

test('mcp prd.generate contract', async () => {
  const server = new PhantomMCPServer();
  const response = await server.invoke({
    tool: 'prd.generate',
    request_id: 'prd-generate',
    arguments: { title: 'MCP Contract Coverage' },
  });
  assert.equal(response.status, 'ok');
  assert.equal(typeof response.result.prd_id, 'string');
});

test('mcp swarm.analyze contract', async () => {
  const server = new PhantomMCPServer();
  const response = await server.invoke({
    tool: 'swarm.analyze',
    request_id: 'swarm-analyze',
    arguments: { question: 'Should we add dark mode?' },
  });
  assert.equal(response.status, 'ok');
  assert.equal(typeof response.result.swarm_result.consensus, 'string');
});

test('mcp bridge.translate_pm_to_dev contract', async () => {
  const server = new PhantomMCPServer();
  const response = await server.invoke({
    tool: 'bridge.translate_pm_to_dev',
    request_id: 'bridge',
    arguments: { pm_intent: 'Improve checkout conversion' },
  });
  assert.equal(response.status, 'ok');
  assert.equal(Array.isArray(response.result.technical_tasks), true);
});

test('mcp invalid argument returns typed error', async () => {
  const server = new PhantomMCPServer();
  const response = await server.invoke({
    tool: 'context.add',
    request_id: 'invalid',
    arguments: {},
  });
  assert.equal(response.status, 'error');
  assert.equal(response.errors[0].code, 'INVALID_ARGUMENT');
});
