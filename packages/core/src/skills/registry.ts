
import { z } from 'zod';

// Define the shape of a Tool that the Agent consumes
export interface AgentTool {
    name: string;
    description: string;
    parameters: any; // JSON Schema or Zod definition
    handler: (args: any) => Promise<any>;
}

// A Skill is a bundle of tools
export interface Skill {
    id: string;
    name: string;
    description: string;
    version: string;
    tools: AgentTool[];
    onLoad?: () => Promise<void>;
}

export class SkillRegistry {
    private static instance: SkillRegistry;
    private skills: Map<string, Skill> = new Map();

    private constructor() { }

    static getInstance(): SkillRegistry {
        if (!SkillRegistry.instance) {
            SkillRegistry.instance = new SkillRegistry();
        }
        return SkillRegistry.instance;
    }

    register(skill: Skill) {
        if (this.skills.has(skill.id)) {
            console.warn(`Skill ${skill.id} is already registered. Overwriting.`);
        }
        this.skills.set(skill.id, skill);
    }

    getSkill(id: string): Skill | undefined {
        return this.skills.get(id);
    }

    getAllSkills(): Skill[] {
        return Array.from(this.skills.values());
    }

    // Returns a flat list of all tools from all registered skills
    getAllTools(): AgentTool[] {
        return Array.from(this.skills.values()).flatMap(s => s.tools);
    }
}
