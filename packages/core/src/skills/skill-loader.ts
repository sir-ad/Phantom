import * as fs from 'fs/promises';
import * as path from 'path';
import { Skill, AgentTool } from './registry.js';
import { existsSync } from 'fs';

// Helper to check if file exists
async function exists(filepath: string): Promise<boolean> {
    try {
        await fs.access(filepath);
        return true;
    } catch {
        return false;
    }
}

export class SkillLoader {
    private loadedSkills = new Map<string, Skill>();

    constructor(private skillsDir: string) { }

    async loadOnDemand(skillName: string): Promise<Skill | null> {
        if (this.loadedSkills.has(skillName)) {
            return this.loadedSkills.get(skillName)!;
        }

        const skillDir = path.join(this.skillsDir, skillName);
        const skillPath = path.join(skillDir, 'SKILL.md');

        if (!(await exists(skillPath))) {
            console.warn(`Skill documentation not found at ${skillPath}`);
            return null;
        }

        const skillDoc = await fs.readFile(skillPath, 'utf-8');

        let tools: AgentTool[] = [];
        const implPathTs = path.join(skillDir, 'index.ts');
        const implPathJs = path.join(skillDir, 'index.js');

        if (await exists(implPathTs) || await exists(implPathJs)) {
            try {
                const module = await import(await exists(implPathJs) ? implPathJs : implPathTs);
                if (module.default && module.default.tools) {
                    tools = module.default.tools;
                } else if (module.tools) {
                    tools = module.tools;
                }
            } catch (err) {
                console.error(`Failed to load implementation for skill ${skillName}`, err);
            }
        }

        // Basic heuristic parser for markdown
        const nameMatch = skillDoc.match(/^#\s+(.+)$/m);
        const name = nameMatch ? nameMatch[1].trim() : skillName;

        const skill: Skill = {
            id: skillName,
            name,
            description: skillDoc,
            version: '1.0.0',
            tools,
        };

        this.loadedSkills.set(skillName, skill);
        return skill;
    }

    inferRequiredSkills(query: string): string[] {
        const keywords: Record<string, string[]> = {
            'prd-forge': ['prd', 'requirements', 'spec', 'product requirement document'],
            'swarm': ['swarm', 'agents', 'consensus', 'debate'],
            'analytics': ['analytics', 'metrics', 'data', 'dau', 'mau', 'telemetry'],
            'interview-analyzer': ['interview', 'transcript', 'insights', 'user interview'],
            'feedback-hub': ['feedback', 'themes', 'sync', 'intercom', 'zendesk'],
            'discovery-loop': ['discovery', 'opportunities', 'risks', 'synthesize']
        };

        const required: string[] = [];
        const lowerQuery = query.toLowerCase();

        for (const [skill, triggers] of Object.entries(keywords)) {
            if (triggers.some(t => lowerQuery.includes(t))) {
                required.push(skill);
            }
        }

        return required;
    }
}
