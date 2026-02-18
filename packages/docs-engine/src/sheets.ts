// ─── PHANTOM SHEET ENGINE ─────────────────────────────────────────────
// Generate .xlsx Excel workbooks — sprint trackers, feature matrices,
// BCG charts, competitive scorecards, and KPI dashboards

import ExcelJS from 'exceljs';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

// ─── Types ───────────────────────────────────────────────────────────

export interface SheetColumn {
    header: string;
    key: string;
    width?: number;
    style?: 'text' | 'number' | 'percentage' | 'currency' | 'date' | 'boolean';
}

export interface SheetData {
    name: string;
    columns: SheetColumn[];
    rows: Record<string, unknown>[];
    headerStyle?: 'matrix' | 'corporate' | 'minimal';
}

export interface SheetConfig {
    title: string;
    author?: string;
    outputPath: string;
    sheets: SheetData[];
}

// ─── Theme Colors ────────────────────────────────────────────────────

const HEADER_STYLES = {
    matrix: {
        fill: '0D1117',
        font: '00FF41',
        border: '21262D',
    },
    corporate: {
        fill: '1A73E8',
        font: 'FFFFFF',
        border: 'DADCE0',
    },
    minimal: {
        fill: '212121',
        font: 'FFFFFF',
        border: 'E0E0E0',
    },
} as const;

// ─── Sheet Engine ────────────────────────────────────────────────────

export class SheetEngine {
    private config: SheetConfig;

    constructor(config: SheetConfig) {
        this.config = config;
    }

    /**
     * Generate an Excel workbook from structured data
     */
    async generate(): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = this.config.author || 'Phantom PM';
        workbook.created = new Date();

        for (const sheetData of this.config.sheets) {
            this.addSheet(workbook, sheetData);
        }

        // Write to file
        await mkdir(dirname(this.config.outputPath), { recursive: true });
        const buffer = await workbook.xlsx.writeBuffer();
        await writeFile(this.config.outputPath, Buffer.from(buffer));

        return this.config.outputPath;
    }

    /**
     * Generate a sprint tracker spreadsheet
     */
    async generateSprintTracker(params: {
        sprintName: string;
        stories: Array<{
            id: string;
            title: string;
            points: number;
            status: string;
            assignee: string;
            priority: string;
        }>;
        outputPath: string;
    }): Promise<string> {
        this.config.outputPath = params.outputPath;
        this.config.sheets = [
            {
                name: params.sprintName,
                columns: [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'Story', key: 'title', width: 40 },
                    { header: 'Points', key: 'points', width: 10, style: 'number' },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Assignee', key: 'assignee', width: 20 },
                    { header: 'Priority', key: 'priority', width: 12 },
                ],
                rows: params.stories,
                headerStyle: 'matrix',
            },
        ];

        return this.generate();
    }

    /**
     * Generate a BCG Matrix spreadsheet
     */
    async generateBCGMatrix(params: {
        features: Array<{
            name: string;
            growth: number;
            share: number;
            quadrant: string;
            recommendation: string;
        }>;
        outputPath: string;
    }): Promise<string> {
        this.config.outputPath = params.outputPath;
        this.config.sheets = [
            {
                name: 'BCG Matrix',
                columns: [
                    { header: 'Feature', key: 'name', width: 30 },
                    { header: 'Growth Rate', key: 'growth', width: 15, style: 'percentage' },
                    { header: 'Market Share', key: 'share', width: 15, style: 'percentage' },
                    { header: 'Quadrant', key: 'quadrant', width: 18 },
                    { header: 'Recommendation', key: 'recommendation', width: 40 },
                ],
                rows: params.features,
                headerStyle: 'corporate',
            },
        ];

        return this.generate();
    }

    /**
     * Generate a KPI dashboard spreadsheet
     */
    async generateKPIDashboard(params: {
        kpis: Array<{
            metric: string;
            current: number;
            target: number;
            delta: number;
            trend: string;
        }>;
        period: string;
        outputPath: string;
    }): Promise<string> {
        this.config.outputPath = params.outputPath;
        this.config.sheets = [
            {
                name: `KPIs — ${params.period}`,
                columns: [
                    { header: 'Metric', key: 'metric', width: 30 },
                    { header: 'Current', key: 'current', width: 15, style: 'number' },
                    { header: 'Target', key: 'target', width: 15, style: 'number' },
                    { header: 'Delta', key: 'delta', width: 12, style: 'percentage' },
                    { header: 'Trend', key: 'trend', width: 10 },
                ],
                rows: params.kpis,
                headerStyle: 'matrix',
            },
        ];

        return this.generate();
    }

    private addSheet(workbook: ExcelJS.Workbook, data: SheetData): void {
        const sheet = workbook.addWorksheet(data.name);
        const style = HEADER_STYLES[data.headerStyle || 'matrix'];

        // Set columns
        sheet.columns = data.columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 15,
        }));

        // Style header row
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: `FF${style.fill}` },
            };
            cell.font = {
                bold: true,
                color: { argb: `FF${style.font}` },
                size: 11,
            };
            cell.border = {
                bottom: { style: 'thin', color: { argb: `FF${style.border}` } },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        headerRow.height = 25;

        // Add data rows
        for (const row of data.rows) {
            const dataRow = sheet.addRow(row);
            dataRow.eachCell((cell, colNumber) => {
                const colDef = data.columns[colNumber - 1];
                if (colDef?.style === 'percentage') {
                    cell.numFmt = '0.0%';
                } else if (colDef?.style === 'currency') {
                    cell.numFmt = '$#,##0.00';
                }
                cell.border = {
                    bottom: { style: 'hair', color: { argb: `FF${style.border}` } },
                };
            });
        }

        // Auto-filter
        if (data.rows.length > 0) {
            sheet.autoFilter = {
                from: { row: 1, column: 1 },
                to: { row: 1 + data.rows.length, column: data.columns.length },
            };
        }

        // Freeze header row
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
    }
}
