import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

function createRpcClient(proc) {
  let buffer = '';
  const inbox = [];
  const waiters = [];

  proc.stdout.setEncoding('utf8');
  proc.stdout.on('data', chunk => {
    buffer += chunk;
    while (true) {
      const idx = buffer.indexOf('\n');
      if (idx < 0) break;
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;

      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }

      inbox.push(message);
      while (waiters.length > 0) {
        const waiter = waiters.shift();
        waiter();
      }
    }
  });

  async function waitFor(predicate, timeoutMs = 5000) {
    const startedAt = Date.now();
    while (true) {
      const match = inbox.find(predicate);
      if (match) return match;
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error('Timed out waiting for JSON-RPC response');
      }
      await new Promise(resolve => waiters.push(resolve));
    }
  }

  return {
    async request(payload) {
      proc.stdin.write(`${JSON.stringify(payload)}\n`);
      return waitFor(msg => msg && msg.id === payload.id);
    },
  };
}

test('mcp stdio server supports initialize/list/call/read flow', async t => {
  const home = join(process.cwd(), '.tmp-mcp-stdio');
  const proc = spawn(process.execPath, ['packages/cli/dist/index.js', 'mcp', 'serve'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PHANTOM_HOME: home,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  t.after(() => {
    if (!proc.killed) proc.kill('SIGTERM');
  });

  const client = createRpcClient(proc);

  const initialize = await client.request({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '0.0.1' },
    },
  });

  assert.equal(initialize.jsonrpc, '2.0');
  assert.equal(initialize.id, 1);
  assert.equal(typeof initialize.result.protocolVersion, 'string');
  assert.equal(typeof initialize.result.serverInfo.name, 'string');

  const toolsList = await client.request({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  });

  assert.equal(Array.isArray(toolsList.result.tools), true);
  const names = toolsList.result.tools.map(tool => tool.name);
  assert.equal(names.includes('context.search'), true);
  assert.equal(names.includes('phantom_plan_sprint'), true);

  const toolCall = await client.request({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'phantom_plan_sprint',
      arguments: { velocity: 13, priorities: ['stability', 'delivery'] },
    },
  });

  assert.equal(toolCall.result.isError, false);
  assert.equal(typeof toolCall.result.structuredContent, 'object');

  const resourceRead = await client.request({
    jsonrpc: '2.0',
    id: 4,
    method: 'resources/read',
    params: { uri: 'phantom://status/summary' },
  });

  assert.equal(Array.isArray(resourceRead.result.contents), true);
  assert.equal(resourceRead.result.contents.length > 0, true);
  const parsed = JSON.parse(resourceRead.result.contents[0].text);
  assert.equal(typeof parsed.version, 'string');
});
