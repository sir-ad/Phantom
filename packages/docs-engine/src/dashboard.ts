// ─── PHANTOM DASHBOARD ENGINE ─────────────────────────────────────────
// Generate self-contained HTML dashboards — KPI cards, charts, metrics
// grids, and status boards. Opens in any browser, zero dependencies.

import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

// ─── Types ───────────────────────────────────────────────────────────

export interface DashboardWidget {
    type: 'kpi-card' | 'table' | 'status-list' | 'progress-bar' | 'text-block';
    title: string;
    data: Record<string, unknown>;
    width?: 'full' | 'half' | 'third';
}

export interface DashboardConfig {
    title: string;
    subtitle?: string;
    theme?: 'matrix' | 'corporate' | 'dark';
    outputPath: string;
    widgets: DashboardWidget[];
    autoRefresh?: boolean;
}

// ─── Dashboard Engine ────────────────────────────────────────────────

export class DashboardEngine {
    private config: DashboardConfig;

    constructor(config: DashboardConfig) {
        this.config = config;
    }

    /**
     * Generate a self-contained HTML dashboard
     */
    async generate(): Promise<string> {
        const html = this.buildHTML();

        await mkdir(dirname(this.config.outputPath), { recursive: true });
        await writeFile(this.config.outputPath, html, 'utf-8');

        return this.config.outputPath;
    }

    /**
     * Generate a product health dashboard
     */
    async generateProductDashboard(params: {
        productName: string;
        kpis: Array<{ label: string; value: string; delta: string; trend: 'up' | 'down' | 'flat' }>;
        features: Array<{ name: string; status: string; progress: number }>;
        sprints: Array<{ name: string; velocity: number; planned: number; completed: number }>;
        outputPath: string;
    }): Promise<string> {
        this.config.title = `${params.productName} — Dashboard`;
        this.config.outputPath = params.outputPath;
        this.config.widgets = [
            ...params.kpis.map(kpi => ({
                type: 'kpi-card' as const,
                title: kpi.label,
                data: { value: kpi.value, delta: kpi.delta, trend: kpi.trend },
                width: 'third' as const,
            })),
            {
                type: 'table' as const,
                title: 'Feature Status',
                data: {
                    headers: ['Feature', 'Status', 'Progress'],
                    rows: params.features.map(f => [f.name, f.status, `${f.progress}%`]),
                },
                width: 'full' as const,
            },
            {
                type: 'table' as const,
                title: 'Sprint Velocity',
                data: {
                    headers: ['Sprint', 'Velocity', 'Planned', 'Completed'],
                    rows: params.sprints.map(s => [s.name, String(s.velocity), String(s.planned), String(s.completed)]),
                },
                width: 'full' as const,
            },
        ];

        return this.generate();
    }

    private buildHTML(): string {
        const theme = this.getThemeCSS();
        const widgetHTML = this.config.widgets.map(w => this.renderWidget(w)).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.config.title} — Phantom Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      ${theme.body}
      min-height: 100vh;
    }

    .header {
      padding: 2rem 3rem;
      border-bottom: 1px solid ${theme.border};
    }

    .header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      ${theme.heading}
    }

    .header p {
      font-size: 0.875rem;
      ${theme.subtext}
      margin-top: 0.25rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 2rem 3rem;
    }

    .widget {
      ${theme.card}
      border-radius: 12px;
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .widget:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }

    .widget.full { grid-column: span 3; }
    .widget.half { grid-column: span 2; }
    .widget.third { grid-column: span 1; }

    .widget-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      ${theme.subtext}
      margin-bottom: 0.75rem;
    }

    .kpi-value {
      font-size: 2.5rem;
      font-weight: 700;
      ${theme.heading}
      line-height: 1;
    }

    .kpi-delta {
      font-size: 0.875rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    .kpi-delta.up { color: #00FF41; }
    .kpi-delta.down { color: #FF2D55; }
    .kpi-delta.flat { color: #8B949E; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      ${theme.tableHeader}
      border-bottom: 2px solid ${theme.border};
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid ${theme.border};
      ${theme.subtext}
    }

    tr:hover td { ${theme.rowHover} }

    .progress-bar {
      height: 8px;
      border-radius: 4px;
      background: ${theme.border};
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, #00FF41, #00D4FF);
      transition: width 0.6s ease;
    }

    .footer {
      padding: 1.5rem 3rem;
      text-align: center;
      font-size: 0.75rem;
      ${theme.subtext}
      border-top: 1px solid ${theme.border};
    }

    @media (max-width: 768px) {
      .grid { grid-template-columns: 1fr; }
      .widget.full, .widget.half, .widget.third { grid-column: span 1; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.config.title}</h1>
    <p>${this.config.subtitle || `Generated ${new Date().toLocaleDateString()} · Phantom PM`}</p>
  </div>

  <div class="grid">
    ${widgetHTML}
  </div>

  <div class="footer">
    Phantom PM · Dashboard · ${new Date().toISOString().split('T')[0]}
  </div>
</body>
</html>`;
    }

    private renderWidget(widget: DashboardWidget): string {
        const widthClass = widget.width || 'third';
        let inner = '';

        switch (widget.type) {
            case 'kpi-card': {
                const d = widget.data as { value: string; delta: string; trend: string };
                inner = `
          <div class="widget-title">${widget.title}</div>
          <div class="kpi-value">${d.value}</div>
          <div class="kpi-delta ${d.trend}">${d.delta}</div>`;
                break;
            }

            case 'table': {
                const d = widget.data as { headers: string[]; rows: string[][] };
                const ths = d.headers.map(h => `<th>${h}</th>`).join('');
                const trs = d.rows.map(row =>
                    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
                ).join('');
                inner = `
          <div class="widget-title">${widget.title}</div>
          <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
                break;
            }

            case 'progress-bar': {
                const d = widget.data as { value: number; label: string };
                inner = `
          <div class="widget-title">${widget.title}</div>
          <div style="margin-bottom: 0.5rem; font-size: 0.875rem;">${d.label} — ${d.value}%</div>
          <div class="progress-bar"><div class="progress-fill" style="width: ${d.value}%"></div></div>`;
                break;
            }

            case 'text-block': {
                const d = widget.data as { text: string };
                inner = `
          <div class="widget-title">${widget.title}</div>
          <div style="font-size: 0.875rem; line-height: 1.6;">${d.text}</div>`;
                break;
            }

            case 'status-list': {
                const d = widget.data as { items: Array<{ label: string; status: string }> };
                const items = d.items.map(i =>
                    `<div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span>${i.label}</span><span style="font-weight:600">${i.status}</span>
          </div>`
                ).join('');
                inner = `<div class="widget-title">${widget.title}</div>${items}`;
                break;
            }
        }

        return `<div class="widget ${widthClass}">${inner}</div>`;
    }

    private getThemeCSS() {
        const themes = {
            matrix: {
                body: 'background: #0D1117; color: #E6EDF3;',
                heading: 'color: #00FF41;',
                subtext: 'color: #8B949E;',
                card: 'background: #161B22; border: 1px solid #21262D;',
                border: '#21262D',
                tableHeader: 'color: #00FF41;',
                rowHover: 'background: rgba(0, 255, 65, 0.05);',
            },
            corporate: {
                body: 'background: #F8F9FA; color: #202124;',
                heading: 'color: #1A73E8;',
                subtext: 'color: #5F6368;',
                card: 'background: #FFFFFF; border: 1px solid #DADCE0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);',
                border: '#DADCE0',
                tableHeader: 'color: #1A73E8;',
                rowHover: 'background: #F1F3F4;',
            },
            dark: {
                body: 'background: #1E1E2E; color: #CDD6F4;',
                heading: 'color: #CDD6F4;',
                subtext: 'color: #A6ADC8;',
                card: 'background: #313244; border: 1px solid #45475A;',
                border: '#45475A',
                tableHeader: 'color: #F38BA8;',
                rowHover: 'background: rgba(243, 139, 168, 0.05);',
            },
        };

        return themes[this.config.theme || 'matrix'];
    }
}
