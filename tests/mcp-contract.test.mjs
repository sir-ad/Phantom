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
  const required = [
    'bridge.translate_pm_to_dev',
    'context.add',
    'context.search',
    'phantom_analyze_product',
    'phantom_create_stories',
    'phantom_generate_prd',
    'phantom_plan_sprint',
    'phantom_swarm_analyze',
  ];

  for (const tool of required) {
    assert.equal(names.includes(tool), true, `missing required MCP tool: ${tool}`);
  }
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

test('mcp phantom_generate_prd contract', async () => {
  const server = new PhantomMCPServer();
  const response = await server.invoke({
    tool: 'phantom_generate_prd',
    request_id: 'prd-generate',
    arguments: { featureName: 'MCP Contract Coverage' },
  });
  assert.equal(response.status, 'ok');
  assert.equal(typeof response.result, 'object');
});

test('mcp phantom_swarm_analyze contract', async () => {
  const server = new PhantomMCPServer();
  const response = await server.invoke({
    tool: 'phantom_swarm_analyze',
    request_id: 'swarm-analyze',
    arguments: { question: 'Should we add dark mode?' },
  });
  assert.equal(response.status, 'ok');
  assert.equal(typeof response.result, 'object');
});

test('mcp legacy alias tools still work', async () => {
  const server = new PhantomMCPServer();

  const prdResponse = await server.invoke({
    tool: 'prd.generate',
    request_id: 'legacy-prd',
    arguments: { title: 'Legacy PRD Contract' },
  });
  assert.equal(prdResponse.status, 'ok');

  const swarmResponse = await server.invoke({
    tool: 'swarm.analyze',
    request_id: 'legacy-swarm',
    arguments: { question: 'Legacy swarm contract check' },
  });
  assert.equal(swarmResponse.status, 'ok');
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
