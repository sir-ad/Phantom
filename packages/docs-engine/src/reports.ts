// ─── PHANTOM REPORT ENGINE ────────────────────────────────────────────
// Generate structured markdown reports — executive briefs, competitive
// analyses, sprint retrospectives, and strategy documents.
// Output is .md that can be converted to PDF via external tools.

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

// ─── Types ───────────────────────────────────────────────────────────

export interface ReportSection {
    title: string;
    content: string;
    level?: 1 | 2 | 3;
    type?: 'text' | 'table' | 'list' | 'quote' | 'kpi' | 'recommendation';
    data?: Record<string, unknown>[];
}

export interface ReportConfig {
    title: string;
    subtitle?: string;
    author?: string;
    date?: string;
    format: 'executive-brief' | 'competitive-analysis' | 'sprint-retro' | 'strategy-doc' | 'custom';
    outputPath: string;
    sections: ReportSection[];
    confidential?: boolean;
}

// ─── Report Engine ───────────────────────────────────────────────────

export class ReportEngine {
    private config: ReportConfig;

    constructor(config: ReportConfig) {
        this.config = {
            ...config,
            date: config.date || new Date().toISOString().split('T')[0],
            author: config.author || 'Phantom PM',
        };
    }

    /**
     * Generate a structured markdown report
     */
    async generate(): Promise<string> {
        const parts: string[] = [];

        // Header
        parts.push(this.renderHeader());

        // Sections
        for (const section of this.config.sections) {
            parts.push(this.renderSection(section));
        }

        // Footer
        parts.push(this.renderFooter());

        const content = parts.join('\n\n');

        // Write to file
        await mkdir(dirname(this.config.outputPath), { recursive: true });
        await writeFile(this.config.outputPath, content, 'utf-8');

        return this.config.outputPath;
    }

    /**
     * Generate a one-page executive brief
     */
    async generateExecBrief(params: {
        situation: string;
        keyFindings: string[];
        recommendations: string[];
        kpis: Array<{ metric: string; value: string; trend: '↑' | '↓' | '→' }>;
        nextSteps: string[];
        outputPath: string;
    }): Promise<string> {
        this.config.format = 'executive-brief';
        this.config.outputPath = params.outputPath;
        this.config.sections = [
            { title: 'Situation', content: params.situation, type: 'text' },
            {
                title: 'Key Findings', content: '', type: 'list',
                data: params.keyFindings.map(f => ({ item: f }))
            },
            {
                title: 'Key Metrics', content: '', type: 'kpi',
                data: params.kpis
            },
            {
                title: 'Recommendations', content: '', type: 'recommendation',
                data: params.recommendations.map(r => ({ item: r }))
            },
            {
                title: 'Next Steps', content: '', type: 'list',
                data: params.nextSteps.map(s => ({ item: s }))
            },
        ];

        return this.generate();
    }

    /**
     * Generate a competitive analysis report
     */
    async generateCompetitiveAnalysis(params: {
        market: string;
        competitors: Array<{
            name: string;
            strengths: string[];
            weaknesses: string[];
            marketShare: string;
        }>;
        opportunities: string[];
        threats: string[];
        outputPath: string;
    }): Promise<string> {
        this.config.format = 'competitive-analysis';
        this.config.outputPath = params.outputPath;
        this.config.sections = [
            { title: 'Market Overview', content: params.market, type: 'text' },
            ...params.competitors.map(c => ({
                title: c.name,
                content: `Market Share: ${c.marketShare}`,
                type: 'table' as const,
                level: 2 as const,
                data: [
                    ...c.strengths.map(s => ({ category: '✅ Strength', detail: s })),
                    ...c.weaknesses.map(w => ({ category: '⚠️ Weakness', detail: w })),
                ],
            })),
            {
                title: 'Opportunities', content: '', type: 'list',
                data: params.opportunities.map(o => ({ item: o }))
            },
            {
                title: 'Threats', content: '', type: 'list',
                data: params.threats.map(t => ({ item: t }))
            },
        ];

        return this.generate();
    }

    private renderHeader(): string {
        const lines: string[] = [];

        if (this.config.confidential) {
            lines.push('> ⚠️ **CONFIDENTIAL** — Do not distribute externally\n');
        }

        lines.push(`# ${this.config.title}`);

        if (this.config.subtitle) {
            lines.push(`\n*${this.config.subtitle}*`);
        }

        lines.push(`\n| | |`);
        lines.push(`|---|---|`);
        lines.push(`| **Author** | ${this.config.author} |`);
        lines.push(`| **Date** | ${this.config.date} |`);
        lines.push(`| **Format** | ${this.config.format} |`);

        lines.push('\n---');

        return lines.join('\n');
    }

    private renderSection(section: ReportSection): string {
        const level = section.level || 2;
        const heading = '#'.repeat(level);
        const lines: string[] = [`${heading} ${section.title}`];

        if (section.content) {
            lines.push(`\n${section.content}`);
        }

        switch (section.type) {
            case 'list':
                if (section.data) {
                    lines.push('');
                    for (const item of section.data) {
                        lines.push(`- ${(item as { item: string }).item}`);
                    }
                }
                break;

            case 'table':
                if (section.data?.length) {
                    const keys = Object.keys(section.data[0]);
                    lines.push('');
                    lines.push(`| ${keys.join(' | ')} |`);
                    lines.push(`| ${keys.map(() => '---').join(' | ')} |`);
                    for (const row of section.data) {
                        lines.push(`| ${keys.map(k => String(row[k] || '')).join(' | ')} |`);
                    }
                }
                break;

            case 'kpi':
                if (section.data) {
                    lines.push('');
                    lines.push('| Metric | Value | Trend |');
                    lines.push('|--------|-------|-------|');
                    for (const kpi of section.data) {
                        const k = kpi as { metric: string; value: string; trend: string };
                        lines.push(`| ${k.metric} | **${k.value}** | ${k.trend} |`);
                    }
                }
                break;

            case 'recommendation':
                if (section.data) {
                    lines.push('');
                    let i = 1;
                    for (const item of section.data) {
                        lines.push(`${i}. **${(item as { item: string }).item}**`);
                        i++;
                    }
                }
                break;

            case 'quote':
                lines.push(`\n> ${section.content}`);
                break;
        }

        return lines.join('\n');
    }

    private renderFooter(): string {
        return [
            '---',
            '',
            `*Generated by Phantom PM · ${this.config.date}*`,
        ].join('\n');
    }
}
