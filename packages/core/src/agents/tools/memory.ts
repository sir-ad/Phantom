import { MemoryManager } from '@phantom-pm/memory';
import { getConfig } from '../../config.js';

let memoryManagerInstance: MemoryManager | null = null;

export const getMemoryManager = async () => {
    if (!memoryManagerInstance) {
        const config = getConfig().get();
        // Default to enabled if not explicitly disabled
        const enabled = config.memory?.enabled ?? true;

        memoryManagerInstance = new MemoryManager({
            basePath: '.phantom/memory',
            enabled
        });
        await memoryManagerInstance.initialize();
    }
    return memoryManagerInstance;
};

// Tool Definitions
export const memoryTools = {
    remember_decision: {
        name: 'remember_decision',
        description: 'Log a key architectural or product decision to persistent memory.',
        parameters: {
            title: { type: 'string', description: 'Brief title of the decision' },
            content: { type: 'string', description: 'Detailed explanation of what was decided and why.' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Relevant tags (e.g. "architecture", "database")' }
        },
        handler: async (args: { title: string, content: string, tags?: string[] }) => {
            const manager = await getMemoryManager();
            const date = new Date().toISOString().split('T')[0];
            const entry = `## ${date}: ${args.title}\n\n${args.content}\n\nTags: ${args.tags?.join(', ') || 'none'}`;
            await manager.appendToEntry('decisions.md', entry);
            return `Decision logged to decisions.md`;
        }
    },

    recall_context: {
        name: 'recall_context',
        description: 'Read the active project context and recent decisions.',
        parameters: {},
        handler: async () => {
            const manager = await getMemoryManager();
            const context = await manager.readEntry('active_context.md');
            const decisions = await manager.readEntry('decisions.md');

            return `## Active Context\n${context?.content || 'None'}\n\n## Recent Decisions\n${decisions?.content || 'None'}`;
        }
    },

    update_context: {
        name: 'update_context',
        description: 'Update the active project context (current goals, blockers).',
        parameters: {
            content: { type: 'string', description: 'The new context summary.' }
        },
        handler: async (args: { content: string }) => {
            const manager = await getMemoryManager();
            await manager.writeEntry('active_context.md', args.content);
            return 'Active context updated.';
        }
    }
};
