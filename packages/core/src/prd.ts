// PHANTOM Core - Deterministic PRD Generator
import { createHash } from 'crypto';
import { extname } from 'path';
import { getContextEngine } from './context.js';

export interface PRDSection {
  title: string;
  content: string;
}

export interface PRD {
  id: string;
  title: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  createdAt: string;
  updatedAt: string;
  sections: PRDSection[];
  evidence: string[];
}

const REQUIRED_SECTIONS = [
  'Overview',
  'Problem Statement',
  'Goals & Non-Goals',
  'User Stories',
  'Requirements',
  'Success Metrics',
  'Risks & Mitigations',
] as const;

function hashHex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function stableTimestamp(seed: string): string {
  const millis = 1_700_000_000_000 + (parseInt(hashHex(seed).slice(0, 8), 16) % 31_536_000_000);
  return new Date(millis).toISOString();
}

function detectPrimaryLanguages(): string[] {
  const stats = getContextEngine().getStats();
  return Object.entries(stats.byLanguage)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([lang]) => lang);
}

function detectTopArtifacts(): string[] {
  return getContextEngine()
    .getEntries()
    .slice(0, 200)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      const aExt = extname(a.path);
      const bExt = extname(b.path);
      if (aExt !== bExt) return aExt.localeCompare(bExt);
      return a.path.localeCompare(b.path);
    })
    .slice(0, 8)
    .map(entry => `${entry.type}:${entry.relativePath}`);
}

function buildSections(title: string): PRDSection[] {
  const contextStats = getContextEngine().getStats();
  const primaryLanguages = detectPrimaryLanguages();
  const artifacts = detectTopArtifacts();

  const contextSummary = [
    `Context files indexed: ${contextStats.totalFiles}`,
    `Context health score: ${contextStats.healthScore}%`,
    `Primary languages: ${primaryLanguages.length > 0 ? primaryLanguages.join(', ') : 'unknown'}`,
  ].join('\n');

  const sections: PRDSection[] = [
    {
      title: 'Overview',
      content: [
        `## ${title}`,
        '',
        'This PRD is generated from local indexed context and deterministic templates.',
        '',
        contextSummary,
      ].join('\n'),
    },
    {
      title: 'Problem Statement',
      content: [
        '### Problem',
        `Current workflows do not explicitly support "${title}" as a deterministic, testable capability.`,
        '',
        '### Why It Matters',
        '- Reduces ambiguity between product intent and implementation.',
        '- Improves repeatability across planning and delivery workflows.',
        '- Provides clearer operational confidence for release decisions.',
      ].join('\n'),
    },
    {
      title: 'Goals & Non-Goals',
      content: [
        '### Goals',
        `1. Deliver "${title}" with deterministic behavior.`,
        '2. Keep command outputs machine-verifiable.',
        '3. Tie recommendations to evidence from local context.',
        '',
        '### Non-Goals',
        '1. Simulated analytics or illustrative-only recommendations.',
        '2. Hidden side effects not backed by explicit command outputs.',
      ].join('\n'),
    },
    {
      title: 'User Stories',
      content: [
        '1. As a product operator, I can run one command and receive deterministic analysis outputs.',
        '2. As an engineer, I can inspect JSON output and trace evidence/provenance.',
        '3. As a reviewer, I can reproduce the same result for identical context and input.',
      ].join('\n'),
    },
    {
      title: 'Requirements',
      content: [
        '### Functional',
        '1. Command output must include deterministic identifiers and evidence fields.',
        '2. All exposed analysis flows must support `--json` mode.',
        '3. Any not-ready feature must fail explicitly with `not implemented`.',
        '',
        '### Technical',
        `1. Context-backed generation uses ${contextStats.totalFiles} indexed files.`,
        `2. Artifact hints (top entries): ${artifacts.length > 0 ? artifacts.join('; ') : 'none available'}`,
        '3. Output schema must remain backward-compatible unless versioned.',
      ].join('\n'),
    },
    {
      title: 'Success Metrics',
      content: [
        '| Metric | Target |',
        '|---|---|',
        '| Deterministic repeatability | identical output for identical input/context |',
        '| CLI JSON coverage | all analysis commands expose `--json` |',
        '| Runtime trust gate | no simulated/demo markers in production command paths |',
      ].join('\n'),
    },
    {
      title: 'Risks & Mitigations',
      content: [
        '| Risk | Mitigation |',
        '|---|---|',
        '| Context drift causes stale output | Require `context add` refresh in operational playbooks |',
        '| Contract changes break automation clients | Keep schemas versioned and add contract tests |',
        '| Integration instability | Surface doctor errors with explicit remediation steps |',
      ].join('\n'),
    },
  ];

  return sections;
}

function validateSections(sections: PRDSection[]): void {
  const byTitle = new Set(sections.map(section => section.title));
  for (const required of REQUIRED_SECTIONS) {
    if (!byTitle.has(required)) {
      throw new Error(`PRD generation failed: missing required section "${required}"`);
    }
  }
}

export function generatePRD(title: string): PRD {
  const normalized = title.trim();
  if (!normalized) {
    throw new Error('PRD title must not be empty.');
  }

  const contextStats = getContextEngine().getStats();
  const seed = `${normalized.toLowerCase()}|${contextStats.totalFiles}|${contextStats.healthScore}`;
  const id = `prd_${hashHex(seed).slice(0, 12)}`;
  const createdAt = stableTimestamp(seed);
  const sections = buildSections(normalized);
  validateSections(sections);

  return {
    id,
    title: normalized,
    version: '1.0',
    status: 'draft',
    createdAt,
    updatedAt: createdAt,
    sections,
    evidence: [
      `context.totalFiles=${contextStats.totalFiles}`,
      `context.health=${contextStats.healthScore}`,
      `seed=${hashHex(seed).slice(0, 16)}`,
    ],
  };
}

export function prdToMarkdown(prd: PRD): string {
  const lines: string[] = [
    `# PRD: ${prd.title}`,
    '',
    `**ID:** ${prd.id}`,
    `**Version:** ${prd.version}`,
    `**Status:** ${prd.status}`,
    `**Created:** ${prd.createdAt}`,
    `**Updated:** ${prd.updatedAt}`,
    '',
    '**Evidence:**',
    ...prd.evidence.map(item => `- ${item}`),
    '',
    '---',
    '',
  ];

  for (const section of prd.sections) {
    lines.push(`## ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*Generated by PHANTOM — deterministic local PRD engine.*');

  return lines.join('\n');
}
