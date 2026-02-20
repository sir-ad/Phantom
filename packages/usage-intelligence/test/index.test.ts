import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UsageStorage } from '../src/storage.js';
import { UsageTracker } from '../src/tracker.js';
import { UsageAggregator } from '../src/aggregator.js';

describe('Usage Intelligence Unit Tests', () => {

    describe('UsageStorage', () => {
        it('should save and retrieve events', () => {
            const storage = new UsageStorage(':memory:');
            const event = {
                id: 'evt_1',
                event_name: 'test_event',
                user_id: 'user_1',
                timestamp: new Date().toISOString(),
                properties: { clicked: true },
                context: {}
            };

            storage.saveEvent(event);
            const retrieved = storage.getEvents({ name: 'test_event' });
            assert.strictEqual(retrieved.length, 1);
            assert.strictEqual(retrieved[0].id, 'evt_1');
            assert.deepStrictEqual(retrieved[0].properties, { clicked: true });
        });
    });

    describe('UsageTracker', () => {
        it('should track events with generated IDs', () => {
            const storage = new UsageStorage(':memory:');
            const tracker = new UsageTracker(storage);

            tracker.track({
                event_name: 'signup',
                user_id: 'new_user'
            });

            const events = storage.getEvents();
            assert.strictEqual(events.length, 1);
            assert.strictEqual(events[0].event_name, 'signup');
            assert.ok(events[0].id.startsWith('evt_'));
        });
    });

    describe('UsageAggregator', () => {
        it('should calculate daily active users', () => {
            const storage = new UsageStorage(':memory:');
            const aggregator = new UsageAggregator(storage);
            const today = new Date().toISOString().split('T')[0];

            // Add 3 events from 2 distinct users
            const tracker = new UsageTracker(storage);
            tracker.track({ event_name: 'login', user_id: 'u1' });
            tracker.track({ event_name: 'view', user_id: 'u1' });
            tracker.track({ event_name: 'login', user_id: 'u2' });

            aggregator.aggregateDailyActiveUsers(today);

            const metrics = storage.getMetrics('active_users', today);
            assert.strictEqual(metrics.length, 1);
            assert.strictEqual(metrics[0].value, 2); // u1 and u2
        });
    });

});
