import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { TranscriptParser } from './parser.js';
import { InterviewStorage } from './storage.js';
// Mock AIManager before importing analyzer
// This is hard without a loader. 
// Instead, we will test Parser and Storage directly first.

describe('Interview Analyzer Unit Tests', () => {
    const testFile = 'test-transcript.txt';
    const testContent = 'Interviewer: Hello\nInterviewee: I have a problem with X.';

    before(async () => {
        await writeFile(testFile, testContent);
    });

    after(async () => {
        try {
            await unlink(testFile);
        } catch (e) { }
    });

    describe('TranscriptParser', () => {
        it('should parse a text file', async () => {
            const parser = new TranscriptParser();
            const result = await parser.parseFile(testFile);
            assert.strictEqual(result.transcript, testContent);
            assert.ok(result.metadata.date);
        });
    });

    describe('InterviewStorage', () => {
        it('should save and retrieve insights using in-memory DB', () => {
            const storage = new InterviewStorage(':memory:');
            const mockInsights = {
                id: 'test-1',
                summary: 'Test summary',
                pain_points: [{ description: 'Pain 1', severity: 5, frequency: 1, quotes: [] }],
                jobs_to_be_done: [],
                themes: [],
                quotes: []
            };

            storage.save(mockInsights);
            const retrieved = storage.get('test-1');
            assert.deepStrictEqual(retrieved, mockInsights);
        });
    });
});
