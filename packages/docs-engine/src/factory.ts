// ─── PHANTOM DOCS ENGINE FACTORY ──────────────────────────────────────
// Convenience factory to create all document generators at once

import { SlideEngine, type SlideConfig } from './slides.js';
import { SheetEngine, type SheetConfig } from './sheets.js';
import { ReportEngine, type ReportConfig } from './reports.js';
import { DashboardEngine, type DashboardConfig } from './dashboard.js';

export interface DocsEngine {
    slides: (config: SlideConfig) => SlideEngine;
    sheets: (config: SheetConfig) => SheetEngine;
    reports: (config: ReportConfig) => ReportEngine;
    dashboards: (config: DashboardConfig) => DashboardEngine;
}

/**
 * Create a docs engine factory with all generators
 *
 * @example
 * ```ts
 * const docs = createDocsEngine();
 *
 * // Generate a presentation
 * const deck = docs.slides({
 *   title: 'Q4 Strategy',
 *   theme: 'matrix',
 *   outputPath: './output/q4-strategy.pptx',
 * });
 * await deck.generateSCR({ situation, complication, resolution, evidence, recommendation });
 *
 * // Generate a spreadsheet
 * const sheet = docs.sheets({
 *   title: 'Sprint Tracker',
 *   outputPath: './output/sprint.xlsx',
 *   sheets: [],
 * });
 * await sheet.generateSprintTracker({ sprintName: 'Sprint 12', stories, outputPath });
 *
 * // Generate a dashboard
 * const dash = docs.dashboards({
 *   title: 'Product Health',
 *   theme: 'matrix',
 *   outputPath: './output/dashboard.html',
 *   widgets: [],
 * });
 * await dash.generateProductDashboard({ productName, kpis, features, sprints, outputPath });
 * ```
 */
export function createDocsEngine(): DocsEngine {
    return {
        slides: (config) => new SlideEngine(config),
        sheets: (config) => new SheetEngine(config),
        reports: (config) => new ReportEngine(config),
        dashboards: (config) => new DashboardEngine(config),
    };
}
