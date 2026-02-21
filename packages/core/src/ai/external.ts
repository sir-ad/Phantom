/**
 * PHANTOM Core - External Link Manager
 * Orchestrates live data fetching from external URLs.
 */

export interface LinkContent {
    title: string;
    content: string;
    sourceUrl: string;
    type: 'figma' | 'notion' | 'web';
    metadata: Record<string, any>;
}

export interface LinkAdapter {
    id: string;
    match(url: string): boolean;
    fetch(url: string): Promise<LinkContent>;
}

export class ExternalLinkManager {
    private adapters: LinkAdapter[] = [];

    registerAdapter(adapter: LinkAdapter) {
        this.adapters.push(adapter);
    }

    async fetch(url: string): Promise<LinkContent> {
        const adapter = this.adapters.find(a => a.match(url));

        if (adapter) {
            return await adapter.fetch(url);
        }

        // Default: Generic Web Scraper
        return this.fetchGenericWeb(url);
    }

    private async fetchGenericWeb(url: string): Promise<LinkContent> {
        try {
            // In a real implementation, we would use a library like 'got' or 'axios' 
            // or the browser agent via OSGateway for robust scraping.
            // For this implementation, we'll simulate the fetch or use a simple fetch if in node.
            const response = await fetch(url);
            const html = await response.text();

            // Basic extraction (simulated)
            const title = html.match(/<title>(.*?)<\/title>/)?.[1] || url;
            const cleanContent = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            return {
                title,
                content: cleanContent,
                sourceUrl: url,
                type: 'web',
                metadata: {
                    scrapedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch URL ${url}: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
    }
}

let instance: ExternalLinkManager | null = null;
export function getExternalLinkManager(): ExternalLinkManager {
    if (!instance) {
        instance = new ExternalLinkManager();
    }
    return instance;
}
