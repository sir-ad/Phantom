// ╔══════════════════════════════════════════════════════════════════╗
// ║  PHANTOM DOCS ENGINE — "I know the document."                    ║
// ║                                                                  ║
// ║  Generate presentation decks, spreadsheets, PDF reports, and     ║
// ║  HTML dashboards — all locally, all from structured data.        ║
// ║                                                                  ║
// ║  Zero cloud dependencies. Your data never leaves your machine.   ║
// ╚══════════════════════════════════════════════════════════════════╝

export { SlideEngine, type SlideConfig, type Slide, type SlideContent } from './slides.js';
export { SheetEngine, type SheetConfig, type SheetData, type SheetColumn } from './sheets.js';
export { ReportEngine, type ReportConfig, type ReportSection } from './reports.js';
export { DashboardEngine, type DashboardConfig, type DashboardWidget } from './dashboard.js';

// Re-export a convenience factory
export { createDocsEngine, type DocsEngine } from './factory.js';
