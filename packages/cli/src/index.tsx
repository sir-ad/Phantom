#!/usr/bin/env node

// ░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
// ░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
// ░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
//
// PHANTOM — The invisible force behind every great product.
// Open source PM operating system for the terminal age.

import { Command } from 'commander';
import {
  PHANTOM_VERSION,
  PHANTOM_ASCII,
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
  type IntegrationScanResult,
  type IntegrationDoctorResult,
  type IntegrationTarget,
} from '@phantom/core';
import {
  PhantomMCPServer,
  runStdioServer,
} from '@phantom/mcp-server';
import {
  theme,
  runBootSequence,
  showFirstRunSetup,
  renderDashboard,
  getDefaultDashboardData,
  renderHealthDashboard,
  getDefaultHealthData,
  renderModuleInstall,
  renderModuleStore,
  renderSwarmResult,
  runSwarmAnimation,
  renderScreenAnalysis,
  renderUXAudit,
  getExampleScreenAnalysis,
  getExampleUXAudit,
  renderNudge,
  renderAchievement,
  renderStreak,
  renderSimulation,
  getExampleNudges,
  renderToolPalette,
  getDefaultToolCategories,
  box,
  gradientBar,
} from '@phantom/tui';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, basename } from 'path';

const program = new Command();

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

    console.log('');
    console.log(theme.green(PHANTOM_ASCII));
    console.log('');
    console.log(theme.dim(`  v${PHANTOM_VERSION} — ${TAGLINE}`));
    console.log('');
    console.log(renderDashboard(getDefaultDashboardData()));
  });

// ─── CONTEXT ─────────────────────────────────────────────────
const contextCommand = program
  .command('context')
  .description('Manage product context')
  .action(() => {
    const config = getConfig();
    const project = config.getActiveProject();

    if (!project) {
      console.log('');
      console.log(theme.warning('  No active project. Add context first:'));
      console.log('');
      console.log(`  ${theme.accent('phantom context add ./path-to-project')}`);
      console.log('');
      return;
    }

    console.log('');
    console.log(theme.title('  PRODUCT CONTEXT'));
    console.log('');
    console.log(`  ${theme.secondary('Project:')} ${theme.highlight(project.name)}`);
    console.log(`  ${theme.secondary('Path:')}    ${project.path}`);
    console.log(`  ${theme.secondary('Added:')}   ${project.createdAt}`);
    console.log('');
  });

contextCommand
  .command('add <path>')
  .description('Add a codebase, design files, or documents to context')
  .action(async (targetPath: string) => {
    const resolvedPath = resolve(targetPath);
    console.log('');
    console.log(theme.title('  INGESTING CONTEXT'));
    console.log(theme.secondary(`  Path: ${resolvedPath}`));
    console.log('');

    const contextEngine = getContextEngine();

    try {
      process.stdout.write(`  ${theme.dim('Scanning files...')}`);
      const stats = await contextEngine.addPath(resolvedPath);

      console.log(` ${theme.check}`);
      console.log('');
      console.log(`  ${theme.success('Context ingested successfully.')}`);
      console.log('');
      console.log(`  ${theme.secondary('Files indexed:')} ${theme.highlight(stats.totalFiles.toString())}`);
      console.log(`  ${theme.secondary('Total size:')}    ${theme.highlight(formatSize(stats.totalSize))}`);
      console.log(`  ${theme.secondary('Health score:')}  ${gradientBar(stats.healthScore, 10)} ${stats.healthScore}%`);
      console.log('');

      if (Object.keys(stats.byType).length > 0) {
        console.log(`  ${theme.title('By Type:')}`);
        for (const [type, count] of Object.entries(stats.byType)) {
          console.log(`    ${theme.dim('•')} ${theme.secondary(type)}: ${count}`);
        }
        console.log('');
      }

      if (Object.keys(stats.byLanguage).length > 0) {
        console.log(`  ${theme.title('Languages:')}`);
        for (const [lang, count] of Object.entries(stats.byLanguage)) {
          console.log(`    ${theme.dim('•')} ${theme.secondary(lang)}: ${count}`);
        }
        console.log('');
      }

      const config = getConfig();
      config.addProject({
        name: basename(resolvedPath) || 'project',
        path: resolvedPath,
        contextPaths: [resolvedPath],
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      });
    } catch (err: any) {
      console.log(` ${theme.cross}`);
      console.log('');
      console.log(theme.error(`  Error: ${err.message}`));
      console.log('');
    }
  });

// ─── INSTALL ─────────────────────────────────────────────────
program
  .command('install <module>')
  .description('Install a Phantom module')
  .action(async (moduleName: string) => {
    const mm = getModuleManager();

    try {
      const module = mm.install(moduleName);
      await renderModuleInstall(module);
    } catch (err: any) {
      console.log('');
      console.log(theme.error(`  Error: ${err.message}`));
      console.log('');

      console.log(theme.secondary('  Available modules:'));
      for (const mod of mm.getAvailableModules()) {
        console.log(`    ${theme.dim('•')} @phantom/${theme.highlight(mod.name)}`);
      }
      console.log('');
    }
  });

// ─── MODULES ─────────────────────────────────────────────────
program
  .command('modules')
  .alias('store')
  .description('Browse the module store')
  .action(() => {
    const mm = getModuleManager();
    const config = getConfig();
    console.log(renderModuleStore(mm.getAvailableModules(), config.get().installedModules));
  });

// ─── INTEGRATIONS ────────────────────────────────────────────
const integrateCommand = program
  .command('integrate')
  .description('Scan, connect, and diagnose integrations')
  .argument('[target]', 'integration target to connect')
  .action((target?: string) => {
    if (!target) {
      console.log('');
      console.log(theme.secondary('  Usage examples:'));
      console.log(`  ${theme.accent('phantom integrate scan')}`);
      console.log(`  ${theme.accent('phantom integrate github')}`);
      console.log(`  ${theme.accent('phantom integrate doctor')}`);
      console.log('');
      return;
    }

    const normalized = target.toLowerCase();
    if (!isKnownIntegrationTarget(normalized)) {
      console.log('');
      console.log(theme.error(`  Unsupported integration target: ${target}`));
      console.log(`  ${theme.secondary(`Supported: ${KNOWN_INTEGRATION_TARGETS.join(', ')}`)}`);
      console.log('');
      return;
    }

    const connected = connectIntegrationTarget(normalized as IntegrationTarget, process.cwd());

    console.log('');
    console.log(theme.success(`  Integration connected: ${connected.name}`));
    if (connected.detectedPath) {
      console.log(`  ${theme.secondary('Detected at:')} ${connected.detectedPath}`);
    } else {
      console.log(`  ${theme.warning('No workspace signal detected; saved as manual connection.')}`);
    }
    console.log(`  ${theme.secondary('Run `phantom integrate doctor` to validate status.')}`);
    console.log('');
  });

integrateCommand
  .command('scan')
  .description('Scan workspace for likely integration targets')
  .action(() => {
    const scan = scanIntegrationTargets(process.cwd());
    const detected = scan.filter((item: IntegrationScanResult) => item.detected);
    console.log('');
    console.log(theme.title('  INTEGRATION SCAN'));
    console.log('');

    if (detected.length === 0) {
      console.log(`  ${theme.warning('No integrations detected from workspace heuristics.')}`);
      console.log('');
      return;
    }

    for (const item of detected) {
      console.log(`  ${theme.check} ${theme.secondary(item.target)} ${theme.dim(`(${item.reason})`)}`);
      if (item.detectedPath) {
        console.log(`    ${theme.dim(item.detectedPath)}`);
      }
    }
    console.log('');
  });

integrateCommand
  .command('doctor')
  .description('Run health checks for configured integrations')
  .action(() => {
    const checks = doctorIntegrations(process.cwd());

    console.log('');
    console.log(theme.title('  INTEGRATION DOCTOR'));
    console.log('');

    if (!checks.some(check => check.configured || check.detected)) {
      console.log(`  ${theme.warning('No configured integrations yet.')}`);
      console.log(`  ${theme.secondary('Run: phantom integrate scan')}`);
      console.log('');
      return;
    }

    for (const check of checks.filter((c: IntegrationDoctorResult) => c.configured || c.detected)) {
      const mark = check.healthy ? theme.check : theme.warning_icon;
      const state = check.healthy ? 'healthy' : 'needs-attention';
      console.log(`  ${mark} ${check.target} (${state})`);
      console.log(`    ${theme.dim(check.reason)}`);
      if (check.detectedPath) {
        console.log(`    ${theme.dim(check.detectedPath)}`);
      }
    }
    console.log('');
  });

// ─── MCP ─────────────────────────────────────────────────────
const mcpCommand = program
  .command('mcp')
  .description('MCP server commands');

mcpCommand
  .command('tools')
  .description('List supported MCP tools')
  .action(() => {
    const server = new PhantomMCPServer();
    const tools = server.listTools();

    console.log('');
    console.log(theme.title('  MCP TOOLS'));
    console.log('');
    for (const tool of tools) {
      console.log(`  ${theme.check} ${theme.secondary(tool.name)}`);
      console.log(`    ${theme.dim(tool.description)}`);
    }
    console.log('');
  });

mcpCommand
  .command('serve')
  .description('Run MCP server over stdio')
  .option('--mode <mode>', 'transport mode (stdio)', 'stdio')
  .action(async (options: { mode: string }) => {
    if (options.mode !== 'stdio') {
      console.log('');
      console.log(theme.warning(`  Unsupported mode '${options.mode}'. Falling back to stdio.`));
      console.log('');
    }
    await runStdioServer();
  });

// ─── STATUS ──────────────────────────────────────────────────
program
  .command('status')
  .description('Show Phantom runtime status')
  .option('--json', 'Output as JSON')
  .action((options: { json?: boolean }) => {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    const project = cfgMgr.getActiveProject();

    const payload = {
      version: PHANTOM_VERSION,
      firstRun: cfg.firstRun,
      activeProject: project ? { name: project.name, path: project.path } : null,
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
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    console.log('');
    console.log(theme.title('  PHANTOM STATUS'));
    console.log('');
    console.log(`  ${theme.secondary('Version:')} ${payload.version}`);
    console.log(`  ${theme.secondary('First Run:')} ${payload.firstRun ? 'yes' : 'no'}`);
    console.log(`  ${theme.secondary('Active Project:')} ${payload.activeProject?.name || 'none'}`);
    console.log(`  ${theme.secondary('Installed Modules:')} ${payload.installedModules.length}`);
    console.log(`  ${theme.secondary('Integrations:')} ${payload.integrations.length}`);
    console.log(`  ${theme.secondary('Data Mode:')} ${payload.dataMode}`);
    console.log(`  ${theme.secondary('Permission Level:')} ${payload.permissionLevel}`);
    console.log(`  ${theme.secondary('Install Channel:')} ${payload.installation.channel}`);
    console.log(`  ${theme.secondary('MCP Enabled:')} ${payload.mcp.enabled ? 'yes' : 'no'}`);
    console.log(`  ${theme.secondary('MCP Mode:')} ${payload.mcp.server_mode}`);
    console.log(`  ${theme.secondary('Audit Log:')} ${payload.security.audit_log_path}`);
    console.log('');
  });

// ─── DOCTOR ──────────────────────────────────────────────────
program
  .command('doctor')
  .description('Run local environment and Phantom health checks')
  .action(() => {
    const cfgMgr = getConfig();
    const cfg = cfgMgr.get();
    const checks = [
      {
        name: 'Config directory',
        ok: existsSync(cfgMgr.getConfigDir()),
        detail: cfgMgr.getConfigDir(),
      },
      {
        name: 'Active project configured',
        ok: Boolean(cfgMgr.getActiveProject()),
        detail: cfgMgr.getActiveProject()?.name || 'none',
      },
      {
        name: 'Installed modules',
        ok: cfg.installedModules.length > 0,
        detail: `${cfg.installedModules.length}`,
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

    console.log('');
    console.log(theme.title('  PHANTOM DOCTOR'));
    console.log('');
    for (const check of checks) {
      const icon = check.ok ? theme.check : theme.warning_icon;
      const name = check.name.padEnd(26);
      console.log(`  ${icon} ${theme.secondary(name)} ${theme.dim(check.detail)}`);
    }

    const passCount = checks.filter(c => c.ok).length;
    const total = checks.length;
    console.log('');
    if (passCount === total) {
      console.log(theme.success(`  All checks passed (${passCount}/${total}).`));
    } else {
      console.log(theme.warning(`  Some checks need attention (${passCount}/${total} passing).`));
    }
    console.log('');
  });

// ─── PRD ─────────────────────────────────────────────────────
program
  .command('prd <action> [title]')
  .description('PRD operations (create, list, export)')
  .action(async (action: string, title?: string) => {
    switch (action) {
      case 'create': {
        if (!title) {
          console.log(theme.error('  Please provide a title: phantom prd create "Feature Name"'));
          return;
        }

        console.log('');
        console.log(theme.title('  📋 GENERATING PRD'));
        console.log(theme.secondary(`  Feature: "${title}"`));
        console.log('');

        const steps = ['Analyzing context...', 'Generating requirements...', 'Writing user stories...', 'Defining success metrics...', 'Finalizing...'];
        for (const step of steps) {
          process.stdout.write(`  ${theme.dim(step)}`);
          await sleep(300 + Math.random() * 400);
          console.log(` ${theme.check}`);
        }

        const prd = generatePRD(title);
        const markdown = prdToMarkdown(prd);

        const outDir = join(process.cwd(), 'phantom-output');
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
        const filename = `${prd.id}-${title.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filepath = join(outDir, filename);
        writeFileSync(filepath, markdown);

        console.log('');
        console.log(theme.success(`  ✓ PRD generated: ${title} v${prd.version}`));
        console.log(theme.secondary(`  File: ${filepath}`));
        console.log('');

        console.log(theme.title('  Preview:'));
        const preview = markdown
          .split('\n')
          .slice(0, 20)
          .map((line: string) => `  ${theme.dim(line)}`)
          .join('\n');
        console.log(preview);
        console.log(theme.dim('  ...'));
        console.log('');
        break;
      }

      case 'list': {
        console.log('');
        console.log(theme.title('  📋 PRD LIBRARY'));
        console.log('');
        console.log(theme.secondary('  No PRDs yet. Create one with:'));
        console.log(`  ${theme.accent('phantom prd create "Feature Name"')}`);
        console.log('');
        break;
      }

      default:
        console.log(theme.error(`  Unknown PRD action: ${action}`));
        console.log(theme.secondary('  Available: create, list, export'));
    }
  });

// ─── SWARM ───────────────────────────────────────────────────
program
  .command('swarm <question>')
  .description('Deploy 7 AI agents to analyze a product question')
  .action(async (question: string) => {
    const swarm = getSwarm();

    await runSwarmAnimation(question);

    console.log(theme.dim('  Synthesizing results...'));
    console.log('');

    const result = await swarm.runSwarm(question);
    console.log(renderSwarmResult(result));
  });

// ─── SCREEN ──────────────────────────────────────────────────
program
  .command('screen <action> [path]')
  .description('Analyze or audit app screenshots')
  .action(async (action: string, targetPath?: string) => {
    switch (action) {
      case 'analyze': {
        if (!targetPath) {
          console.log(theme.error('  Please provide a screenshot path'));
          return;
        }
        console.log('');
        console.log(theme.title(`  Analyzing: ${targetPath}`));
        console.log('');
        console.log(theme.warning('  Demo Mode: output uses example analysis data.'));
        await sleep(1000);
        console.log(renderScreenAnalysis(getExampleScreenAnalysis()));
        break;
      }

      case 'audit': {
        console.log('');
        console.log(theme.title('  Running app-wide UX audit...'));
        console.log(theme.secondary(`  Analyzing screenshots in ${targetPath || './screenshots/'}...`));
        console.log('');
        console.log(theme.warning('  Demo Mode: output uses example audit data.'));
        await sleep(1500);
        console.log(renderUXAudit(getExampleUXAudit()));
        break;
      }

      default:
        console.log(theme.error(`  Unknown screen action: ${action}`));
        console.log(theme.secondary('  Available: analyze, audit'));
    }
  });

// ─── HEALTH ──────────────────────────────────────────────────
program
  .command('health')
  .description('Show system health dashboard')
  .action(() => {
    console.log('');
    console.log(theme.warning('  Demo Mode: health values are illustrative defaults.'));
    console.log(renderHealthDashboard(getDefaultHealthData()));
  });

// ─── TOOLS ───────────────────────────────────────────────────
program
  .command('tools')
  .description('Open the tool palette')
  .action(() => {
    console.log(renderToolPalette(getDefaultToolCategories()));
  });

// ─── FRAMEWORKS ──────────────────────────────────────────────
program
  .command('frameworks [action] [framework]')
  .description('Browse and apply PM frameworks')
  .action((action?: string, framework?: string) => {
    if (!action || action === 'list') {
      console.log('');
      console.log(theme.title('  PM FRAMEWORKS'));
      console.log(theme.secondary('  Built-in product management frameworks'));
      console.log('');
      for (const fw of FRAMEWORKS) {
        console.log(`  ├── ${theme.highlight(fw.name.padEnd(28))} — ${theme.secondary(fw.desc)}`);
      }
      console.log('');
      console.log(theme.secondary('  Apply a framework:'));
      console.log(`  ${theme.accent('phantom frameworks apply rice --to backlog.csv')}`);
      console.log('');
    } else if (action === 'apply') {
      console.log('');
      console.log(theme.title(`  Applying ${framework || 'RICE'} framework...`));
      console.log(theme.secondary('  This feature requires the relevant module to be installed.'));
      console.log(`  ${theme.accent('phantom install @phantom/frameworks')}`);
      console.log('');
    }
  });

// ─── SIMULATE ────────────────────────────────────────────────
program
  .command('simulate <scenario>')
  .description('Run product simulation')
  .action(async (scenario: string) => {
    console.log('');
    console.log(theme.title('  🔮 PRODUCT SIMULATION ENGINE'));
    console.log(theme.secondary(`  Scenario: "${scenario}"`));
    console.log('');
    console.log(theme.warning('  Demo Mode: simulation output is illustrative.'));
    console.log(theme.dim('  Creating 10,000 synthetic user sessions...'));
    await sleep(2000);
    console.log('');
    console.log(renderSimulation(scenario));
    console.log('');
  });

// ─── NUDGE ───────────────────────────────────────────────────
program
  .command('nudge')
  .description('Show smart nudges')
  .action(() => {
    const nudges = getExampleNudges();
    console.log('');
    console.log(theme.warning('  Demo Mode: nudges are illustrative examples.'));
    console.log('');
    for (const nudge of nudges) {
      console.log(renderNudge(nudge));
      console.log('');
    }
  });

// ─── PRODUCTS ────────────────────────────────────────────────
program
  .command('products')
  .description('Manage multiple products')
  .action(() => {
    const products = [
      { name: 'Acme App', active: true, health: 89, sprint: '14/20' },
      { name: 'Acme Admin Dashboard', active: false, health: 72, sprint: '8/12' },
      { name: 'Acme Mobile', active: false, health: 65, sprint: '3/10', paused: true },
      { name: 'Acme API Platform', active: false, health: 91, sprint: '6/8' },
    ];

    const lines = products.map(p => {
      const icon = p.paused ? theme.dim('○') : theme.statusOn;
      const name = p.name.padEnd(24);
      const status = p.active ? theme.success('(active)') : p.paused ? theme.dim('(paused)') : '';
      const health = `Health: ${p.health}%`;
      const sprint = `Sprint: ${p.sprint}`;
      return `  ${icon} ${theme.secondary(name)} ${status}  ${theme.dim(health)}   ${theme.dim(sprint)}`;
    });

    console.log('');
    console.log(theme.warning('  Demo Mode: portfolio values are illustrative.'));
    console.log(box(lines.join('\n'), 'YOUR PRODUCTS', 62));
    console.log('');
    console.log(`  ${theme.dim('[Switch Product]')}  ${theme.dim('[Compare Products]')}  ${theme.dim('[Portfolio View]')}`);
    console.log('');
  });

// ─── DOCS ────────────────────────────────────────────────────
program
  .command('docs [action]')
  .description('Auto-generate documentation')
  .action(async (action?: string) => {
    if (action === 'generate') {
      console.log('');
      console.log(theme.title('  📝 AUTO-DOCUMENTATION'));
      console.log(theme.secondary('  Scanning product artifacts...'));
      console.log('');
      console.log(theme.warning('  Demo Mode: generation list is illustrative.'));
      console.log('');

      const files = [
        'product-overview.md',
        'architecture-diagram.svg',
        'feature-matrix.md',
        'user-personas.md',
        'metrics-dictionary.md',
        'decision-log.md',
        'api-reference.md',
        'changelog.md',
      ];

      for (const file of files) {
        process.stdout.write(`  ├── ${theme.secondary(file.padEnd(30))}`);
        await sleep(200 + Math.random() * 300);
        console.log(theme.dim('— ' + getDocDescription(file)));
      }
      console.log('');
      console.log(theme.success('  ✓ All documentation generated.'));
      console.log('');
    } else {
      console.log('');
      console.log(theme.secondary('  Usage: phantom docs generate'));
      console.log('');
    }
  });

// ─── BOOT ────────────────────────────────────────────────────
program
  .command('boot')
  .description('Run the boot sequence')
  .action(async () => {
    await runBootSequence();
    await showFirstRunSetup();
  });

// ─── DASHBOARD ───────────────────────────────────────────────
program
  .command('dashboard')
  .alias('dash')
  .description('Show the main dashboard')
  .action(() => {
    console.log(renderDashboard(getDefaultDashboardData()));
  });

// ─── DEMO ────────────────────────────────────────────────────
program
  .command('demo')
  .description('Run the full Phantom demo')
  .action(async () => {
    await runBootSequence();
    await sleep(1000);

    console.log(theme.dim('\n  Press any key to continue...\n'));
    console.log(renderDashboard(getDefaultDashboardData()));
    await sleep(1000);

    console.log(theme.dim('\n  Module installation demo:\n'));
    const mm = getModuleManager();
    const oracle = mm.getModule('oracle');
    if (oracle) await renderModuleInstall(oracle);
    await sleep(500);

    console.log(theme.dim('\n  Smart nudge examples:\n'));
    const nudges = getExampleNudges();
    console.log(renderNudge(nudges[0]));
    await sleep(500);

    console.log('');
    console.log(renderAchievement({
      title: 'The Architect',
      description: 'Generated 10 PRDs with Phantom',
      next: 'The Oracle — Run 5 simulations',
    }));
    await sleep(500);

    console.log('');
    console.log(renderStreak({ days: 12, target: 14 }));
    console.log('');

    console.log(theme.dim('\n  Health dashboard:\n'));
    console.log(renderHealthDashboard(getDefaultHealthData()));
    await sleep(500);

    console.log(theme.dim('\n  Tool palette:\n'));
    console.log(renderToolPalette(getDefaultToolCategories()));
    await sleep(500);

    console.log(theme.dim('\n  Screen analysis:\n'));
    console.log(renderScreenAnalysis(getExampleScreenAnalysis()));
    await sleep(500);

    console.log(theme.dim('\n  UX audit:\n'));
    console.log(renderUXAudit(getExampleUXAudit()));
    await sleep(500);

    console.log(theme.dim('\n  Product simulation:\n'));
    console.log(renderSimulation('Add shopping cart abandonment emails'));

    console.log('');
    console.log(theme.title('  DEMO COMPLETE'));
    console.log(theme.secondary('  Phantom is ready. Start building the future.'));
    console.log('');
  });

// ─── HELPERS ─────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getDocDescription(filename: string): string {
  const map: Record<string, string> = {
    'product-overview.md': 'What the product does',
    'architecture-diagram.svg': 'System architecture visual',
    'feature-matrix.md': 'All features with status',
    'user-personas.md': 'Synthesized from research',
    'metrics-dictionary.md': 'All tracked metrics explained',
    'decision-log.md': 'All product decisions',
    'api-reference.md': 'Public API documentation',
    'changelog.md': 'Product changelog from git',
  };
  return map[filename] || '';
}

program.parse();
