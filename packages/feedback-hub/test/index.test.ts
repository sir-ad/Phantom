import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { FeedbackCollectorFactory, SlackCollector } from '../src/collector.js';
import { FeedbackStorage } from '../src/storage.js';

describe('Feedback Hub Unit Tests', () => {

    describe('Collector Factory', () => {
        it('should create a Slack collector', () => {
            const collector = FeedbackCollectorFactory.create({
                type: 'slack',
                config: { channel_id: 'C123' }
            });
            assert.ok(collector instanceof SlackCollector);
            assert.strictEqual(collector.type, 'slack');
        });

        it('should throw for unknown collector type', () => {
            assert.throws(() => {
                FeedbackCollectorFactory.create({
                    type: 'unknown' as any,
                    config: {}
                });
            }, /Unsupported collector type/);
        });
    });

    describe('FeedbackStorage', () => {
        it('should save and retrieve feedback items', () => {
            const storage = new FeedbackStorage(':memory:');
            const mockItems = [
                {
                    id: 'fb_1',
                    source: 'slack' as const,
                    content: 'Great app',
                    author: 'User A',
                    timestamp: new Date().toISOString(),
                    metadata: {}
                }
            ];

            storage.saveFeedback(mockItems);
            const retrieved = storage.getAllFeedback();

            assert.strictEqual(retrieved.length, 1);
            assert.strictEqual(retrieved[0].content, 'Great app');
        });
    });
});
