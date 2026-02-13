// PHANTOM TUI - Screen Analysis Display
import { theme, doubleBox, box, gradientBar } from '../theme/index.js';

export interface ScreenAnalysis {
  filename: string;
  page: string;
  componentsDetected: number;
  issues: {
    severity: 'HIGH' | 'MED' | 'LOW';
    message: string;
  }[];
  recommendations: string[];
}

export interface UXAudit {
  overallScore: number;
  categories: {
    name: string;
    score: number;
  }[];
  topIssues: string[];
}

export function renderScreenAnalysis(analysis: ScreenAnalysis): string {
  const lines: string[] = [];

  lines.push('');

  const issueLines = analysis.issues.map(issue => {
    const color = issue.severity === 'HIGH' ? theme.error : issue.severity === 'MED' ? theme.warning : theme.dim;
    return `  │  ${color('⚠ ' + issue.severity.padEnd(6))} ${theme.secondary(issue.message.padEnd(42))} │`;
  });

  const recoLines = analysis.recommendations.map((rec, i) =>
    `  ${theme.secondary(`${i + 1}. ${rec}`)}`
  );

  const content = [
    '',
    `  ${theme.title('Page:')} ${analysis.page}`,
    `  ${theme.title('Components Detected:')} ${analysis.componentsDetected}`,
    '',
    `  ${theme.title('UX Issues Found:')}`,
    `  ┌${'─'.repeat(54)}┐`,
    ...issueLines,
    `  └${'─'.repeat(54)}┘`,
    '',
    `  ${theme.title('Recommendations:')}`,
    ...recoLines,
    '',
    `  ${theme.dim('[Generate PRD for fixes]')}  ${theme.dim('[Create user stories]')}`,
    `  ${theme.dim('[Show annotated screenshot]')}  ${theme.dim('[Generate new wireframe]')}`,
    '',
  ].join('\n');

  lines.push(doubleBox(content, `SCREEN ANALYSIS: ${analysis.filename}`, 62));

  return lines.join('\n');
}

export function renderUXAudit(audit: UXAudit): string {
  const lines: string[] = [];

  const catLines = audit.categories.map(cat => {
    const bar = gradientBar(cat.score, 10);
    const needsWork = cat.score < 60 ? theme.error('← Critical') : cat.score < 70 ? theme.warning('← Needs work') : '';
    return `  │  ${theme.secondary(cat.name.padEnd(18))} ${bar}  ${cat.score}/100 ${needsWork.padEnd(16)} │`;
  });

  const issueLines = audit.topIssues.map((issue, i) =>
    `  ${theme.secondary(`${i + 1}. ${issue}`)}`
  );

  const content = [
    '',
    `  ${theme.title('Overall UX Score:')} ${audit.overallScore}/100`,
    '',
    `  ┌─ ${theme.title('By Category')} ${'─'.repeat(42)}┐`,
    ...catLines,
    `  └${'─'.repeat(56)}┘`,
    '',
    `  ${theme.title('Top Issues (by impact × frequency):')}`,
    ...issueLines,
    '',
    `  ${theme.dim('[Full Report]')}  ${theme.dim('[Generate Fix PRDs]')}  ${theme.dim('[Prioritize]')}`,
    '',
  ].join('\n');

  lines.push(box(content, 'APP-WIDE UX AUDIT', 62));

  return lines.join('\n');
}

export function getExampleScreenAnalysis(): ScreenAnalysis {
  return {
    filename: 'checkout-page.png',
    page: 'Checkout',
    componentsDetected: 14,
    issues: [
      { severity: 'HIGH', message: 'Form has 12 fields — reduce to ≤6' },
      { severity: 'HIGH', message: 'No progress indicator — add step tracker' },
      { severity: 'MED', message: 'CTA button below fold on mobile' },
      { severity: 'MED', message: 'No trust signals (security badges)' },
      { severity: 'LOW', message: 'Color contrast on helper text: 3.2:1' },
      { severity: 'LOW', message: 'No autofill attributes on address fields' },
    ],
    recommendations: [
      'Split into 3-step wizard (info → shipping → payment)',
      'Add progress bar at top',
      'Move CTA to sticky bottom bar',
      'Add trust badges near payment section',
    ],
  };
}

export function getExampleUXAudit(): UXAudit {
  return {
    overallScore: 72,
    categories: [
      { name: 'Navigation', score: 82 },
      { name: 'Forms & Input', score: 58 },
      { name: 'Visual Design', score: 79 },
      { name: 'Accessibility', score: 52 },
      { name: 'Mobile UX', score: 68 },
      { name: 'Error Handling', score: 44 },
      { name: 'Performance', score: 83 },
    ],
    topIssues: [
      'Inconsistent button styles across 12 screens',
      'Missing error states on 8 forms',
      'No loading states on 15 data-heavy screens',
      'Mobile nav breaks on 6 screens',
      'Color contrast fails WCAG AA on 22 elements',
    ],
  };
}
