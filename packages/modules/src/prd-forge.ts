// PHANTOM Module: PRD Forge v2.1.0
// "I know PRDs."
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getContextEngine } from '@phantom-pm/core';
import { getAIManager } from '@phantom-pm/core';

export interface PRDGenerationOptions {
  title: string;
  includeTechnicalRequirements?: boolean;
  includeUXWireframes?: boolean;
  includeMetricsFramework?: boolean;
  outputPath?: string;
}

export interface GeneratedPRD {
  id: string;
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
  generatedAt: string;
  metadata: {
    model: string;
    tokenCount: number;
    cost: number;
  };
}

function extractProjectContext(): string {
  const context = getContextEngine();
  const entries = context.getEntries();
  
  // Get code files
  const codeFiles = entries
    .filter(entry => entry.type === 'code')
    .slice(0, 10)
    .map(entry => `File: ${entry.relativePath}\nLanguage: ${entry.metadata.language || 'unknown'}\nSize: ${entry.metadata.size} bytes\n`);
  
  // Get documentation files
  const docs = entries
    .filter(entry => entry.type === 'document')
    .slice(0, 5)
    .map(entry => `Doc: ${entry.relativePath}\nSize: ${entry.metadata.size} bytes\n`);
  
  return [
    'PROJECT CONTEXT:',
    `Total Files: ${entries.length}`,
    '---',
    'CODE FILES:',
    ...codeFiles,
    '---',
    'DOCUMENTATION:',
    ...docs,
  ].join('\n');
}

export async function generatePRD(options: PRDGenerationOptions): Promise<GeneratedPRD> {
  const ai = getAIManager();
  const context = extractProjectContext();
  const timestamp = new Date().toISOString();
  const prdId = `prd_${Date.now().toString(36)}_${options.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
  const systemPrompt = `You are a Product Manager AI expert specializing in creating comprehensive Product Requirements Documents (PRDs).

Current Project Context:
${context}

Your task is to create a detailed PRD for: "${options.title}"

Follow this exact structure:
1. Executive Summary (1-2 paragraphs)
2. Problem Statement (user pain points, market gap)
3. User Personas & Jobs-to-Be-Done
4. Solution Overview (what we're building)
5. Feature Requirements (user stories format)
6. Technical Requirements (APIs, data models, performance)
7. UX/UI Requirements (wireframes, user flows)
8. Success Metrics & KPIs
9. Go-to-Market Strategy
10. Risks & Mitigations

Make it specific to the project context provided. Include technical details based on the code files mentioned.`;

  const userPrompt = `Generate a comprehensive PRD for "${options.title}".

Additional Requirements:
${options.includeTechnicalRequirements ? '- Include detailed technical requirements\n' : ''}
${options.includeUXWireframes ? '- Include UX wireframe descriptions\n' : ''}
${options.includeMetricsFramework ? '- Include detailed metrics framework\n' : ''}

Make the PRD actionable, specific, and tied to the project context.`;

  try {
    const response = await ai.complete({
      model: 'o3-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      maxTokens: 4000,
    });

    // Parse the response into sections
    const sections = parsePRDIntoSections(response.content);
    
    const prd: GeneratedPRD = {
      id: prdId,
      title: options.title,
      sections,
      generatedAt: timestamp,
      metadata: {
        model: response.model,
        tokenCount: response.usage?.totalTokens || 0,
        cost: ai.getMetrics().find((m: any) => m.provider === 'openai')?.totalCost || 0,
      },
    };

    // Save to file if output path provided
    if (options.outputPath) {
      savePRDToFile(prd, options.outputPath);
    }

    return prd;
  } catch (error) {
    // Fallback to template if AI fails
    return createFallbackPRD(options);
  }
}

function parsePRDIntoSections(content: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = content.split('\n');
  let currentSection = { title: 'PRD Content', content: '' };
  
  for (const line of lines) {
    // Look for section headers (e.g., "## Executive Summary")
    const sectionMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (sectionMatch) {
      // Save previous section
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }
      // Start new section
      currentSection = {
        title: sectionMatch[1].trim(),
        content: '',
      };
    } else {
      currentSection.content += line + '\n';
    }
  }
  
  // Add final section
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }
  
  // If no sections were parsed, create default ones
  if (sections.length === 0) {
    return [
      { title: 'Executive Summary', content },
      { title: 'Requirements', content: 'Details parsed from the AI response.' },
    ];
  }
  
  return sections;
}

function savePRDToFile(prd: GeneratedPRD, outputPath: string): void {
  const fullPath = join(outputPath, `${prd.id}.md`);
  mkdirSync(outputPath, { recursive: true });
  
  const markdown = `# ${prd.title}
Generated: ${prd.generatedAt}
PRD ID: ${prd.id}
Model: ${prd.metadata.model}

${prd.sections.map(section => `## ${section.title}\n\n${section.content.trim()}\n`).join('\n')}

---
Generated by PHANTOM PRD Forge v2.1.0
"I know PRDs."
`;
  
  writeFileSync(fullPath, markdown);
}

function createFallbackPRD(options: PRDGenerationOptions): GeneratedPRD {
  const timestamp = new Date().toISOString();
  const prdId = `prd_fallback_${Date.now().toString(36)}`;
  
  return {
    id: prdId,
    title: options.title,
    sections: [
      {
        title: 'Executive Summary',
        content: `This PRD outlines the requirements for "${options.title}". Due to AI service unavailability, this is a template-based PRD.`,
      },
      {
        title: 'Problem Statement',
        content: 'Define the user pain points and market gap this feature addresses.',
      },
      {
        title: 'Solution Overview',
        content: 'Describe what we are building and how it solves the identified problems.',
      },
      {
        title: 'Requirements',
        content: 'List feature requirements in user story format.\n\nAs a user, I want to...\nAs an admin, I need to...\nAs a developer, I require...',
      },
    ],
    generatedAt: timestamp,
    metadata: {
      model: 'fallback-template',
      tokenCount: 0,
      cost: 0,
    },
  };
}

// Module entry point for CLI
export async function runPRDForge(args: Record<string, any>): Promise<any> {
  const title = args.title || args._[0];
  if (!title) {
    throw new Error('PRD title is required');
  }

  const options: PRDGenerationOptions = {
    title,
    includeTechnicalRequirements: args.technical || false,
    includeUXWireframes: args.ux || false,
    includeMetricsFramework: args.metrics || false,
    outputPath: args.output || './.phantom/output/prds',
  };

  const prd = await generatePRD(options);
  
  return {
    success: true,
    prd: {
      id: prd.id,
      title: prd.title,
      sections: prd.sections.map(s => s.title),
      filePath: options.outputPath ? join(options.outputPath, `${prd.id}.md`) : undefined,
    },
    metadata: prd.metadata,
  };
}
