import { chromium, type Browser, type Page } from 'playwright';
import { AIManager } from '@phantom-pm/core';

export interface AgentOptions {
    headless?: boolean;
    viewport?: { width: number; height: number };
}

export class BrowserAgent {
    private browser: Browser | null = null;
    public page: Page | null = null;
    private aiManager: AIManager;

    constructor(aiManager: AIManager, private options: AgentOptions = {}) {
        this.aiManager = aiManager;
    }

    async init() {
        this.browser = await chromium.launch({
            headless: this.options.headless ?? true,
        });
        const context = await this.browser.newContext({
            viewport: this.options.viewport || { width: 1280, height: 800 },
        });
        this.page = await context.newPage();
    }

    async goto(url: string) {
        if (!this.page) throw new Error("Agent not initialized");
        await this.page.goto(url, { waitUntil: 'networkidle' });
    }

    async getScreenshot(fullPage = false): Promise<Buffer> {
        if (!this.page) throw new Error("Agent not initialized");
        return await this.page.screenshot({ fullPage });
    }

    async getDOMTree(): Promise<string> {
        if (!this.page) throw new Error("Agent not initialized");
        // Extract a clean version of the DOM for AI parsing
        return await this.page.evaluate(() => {
            const clone = document.body.cloneNode(true) as HTMLElement;
            // Remove scripts, styles, svgs to save tokens
            clone.querySelectorAll('script, style, svg').forEach(el => el.remove());
            return clone.innerHTML;
        });
    }

    async injectCSS(css: string) {
        if (!this.page) throw new Error("Agent not initialized");
        await this.page.addStyleTag({ content: css });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
