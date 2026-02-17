#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';
import { Command } from 'commander';
import {
  PHANTOM_ASCII,
  PHANTOM_VERSION,
  TAGLINE,
  FRAMEWORKS,
  getConfig,
  getContextEngine,
  getModuleManager,
  getSwarm,
  generatePRD,
  prdToMarkdown,
  KNOWN_INTEGRATION_TARGETS,
  isKnownIntegrationTarget,
  scanIntegrations as scanIntegrationTargets,
  connectIntegration as connectIntegrationTarget,
  doctorIntegrations,
  type IntegrationTarget,
  analyzeScreenPath,
  auditScreensPath,
  generateRealDocumentation,
  getRealNudges,
  getRealProducts,
  getRuntimeHealth,
  runDeterministicSimulation,
} from '@phantom-pm/core';
import {
  registerWithAllDetected,
  registerWithSpecificAgent,
  listRegistrationTargets,
} from '@phantom-pm/core';
import { registerConfigCommands } from './commands/config.js';
import { registerStoriesCommands } from './commands/stories.js';
import { startChat } from './commands/chat.js';
import { PhantomMCPServer, runStdioServer, PhantomDiscovery } from '@phantom-pm/mcp-server';
import {
  theme,
  box,
  runBootSequence,
  showFirstRunSetup,
  renderModuleInstall,
  renderModuleStore,
  renderSwarmResult,
  renderHealthDashboard,
  renderNudge,
} from '@phantom-pm/tui';

const program = new Command();

function printJson(payload: unknown): void {
  console.log(JSON.stringify(payload, null, 2));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function failNotImplemented(command: string): void {
  console.error('');
  console.error(theme.error(`  ${command} is not implemented in real runtime mode.`));
  console.error(theme.secondary('  Use implemented commands: status, doctor, context, swarm, screen, health, docs, integrate, mcp.'));
  console.error('');
  process.exitCode = 1;
}

type ModulePayload = Record<string, any>;

function asObject(value: unknown): ModulePayload {
  if (!value || typeof value !== 'object') return {};
  return value as ModulePayload;
}

async function runModuleCommand(
  moduleName: string,
  moduleLabel: string,
  commandName: string,
  args: Record<string, unknown>,
): Promise<ModulePayload> {
  const moduleManager = getModuleManager();
  if (!moduleManager.isInstalled(moduleName)) {
    console.log('');
    console.log(theme.warning(`  ${moduleLabel} module not installed. Installing...`));
    await moduleManager.install(moduleName);
  }
  const result = await moduleManager.executeCommand(moduleName, commandName, args);
  return asObject(result);
}

function parseJsonOption(raw: string | undefined, optionName: string): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON for ${optionName}`);
  }
}

program
  .name('phantom')
  .description(TAGLINE)
  .version(PHANTOM_VERSION, '-v, --version')
  .action(async () => {
    const config = getConfig();
    if (config.isFirstRun()) {
      await runBootSequence();
      await showFirstRunSetup();
      config.completeFirstRun();
      return;
    }

    const cfg = config.get();
    const stats = getContextEngine().getStats();
    const lines = [
      '',
      `  ${theme.secondary('Version:')} ${PHANTOM_VERSION}`,
      `  ${theme.secondary('Active project:')} ${cfg.activeProject || 'none'}`,
      `  ${theme.secondary('Context files:')} ${stats.totalFiles}`,
      `  ${theme.secondary('Installed modules:')} ${cfg.installedModules.length}`,
      `  ${theme.secondary('Integrations:')} ${cfg.integrations.length}`,
      '',
      `  ${theme.dim('Try: phantom --help')}`,
      '',
    ];
    console.log('');
    console.log(theme.green(PHANTOM_ASCII));
    console.log(box(lines.join('\n'), TAGLINE, 60));
  });

const contextCommand = program.command('context').description('Manage product context');

contextCommand
  .command('add <path>')
  .description('Add project files into deterministic local context index')
  .option('--json', 'Output as JSON')
  .action(async (targetPath: string, options: { json?: boolean }) => {
    const resolvedPath = resolve(targetPath);
    const contextEngine = getContextEngine();

    try {
      const stats = await contextEngine.addPath(resolvedPath);
      const config = getConfig();
      config.addProject({
        name: basename(resolvedPath) || 'project',
        path: resolvedPath,
        contextPaths: [resolvedPath],
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      });

      if (options.json) {
        printJson({ path: resolvedPath, stats });
        return;
      }

      console.log('');
      console.log(theme.success('  Context ingested successfully.'));
      console.log(`  ${theme.secondary('Path:')} ${resolvedPath}`);
      console.log(`  ${theme.secondary('Files indexed:')} ${stats.totalFiles}`);
      console.log(`  ${theme.secondary('Total size:')} ${formatSize(stats.totalSize)}`);
      console.log(`  ${theme.secondary('Health score:')} ${stats.healthScore}%`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown context indexing error';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

contextCommand
  .description('Show active project context')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const config = getConfig();
    const project = config.getActiveProject();
    const stats = getContextEngine().getStats();
    const payload = {
      activeProject: project || null,
      contextStats: stats,
    };

    if (options.json) {
      printJson(payload);
      return;
    }

    console.log('');
    if (!project) {
      console.log(theme.warning('  No active project. Add context first: phantom context add ./path'));
      console.log('');
      return;
    }

    console.log(theme.title('  PRODUCT CONTEXT'));
    console.log(`  ${theme.secondary('Project:')} ${project.name}`);
    console.log(`  ${theme.secondary('Path:')} ${project.path}`);
    console.log(`  ${theme.secondary('Indexed files:')} ${stats.totalFiles}`);
    console.log(`  ${theme.secondary('Health score:')} ${stats.healthScore}%`);
    console.log('');
  });

program
  .command('install <module>')
  .description('Install a built-in Phantom module')
  .option('--json', 'Output as JSON')
  .action(async (moduleName: string, options: { json?: boolean }) => {
    try {
      const mm = getModuleManager();
      const mod = await mm.install(moduleName);
      if (options.json) {
        printJson({ status: 'ok', module: mod });
        return;
      }
      await renderModuleInstall(mod);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to install module';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

program
  .command('modules')
  .alias('store')
  .description('Browse built-in module registry')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const mm = getModuleManager();
    const config = getConfig();
    const payload = {
      available: mm.getAvailableModules(),
      installed: config.get().installedModules,
    };
    if (options.json) {
      printJson(payload);
      return;
    }
    console.log(renderModuleStore(payload.available, payload.installed));
  });

const integrateCommand = program.command('integrate').description('Integration operations');

function connectIntegrationAndPrint(target: string, options: { json?: boolean }): void {
  const normalized = target.toLowerCase();
  if (!isKnownIntegrationTarget(normalized)) {
    const error = `Unsupported integration target: ${target}`;
    if (options.json) {
      printJson({ status: 'error', error, supported: KNOWN_INTEGRATION_TARGETS });
    } else {
      console.log('');
      console.log(theme.error(`  ${error}`));
      console.log(`  ${theme.secondary(`Supported: ${KNOWN_INTEGRATION_TARGETS.join(', ')}`)}`);
      console.log('');
    }
    process.exitCode = 1;
    return;
  }

  const connected = connectIntegrationTarget(normalized as IntegrationTarget, process.cwd());
  if (options.json) {
    printJson({ status: 'ok', integration: connected });
    return;
  }
  console.log('');
  console.log(theme.success(`  Integration connected: ${connected.name}`));
  if (connected.detectedPath) {
    console.log(`  ${theme.secondary('Detected at:')} ${connected.detectedPath}`);
  }
  console.log('');
}

integrateCommand
  .command('scan')
  .description('Scan workspace for integration signals')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const scan = scanIntegrationTargets(process.cwd());
    if (options.json) {
      printJson({ integrations: scan });
      return;
    }

    console.log('');
    console.log(theme.title('  INTEGRATION SCAN'));
    console.log('');
    for (const item of scan) {
      const mark = item.detected ? theme.check : theme.warning_icon;
      console.log(`  ${mark} ${item.target} ${theme.dim(`(${item.reason})`)}`);
      if (item.detectedPath) console.log(`    ${theme.dim(item.detectedPath)}`);
    }
    console.log('');
  });

integrateCommand
  .command('doctor')
  .description('Validate configured integrations')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const checks = doctorIntegrations(process.cwd());
    if (options.json) {
      printJson({ checks });
      return;
    }

    console.log('');
    console.log(theme.title('  INTEGRATION DOCTOR'));
    console.log('');
    for (const check of checks.filter(c => c.configured || c.detected)) {
      const mark = check.healthy ? theme.check : theme.warning_icon;
      console.log(`  ${mark} ${check.target} ${theme.dim(`(${check.reason})`)}`);
      if (check.detectedPath) console.log(`    ${theme.dim(check.detectedPath)}`);
    }
    if (!checks.some(c => c.configured || c.detected)) {
      console.log(theme.warning('  No integration signals or configured targets yet.'));
    }
    console.log('');
  });

integrateCommand
  .command('connect <target>')
  .description('Connect a specific integration target')
  .option('--json', 'Output as JSON')
  .action((target: string, options: { json?: boolean }) => {
    connectIntegrationAndPrint(target, options);
  });

integrateCommand
  .description('Show integration usage')
  .action(() => {
    console.log('');
    console.log(`  ${theme.secondary('Usage:')}`);
    console.log(`  ${theme.accent('phantom integrate scan --json')}`);
    console.log(`  ${theme.accent('phantom integrate connect github --json')}`);
    console.log(`  ${theme.accent('phantom integrate doctor --json')}`);
    console.log(`  ${theme.accent('phantom integrate github --json')}`);
    console.log('');
  });

const mcpCommand = program.command('mcp').description('MCP server commands');

mcpCommand
  .command('tools')
  .description('List supported MCP tools')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const server = new PhantomMCPServer();
    const tools = server.listTools();
    if (options.json) {
      printJson({ tools });
      return;
    }
    console.log('');
    console.log(theme.title('  MCP TOOLS'));
    console.log('');
    for (const tool of tools) {
      console.log(`  ${theme.check} ${tool.name}`);
      console.log(`    ${theme.dim(tool.description)}`);
    }
    console.log('');
  });

mcpCommand
  .command('serve')
  .description('Run MCP server over stdio')
  .option('--mode <mode>', 'transport mode', 'stdio')
  .action(async (options: { mode: string }) => {
    const mode = options.mode === 'legacy-jsonl' ? 'legacy-jsonl' : 'stdio';
    if (options.mode !== 'stdio' && options.mode !== 'legacy-jsonl') {
      console.log('');
      console.log(theme.warning(`  Unsupported mode '${options.mode}', using stdio or legacy-jsonl.`));
      console.log('');
    }
    await runStdioServer(mode);
  });

mcpCommand
  .command('status')
  .description('Check MCP integration status')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    const { PhantomDiscovery } = await import('@phantom-pm/mcp-server');
    const report = await PhantomDiscovery.healthReport();

    if (options.json) {
      printJson(report);
      return;
    }

    console.log('');
    console.log(theme.title('  MCP INTEGRATION STATUS'));
    console.log('');

    // Check MCP server
    const mcpRunning = report.mcp_server.status === 'running';
    console.log(`  ${theme.secondary('MCP Server:')} ${mcpRunning ? theme.success('Running') : theme.error('Not responding')}`);

    // Check agent registrations
    const agents = report.agents;
    const installedAgents = agents.filter(agent => agent.installed);

    if (installedAgents.length === 0) {
      console.log('');
      console.log(theme.warning('  No AI agents detected on this system.'));
      console.log(theme.dim('  Install Cursor, Codex, or other MCP-compatible editors to enable integration.'));
      console.log('');
      return;
    }

    console.log('');
    console.log(theme.secondary(`  Detected Agents (${installedAgents.length}):`));

    for (const agent of installedAgents) {
      const status = agent.registered ? theme.success('Registered') : theme.warning('Not registered');
      console.log(`    ${agent.name}: ${status}`);
    }

    console.log('');
    if (mcpRunning && installedAgents.some(agent => agent.registered)) {
      console.log(theme.success('  ✅ MCP integration is ready!'));
      console.log(theme.dim('  Restart your AI agents to enable PHANTOM integration.'));
    } else {
      console.log(theme.warning('  ⚠️  MCP integration needs attention.'));
      console.log(theme.dim('  Run "phantom mcp register" to register with agents.'));
    }
    console.log('');
  });

mcpCommand
  .command('register')
  .description('Manually register with detected AI agents')
  .action(async () => {
    const { PhantomDiscovery } = await import('@phantom-pm/mcp-server');

    console.log('');
    console.log(theme.title('  MCP REGISTRATION'));
    console.log('');

    await PhantomDiscovery.autoRegisterAll();

    console.log('');
    console.log(theme.success('  Registration process completed!'));
    console.log(theme.dim('  Restart your AI agents to enable PHANTOM integration.'));
    console.log('');
  });

program
  .command('status')
  .description('Show Phantom runtime status')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    const payload = {
      version: PHANTOM_VERSION,
      firstRun: cfg.firstRun,
      activeProject: cfgMgr.getActiveProject() || null,
      installedModules: cfg.installedModules,
      integrations: cfg.integrations,
      dataMode: cfg.dataMode,
      permissionLevel: cfg.permissionLevel,
      theme: cfg.theme,
      installation: cfg.installation,
      mcp: cfg.mcp,
      security: cfg.security,
    };
    if (options.json) {
      printJson(payload);
      return;
    }
    console.log('');
    console.log(theme.title('  PHANTOM STATUS'));
    console.log(`  ${theme.secondary('Version:')} ${payload.version}`);
    console.log(`  ${theme.secondary('Active Project:')} ${payload.activeProject?.name || 'none'}`);
    console.log(`  ${theme.secondary('Installed Modules:')} ${payload.installedModules.length}`);
    console.log(`  ${theme.secondary('Integrations:')} ${payload.integrations.length}`);
    console.log('');
  });

program
  .command('doctor')
  .description('Run local environment and Phantom health checks')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    const checks = [
      {
        name: 'Config directory',
        ok: existsSync(cfgMgr.getConfigDir()),
        detail: cfgMgr.getConfigDir(),
      },
      {
        name: 'Context entries present',
        ok: getContextEngine().getEntries().length > 0,
        detail: `${getContextEngine().getEntries().length}`,
      },
      {
        name: 'CLI build artifact',
        ok: existsSync(join(process.cwd(), 'packages/cli/dist/index.js')),
        detail: 'packages/cli/dist/index.js',
      },
      {
        name: 'Config schema keys',
        ok:
          typeof cfg.installation.channel === 'string' &&
          typeof cfg.installation.version === 'string' &&
          typeof cfg.mcp.enabled === 'boolean' &&
          typeof cfg.mcp.server_mode === 'string' &&
          Array.isArray(cfg.integrations) &&
          typeof cfg.security.audit_log_path === 'string',
        detail: 'installation/mcp/integrations/security',
      },
    ];
    const passCount = checks.filter(c => c.ok).length;
    const payload = {
      checks,
      summary: {
        passing: passCount,
        total: checks.length,
        healthy: passCount === checks.length,
      },
    };

    if (options.json) {
      printJson(payload);
      return;
    }

    console.log('');
    console.log(theme.title('  PHANTOM DOCTOR'));
    console.log('');
    for (const check of checks) {
      const icon = check.ok ? theme.check : theme.warning_icon;
      console.log(`  ${icon} ${check.name.padEnd(26)} ${theme.dim(check.detail)}`);
    }
    console.log('');
    if (payload.summary.healthy) {
      console.log(theme.success(`  All checks passed (${passCount}/${checks.length}).`));
    } else {
      console.log(theme.warning(`  Some checks need attention (${passCount}/${checks.length}).`));
    }
    console.log('');
  });

program
  .command('register')
  .description('Register Phantom MCP server with detected AI agents')
  .option('--target <agent>', 'Register with a specific agent (e.g. cursor, claude-code)')
  .option('--all', 'Register with ALL detected agents')
  .option('--list', 'List all registration targets and their status')
  .option('--json', 'Output as JSON')
  .action(async (options: { target?: string; all?: boolean; list?: boolean; json?: boolean }) => {
    try {
      const cwd = process.cwd();

      if (options.list) {
        const targets = listRegistrationTargets(cwd);
        if (options.json) {
          printJson({ targets });
          return;
        }
        console.log('');
        console.log(theme.title('  MCP REGISTRATION TARGETS'));
        console.log('');
        for (const t of targets) {
          const statusIcon = t.registered ? theme.success('✓ Registered') :
            t.exists ? theme.warning('○ Not registered') :
              theme.dim('— Config not found');
          console.log(`  ${theme.accent(t.agentName.padEnd(30))} ${statusIcon}`);
          console.log(`  ${theme.dim(t.configPath)}`);
          console.log('');
        }
        return;
      }

      if (options.target) {
        const result = registerWithSpecificAgent(cwd, options.target);
        if (options.json) {
          printJson(result);
          return;
        }
        console.log('');
        if (result.success) {
          console.log(theme.success(`  ✓ Phantom MCP registered with ${result.agentName}`));
          console.log(`  ${theme.secondary('Config:')} ${result.configPath}`);
          console.log(`  ${theme.secondary('Action:')} ${result.action}`);
        } else {
          console.log(theme.error(`  ✗ Failed: ${result.message}`));
        }
        console.log('');
        return;
      }

      // Default: register with all detected agents
      const summary = await registerWithAllDetected(cwd);
      if (options.json) {
        printJson(summary);
        return;
      }

      console.log('');
      console.log(theme.title('  PHANTOM MCP AUTO-REGISTRATION'));
      console.log('');
      for (const result of summary.results) {
        const icon = result.success
          ? (result.action === 'skipped' ? '○' : '✓')
          : '✗';
        const color = result.success
          ? (result.action === 'skipped' ? theme.dim : theme.success)
          : theme.error;
        console.log(`  ${color(`${icon} ${result.agentName}`)} — ${result.message}`);
      }
      console.log('');
      console.log(theme.secondary(`  Total: ${summary.totalTargets} | Registered: ${summary.successful} | Skipped: ${summary.skipped} | Errors: ${summary.errors}`));
      if (summary.successful > 0) {
        console.log('');
        console.log(theme.success('  Restart your AI agents to activate Phantom integration.'));
      }
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

const prdCommand = program.command('prd').description('PRD operations');

// Register config commands
registerConfigCommands(program);

// Register stories commands
registerStoriesCommands(program);

prdCommand
  .command('create <title>')
  .description('Generate AI-powered PRD from title + local context')
  .option('--out <path>', 'Output file path')
  .option('--json', 'Output as JSON')
  .option('--technical', 'Include technical requirements')
  .option('--ux', 'Include UX wireframe descriptions')
  .option('--metrics', 'Include metrics framework')
  .action(async (title: string, options: { out?: string; json?: boolean; technical?: boolean; ux?: boolean; metrics?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure prd-forge module is installed
      if (!moduleManager.isInstalled('prd-forge')) {
        console.log('');
        console.log(theme.warning('  PRD Forge module not installed. Installing...'));
        await moduleManager.install('prd-forge');
      }

      const result = await moduleManager.executeCommand('prd-forge', 'prd create', {
        title,
        technical: options.technical,
        ux: options.ux,
        metrics: options.metrics,
        output: options.out || './.phantom/output/prds',
      });

      const outputPath = result.prd.filePath || './.phantom/output/prds';

      const payload = {
        status: 'ok',
        module: 'prd-forge',
        prd: result.prd,
        metadata: result.metadata,
      };

      if (options.json) {
        printJson(payload);
        return;
      }

      console.log('');
      console.log(theme.success(`  PRD generated: ${result.prd.title}`));
      console.log(`  ${theme.secondary('ID:')} ${result.prd.id}`);
      console.log(`  ${theme.secondary('Sections:')} ${result.prd.sections.length}`);
      console.log(`  ${theme.secondary('Model:')} ${result.metadata.model}`);
      console.log(`  ${theme.secondary('Tokens:')} ${result.metadata.tokenCount}`);
      console.log(`  ${theme.secondary('Output:')} ${outputPath}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate PRD';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

prdCommand
  .command('list')
  .description('List generated PRDs from .phantom/output/prds directory')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const outDir = join(process.cwd(), '.phantom', 'output', 'prds');
    const items = existsSync(outDir)
      ? readdirSync(outDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const path = join(outDir, file);
          return {
            name: file,
            path,
            sizeBytes: statSync(path).size,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name))
      : [];

    if (options.json) {
      printJson({ files: items });
      return;
    }

    console.log('');
    console.log(theme.title('  PRD LIBRARY'));
    console.log('');
    if (items.length === 0) {
      console.log(theme.warning('  No PRDs found in .phantom/output/prds/.'));
    } else {
      for (const item of items) {
        console.log(`  ${theme.check} ${item.name} ${theme.dim(`(${formatSize(item.sizeBytes)})`)}`);
      }
    }
    console.log('');
  });

program
  .command('swarm <question>')
  .description('Run deterministic multi-agent product analysis')
  .option('--json', 'Output as JSON')
  .action(async (question: string, options: { json?: boolean }) => {
    try {
      const result = await getSwarm().runSwarm(question);
      if (options.json) {
        printJson(result);
        return;
      }
      console.log(renderSwarmResult(result));
      console.log(`  ${theme.dim(`Evidence count: ${result.evidence.length}`)}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Swarm analysis failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

const screenCommand = program.command('screen').description('Screen analysis commands');

screenCommand
  .command('analyze <path>')
  .description('Analyze a single screenshot with deterministic UX checks')
  .option('--json', 'Output as JSON')
  .action((targetPath: string, options: { json?: boolean }) => {
    try {
      const analysis = analyzeScreenPath(targetPath);
      if (options.json) {
        printJson(analysis);
        return;
      }
      console.log('');
      console.log(theme.title(`  SCREEN ANALYSIS: ${analysis.filename}`));
      console.log(`  ${theme.secondary('Path:')} ${analysis.path}`);
      console.log(`  ${theme.secondary('Score:')} ${analysis.score}/100`);
      console.log(`  ${theme.secondary('Components detected:')} ${analysis.componentsDetected}`);
      for (const issue of analysis.issues) {
        console.log(`  ${theme.warning_icon} ${issue.severity} ${issue.message}`);
      }
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Screen analysis failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

screenCommand
  .command('audit [path]')
  .description('Audit one image or image directory')
  .option('--json', 'Output as JSON')
  .action((targetPath: string | undefined, options: { json?: boolean }) => {
    try {
      const audit = auditScreensPath(targetPath || join(process.cwd(), 'screenshots'));
      if (options.json) {
        printJson(audit);
        return;
      }
      console.log('');
      console.log(theme.title('  SCREEN AUDIT'));
      console.log(`  ${theme.secondary('Files analyzed:')} ${audit.filesAnalyzed}`);
      console.log(`  ${theme.secondary('Overall score:')} ${audit.overallScore}/100`);
      console.log(`  ${theme.secondary('Issues:')} HIGH=${audit.issuesBySeverity.HIGH} MED=${audit.issuesBySeverity.MED} LOW=${audit.issuesBySeverity.LOW}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Screen audit failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

program
  .command('health')
  .description('Show real runtime health metrics')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const data = getRuntimeHealth(process.cwd());
    if (options.json) {
      printJson(data);
      return;
    }
    console.log('');
    console.log(renderHealthDashboard(data));
    console.log('');
  });

program
  .command('simulate <scenario>')
  .description('Run deterministic simulation for a product scenario')
  .option('--json', 'Output as JSON')
  .action((scenario: string, options: { json?: boolean }) => {
    const result = runDeterministicSimulation(scenario);
    if (options.json) {
      printJson(result);
      return;
    }
    console.log('');
    console.log(theme.title('  DETERMINISTIC SIMULATION'));
    console.log(`  ${theme.secondary('Scenario:')} ${result.scenario}`);
    console.log(`  ${theme.secondary('Seed:')} ${result.seed}`);
    console.log(`  ${theme.secondary('Baseline:')} ${result.metrics.baseline}`);
    console.log(`  ${theme.secondary('Projected:')} ${result.metrics.projected}`);
    console.log(`  ${theme.secondary('Delta (%):')} ${result.metrics.deltaPercent}`);
    console.log(`  ${theme.secondary('Confidence:')} ${result.metrics.confidence}%`);
    console.log('');
  });

program
  .command('nudge')
  .description('Show intelligent nudges and suggestions')
  .option('--json', 'Output as JSON')
  .option('--dismiss <id>', 'Dismiss a specific nudge')
  .option('--snooze <id>', 'Snooze a nudge (minutes)')
  .option('--refresh', 'Generate new nudges based on current context')
  .action(async (options: { json?: boolean; dismiss?: string; snooze?: string; refresh?: boolean }) => {
    try {
      const { NudgeEngine, getConfig, getContextEngine, getModuleManager } = await import('@phantom-pm/core');
      const engine = new NudgeEngine();

      // Handle dismiss/snooze actions
      if (options.dismiss) {
        const success = engine.dismissNudge(options.dismiss);
        if (options.json) {
          printJson({ status: success ? 'ok' : 'error', action: 'dismiss', id: options.dismiss });
        } else if (success) {
          console.log(theme.success(`  Nudge dismissed: ${options.dismiss}`));
        } else {
          console.log(theme.error(`  Failed to dismiss nudge: ${options.dismiss}`));
        }
        return;
      }

      if (options.snooze) {
        const [id, minutesStr] = options.snooze.split(':');
        const minutes = parseInt(minutesStr || '60');
        const success = engine.snoozeNudge(id, minutes);
        if (options.json) {
          printJson({ status: success ? 'ok' : 'error', action: 'snooze', id, minutes });
        } else if (success) {
          console.log(theme.success(`  Nudge snoozed for ${minutes} minutes: ${id}`));
        } else {
          console.log(theme.error(`  Failed to snooze nudge: ${id}`));
        }
        return;
      }

      // Generate new nudges if requested
      if (options.refresh) {
        const config = getConfig();
        const cfg = config.get();
        const context = getContextEngine();
        const modules = getModuleManager();

        const userContext = {
          activeProject: cfg.activeProject || null,
          installedModules: cfg.installedModules,
          connectedAgents: [], // TODO: Get from registry
          recentActions: [], // TODO: Track recent actions
          currentDirectory: process.cwd(),
          timeOfDay: new Date().getHours().toString(),
          dayOfWeek: new Date().getDay().toString()
        };

        await engine.generateNudges(userContext);
      }

      // Get current nudges
      const nudges = engine.getCurrentNudges();
      const stats = engine.getNudgeStats();

      if (options.json) {
        printJson({ nudges, stats });
        return;
      }

      console.log('');
      console.log(theme.title('  INTELLIGENT NUDGES'));
      console.log(theme.secondary(`  Active: ${stats.active} | Total Generated: ${stats.totalGenerated}`));
      console.log('');

      if (nudges.length === 0) {
        console.log(theme.success('  🎉 No active nudges. Everything looks good!'));
        console.log(theme.dim('  Run with --refresh to generate new contextual suggestions'));
        console.log('');
        return;
      }

      // Display nudges by priority
      const priorityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];

      for (const priority of priorityOrder) {
        const priorityNudges = nudges.filter(n => n.priority === priority);
        if (priorityNudges.length === 0) continue;

        const priorityTitle = {
          'critical': '🚨 CRITICAL ALERTS',
          'high': '⚠️  HIGH PRIORITY',
          'medium': '💡 RECOMMENDATIONS',
          'low': '📢 SUGGESTIONS'
        }[priority];

        console.log(theme.title(`  ${priorityTitle}`));
        console.log('');

        for (const nudge of priorityNudges) {
          const typeIcon = {
            'suggestion': '💡',
            'warning': '⚠️',
            'opportunity': '✨',
            'insight': '🔮',
            'alert': '🚨'
          }[nudge.type] || '📋';

          console.log(`  ${typeIcon} ${theme.accent(nudge.title)}`);
          console.log(`     ${nudge.message}`);
          if (nudge.command) {
            console.log(`     ${theme.dim(`Command: ${nudge.command}`)}`);
          }
          if (nudge.suggestions.length > 0) {
            console.log(`     ${theme.dim('Suggestions:')} ${nudge.suggestions.join(' • ')}`);
          }
          console.log(`     ${theme.dim(`ID: ${nudge.id} | ${new Date(nudge.timestamp).toLocaleString()}`)}`);
          console.log('');
        }
      }

      console.log(theme.dim('  Use: phantom nudge --dismiss <id> to dismiss a nudge'));
      console.log(theme.dim('  Use: phantom nudge --snooze <id>:<minutes> to snooze'));
      console.log(theme.dim('  Use: phantom nudge --refresh to generate new suggestions'));
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nudge system error';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

program
  .command('products')
  .description('Show persisted project/product portfolio')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const products = getRealProducts(process.cwd());
    if (options.json) {
      printJson({ products });
      return;
    }
    if (products.length === 0) {
      console.log('');
      console.log(theme.warning('  No products found. Add context with: phantom context add ./project'));
      console.log('');
      return;
    }

    const lines = products.map((p) => {
      const status = p.active ? theme.success('active') : p.paused ? theme.warning('paused') : theme.dim('tracked');
      return `  ${p.name.padEnd(28)} ${status}  health=${p.health}%  context_files=${p.contextFiles}`;
    });
    console.log('');
    console.log(box(lines.join('\n'), 'PRODUCT PORTFOLIO', 80));
    console.log('');
  });

const docsCommand = program.command('docs').description('Documentation operations');

const sprintCommand = program.command('sprint').description('Sprint planning operations');

sprintCommand
  .command('plan')
  .description('Plan a new sprint')
  .option('--goal <string>', 'Sprint goal')
  .option('--duration <days>', 'Sprint duration in days', '14')
  .option('--velocity <points>', 'Team velocity in story points')
  .option('--backlog <path>', 'Path to backlog file')
  .option('--json', 'Output as JSON')
  .action(async (options: { goal?: string; duration?: string; velocity?: string; backlog?: string; json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure sprint-planner module is installed
      if (!moduleManager.isInstalled('sprint-planner')) {
        console.log('');
        console.log(theme.warning('  Sprint Planner module not installed. Installing...'));
        await moduleManager.install('sprint-planner');
      }

      const result = await moduleManager.executeCommand('sprint-planner', 'sprint plan', {
        goal: options.goal,
        duration: options.duration ? parseInt(options.duration) : undefined,
        velocity: options.velocity ? parseInt(options.velocity) : undefined,
        backlog: options.backlog,
        _: ['plan'],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Sprint plan generated successfully!'));
      console.log(`  ${theme.secondary('Sprint:')} ${result.sprint.name}`);
      console.log(`  ${theme.secondary('Goal:')} ${result.sprint.goal}`);
      console.log(`  ${theme.secondary('Stories:')} ${result.sprint.stories}`);
      console.log(`  ${theme.secondary('Total Points:')} ${result.sprint.totalPoints}`);
      console.log(`  ${theme.secondary('Dates:')} ${result.sprint.startDate} to ${result.sprint.endDate}`);
      console.log(`  ${theme.secondary('Output:')} ${result.filePath}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate sprint plan';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

sprintCommand
  .command('retro')
  .description('Generate sprint retrospective')
  .option('--sprint <path>', 'Path to sprint data file')
  .option('--json', 'Output as JSON')
  .action(async (options: { sprint?: string; json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure sprint-planner module is installed
      if (!moduleManager.isInstalled('sprint-planner')) {
        console.log('');
        console.log(theme.warning('  Sprint Planner module not installed. Installing...'));
        await moduleManager.install('sprint-planner');
      }

      const result = await moduleManager.executeCommand('sprint-planner', 'sprint retro', {
        sprint: options.sprint,
        _: ['retro'],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Sprint retrospective generated successfully!'));
      console.log(`  ${theme.secondary('Type:')} ${result.type}`);
      if (result.filePath) {
        console.log(`  ${theme.secondary('Output:')} ${result.filePath}`);
      }
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate sprint retrospective';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

sprintCommand
  .description('Show sprint planning usage')
  .action(() => {
    console.log('');
    console.log(theme.title('  SPRINT PLANNING'));
    console.log(theme.secondary('  AI-powered sprint planning with velocity tracking'));
    console.log('');
    console.log(`  ${theme.accent('phantom sprint plan --goal "Sprint Goal"')}`);
    console.log(`  ${theme.accent('phantom sprint plan --duration 10 --velocity 15')}`);
    console.log(`  ${theme.accent('phantom sprint retro --sprint ./sprint-data.json')}`);
    console.log('');
  });

const bridgeCommand = program.command('bridge').description('PM ↔ Dev translation operations');

bridgeCommand
  .command('translate <intent>')
  .description('Translate PM intent to technical tasks')
  .option('--constraints <constraints>', 'Comma-separated constraints')
  .option('--json', 'Output as JSON')
  .action(async (intent: string, options: { constraints?: string; json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure bridge module is installed
      if (!moduleManager.isInstalled('bridge')) {
        console.log('');
        console.log(theme.warning('  Bridge module not installed. Installing...'));
        await moduleManager.install('bridge');
      }

      const result = await moduleManager.executeCommand('bridge', 'bridge translate', {
        intent,
        constraints: options.constraints,
        _: ['translate', intent],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Translation completed successfully!'));
      console.log(`  ${theme.secondary('Technical Tasks:')} ${result.translation.technicalTasks.length}`);
      console.log(`  ${theme.secondary('Acceptance Criteria:')} ${result.translation.acceptanceCriteria.length}`);
      console.log(`  ${theme.secondary('Risks Identified:')} ${result.translation.risks.length}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to translate PM intent';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

bridgeCommand
  .command('spec <requirements>')
  .description('Generate technical specification from requirements')
  .option('--json', 'Output as JSON')
  .action(async (requirements: string, options: { json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure bridge module is installed
      if (!moduleManager.isInstalled('bridge')) {
        console.log('');
        console.log(theme.warning('  Bridge module not installed. Installing...'));
        await moduleManager.install('bridge');
      }

      const result = await moduleManager.executeCommand('bridge', 'bridge spec', {
        requirements,
        _: ['spec', requirements],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Technical specification generated successfully!'));
      console.log(`  ${theme.secondary('Architecture:')} ${result.specification.architecture}`);
      console.log(`  ${theme.secondary('API Endpoints:')} ${result.specification.apiEndpoints.length}`);
      console.log(`  ${theme.secondary('Dependencies:')} ${result.specification.dependencies.length}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate technical specification';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

bridgeCommand
  .description('Show bridge usage')
  .action(() => {
    console.log('');
    console.log(theme.title('  BRIDGE TRANSLATION'));
    console.log(theme.secondary('  Bidirectional PM ↔ Dev translation engine'));
    console.log('');
    console.log(`  ${theme.accent('phantom bridge translate "Implement user authentication"')}`);
    console.log(`  ${theme.accent('phantom bridge spec "Authentication system with OAuth support"')}`);
    console.log('');
  });

// Add the new commands to the existing command structure

const competitiveCommand = program.command('competitive').description('Competitive analysis operations');

competitiveCommand
  .command('analyze <subject>')
  .description('Analyze competitors in a market space')
  .option('--depth <level>', 'Analysis depth (brief|detailed|comprehensive)', 'detailed')
  .option('--trends', 'Include market trends')
  .option('--json', 'Output as JSON')
  .action(async (subject: string, options: { depth?: string; trends?: boolean; json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure competitive module is installed
      if (!moduleManager.isInstalled('competitive')) {
        console.log('');
        console.log(theme.warning('  Competitive Analysis module not installed. Installing...'));
        await moduleManager.install('competitive');
      }

      const result = await moduleManager.executeCommand('competitive', 'competitive analyze', {
        subject,
        depth: options.depth,
        trends: options.trends,
        _: ['analyze', subject],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Competitive analysis completed successfully!'));
      console.log(`  ${theme.secondary('Subject:')} ${result.analysis.subject}`);
      console.log(`  ${theme.secondary('Competitors Found:')} ${result.analysis.competitorCount}`);
      console.log(`  ${theme.secondary('Output:')} ${result.filePath}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to run competitive analysis';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

competitiveCommand
  .command('watch <competitor>')
  .description('Watch a competitor for updates')
  .option('--json', 'Output as JSON')
  .action(async (competitor: string, options: { json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure competitive module is installed
      if (!moduleManager.isInstalled('competitive')) {
        console.log('');
        console.log(theme.warning('  Competitive Analysis module not installed. Installing...'));
        await moduleManager.install('competitive');
      }

      const result = await moduleManager.executeCommand('competitive', 'competitive watch', {
        competitor,
        _: ['watch', competitor],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Competitor watch initiated!'));
      console.log(`  ${theme.secondary('Competitor:')} ${result.competitor}`);
      console.log(`  ${theme.secondary('Report:')} ${result.report}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate competitor watch';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

competitiveCommand
  .description('Show competitive analysis usage')
  .action(() => {
    console.log('');
    console.log(theme.title('  COMPETITIVE ANALYSIS'));
    console.log(theme.secondary('  Monitor competitors and analyze market positioning'));
    console.log('');
    console.log(`  ${theme.accent('phantom competitive analyze "project management software"')}`);
    console.log(`  ${theme.accent('phantom competitive watch "Notion"')}`);
    console.log(`  ${theme.accent('phantom competitive analyze "AI tools" --depth comprehensive')}`);
    console.log('');
  });

const analyticsCommand = program.command('analytics').description('Analytics operations');

analyticsCommand
  .command('dashboard')
  .description('Generate analytics dashboard')
  .option('--period <days>', 'Analysis period', 'last 30 days')
  .option('--categories <list>', 'Comma-separated metric categories')
  .option('--format <type>', 'Output format (json|markdown)', 'json')
  .option('--json', 'Output as JSON')
  .action(async (options: { period?: string; categories?: string; format?: string; json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure analytics-lens module is installed
      if (!moduleManager.isInstalled('analytics-lens')) {
        console.log('');
        console.log(theme.warning('  Analytics Lens module not installed. Installing...'));
        await moduleManager.install('analytics-lens');
      }

      const result = await moduleManager.executeCommand('analytics-lens', 'analytics dashboard', {
        period: options.period,
        categories: options.categories,
        format: options.format,
        _: ['dashboard'],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Analytics dashboard generated successfully!'));
      console.log(`  ${theme.secondary('Dashboard:')} ${result.dashboard.name}`);
      console.log(`  ${theme.secondary('Period:')} ${result.dashboard.period}`);
      console.log(`  ${theme.secondary('Metrics:')} ${result.dashboard.metricCount}`);
      console.log(`  ${theme.secondary('Output:')} ${result.filePath}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate analytics dashboard';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

analyticsCommand
  .command('report')
  .description('Generate analytics report')
  .option('--period <days>', 'Analysis period', 'last quarter')
  .option('--focus <area>', 'Report focus area')
  .option('--format <type>', 'Output format (json|markdown)', 'json')
  .option('--json', 'Output as JSON')
  .action(async (options: { period?: string; focus?: string; format?: string; json?: boolean }) => {
    try {
      const moduleManager = getModuleManager();

      // Ensure analytics-lens module is installed
      if (!moduleManager.isInstalled('analytics-lens')) {
        console.log('');
        console.log(theme.warning('  Analytics Lens module not installed. Installing...'));
        await moduleManager.install('analytics-lens');
      }

      const result = await moduleManager.executeCommand('analytics-lens', 'analytics report', {
        period: options.period,
        focus: options.focus,
        format: options.format,
        _: ['report'],
      });

      if (options.json) {
        printJson(result);
        return;
      }

      console.log('');
      console.log(theme.success('  Analytics report generated successfully!'));
      console.log(`  ${theme.secondary('Report:')} ${result.report.title}`);
      console.log(`  ${theme.secondary('Period:')} ${result.report.period}`);
      console.log(`  ${theme.secondary('Metrics:')} ${result.report.metricCount}`);
      console.log(`  ${theme.secondary('Output:')} ${result.filePath}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate analytics report';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

analyticsCommand
  .description('Show analytics usage')
  .action(() => {
    console.log('');
    console.log(theme.title('  ANALYTICS LENS'));
    console.log(theme.secondary('  Connect to analytics platforms and surface actionable insights'));
    console.log('');
    console.log(`  ${theme.accent('phantom analytics dashboard')}`);
    console.log(`  ${theme.accent('phantom analytics report --period "last quarter"')}`);
    console.log(`  ${theme.accent('phantom analytics dashboard --categories "user-engagement,revenue"')}`);
    console.log('');
  });

const oracleCommand = program.command('oracle').description('Predictive product intelligence');

oracleCommand
  .command('predict <feature>')
  .description('Predict feature success')
  .option('--description <text>', 'Feature description')
  .option('--json', 'Output as JSON')
  .action(async (feature: string, options: { description?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('oracle', 'Oracle', 'oracle predict', {
        feature,
        description: options.description,
        _: ['predict', feature],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Oracle prediction complete.'));
      console.log(`  ${theme.secondary('Feature:')} ${feature}`);
      console.log(`  ${theme.secondary('Probability:')} ${result.prediction?.successProbability ?? 'n/a'}%`);
      console.log(`  ${theme.secondary('Generated:')} ${result.prediction?.generatedAt ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Oracle prediction failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

oracleCommand
  .command('simulate [scenario]')
  .description('Run Monte Carlo simulation')
  .option('--iterations <count>', 'Iteration count', '10000')
  .option('--json', 'Output as JSON')
  .action(async (scenario: string | undefined, options: { iterations?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('oracle', 'Oracle', 'oracle simulate', {
        scenario: scenario || 'default',
        iterations: Number.parseInt(options.iterations || '10000', 10),
        _: ['simulate', scenario || 'default'],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Simulation complete.'));
      console.log(`  ${theme.secondary('Scenario:')} ${result.simulation?.scenario ?? scenario ?? 'default'}`);
      console.log(`  ${theme.secondary('Confidence:')} ${result.simulation?.confidence ?? 'n/a'}%`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Oracle simulation failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

oracleCommand
  .command('forecast')
  .description('Generate metric forecast')
  .option('--metric <name>', 'Metric name', 'revenue')
  .option('--period <months>', 'Period in months', '6')
  .option('--data <json>', 'Historical data JSON array')
  .option('--json', 'Output as JSON')
  .action(async (options: { metric?: string; period?: string; data?: string; json?: boolean }) => {
    try {
      if (options.data) {
        parseJsonOption(options.data, '--data');
      }
      const result = await runModuleCommand('oracle', 'Oracle', 'oracle forecast', {
        metric: options.metric || 'revenue',
        period: Number.parseInt(options.period || '6', 10),
        data: options.data,
        _: ['forecast'],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Forecast generated.'));
      console.log(`  ${theme.secondary('Metric:')} ${result.forecast?.metric ?? options.metric}`);
      console.log(`  ${theme.secondary('Confidence:')} ${result.forecast?.confidence ?? 'n/a'}%`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Oracle forecast failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

oracleCommand
  .command('risk [project]')
  .description('Assess project risk')
  .option('--json', 'Output as JSON')
  .action(async (project: string | undefined, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('oracle', 'Oracle', 'oracle risk', {
        project: project || '',
        _: ['risk', project || ''],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Risk assessment generated.'));
      console.log(`  ${theme.secondary('Overall Risk:')} ${result.risk?.overallRisk ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Score:')} ${result.risk?.score ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Oracle risk assessment failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

const experimentCommand = program.command('experiment').description('A/B test and experimentation workflow');

experimentCommand
  .command('design <hypothesis>')
  .description('Design an experiment')
  .option('--metric <name>', 'Primary metric', 'conversion_rate')
  .option('--json', 'Output as JSON')
  .action(async (hypothesis: string, options: { metric?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('experiment-lab', 'Experiment Lab', 'experiment design', {
        hypothesis,
        metric: options.metric || 'conversion_rate',
        _: ['design', hypothesis],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Experiment design created.'));
      console.log(`  ${theme.secondary('Experiment:')} ${result.experiment?.name ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Sample Size:')} ${result.experiment?.sampleSize ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Experiment design failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

experimentCommand
  .command('analyze <experimentId>')
  .description('Analyze experiment results')
  .option('--data <json>', 'Variant data JSON object')
  .option('--json', 'Output as JSON')
  .action(async (experimentId: string, options: { data?: string; json?: boolean }) => {
    try {
      if (options.data) {
        parseJsonOption(options.data, '--data');
      }
      const result = await runModuleCommand('experiment-lab', 'Experiment Lab', 'experiment analyze', {
        experimentId,
        data: options.data,
        _: ['analyze', experimentId],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Experiment analysis complete.'));
      console.log(`  ${theme.secondary('Winner:')} ${result.analysis?.winner ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Significant:')} ${result.analysis?.statisticalSignificance ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Experiment analysis failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

experimentCommand
  .command('sample-size')
  .description('Calculate required sample size')
  .option('--baseline <rate>', 'Baseline conversion rate', '0.2')
  .option('--mde <rate>', 'Minimum detectable effect', '0.05')
  .option('--confidence <rate>', 'Confidence level', '0.95')
  .option('--power <rate>', 'Statistical power', '0.8')
  .option('--json', 'Output as JSON')
  .action(async (options: { baseline?: string; mde?: string; confidence?: string; power?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('experiment-lab', 'Experiment Lab', 'experiment sample-size', {
        baseline: Number.parseFloat(options.baseline || '0.2'),
        mde: Number.parseFloat(options.mde || '0.05'),
        confidence: Number.parseFloat(options.confidence || '0.95'),
        power: Number.parseFloat(options.power || '0.8'),
        _: ['sample-size'],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Sample size calculation complete.'));
      console.log(`  ${theme.secondary('Sample Size:')} ${result.calculation?.sampleSize ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Duration (days):')} ${result.calculation?.duration ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sample size calculation failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

experimentCommand
  .command('rollout <experimentId>')
  .description('Create rollout strategy')
  .option('--phases <count>', 'Rollout phases', '3')
  .option('--json', 'Output as JSON')
  .action(async (experimentId: string, options: { phases?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('experiment-lab', 'Experiment Lab', 'experiment rollout', {
        experimentId,
        phases: Number.parseInt(options.phases || '3', 10),
        _: ['rollout', experimentId],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Rollout strategy created.'));
      console.log(`  ${theme.secondary('Phases:')} ${result.strategy?.phases?.length ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Risk Level:')} ${result.strategy?.riskLevel ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rollout strategy failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

const uxCommand = program.command('ux').description('UX auditing and WCAG checks');

uxCommand
  .command('audit <imagePath>')
  .description('Audit a UI screenshot')
  .option('--page-type <type>', 'Page type', 'generic')
  .option('--no-wcag', 'Skip WCAG checks')
  .option('--json', 'Output as JSON')
  .action(async (imagePath: string, options: { pageType?: string; wcag?: boolean; json?: boolean }) => {
    try {
      const result = await runModuleCommand('ux-auditor', 'UX Auditor', 'ux audit', {
        imagePath,
        pageType: options.pageType || 'generic',
        wcag: options.wcag !== false,
        _: ['audit', imagePath],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  UX audit complete.'));
      console.log(`  ${theme.secondary('Score:')} ${result.audit?.overallScore ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Issues:')} ${result.audit?.issues?.length ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UX audit failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

uxCommand
  .command('score <imagePath>')
  .description('Get quick UX score')
  .option('--json', 'Output as JSON')
  .action(async (imagePath: string, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('ux-auditor', 'UX Auditor', 'ux score', {
        imagePath,
        _: ['score', imagePath],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  UX score generated.'));
      console.log(`  ${theme.secondary('Overall:')} ${result.scores?.overall ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UX score failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

uxCommand
  .command('compare <before> <after>')
  .description('Compare UX between two screenshots')
  .option('--json', 'Output as JSON')
  .action(async (before: string, after: string, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('ux-auditor', 'UX Auditor', 'ux compare', {
        before,
        after,
        _: ['compare', before, after],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  UX comparison complete.'));
      console.log(`  ${theme.secondary('Delta:')} ${result.comparison?.scoreDifference ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'UX comparison failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

uxCommand
  .command('wcag <imagePath>')
  .description('Generate WCAG compliance report')
  .option('--level <level>', 'WCAG level (A|AA|AAA)', 'AA')
  .option('--json', 'Output as JSON')
  .action(async (imagePath: string, options: { level?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('ux-auditor', 'UX Auditor', 'ux wcag', {
        imagePath,
        level: options.level || 'AA',
        _: ['wcag', imagePath],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  WCAG report generated.'));
      console.log(`  ${theme.secondary('Level:')} ${result.wcag?.level ?? options.level}`);
      console.log(`  ${theme.secondary('Score:')} ${result.wcag?.score ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'WCAG report failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

const timeMachineCommand = program.command('timemachine').description('Decision snapshots and what-if analysis');

timeMachineCommand
  .command('snapshot')
  .description('Create a product snapshot')
  .option('--name <name>', 'Snapshot name')
  .option('--description <text>', 'Snapshot description')
  .option('--tags <csv>', 'Comma-separated tags')
  .option('--json', 'Output as JSON')
  .action(async (options: { name?: string; description?: string; tags?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('time-machine', 'Time Machine', 'timemachine snapshot', {
        name: options.name,
        description: options.description,
        tags: options.tags,
        _: ['snapshot'],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Snapshot created.'));
      console.log(`  ${theme.secondary('Snapshot ID:')} ${result.snapshot?.id ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Name:')} ${result.snapshot?.name ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Snapshot creation failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

timeMachineCommand
  .command('compare <id1> <id2>')
  .description('Compare two snapshots')
  .option('--json', 'Output as JSON')
  .action(async (id1: string, id2: string, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('time-machine', 'Time Machine', 'timemachine compare', {
        id1,
        id2,
        _: ['compare', id1, id2],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Snapshot comparison complete.'));
      console.log(`  ${theme.secondary('Added Decisions:')} ${result.comparison?.addedDecisions?.length ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Changed Decisions:')} ${result.comparison?.changedDecisions?.length ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Snapshot comparison failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

timeMachineCommand
  .command('list')
  .description('List saved snapshots')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('time-machine', 'Time Machine', 'timemachine list', {
        _: ['list'],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Snapshots loaded.'));
      console.log(`  ${theme.secondary('Count:')} ${result.count ?? 0}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Snapshot list failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

timeMachineCommand
  .command('whatif <baseId>')
  .description('Create a what-if scenario')
  .option('--name <name>', 'Scenario name')
  .option('--decision <json>', 'Decision JSON payload')
  .option('--json', 'Output as JSON')
  .action(async (baseId: string, options: { name?: string; decision?: string; json?: boolean }) => {
    try {
      const decision = parseJsonOption(options.decision, '--decision');
      const result = await runModuleCommand('time-machine', 'Time Machine', 'timemachine whatif', {
        baseId,
        name: options.name,
        decision,
        _: ['whatif', baseId],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  What-if scenario created.'));
      console.log(`  ${theme.secondary('Scenario ID:')} ${result.scenario?.id ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Risk:')} ${result.scenario?.riskAssessment?.overallRisk ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'What-if scenario failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

const figmaCommand = program.command('figma').description('Figma integration and design analysis');

figmaCommand
  .command('sync <fileKey>')
  .description('Sync a Figma file')
  .option('--json', 'Output as JSON')
  .action(async (fileKey: string, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('figma-bridge', 'Figma Bridge', 'figma sync', {
        fileKey,
        _: ['sync', fileKey],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Figma sync complete.'));
      console.log(`  ${theme.secondary('Pages Synced:')} ${result.sync?.pagesSynced ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Figma sync failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

figmaCommand
  .command('analyze <fileKey>')
  .description('Analyze a Figma design')
  .option('--json', 'Output as JSON')
  .action(async (fileKey: string, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('figma-bridge', 'Figma Bridge', 'figma analyze', {
        fileKey,
        _: ['analyze', fileKey],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Figma design analysis complete.'));
      console.log(`  ${theme.secondary('Screens:')} ${result.analysis?.screens?.length ?? 'n/a'}`);
      console.log(`  ${theme.secondary('Components:')} ${result.analysis?.components?.length ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Figma analysis failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

figmaCommand
  .command('stories <fileKey>')
  .description('Generate stories from Figma design')
  .option('--json', 'Output as JSON')
  .action(async (fileKey: string, options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('figma-bridge', 'Figma Bridge', 'figma stories', {
        fileKey,
        _: ['stories', fileKey],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Stories generated from Figma.'));
      console.log(`  ${theme.secondary('Count:')} ${result.count ?? 0}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Figma story generation failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

figmaCommand
  .command('prd <fileKey>')
  .description('Generate PRD from Figma design')
  .option('--title <name>', 'PRD title')
  .option('--json', 'Output as JSON')
  .action(async (fileKey: string, options: { title?: string; json?: boolean }) => {
    try {
      const result = await runModuleCommand('figma-bridge', 'Figma Bridge', 'figma prd', {
        fileKey,
        title: options.title,
        _: ['prd', fileKey],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  PRD generated from Figma.'));
      console.log(`  ${theme.secondary('PRD ID:')} ${result.prd?.id ?? 'n/a'}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Figma PRD generation failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

figmaCommand
  .command('list')
  .description('List cached Figma files')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      const result = await runModuleCommand('figma-bridge', 'Figma Bridge', 'figma list', {
        _: ['list'],
      });
      if (options.json) {
        printJson(result);
        return;
      }
      console.log('');
      console.log(theme.success('  Cached Figma files loaded.'));
      console.log(`  ${theme.secondary('Count:')} ${result.count ?? 0}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Figma file list failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

docsCommand
  .command('generate')
  .description('Generate deterministic documentation artifacts')
  .option('--out <path>', 'Output directory path')
  .option('--json', 'Output as JSON')
  .action((options: { out?: string; json?: boolean }) => {
    try {
      const files = generateRealDocumentation(process.cwd(), options.out);
      if (options.json) {
        printJson({ files });
        return;
      }
      console.log('');
      console.log(theme.success('  Documentation generated:'));
      for (const file of files) {
        console.log(`  ${theme.check} ${file}`);
      }
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Documentation generation failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

program
  .command('frameworks [action] [framework]')
  .description('List built-in PM frameworks')
  .option('--json', 'Output as JSON')
  .action((action: string | undefined, framework: string | undefined, options: { json?: boolean }) => {
    if (!action || action === 'list') {
      if (options.json) {
        printJson({ frameworks: FRAMEWORKS });
        return;
      }
      console.log('');
      console.log(theme.title('  PM FRAMEWORKS'));
      console.log('');
      for (const fw of FRAMEWORKS) {
        console.log(`  ${theme.check} ${fw.name} ${theme.dim(`— ${fw.desc}`)}`);
      }
      console.log('');
      return;
    }

    if (action === 'apply') {
      const payload = {
        status: 'not_implemented',
        message: 'Framework auto-apply is not implemented in real runtime mode.',
        framework: framework || null,
      };
      if (options.json) {
        printJson(payload);
      } else {
        console.log('');
        console.log(theme.warning(`  ${payload.message}`));
        console.log('');
      }
      process.exitCode = 1;
      return;
    }

    process.exitCode = 1;
  });

program
  .command('dashboard')
  .alias('dash')
  .description('Show concise runtime summary')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const cfg = getConfig().get();
    const stats = getContextEngine().getStats();
    const health = getRuntimeHealth(process.cwd());
    const payload = {
      activeProject: cfg.activeProject || null,
      contextFiles: stats.totalFiles,
      contextHealth: stats.healthScore,
      installedModules: cfg.installedModules.length,
      connectedIntegrations: health.integrations.filter(i => i.connected).length,
      primaryModel: health.primaryModel,
    };
    if (options.json) {
      printJson(payload);
      return;
    }
    console.log('');
    console.log(box([
      '',
      `  Active Project: ${payload.activeProject || 'none'}`,
      `  Context Files: ${payload.contextFiles} (health ${payload.contextHealth}%)`,
      `  Installed Modules: ${payload.installedModules}`,
      `  Connected Integrations: ${payload.connectedIntegrations}`,
      `  Primary Model: ${payload.primaryModel.provider}/${payload.primaryModel.model} (${payload.primaryModel.status})`,
      '',
    ].join('\n'), 'PHANTOM DASHBOARD', 78));
    console.log('');
  });

// Agent Matrix Commands
const agentsCommand = program.command('agents').description('Agent Matrix - Connect and coordinate all AI agents');

agentsCommand
  .command('register')
  .description('Register PHANTOM with all detected AI agents')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      if (options.json) {
        // JSON output for programmatic use
        const agents = await PhantomDiscovery.detectInstalledAgents();
        const installed = agents.filter((a: any) => a.installed);
        const results = [];

        for (const agent of installed) {
          const success = await PhantomDiscovery.registerWithAgent(agent.type);
          results.push({
            agent: agent.name,
            type: agent.type,
            success,
            status: success ? 'registered' : 'failed'
          });
        }

        printJson({
          timestamp: new Date().toISOString(),
          total_agents: installed.length,
          successful_registrations: results.filter(r => r.success).length,
          results
        });
        return;
      }

      // Interactive output
      await PhantomDiscovery.autoRegisterAll();

    } catch (error) {
      console.error(theme.error('  Failed to register agents:'), error);
      process.exitCode = 1;
    }
  });

agentsCommand
  .command('health')
  .description('Check PHANTOM and agent connection health')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      if (options.json) {
        const report = await PhantomDiscovery.healthReport();
        printJson(report);
        return;
      }

      // Interactive health check
      await PhantomDiscovery.healthCheck();

    } catch (error) {
      console.error(theme.error('  Health check failed:'), error);
      process.exitCode = 1;
    }
  });

agentsCommand
  .command('scan')
  .description('Scan system for installed AI agents and LLMs')
  .option('--register', 'Automatically register detected agents')
  .option('--json', 'Output as JSON')
  .action(async (options: { register?: boolean; json?: boolean }) => {
    try {
      let report = await PhantomDiscovery.healthReport();

      if (options.register) {
        const installed = report.agents.filter(agent => agent.installed);

        if (options.json) {
          const registrationResults: Array<{ type: string; success: boolean; message: string }> = [];
          for (const agent of installed) {
            const result = await PhantomDiscovery.registerAgent(agent.type);
            registrationResults.push({
              type: agent.type,
              success: result.success,
              message: result.message,
            });
          }
          report = await PhantomDiscovery.healthReport();
          const detected = report.agents.filter(agent => agent.installed);
          const registered = report.agents.filter(agent => agent.registered).map(agent => agent.type);
          printJson({
            detected,
            registered,
            health: {
              mcp_server: report.mcp_server,
              totals: {
                detected: detected.length,
                registered: registered.length,
              },
            },
            issues: report.issues,
            registration: registrationResults,
          });
          return;
        }

        const summary = await PhantomDiscovery.registerAll(installed.map(agent => agent.type));
        report = await PhantomDiscovery.healthReport();
        console.log('');
        console.log(theme.success(`  Registration complete: ${summary.success}/${summary.total} agents.`));
        console.log('');
      }

      const detected = report.agents.filter(agent => agent.installed);
      const registered = report.agents.filter(agent => agent.registered).map(agent => agent.type);

      if (options.json) {
        printJson({
          detected,
          registered,
          health: {
            mcp_server: report.mcp_server,
            totals: {
              detected: detected.length,
              registered: registered.length,
            },
          },
          issues: report.issues,
        });
        return;
      }

      console.log('');
      console.log(theme.title('  DETECTED AGENTS'));
      console.log('');

      if (detected.length === 0) {
        console.log(theme.warning('  No AI agents detected in your system.'));
        console.log(theme.dim('  Supported: Claude Code, Cursor, Codex CLI, VS Code, Zed, Gemini CLI'));
        console.log('');
        return;
      }

      for (const agent of detected) {
        const statusIcon = agent.running ? '🟢' : '🔵';
        const confidenceColor = agent.confidence > 80 ? theme.success :
          agent.confidence > 60 ? theme.warning : theme.dim;
        const registration = agent.registered ? theme.success('Registered') : theme.warning('Not registered');

        console.log(`  ${statusIcon} ${theme.accent(agent.name)}`);
        console.log(`     ${confidenceColor(`Confidence: ${agent.confidence}%`)} | Status: ${agent.status}`);
        console.log(`     ${theme.secondary('Registration:')} ${registration}`);
        console.log(`     ${theme.dim(agent.configPath)}`);
        console.log('');
      }

      if (report.issues.length > 0) {
        console.log(theme.warning('  Discovery issues:'));
        for (const issue of report.issues) {
          console.log(`    • ${issue}`);
        }
        console.log('');
      }

      console.log(theme.dim('  Run with --register to automatically register detected agents'));
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Agent scan failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

agentsCommand
  .command('list')
  .description('List registered agents and their integration status')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      const { AgentRegistry } = await import('@phantom-pm/core');
      const registry = new AgentRegistry();
      const agents = registry.getAllAgents();

      if (options.json) {
        printJson({ agents });
        return;
      }

      console.log('');
      console.log(theme.title('  REGISTERED AGENTS'));
      console.log('');

      if (agents.length === 0) {
        console.log(theme.warning('  No agents registered yet.'));
        console.log(theme.dim('  Run: phantom agents scan'));
        console.log('');
        return;
      }

      for (const agent of agents) {
        const statusIcon = {
          'connected': '🟢',
          'running': '🟢',
          'available': '🔵',
          'installed': '🔵',
          'offline': '🔴',
          'unknown': '⚪'
        }[agent.status] || '⚪';

        const integrationLevel = agent.phantomIntegration.level;
        const levelColor = integrationLevel === 'full' ? theme.success :
          integrationLevel === 'enhanced' ? theme.warning :
            theme.dim;

        console.log(`  ${statusIcon} ${theme.accent(agent.signature.name)}`);
        console.log(`     Integration: ${levelColor(integrationLevel)}`);
        console.log(`     Features: ${agent.phantomIntegration.featuresEnabled.join(', ') || 'None'}`);
        console.log(`     Reliability: ${agent.performance.reliability}%`);
        console.log(`     Last seen: ${new Date(agent.lastDetection).toLocaleString()}`);
        console.log('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to list agents';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

agentsCommand
  .command('integrate <agentId>')
  .description('Enable Phantom integration for an agent')
  .option('--level <level>', 'Integration level: integrated, enhanced, full', 'enhanced')
  .option('--json', 'Output as JSON')
  .action(async (agentId: string, options: { level: string; json?: boolean }) => {
    try {
      const { AgentRegistry } = await import('@phantom-pm/core');
      const registry = new AgentRegistry();

      const validLevels = ['integrated', 'enhanced', 'full'] as const;
      if (!validLevels.includes(options.level as any)) {
        throw new Error(`Invalid integration level. Choose from: ${validLevels.join(', ')}`);
      }

      const success = registry.enableIntegration(agentId, options.level as any);

      if (!success) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      if (options.json) {
        printJson({ status: 'ok', agentId, level: options.level });
        return;
      }

      console.log('');
      console.log(theme.success(`  Integration enabled for ${agentId}`));
      console.log(`  Level: ${options.level}`);
      console.log(theme.dim('  Run: phantom agents list to see updated status'));
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Integration failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

agentsCommand
  .command('network')
  .description('Show agent network topology and connections')
  .option('--json', 'Output as JSON')
  .action(async (options: { json?: boolean }) => {
    try {
      const { AgentRegistry } = await import('@phantom-pm/core');
      const registry = new AgentRegistry();
      const topology = registry.getNetworkTopology();

      if (options.json) {
        printJson(topology);
        return;
      }

      console.log('');
      console.log(theme.title('  AGENT NETWORK TOPOLOGY'));
      console.log('');

      console.log(theme.secondary(`Agents: ${topology.agents.length}`));
      console.log(theme.secondary(`Connections: ${topology.connections.length}`));
      console.log(theme.secondary(`Clusters: ${topology.clusters.length}`));
      console.log('');

      if (topology.clusters.length > 0) {
        console.log(theme.title('  CLUSTERS'));
        for (const cluster of topology.clusters) {
          console.log(`  ${theme.accent(cluster.name)}: ${cluster.agents.join(', ')}`);
        }
        console.log('');
      }

      if (topology.connections.length > 0) {
        console.log(theme.title('  CONNECTIONS'));
        for (const conn of topology.connections.slice(0, 10)) { // Show top 10
          const strengthBar = '█'.repeat(Math.floor(conn.strength / 20)) + '░'.repeat(5 - Math.floor(conn.strength / 20));
          console.log(`  ${conn.from} → ${conn.to} [${strengthBar}] ${conn.strength}%`);
        }
        if (topology.connections.length > 10) {
          console.log(theme.dim(`  ... and ${topology.connections.length - 10} more connections`));
        }
      }

      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network analysis failed';
      if (options.json) {
        printJson({ status: 'error', error: message });
      } else {
        console.log('');
        console.log(theme.error(`  ${message}`));
        console.log('');
      }
      process.exitCode = 1;
    }
  });

agentsCommand
  .description('Show Agent Matrix usage and capabilities')
  .action(() => {
    console.log('');
    console.log(theme.title('  PHANTOM AGENT MATRIX'));
    console.log(theme.secondary('  Connect and coordinate all your AI agents'));
    console.log('');
    console.log(`  ${theme.accent('phantom agents scan')}     # Detect installed AI agents`);
    console.log(`  ${theme.accent('phantom agents list')}     # Show registered agents`);
    console.log(`  ${theme.accent('phantom agents integrate <id>')} # Enable integration`);
    console.log(`  ${theme.accent('phantom agents network')}   # View network topology`);
    console.log('');
    console.log(theme.dim('  Supported agents: Claude Code, Cursor, Codex, Gemini, ChatGPT, VS Code, Zed'));
    console.log('');
  });

program
  .command('boot')
  .description('Run onboarding boot sequence')
  .action(async () => {
    await runBootSequence();
    await showFirstRunSetup();
  });

program
  .command('tools')
  .description('Tool palette (real-mode gate)')
  .action(() => {
    failNotImplemented('tools');
  });

// ── Chat command ──
program
  .command('chat')
  .description('Interactive AI chat — connect any model and talk to Phantom')
  .option('--model <model>', 'Model to connect (e.g. gpt-4o, claude, gemini, ollama:llama3.1:8b)')
  .option('--provider <provider>', 'Force a specific provider (openai, anthropic, ollama, gemini)')
  .action(async (options: { model?: string; provider?: string }) => {
    await startChat(options);
  });

// ── Model management ──
program
  .command('model')
  .description('Manage AI model connections')
  .argument('[action]', 'list | switch <model>', 'list')
  .argument('[model]', 'Model name for switch')
  .action(async (action: string, model: string | undefined) => {
    if (action === 'switch' && model) {
      console.log(`  Use: phantom chat --model ${model}`);
      return;
    }
    // List available models
    console.log('');
    console.log(theme.title('  AVAILABLE MODELS'));
    console.log('');
    console.log(`  ${theme.accent('Provider')}          ${theme.accent('Models')}`);
    console.log(`  ${theme.dim('─'.repeat(55))}`);
    console.log(`  ${theme.success('ollama')}            llama3.1:8b, llama3.1:70b, codellama:7b, mistral:7b`);
    console.log(`  ${theme.success('openai')}            gpt-4o, gpt-4o-mini, o3-mini`);
    console.log(`  ${theme.success('anthropic')}         claude-sonnet-4, claude-3.5-haiku, claude-3-opus`);
    console.log(`  ${theme.success('gemini')}            gemini-2.0-flash, gemini-2.5-pro, gemini-1.5-pro`);
    console.log('');
    console.log(theme.dim('  Usage: phantom chat --model <name>'));
    console.log(theme.dim('  Config: phantom config setup'));
    console.log('');
  });

function dirnameSafe(pathValue: string): string {
  const idx = Math.max(pathValue.lastIndexOf('/'), pathValue.lastIndexOf('\\'));
  if (idx <= 0) return process.cwd();
  return pathValue.slice(0, idx);
}

const argv = [...process.argv];
if (
  argv[2] === 'integrate' &&
  typeof argv[3] === 'string' &&
  !argv[3].startsWith('-') &&
  !['scan', 'doctor', 'connect'].includes(argv[3])
) {
  argv.splice(3, 0, 'connect');
}

// ── Default: no command → launch interactive chat ──
const knownCommands = program.commands.map((c: any) => c.name());
const userCommand = argv[2];
if (
  !userCommand ||
  (userCommand && !userCommand.startsWith('-') && !knownCommands.includes(userCommand))
) {
  // No command or unknown command → launch chat
  if (!userCommand) {
    startChat({});
  } else {
    // Treat as a question to Phantom
    program.parse(argv);
  }
} else {
  program.parse(argv);
}
