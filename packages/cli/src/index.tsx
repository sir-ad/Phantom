#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
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
import { PhantomMCPServer, runStdioServer, PhantomDiscovery } from '@phantom/mcp-server';
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
  .description('Show intelligent nudges and suggestions')
  .option('--json', 'Output as JSON')
  .option('--dismiss <id>', 'Dismiss a specific nudge')
  .option('--snooze <id>', 'Snooze a nudge (minutes)')
  .option('--refresh', 'Generate new nudges based on current context')
  .action(async (options: { json?: boolean; dismiss?: string; snooze?: string; refresh?: boolean }) => {
    try {
      const { NudgeEngine, getConfig, getContextEngine, getModuleManager } = await import('@phantom/core');
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
        const agents = PhantomDiscovery.detectInstalledAgents();
        const installed = agents.filter((a: any) => a.installed);
        const results = [];
        
        for (const agent of installed) {
          const success = await PhantomDiscovery.registerWithAgent(agent.type as any);
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
        // Implement JSON health check
        const mcpRunning = await PhantomDiscovery.detectPhantom();
        const agents = PhantomDiscovery.detectInstalledAgents();
        const healthData = {
          timestamp: new Date().toISOString(),
          mcp_server: {
            status: mcpRunning ? 'running' : 'not_responding',
            version: '1.0.0'
          },
          agents: agents.map((agent: any) => {
            const configPath = PhantomDiscovery.AGENT_CONFIG_PATHS[agent.type as keyof typeof PhantomDiscovery.AGENT_CONFIG_PATHS];
            let registered = false;
            if (configPath && existsSync(configPath)) {
              try {
                const config = JSON.parse(readFileSync(configPath, 'utf8'));
                registered = config.mcpServers?.phantom !== undefined;
              } catch {
                registered = false;
              }
            }
            return {
              name: agent.name,
              type: agent.type,
              installed: agent.installed,
              registered,
              status: agent.installed ? (registered ? 'connected' : 'detected_not_registered') : 'not_installed'
            };
          })
        };
        printJson(healthData);
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
      const { AgentDiscovery, AgentRegistry } = await import('@phantom/core');
      const discovery = new AgentDiscovery();
      const agents = await discovery.scanSystem();
      
      if (options.register) {
        const registry = new AgentRegistry();
        const registered = await registry.scanAndRegister();
        
        if (options.json) {
          printJson({ detected: agents, registered: registered.map(r => r.id) });
          return;
        }
        
        console.log('');
        console.log(theme.success(`  Registered ${registered.length} new agents:`));
        for (const agent of registered) {
          console.log(`    • ${agent.signature.name}`);
        }
        console.log('');
      }
      
      if (options.json && !options.register) {
        printJson({ agents });
        return;
      }
      
      if (!options.register) {
        console.log('');
        console.log(theme.title('  DETECTED AGENTS'));
        console.log('');
        
        if (agents.length === 0) {
          console.log(theme.warning('  No AI agents detected in your system.'));
          console.log(theme.dim('  Supported: Claude Code, Cursor, Codex, Gemini, ChatGPT, VS Code, Zed')); 
          console.log('');
          return;
        }
        
        for (const agent of agents) {
          const statusIcon = agent.status === 'running' ? '🟢' : '🔵';
          const confidenceColor = agent.confidence > 80 ? theme.success : 
                                 agent.confidence > 60 ? theme.warning : theme.dim;
          
          console.log(`  ${statusIcon} ${theme.accent(agent.signature.name)}`);
          console.log(`     ${theme.secondary(agent.signature.description)}`);
          console.log(`     ${confidenceColor(`Confidence: ${agent.confidence}%`)} | Status: ${agent.status}`);
          if (agent.detectedPaths.length > 0) {
            console.log(`     ${theme.dim(`Paths: ${agent.detectedPaths.join(', ')}`)}`);
          }
          console.log('');
        }
        
        console.log(theme.dim('  Run with --register to automatically register detected agents'));
        console.log('');
      }
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
      const { AgentRegistry } = await import('@phantom/core');
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
      const { AgentRegistry } = await import('@phantom/core');
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
      const { AgentRegistry } = await import('@phantom/core');
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
