import { describe, it } from 'node:test';
import assert from 'node:assert';
import { OpportunityScorer } from '../src/scorer.js';
import { DiscoveryStorage } from '../src/storage.js';

describe('Discovery Loop Unit Tests', () => {

    describe('OpportunityScorer', () => {
        it('should calculate RICE score correctly', () => {
            const scorer = new OpportunityScorer({ framework: 'RICE' });
            const score = scorer.calculateScore({
                reach: 1000,
                impact: 3,
                confidence: 80, // 0.8
                effort: 4
            });
            // (1000 * 3 * 0.8) / 4 = 2400 / 4 = 600
            assert.strictEqual(score, 600);
        });

        it('should calculate ICE score correctly', () => {
            const scorer = new OpportunityScorer({ framework: 'ICE' });
            const score = scorer.calculateScore({
                impact: 8,
                confidence: 8,
                effort: 2 // Ease = 10 - 2 = 8
            });
            // (8 * 8 * 8) / 3 = 512 / 3 = 170.66...
            assert.ok(score > 170 && score < 171);
        });
    });

    describe('DiscoveryStorage', () => {
        it('should save and retrieve opportunities', () => {
            const storage = new DiscoveryStorage(':memory:');
            const opp = {
                id: 'opp_1',
                title: 'Test Opp',
                description: 'Desc',
                score: 100,
                framework: 'RICE' as const,
                components: { reach: 100 },
                sources: {},
                status: 'new' as const,
                created_at: new Date().toISOString()
            };

            storage.saveOpportunity(opp);
            const retrieved = storage.getAllOpportunities();
            assert.strictEqual(retrieved.length, 1);
            assert.strictEqual(retrieved[0].title, 'Test Opp');
        });
    });
});
