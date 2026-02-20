// PHANTOM Module: Figma Bridge v1.2.0
// Connect Figma designs to PRDs, user stories, and development tasks
// "I know design."

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getAIManager, getConfig } from '@phantom-pm/core';

export interface FigmaFile {
  key: string;
  name: string;
  lastModified: string;
  thumbnailUrl?: string;
  version: string;
  pages: FigmaPage[];
}

export interface FigmaPage {
  id: string;
  name: string;
  frames: FigmaFrame[];
}

export interface FigmaFrame {
  id: string;
  name: string;
  type: 'FRAME' | 'COMPONENT' | 'INSTANCE' | 'GROUP';
  width: number;
  height: number;
  x: number;
  y: number;
  children?: FigmaNode[];
  componentProperties?: Record<string, unknown>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible: boolean;
}

export interface DesignAnalysis {
  fileKey: string;
  fileName: string;
  analyzedAt: string;
  components: DesignComponent[];
  screens: ScreenAnalysis[];
  styleConsistency: StyleConsistencyReport;
  accessibilityIssues: AccessibilityIssue[];
  recommendations: DesignRecommendation[];
  devHandoff: DevHandoffInfo;
}

export interface DesignComponent {
  name: string;
  type: 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'icon' | 'other';
  instances: number;
  variations: string[];
  properties: Record<string, string>;
}

export interface ScreenAnalysis {
  name: string;
  frameId: string;
  dimensions: { width: number; height: number };
  elementCount: number;
  complexity: 'low' | 'medium' | 'high';
  userFlows: string[];
  states: string[];
}

export interface StyleConsistencyReport {
  colors: { name: string; hex: string; count: number }[];
  typography: { name: string; font: string; size: number; count: number }[];
  spacing: { value: number; count: number }[];
  issues: ConsistencyIssue[];
  score: number;
}

export interface ConsistencyIssue {
  type: 'color' | 'typography' | 'spacing';
  description: string;
  occurrences: number;
  suggestion: string;
}

export interface AccessibilityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  wcagCriterion: string;
  description: string;
  element: string;
  suggestion: string;
}

export interface DesignRecommendation {
  priority: number;
  category: 'accessibility' | 'consistency' | 'usability' | 'performance';
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface DevHandoffInfo {
  assets: ExportableAsset[];
  cssVariables: CSSVariable[];
  measurements: Measurement[];
  notes: HandoffNote[];
}

export interface ExportableAsset {
  name: string;
  type: 'image' | 'svg' | 'pdf';
  nodeId: string;
  format: string;
  scale: number;
}

export interface CSSVariable {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'shadow';
}

export interface Measurement {
  from: string;
  to: string;
  distance: number;
  direction: 'horizontal' | 'vertical';
}

export interface HandoffNote {
  nodeId: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface SyncResult {
  fileKey: string;
  syncedAt: string;
  pagesSynced: number;
  componentsFound: number;
  screensFound: number;
  linkedPrdId?: string;
  storiesGenerated: number;
}

export class FigmaBridgeModule {
  private apiToken?: string;
  private outputDir: string;
  private apiBaseUrl = 'https://api.figma.com/v1';

  constructor() {
    const config = getConfig();
    this.apiToken = config.getAPIKey('figma');
    this.outputDir = join(config.getConfigDir(), 'figma');
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Check if Figma API is configured
   */
  isConfigured(): boolean {
    return !!this.apiToken;
  }

  /**
   * Sync Figma file to local cache
   */
  async syncFile(fileKey: string): Promise<SyncResult> {
    if (!this.isConfigured()) {
      throw new Error('Figma API token not configured. Set it with: phantom config set-api-key figma <token>');
    }

    try {
      // Fetch file metadata
      const file = await this.fetchFile(fileKey);

      // Fetch components
      const components = await this.fetchComponents(fileKey);

      // Analyze screens
      const screens = this.analyzeScreens(file);

      // Cache the data
      this.cacheFile(fileKey, file, components);

      return {
        fileKey,
        syncedAt: new Date().toISOString(),
        pagesSynced: file.pages.length,
        componentsFound: components.length,
        screensFound: screens.length,
        storiesGenerated: screens.length * 3, // Estimate 3 stories per screen
      };
    } catch (error) {
      throw new Error(`Failed to sync Figma file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze design for UX issues and inconsistencies
   */
  async analyzeDesign(fileKey: string): Promise<DesignAnalysis> {
    // Load from cache or sync first
    let file: FigmaFile;
    try {
      file = this.loadCachedFile(fileKey);
    } catch {
      const syncResult = await this.syncFile(fileKey);
      file = this.loadCachedFile(fileKey);
    }

    const ai = getAIManager();

    const systemPrompt = `You are a design analysis AI specializing in:
- Design system consistency
- Accessibility compliance (WCAG 2.1)
- Component architecture review
- Developer handoff preparation

Analyze the design and provide structured feedback.

Respond in JSON format:
{
  "components": [
    { "name": "Component Name", "type": "button", "instances": 5, "variations": ["primary", "secondary"], "properties": {} }
  ],
  "screens": [
    { "name": "Screen Name", "frameId": "123", "dimensions": { "width": 375, "height": 812 }, "elementCount": 25, "complexity": "medium", "userFlows": ["login"], "states": ["default", "loading"] }
  ],
  "styleConsistency": {
    "colors": [{ "name": "Primary", "hex": "#007AFF", "count": 15 }],
    "typography": [{ "name": "Heading", "font": "Inter", "size": 24, "count": 8 }],
    "spacing": [{ "value": 16, "count": 20 }],
    "issues": [{ "type": "color", "description": "Issue", "occurrences": 3, "suggestion": "Fix" }],
    "score": 85
  },
  "accessibilityIssues": [
    { "severity": "high", "wcagCriterion": "1.4.3", "description": "Low contrast", "element": "Text", "suggestion": "Increase contrast" }
  ],
  "recommendations": [
    { "priority": 1, "category": "accessibility", "description": "Fix contrast", "impact": "Better readability", "effort": "low" }
  ],
  "devHandoff": {
    "assets": [{ "name": "icon", "type": "svg", "nodeId": "123", "format": "svg", "scale": 1 }],
    "cssVariables": [{ "name": "--color-primary", "value": "#007AFF", "category": "color" }],
    "measurements": [{ "from": "A", "to": "B", "distance": 16, "direction": "horizontal" }],
    "notes": [{ "nodeId": "123", "text": "Note", "author": "Designer", "timestamp": "2024-01-01" }]
  }
}`;

    const userPrompt = `Analyze this Figma design:

File: ${file.name}
Pages: ${file.pages.length}
Screens: ${file.pages.reduce((sum, p) => sum + p.frames.length, 0)}

Provide a comprehensive design analysis.`;

    try {
      const response = await ai.complete({
        model: 'o3-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        maxTokens: 3000,
      });

      const parsed = this.parseAnalysisResponse(response.content);
      const analysis: DesignAnalysis = {
        fileKey,
        fileName: file.name,
        analyzedAt: new Date().toISOString(),
        components: parsed.components || [],
        screens: parsed.screens || [],
        styleConsistency: parsed.styleConsistency || {
          colors: [],
          typography: [],
          spacing: [],
          issues: [],
          score: 70,
        },
        accessibilityIssues: parsed.accessibilityIssues || [],
        recommendations: parsed.recommendations || [],
        devHandoff: parsed.devHandoff || {
          assets: [],
          cssVariables: [],
          measurements: [],
          notes: [],
        },
      };

      this.saveAnalysis(analysis);
      return analysis;
    } catch (error) {
      return this.createFallbackAnalysis(fileKey, file);
    }
  }

  /**
   * Generate stories from Figma design
   */
  async generateStoriesFromDesign(fileKey: string): Promise<{
    stories: Array<{
      id: string;
      title: string;
      description: string;
      acceptanceCriteria: string[];
      screen: string;
    }>;
    count: number;
  }> {
    const analysis = await this.analyzeDesign(fileKey);

    const stories = [];
    for (const screen of analysis.screens) {
      // Generate stories for each screen
      stories.push({
        id: `story_${screen.frameId}_1`,
        title: `View ${screen.name}`,
        description: `As a user, I want to view the ${screen.name} screen`,
        acceptanceCriteria: [
          `Screen loads within 2 seconds`,
          `All elements from design are present`,
          `Responsive behavior matches design specifications`,
        ],
        screen: screen.name,
      });

      if (screen.userFlows.length > 0) {
        for (const flow of screen.userFlows) {
          stories.push({
            id: `story_${screen.frameId}_${flow}`,
            title: `${screen.name} - ${flow} flow`,
            description: `As a user, I want to complete the ${flow} flow`,
            acceptanceCriteria: [
              `User can navigate through all ${flow} steps`,
              `Error states are handled gracefully`,
              `Success state is clearly indicated`,
            ],
            screen: screen.name,
          });
        }
      }
    }

    return { stories, count: stories.length };
  }

  /**
   * Generate PRD from Figma design
   */
  async generatePRDFromDesign(fileKey: string, prdTitle: string): Promise<{
    prdId: string;
    title: string;
    sections: Array<{ title: string; content: string }>;
  }> {
    const analysis = await this.analyzeDesign(fileKey);
    const stories = await this.generateStoriesFromDesign(fileKey);

    const sections = [
      {
        title: 'Overview',
        content: `Design-driven PRD for ${prdTitle}. Based on Figma file: ${analysis.fileName}`,
      },
      {
        title: 'Design Screens',
        content: analysis.screens.map(s => `- ${s.name} (${s.dimensions.width}x${s.dimensions.height}, ${s.complexity} complexity)`).join('\n'),
      },
      {
        title: 'User Stories',
        content: stories.stories.map(s => `- ${s.title}: ${s.description}`).join('\n'),
      },
      {
        title: 'Components',
        content: analysis.components.map(c => `- ${c.name} (${c.type}): ${c.instances} instances, ${c.variations.length} variations`).join('\n'),
      },
      {
        title: 'Accessibility Considerations',
        content: analysis.accessibilityIssues.map(i => `- [${i.severity}] ${i.description} (${i.wcagCriterion})`).join('\n') || 'No critical issues found',
      },
      {
        title: 'Technical Notes',
        content: analysis.devHandoff.notes.map(n => `- ${n.text}`).join('\n') || 'See Figma for detailed specifications',
      },
    ];

    return {
      prdId: `prd_figma_${Date.now().toString(36)}`,
      title: prdTitle,
      sections,
    };
  }

  /**
   * Get cached file info
   */
  getCachedFiles(): Array<{ key: string; name: string; syncedAt: string }> {
    const files: Array<{ key: string; name: string; syncedAt: string }> = [];

    if (!existsSync(this.outputDir)) return files;

    const entries = readdirSync(this.outputDir).filter(f => f.endsWith('.json') && !f.includes('_analysis'));
    for (const entry of entries) {
      try {
        const content = JSON.parse(readFileSync(join(this.outputDir, entry), 'utf8'));
        files.push({
          key: content.key,
          name: content.name || 'Unknown',
          syncedAt: content.syncedAt || 'Unknown',
        });
      } catch {
        // Skip invalid entries
      }
    }

    return files;
  }

  // Private helper methods
  private async fetchFile(fileKey: string): Promise<FigmaFile> {
    const response = await fetch(`${this.apiBaseUrl}/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': this.apiToken!,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      name: string;
      lastModified: string;
      version: string;
      thumbnailUrl?: string;
      document: {
        children: Array<{
          id: string;
          name: string;
          type: string;
          children?: unknown[];
        }>;
      };
    };

    return {
      key: fileKey,
      name: data.name,
      lastModified: data.lastModified,
      version: data.version,
      thumbnailUrl: data.thumbnailUrl,
      pages: data.document.children
        .filter(c => c.type === 'CANVAS')
        .map(canvas => ({
          id: canvas.id,
          name: canvas.name,
          frames: [],
        })),
    };
  }

  private async fetchComponents(fileKey: string): Promise<DesignComponent[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/files/${fileKey}/components`, {
        headers: {
          'X-Figma-Token': this.apiToken!,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as {
        meta?: { components?: Array<{ name: string; node_id: string; component_set_id?: string }> };
      };

      const components = data.meta?.components || [];
      return components.map(c => ({
        name: c.name,
        type: 'other',
        instances: 1,
        variations: c.component_set_id ? ['default'] : [],
        properties: {},
      }));
    } catch {
      return [];
    }
  }

  private analyzeScreens(file: FigmaFile): ScreenAnalysis[] {
    const screens: ScreenAnalysis[] = [];

    for (const page of file.pages) {
      for (const frame of page.frames) {
        screens.push({
          name: frame.name,
          frameId: frame.id,
          dimensions: { width: frame.width, height: frame.height },
          elementCount: frame.children?.length || 0,
          complexity: this.assessComplexity(frame),
          userFlows: this.inferUserFlows(frame),
          states: this.inferStates(frame),
        });
      }
    }

    return screens;
  }

  private assessComplexity(frame: FigmaFrame): 'low' | 'medium' | 'high' {
    const elementCount = frame.children?.length || 0;
    if (elementCount < 10) return 'low';
    if (elementCount < 30) return 'medium';
    return 'high';
  }

  private inferUserFlows(frame: FigmaFrame): string[] {
    const flows: string[] = [];
    const name = frame.name.toLowerCase();

    if (name.includes('login') || name.includes('signin')) flows.push('authentication');
    if (name.includes('signup') || name.includes('register')) flows.push('registration');
    if (name.includes('checkout') || name.includes('payment')) flows.push('purchase');
    if (name.includes('profile') || name.includes('settings')) flows.push('account');
    if (name.includes('search') || name.includes('browse')) flows.push('discovery');

    return flows;
  }

  private inferStates(frame: FigmaFrame): string[] {
    const states: string[] = ['default'];
    const name = frame.name.toLowerCase();

    if (name.includes('loading') || name.includes('skeleton')) states.push('loading');
    if (name.includes('empty') || name.includes('blank')) states.push('empty');
    if (name.includes('error') || name.includes('fail')) states.push('error');
    if (name.includes('success') || name.includes('done')) states.push('success');

    return states;
  }

  private cacheFile(fileKey: string, file: FigmaFile, components: DesignComponent[]): void {
    const cachePath = join(this.outputDir, `${fileKey}.json`);
    writeFileSync(cachePath, JSON.stringify({
      ...file,
      syncedAt: new Date().toISOString(),
      components,
    }, null, 2));
  }

  private loadCachedFile(fileKey: string): FigmaFile {
    const cachePath = join(this.outputDir, `${fileKey}.json`);
    if (!existsSync(cachePath)) {
      throw new Error(`File not cached: ${fileKey}`);
    }
    return JSON.parse(readFileSync(cachePath, 'utf8')) as FigmaFile;
  }

  private saveAnalysis(analysis: DesignAnalysis): void {
    const filePath = join(this.outputDir, `${analysis.fileKey}_analysis.json`);
    writeFileSync(filePath, JSON.stringify(analysis, null, 2));
  }

  private parseAnalysisResponse(content: string): Partial<DesignAnalysis> {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      // Fallback
    }
    return {};
  }

  private createFallbackAnalysis(fileKey: string, file: FigmaFile): DesignAnalysis {
    return {
      fileKey,
      fileName: file.name,
      analyzedAt: new Date().toISOString(),
      components: [],
      screens: file.pages.flatMap(p => p.frames.map(f => ({
        name: f.name,
        frameId: f.id,
        dimensions: { width: f.width, height: f.height },
        elementCount: 0,
        complexity: 'low',
        userFlows: [],
        states: ['default'],
      }))),
      styleConsistency: {
        colors: [],
        typography: [],
        spacing: [],
        issues: [],
        score: 70,
      },
      accessibilityIssues: [],
      recommendations: [],
      devHandoff: {
        assets: [],
        cssVariables: [],
        measurements: [],
        notes: [],
      },
    };
  }
}

// Module entry point for CLI
export async function runFigmaBridge(args: Record<string, unknown>): Promise<unknown> {
  const bridge = new FigmaBridgeModule();
  const command = args.command || args._[0];

  switch (command) {
    case 'sync': {
      const fileKey = args.fileKey || args._[1];
      if (!fileKey || typeof fileKey !== 'string') {
        throw new Error('Figma file key is required');
      }
      const result = await bridge.syncFile(fileKey);
      return {
        success: true,
        sync: result,
      };
    }

    case 'analyze': {
      const fileKey = args.fileKey || args._[1];
      if (!fileKey || typeof fileKey !== 'string') {
        throw new Error('Figma file key is required');
      }
      const result = await bridge.analyzeDesign(fileKey);
      return {
        success: true,
        analysis: result,
      };
    }

    case 'stories': {
      const fileKey = args.fileKey || args._[1];
      if (!fileKey || typeof fileKey !== 'string') {
        throw new Error('Figma file key is required');
      }
      const result = await bridge.generateStoriesFromDesign(fileKey);
      return {
        success: true,
        stories: result.stories,
        count: result.count,
      };
    }

    case 'prd': {
      const fileKey = args.fileKey || args._[1];
      const title = typeof args.title === 'string' ? args.title : 'Design-Driven PRD';
      if (!fileKey || typeof fileKey !== 'string') {
        throw new Error('Figma file key is required');
      }
      const result = await bridge.generatePRDFromDesign(fileKey, title);
      return {
        success: true,
        prd: result,
      };
    }

    case 'list': {
      const files = bridge.getCachedFiles();
      return {
        success: true,
        files,
        count: files.length,
      };
    }

    default:
      throw new Error(`Unknown figma-bridge command: ${String(command)}`);
  }
}

export default FigmaBridgeModule;
