
import { BaseAgent, type AgentResult, type SwarmInputSnapshot } from './BaseAgent.js';
import { getAIManager, type AIMessage } from '../ai/manager.js';

export interface TaskNode {
    id: string;
    title: string;
    description: string;
    complexity: number; // 1-10
    type: 'research' | 'code' | 'design' | 'review' | 'deploy';
    dependencies: string[]; // IDs of tasks that must be done first
    subtasks: TaskNode[];
    assignedAgent?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export class TaskMasterAgent extends BaseAgent {
    constructor() {
        super('TaskMaster');
    }

    override getDescription(): string {
        return "Task Architect. specialized in recursive task decomposition and complexity analysis.";
    }

    async decompose(goal: string, depth: number = 0): Promise<TaskNode[]> {
        if (depth > 2) return []; // Prevent infinite recursion for now

        const ai = getAIManager();

        const prompt = `You are a Senior Technical Project Manager.
    Goal: ${goal}
    
    Decompose this goal into 3-5 high-level technical tasks.
    For each task, estimate complexity (1-10).
    If complexity is > 5, it means it's too big and needs further breakdown (which will happen recursively).
    
    Return pure JSON format:
    [
      {
        "title": "Task Title",
        "description": "Short description",
        "complexity": 7,
        "type": "code",
        "dependencies": []
      }
    ]
    `;

        const request = {
            model: ai.getDefaultProvider()?.getDefaultModel() || 'o3-mini',
            messages: [{ role: 'user' as const, content: prompt }],
            temperature: 0.2,
            maxTokens: 2000,
        };

        try {
            const response = await ai.complete(request);
            const cleanContent = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
            const tasks: any[] = JSON.parse(cleanContent);

            const nodes: TaskNode[] = [];

            for (const t of tasks) {
                const node: TaskNode = {
                    id: crypto.randomUUID(),
                    title: t.title,
                    description: t.description,
                    complexity: t.complexity,
                    type: t.type || 'code',
                    dependencies: t.dependencies || [],
                    subtasks: [],
                    status: 'pending'
                };

                // Recursive Step
                if (node.complexity > 5) {
                    console.log(`[TaskMaster] Decomposing complex task: ${node.title} (Complexity: ${node.complexity})`);
                    node.subtasks = await this.decompose(node.title, depth + 1);
                }

                nodes.push(node);
            }

            return nodes;

        } catch (error) {
            console.error("Task Decomposition Failed", error);
            return [];
        }
    }
}
