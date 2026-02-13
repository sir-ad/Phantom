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
} from '@phantom/core';
import { PhantomMCPServer, runStdioServer } from '@phantom/mcp-server';
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
} from '@phantom/tui';

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
      const mod = mm.install(moduleName);
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
    if (options.mode !== 'stdio') {
      console.log('');
      console.log(theme.warning(`  Unsupported mode '${options.mode}', using stdio.`));
      console.log('');
    }
    await runStdioServer();
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

const prdCommand = program.command('prd').description('PRD operations');

prdCommand
  .command('create <title>')
  .description('Generate deterministic PRD from title + local context')
  .option('--out <path>', 'Output file path')
  .option('--json', 'Output as JSON')
  .action((title: string, options: { out?: string; json?: boolean }) => {
    try {
      const prd = generatePRD(title);
      const markdown = prdToMarkdown(prd);
      const outDir = join(process.cwd(), 'phantom-output');
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

      const defaultFile = join(outDir, `${prd.id}-${title.toLowerCase().replace(/\s+/g, '-')}.md`);
      const outputPath = options.out ? resolve(options.out) : defaultFile;
      mkdirSync(dirnameSafe(outputPath), { recursive: true });
      writeFileSync(outputPath, `${markdown}\n`, 'utf8');

      const payload = {
        status: 'ok',
        prd: {
          id: prd.id,
          title: prd.title,
          version: prd.version,
          sections: prd.sections.map(s => s.title),
          evidence: prd.evidence,
        },
        outputPath,
      };

      if (options.json) {
        printJson(payload);
        return;
      }

      console.log('');
      console.log(theme.success(`  PRD generated: ${prd.title}`));
      console.log(`  ${theme.secondary('File:')} ${outputPath}`);
      console.log('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PRD generation failed';
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
  .description('List generated PRDs from phantom-output directory')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const outDir = join(process.cwd(), 'phantom-output');
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
      console.log(theme.warning('  No PRDs found in phantom-output/.'));
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
  .description('Show context-backed operational nudges')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const nudges = getRealNudges(process.cwd());
    if (options.json) {
      printJson({ nudges });
      return;
    }
    console.log('');
    for (const nudge of nudges) {
      console.log(renderNudge(nudge));
      console.log('');
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

program.parse(argv);
