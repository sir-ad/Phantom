
import { Skill, AgentTool } from './registry.js';
import { memoryTools } from '../agents/tools/memory.js';

export class StandardSkill implements Skill {
    id = "standard-library";
    name = "Phantom Standard Library";
    description = "Core tools for memory, filesystem, and basic operations.";
    version = "1.0.0";
    tools: AgentTool[] = [];

    constructor() {
        this.tools = [
            // Convert memoryTools object values to array
            ...Object.values(memoryTools)
        ];
    }

    async onLoad() {
        console.log('Standard Skill loaded.');
    }
}
