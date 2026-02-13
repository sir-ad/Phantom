import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createInterface } from 'readline';
import {
  generatePRD,
  getContextEngine,
  getSwarm,
  prdToMarkdown,
} from '@phantom/core';

export type PhantomToolName =
  | 'context.add'
  | 'context.search'
  | 'prd.generate'
  | 'swarm.analyze'
  | 'bridge.translate_pm_to_dev';

export interface ToolRequest {
  tool: PhantomToolName;
  arguments: Record<string, unknown>;
  request_id: string;
}

export interface ToolResponse {
  request_id: string;
  status: 'ok' | 'error';
  result?: unknown;
  errors?: string[];
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
    description: 'Run agent swarm analysis for a product decision',
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

function parseStringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid or missing argument: ${key}`);
  }
  return value.trim();
}

function parseNumberArg(args: Record<string, unknown>, key: string, fallback: number): number {
  const value = args[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value));
  }
  return fallback;
}

function bridgeTranslate(pmIntent: string, constraintsRaw?: unknown): {
  technical_tasks: string[];
  acceptance_criteria: string[];
  risks: string[];
} {
  const lower = pmIntent.toLowerCase();
  const constraints =
    typeof constraintsRaw === 'string'
      ? constraintsRaw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [];

  const technical_tasks = [
    `Create implementation plan for: ${pmIntent}`,
    'Define API and data model updates',
    'Implement UI changes and state handling',
    'Add analytics events for rollout measurement',
    'Add tests (unit + integration) for new behavior',
  ];

  if (lower.includes('checkout') || lower.includes('payment')) {
    technical_tasks.push('Validate payment and tax edge cases in staging');
  }
  if (lower.includes('login') || lower.includes('auth')) {
    technical_tasks.push('Review auth scopes and session handling');
  }

  const acceptance_criteria = [
    'Feature behavior is deterministic for documented core flows',
    'P95 response time target and error-handling requirements are met',
    'Accessibility checks pass for updated UI states',
    'Release notes and rollback procedure are documented',
  ];

  const risks = [
    'Scope drift if PM intent is not narrowed to MVP slice',
    'Integration failures if external provider contracts are unstable',
    'Regression risk without coverage on changed code paths',
  ];

  if (constraints.length > 0) {
    risks.push(`Constraint pressure detected: ${constraints.join(', ')}`);
  }

  return { technical_tasks, acceptance_criteria, risks };
}

export class PhantomMCPServer {
  listTools(): ToolDefinition[] {
    return TOOL_DEFINITIONS;
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
            writeFileSync(targetPath, markdown);
            return ok(request.request_id, {
              prd_id: prd.id,
              markdown,
              output_path: targetPath,
            });
          }

          return ok(request.request_id, {
            prd_id: prd.id,
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
          return err(request.request_id, [`Unknown tool: ${request.tool}`]);
      }
    } catch (error) {
      return err(request.request_id, [error instanceof Error ? error.message : 'Unknown error']);
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

function err(requestId: string, errors: string[]): ToolResponse {
  return {
    request_id: requestId,
    status: 'error',
    errors,
  };
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

    let payload: unknown;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      process.stdout.write(`${JSON.stringify(err('unknown', ['Invalid JSON payload']))}\n`);
      continue;
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'action' in payload &&
      (payload as { action?: unknown }).action === 'tools.list'
    ) {
      const requestIdValue = (payload as { request_id?: unknown }).request_id;
      const requestId = typeof requestIdValue === 'string' ? requestIdValue : 'tools.list';
      process.stdout.write(
        `${JSON.stringify(ok(requestId, { tools: server.listTools() }))}\n`
      );
      continue;
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'tool' in payload &&
      'arguments' in payload &&
      'request_id' in payload
    ) {
      const req = payload as ToolRequest;
      const response = await server.invoke(req);
      process.stdout.write(`${JSON.stringify(response)}\n`);
      continue;
    }

    process.stdout.write(
      `${JSON.stringify(
        err('unknown', ['Payload must be a tool request or tools.list action'])
      )}\n`
    );
  }
}
