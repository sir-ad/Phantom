// ─── PHANTOM SLIDE ENGINE ─────────────────────────────────────────────
// Generate .pptx presentation decks using the Pyramid Principle
// Situation → Complication → Resolution → Supporting Evidence

import pptxgen from 'pptxgenjs';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

// ─── Types ───────────────────────────────────────────────────────────

export interface SlideContent {
    title: string;
    bullets?: string[];
    notes?: string;
    layout?: 'title' | 'content' | 'two-column' | 'comparison' | 'quote';
    image?: string;
}

export interface Slide {
    content: SlideContent;
    position: number;
}

export interface SlideConfig {
    title: string;
    subtitle?: string;
    author?: string;
    company?: string;
    theme?: 'matrix' | 'corporate' | 'minimal' | 'dark';
    outputPath: string;
}

// ─── Theme Palettes ──────────────────────────────────────────────────

const THEMES = {
    matrix: {
        bg: '0D1117',
        primary: '00FF41',
        secondary: '8B949E',
        accent: '00D4FF',
        text: 'E6EDF3',
        dimmed: '484F58',
    },
    corporate: {
        bg: 'FFFFFF',
        primary: '1A73E8',
        secondary: '5F6368',
        accent: '34A853',
        text: '202124',
        dimmed: '9AA0A6',
    },
    minimal: {
        bg: 'FAFAFA',
        primary: '212121',
        secondary: '757575',
        accent: 'FF5722',
        text: '212121',
        dimmed: 'BDBDBD',
    },
    dark: {
        bg: '1E1E2E',
        primary: 'CDD6F4',
        secondary: 'A6ADC8',
        accent: 'F38BA8',
        text: 'CDD6F4',
        dimmed: '585B70',
    },
} as const;

// ─── Slide Engine ────────────────────────────────────────────────────

export class SlideEngine {
    private config: SlideConfig;
    private theme: typeof THEMES[keyof typeof THEMES];

    constructor(config: SlideConfig) {
        this.config = config;
        this.theme = THEMES[config.theme || 'matrix'];
    }

    /**
     * Generate a presentation deck from structured slide data
     */
    async generate(slides: Slide[]): Promise<string> {
        // Cast to any to handle CommonJS/ESM interop issues in NodeNext
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pptx = new (pptxgen as any)();

        // Set metadata
        pptx.author = this.config.author || 'Phantom PM';
        pptx.company = this.config.company || 'Phantom';
        pptx.title = this.config.title;

        // Create title slide
        this.addTitleSlide(pptx);

        // Create content slides
        for (const slide of slides.sort((a, b) => a.position - b.position)) {
            this.addContentSlide(pptx, slide);
        }

        // Write to file
        const outputPath = this.config.outputPath;
        await mkdir(dirname(outputPath), { recursive: true });

        const data = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
        await writeFile(outputPath, data);

        return outputPath;
    }

    /**
     * Generate a SCR (Situation-Complication-Resolution) deck
     */
    async generateSCR(params: {
        situation: string;
        complication: string;
        resolution: string;
        evidence: string[];
        recommendation: string;
    }): Promise<string> {
        const slides: Slide[] = [
            {
                position: 1,
                content: {
                    title: 'Situation',
                    bullets: [params.situation],
                    layout: 'content',
                    notes: 'Context and background — what is the current state?',
                },
            },
            {
                position: 2,
                content: {
                    title: 'Complication',
                    bullets: [params.complication],
                    layout: 'content',
                    notes: 'What has changed or what problem has emerged?',
                },
            },
            {
                position: 3,
                content: {
                    title: 'Resolution',
                    bullets: [params.resolution],
                    layout: 'content',
                    notes: 'The proposed solution or answer',
                },
            },
            {
                position: 4,
                content: {
                    title: 'Supporting Evidence',
                    bullets: params.evidence,
                    layout: 'content',
                    notes: 'Data and analysis supporting the resolution',
                },
            },
            {
                position: 5,
                content: {
                    title: 'Recommendation',
                    bullets: [params.recommendation],
                    layout: 'content',
                    notes: 'Clear next steps and ask',
                },
            },
        ];

        return this.generate(slides);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private addTitleSlide(pptx: any): void {
        const slide = pptx.addSlide();
        slide.background = { color: this.theme.bg };

        slide.addText(this.config.title, {
            x: 0.5,
            y: 1.5,
            w: '90%',
            h: 1.5,
            fontSize: 36,
            bold: true,
            color: this.theme.primary,
            align: 'center',
        });

        if (this.config.subtitle) {
            slide.addText(this.config.subtitle, {
                x: 0.5,
                y: 3.2,
                w: '90%',
                h: 0.8,
                fontSize: 18,
                color: this.theme.secondary,
                align: 'center',
            });
        }

        slide.addText(`Generated by Phantom PM · ${new Date().toLocaleDateString()}`, {
            x: 0.5,
            y: 4.8,
            w: '90%',
            h: 0.5,
            fontSize: 10,
            color: this.theme.dimmed,
            align: 'center',
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private addContentSlide(pptx: any, slide: Slide): void {
        const pptxSlide = pptx.addSlide();
        pptxSlide.background = { color: this.theme.bg };

        // Title
        pptxSlide.addText(slide.content.title, {
            x: 0.5,
            y: 0.3,
            w: '90%',
            h: 0.8,
            fontSize: 28,
            bold: true,
            color: this.theme.primary,
        });

        // Divider line
        // Use string literal 'rect' instead of enum to avoid type issues
        pptxSlide.addShape('rect', {
            x: 0.5,
            y: 1.1,
            w: '90%',
            h: 0.02,
            fill: { color: this.theme.accent },
        });

        // Bullets
        if (slide.content.bullets?.length) {
            const bulletText = slide.content.bullets.map(b => ({
                text: b,
                options: {
                    fontSize: 16,
                    color: this.theme.text,
                    bullet: { code: '25CF', color: this.theme.accent },
                    paraSpaceBefore: 8,
                    paraSpaceAfter: 4,
                },
            }));

            // Remove explicit type cast that was causing namespace error
            pptxSlide.addText(bulletText, {
                x: 0.7,
                y: 1.4,
                w: '85%',
                h: 3.5,
                valign: 'top',
            });
        }

        // Notes
        if (slide.content.notes) {
            pptxSlide.addNotes(slide.content.notes);
        }
    }
}
