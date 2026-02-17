import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';

process.env.PHANTOM_HOME = join(process.cwd(), '.tmp-module-runtime-home');

const core = await import('../packages/core/dist/index.js');

function getManager() {
  return core.getModuleManager();
}

test('module runtime dispatch executes experiment sample-size command', async () => {
  const manager = getManager();

  const result = await manager.executeCommand('experiment-lab', 'experiment sample-size', {
    baseline: 0.2,
    mde: 0.05,
    confidence: 0.95,
    power: 0.8,
    _: ['sample-size'],
  });

  assert.equal(result.success, true);
  assert.equal(typeof result.calculation.sampleSize, 'number');
  assert.equal(result.calculation.sampleSize > 0, true);
});

test('module runtime aliases resolve for time-machine commands', async () => {
  const manager = getManager();

  const snapshot = await manager.executeCommand('time-machine', 'timemachine snapshot', {
    name: 'Runtime Snapshot',
    description: 'Created during module runtime test',
    _: ['snapshot'],
  });

  assert.equal(snapshot.success, true);
  assert.equal(typeof snapshot.snapshot.id, 'string');

  const listed = await manager.executeCommand('time-machine', 'time-machine list', {
    _: ['list'],
  });

  assert.equal(listed.success, true);
  assert.equal(Array.isArray(listed.snapshots), true);
  assert.equal(typeof listed.count, 'number');
  assert.equal(listed.count >= 1, true);
});
