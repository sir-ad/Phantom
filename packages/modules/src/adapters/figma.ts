import { LinkAdapter, LinkContent } from '@phantom-pm/core';
import { FigmaBridgeModule } from '../figma-bridge.js';

export class FigmaLinkAdapter implements LinkAdapter {
    id = 'figma';
    private bridge = new FigmaBridgeModule();

    match(url: string): boolean {
        return url.includes('figma.com/file/') || url.includes('figma.com/design/');
    }

    async fetch(url: string): Promise<LinkContent> {
        const fileKey = this.extractFileKey(url);
        if (!fileKey) throw new Error('Invalid Figma URL');

        try {
            // Sync the file to get latest data
            const syncResult = await this.bridge.syncFile(fileKey);

            // Get design analysis for richer context
            const analysis = await this.bridge.analyzeDesign(fileKey);

            // Construct a meaningful context string
            let content = `Figma Design: ${analysis.fileName}\n`;
            content += `Analyzed At: ${analysis.analyzedAt}\n\n`;

            content += `--- SCREEN SUMMARY ---\n`;
            analysis.screens.forEach(s => {
                content += `- ${s.name}: ${s.complexity} complexity. Flows: ${s.userFlows.join(', ') || 'none'}\n`;
            });

            content += `\n--- COMPONENT SUMMARY ---\n`;
            analysis.components.forEach(c => {
                content += `- ${c.name} (${c.type}): ${c.instances} instances\n`;
            });

            if (analysis.accessibilityIssues.length > 0) {
                content += `\n--- ACCESSIBILITY NOTES ---\n`;
                analysis.accessibilityIssues.forEach(i => {
                    content += `- [${i.severity}] ${i.description}\n`;
                });
            }

            return {
                title: analysis.fileName,
                content: content,
                sourceUrl: url,
                type: 'figma',
                metadata: {
                    fileKey: analysis.fileKey,
                    syncedAt: analysis.analyzedAt,
                    screens: analysis.screens.length,
                    components: analysis.components.length
                }
            };
        } catch (error) {
            console.error('Figma Link Adapter failed:', error);
            throw new Error(`Failed to fetch Figma data: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
    }

    private extractFileKey(url: string): string | null {
        const match = url.match(/(?:file|design)\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    }
}
