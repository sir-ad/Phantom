import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createInterface } from 'readline';
import {
  generatePRD,
  getConfig,
  getContextEngine,
  getModuleManager,
  getSwarm,
  prdToMarkdown,
} from '@phantom/core';

export type PhantomToolName =
  | 'context.add'
  | 'context.search'
  | 'prd.generate'
  | 'swarm.analyze'
  | 'bridge.translate_pm_to_dev';

type PhantomErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_TOOL'
  | 'INVALID_ARGUMENT'
  | 'TOOL_EXECUTION_ERROR'
  | 'RESOURCE_NOT_FOUND';

interface ToolError {
  code: PhantomErrorCode;
  message: string;
}

export interface ToolRequest {
  tool: PhantomToolName;
  arguments: Record<string, unknown>;
  request_id: string;
}

export interface ToolResponse {
  request_id: string;
  status: 'ok' | 'error';
  result?: unknown;
  errors?: ToolError[];
}

export interface ToolDefinition {
  name: PhantomToolName;
  description: string;
  input_schema: {
    type: 'object';
    required: string[];
    properties: Record<string, { type: string; description: string }>;
  };
}

interface ResourceDefinition {
  uri: string;
  title: string;
  description: string;
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'context.add',
    description: 'Index a path into the local PHANTOM context engine',
    input_schema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: { type: 'string', description: 'Absolute or relative path to index' },
        mode: { type: 'string', description: 'Reserved for future indexing mode options' },
      },
    },
  },
  {
    name: 'context.search',
    description: 'Search indexed context by path and content',
    input_schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Search query text' },
        limit: { type: 'number', description: 'Maximum number of results' },
      },
    },
  },
  {
    name: 'prd.generate',
    description: 'Generate a PRD document from a title',
    input_schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', description: 'PRD title' },
        output_path: { type: 'string', description: 'Optional file path to write markdown output' },
      },
    },
  },
  {
    name: 'swarm.analyze',
    description: 'Run deterministic swarm analysis for a product decision',
    input_schema: {
      type: 'object',
      required: ['question'],
      properties: {
        question: { type: 'string', description: 'Decision question' },
      },
    },
  },
  {
    name: 'bridge.translate_pm_to_dev',
    description: 'Translate PM intent into dev-ready tasks',
    input_schema: {
      type: 'object',
      required: ['pm_intent'],
      properties: {
        pm_intent: { type: 'string', description: 'PM goal or product intent' },
        product_constraints: {
          type: 'string',
          description: 'Optional comma-delimited constraints to honor',
        },
      },
    },
  },
];

const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'phantom://status/summary',
    title: 'Status Summary',
    description: 'Current Phantom runtime status and core configuration summary.',
  },
  {
    uri: 'phantom://projects/summary',
    title: 'Project Summary',
    description: 'Tracked projects and active context metadata.',
  },
  {
    uri: 'phantom://modules/summary',
    title: 'Module Summary',
    description: 'Installed and available module inventory.',
  },
];

function parseStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw invalidArgument(key, 'must be a non-empty string');
  }
  return value.trim();
}

function parseNumberArg(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = args[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw invalidArgument(key, 'must be a finite number');
  }
  return Math.max(1, Math.floor(value));
}

function invalidArgument(field: string, rule: string): Error {
  return new Error(`INVALID_ARGUMENT:${field}:${rule}`);
}

function parseError(error: unknown): ToolError {
  if (error instanceof Error) {
    if (error.message.startsWith('INVALID_ARGUMENT:')) {
      return { code: 'INVALID_ARGUMENT', message: error.message.replace(/^INVALID_ARGUMENT:/, '') };
    }
    return { code: 'TOOL_EXECUTION_ERROR', message: error.message };
  }
  return { code: 'TOOL_EXECUTION_ERROR', message: 'Unknown tool execution error' };
}

function bridgeTranslate(pmIntent: string, constraintsRaw?: unknown): {
  technical_tasks: string[];
  acceptance_criteria: string[];
  risks: string[];
  evidence: string[];
} {
  const lower = pmIntent.toLowerCase();
  const constraints =
    typeof constraintsRaw === 'string'
      ? constraintsRaw
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      : [];

  const technicalTasks = [
    `Define implementation plan for "${pmIntent}"`,
    'Specify API/data model changes with backward-compatibility notes',
    'Implement deterministic business logic and error handling',
    'Add unit/integration coverage for affected command paths',
    'Update operational docs and runbook references',
  ];
  if (lower.includes('checkout') || lower.includes('payment')) {
    technicalTasks.push('Validate payment edge-cases and rollback criteria in staging');
  }
  if (lower.includes('auth') || lower.includes('login')) {
    technicalTasks.push('Verify auth/session boundaries and permission regression tests');
  }

  const acceptanceCriteria = [
    'Output is deterministic for identical input and context state',
    'Command-level JSON contract remains schema valid',
    'Observed errors include actionable remediation notes',
    'Release checks (build/test/installer/reality gate) pass',
  ];

  const risks = [
    'Scope drift if PM intent is not narrowed to a deliverable slice',
    'Dependency uncertainty if external service contracts change',
    'Regression risk without coverage in changed command paths',
  ];
  if (constraints.length > 0) {
    risks.push(`Constraint pressure: ${constraints.join(', ')}`);
  }

  return {
    technical_tasks: technicalTasks,
    acceptance_criteria: acceptanceCriteria,
    risks,
    evidence: [
      `constraints.count=${constraints.length}`,
      `intent.length=${pmIntent.length}`,
    ],
  };
}

function isToolRequest(payload: unknown): payload is ToolRequest {
  if (typeof payload !== 'object' || payload === null) return false;
  const record = payload as Record<string, unknown>;
  if (typeof record.tool !== 'string') return false;
  if (typeof record.request_id !== 'string') return false;
  if (typeof record.arguments !== 'object' || record.arguments === null) return false;
  return TOOL_DEFINITIONS.some(def => def.name === record.tool);
}

export class PhantomMCPServer {
  listTools(): ToolDefinition[] {
    return TOOL_DEFINITIONS;
  }

  listResources(): ResourceDefinition[] {
    return RESOURCES;
  }

  readResource(uri: string): unknown {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    switch (uri) {
      case 'phantom://status/summary':
        return {
          version: cfg.version,
          first_run: cfg.firstRun,
          active_project: cfg.activeProject || null,
          installed_modules: cfg.installedModules.length,
          integrations: cfg.integrations.length,
          mcp: cfg.mcp,
        };
      case 'phantom://projects/summary':
        return {
          active_project: cfg.activeProject || null,
          projects: cfg.projects,
          context_stats: getContextEngine().getStats(),
        };
      case 'phantom://modules/summary': {
        const mm = getModuleManager();
        return {
          installed: cfg.installedModules,
          available: mm.getAvailableModules().map(mod => ({
            name: mod.name,
            version: mod.version,
            description: mod.description,
          })),
        };
      }
      default:
        throw new Error(`RESOURCE_NOT_FOUND:${uri}`);
    }
  }

  async invoke(request: ToolRequest): Promise<ToolResponse> {
    try {
      switch (request.tool) {
        case 'context.add': {
          const path = parseStringArg(request.arguments, 'path');
          const stats = await getContextEngine().addPath(path);
          return ok(request.request_id, { stats });
        }
        case 'context.search': {
          const query = parseStringArg(request.arguments, 'query');
          const limit = parseNumberArg(request.arguments, 'limit', 20);
          const matches = getContextEngine()
            .search(query)
            .slice(0, limit)
            .map(entry => ({
              id: entry.id,
              path: entry.path,
              relative_path: entry.relativePath,
              type: entry.type,
              snippet: entry.content?.slice(0, 200) || '',
            }));
          return ok(request.request_id, { matches });
        }
        case 'prd.generate': {
          const title = parseStringArg(request.arguments, 'title');
          const prd = generatePRD(title);
          const markdown = prdToMarkdown(prd);
          const outputPath = request.arguments.output_path;

          if (typeof outputPath === 'string' && outputPath.trim().length > 0) {
            const targetPath = outputPath.trim();
            mkdirSync(dirname(targetPath), { recursive: true });
            writeFileSync(targetPath, `${markdown}\n`, 'utf8');
            return ok(request.request_id, {
              prd_id: prd.id,
              sections: prd.sections.map(section => section.title),
              evidence: prd.evidence,
              output_path: targetPath,
            });
          }

          return ok(request.request_id, {
            prd_id: prd.id,
            sections: prd.sections.map(section => section.title),
            evidence: prd.evidence,
            markdown,
          });
        }
        case 'swarm.analyze': {
          const question = parseStringArg(request.arguments, 'question');
          const result = await getSwarm().runSwarm(question);
          return ok(request.request_id, { swarm_result: result });
        }
        case 'bridge.translate_pm_to_dev': {
          const pmIntent = parseStringArg(request.arguments, 'pm_intent');
          const bridge = bridgeTranslate(pmIntent, request.arguments.product_constraints);
          return ok(request.request_id, bridge);
        }
        default:
          return err(request.request_id, [{ code: 'INVALID_TOOL', message: `Unknown tool: ${request.tool}` }]);
      }
    } catch (error) {
      return err(request.request_id, [parseError(error)]);
    }
  }
}

function ok(requestId: string, result: unknown): ToolResponse {
  return {
    request_id: requestId,
    status: 'ok',
    result,
  };
}

function err(requestId: string, errors: ToolError[]): ToolResponse {
  return {
    request_id: requestId,
    status: 'error',
    errors,
  };
}

function parseJsonLine(line: string): unknown {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function parseRequestId(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

export async function runStdioServer(): Promise<void> {
  const server = new PhantomMCPServer();
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const payload = parseJsonLine(trimmed);
    if (!payload || typeof payload !== 'object') {
      process.stdout.write(`${JSON.stringify(err('unknown', [{ code: 'INVALID_REQUEST', message: 'Invalid JSON payload' }]))}\n`);
      continue;
    }

    const record = payload as Record<string, unknown>;
    const action = record.action;
    const requestId = parseRequestId(record.request_id, 'unknown');

    if (action === 'tools.list') {
      process.stdout.write(`${JSON.stringify(ok(requestId, { tools: server.listTools() }))}\n`);
      continue;
    }
    if (action === 'resources.list') {
      process.stdout.write(`${JSON.stringify(ok(requestId, { resources: server.listResources() }))}\n`);
      continue;
    }
    if (action === 'resources.read') {
      if (typeof record.uri !== 'string' || record.uri.length === 0) {
        process.stdout.write(
          `${JSON.stringify(err(requestId, [{ code: 'INVALID_ARGUMENT', message: 'uri:must be a non-empty string' }]))}\n`
        );
        continue;
      }
      try {
        const value = server.readResource(record.uri);
        process.stdout.write(`${JSON.stringify(ok(requestId, { uri: record.uri, value }))}\n`);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('RESOURCE_NOT_FOUND:')) {
          process.stdout.write(
            `${JSON.stringify(err(requestId, [{ code: 'RESOURCE_NOT_FOUND', message: error.message.replace(/^RESOURCE_NOT_FOUND:/, '') }]))}\n`
          );
        } else {
          process.stdout.write(`${JSON.stringify(err(requestId, [parseError(error)]))}\n`);
        }
      }
      continue;
    }

    if (isToolRequest(payload)) {
      const response = await server.invoke(payload);
      process.stdout.write(`${JSON.stringify(response)}\n`);
      continue;
    }

    process.stdout.write(
      `${JSON.stringify(
        err(requestId, [{ code: 'INVALID_REQUEST', message: 'Payload must be a valid tool request or supported action' }])
      )}\n`
    );
  }
}
