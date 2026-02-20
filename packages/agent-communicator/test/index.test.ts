import { describe, it } from 'node:test';
import assert from 'node:assert';
import { IntentRouter } from '../src/router.js';
import { Executor } from '../src/executor.js';

describe('Agent Communicator Unit Tests', () => {

    describe('Executor', () => {
        it('should dispatch interview analysis command', async () => {
            let called = false;
            const mockModules = {
                runInterviewAnalyzer: async (args: any) => {
                    called = true;
                    assert.strictEqual(args.file, 'test.txt');
                    return { success: true };
                }
            };

            const executor = new Executor(mockModules);
            await executor.execute({
                category: 'command',
                targetModule: 'interview',
                action: 'analyze',
                confidence: 0.9,
                parameters: { file: 'test.txt' }
            });

            assert.ok(called);
        });

        it('should handle low confidence', async () => {
            const executor = new Executor({});
            const result = await executor.execute({
                category: 'unknown',
                confidence: 0.5,
                targetModule: 'interview'
            });
            assert.ok(result.message.includes('not sure'));
        });
    });
});
