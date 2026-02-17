// PHANTOM TUI - Module Installation Screen
import { theme, doubleBox, matrixRain, progressBar } from '../theme/index.js';
import type { ModuleManifest } from '@phantom-pm/core';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function renderModuleInstall(module: ModuleManifest): Promise<void> {
  const clearLine = '\x1B[2K\r';

  console.log('');

  // Phase 1: Show download box with 0%
  const installBox = [
    '',
    `   ${theme.title(`DOWNLOADING MODULE: ${module.name} v${module.version}`)}`,
    '',
    `   ${progressBar(0, 44)}  0%`,
    '',
    `   ${theme.secondary('Loading ' + module.description.toLowerCase() + '...')}`,
    '',
  ].join('\n');

  console.log(doubleBox(installBox, undefined, 62));
  await sleep(500);

  // Phase 2: Matrix rain during "download"
  console.log('');
  for (let i = 0; i < 3; i++) {
    console.log(matrixRain(60, 2));
    await sleep(300);
  }

  // Phase 3: Show completed box with quote
  console.log('');
  const commands = module.commands.map(cmd =>
    `     phantom ${cmd.name.padEnd(20)} — ${cmd.description}`
  );

  const completeBox = [
    '',
    `   ${theme.title(`DOWNLOADING MODULE: ${module.name} v${module.version}`)}`,
    '',
    `   ${progressBar(100, 44)}  100%`,
    '',
    `   ┌${'─'.repeat(46)}┐`,
    `   │${' '.repeat(46)}│`,
    `   │         ${theme.green(`"${module.quote}"`)}${' '.repeat(Math.max(0, 32 - module.quote.length))}│`,
    `   │${' '.repeat(46)}│`,
    `   └${'─'.repeat(46)}┘`,
    '',
    `   ${theme.title('New abilities unlocked:')}`,
    ...commands,
    '',
  ].join('\n');

  console.log(doubleBox(completeBox, undefined, 62));
  console.log('');
}

export function renderModuleStore(modules: ModuleManifest[], installedModules: string[]): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(theme.title('  PHANTOM MODULE STORE'));
  lines.push(theme.subtitle('  "I know kung fu." — Install superpowers on demand.'));
  lines.push('');
  lines.push(`  ${'─'.repeat(70)}`);
  lines.push('');

  for (const mod of modules) {
    const isInstalled = installedModules.includes(mod.name);
    const icon = isInstalled ? theme.success('✦') : theme.dim('○');
    const status = isInstalled
      ? theme.success(`INSTALLED v${mod.version}`)
      : theme.dim(`AVAILABLE v${mod.version}`);
    const name = `@phantom/${mod.name}`;

    lines.push(`  ${icon} ${theme.highlight(name.padEnd(30))} ${status}`);
    lines.push(`    ${theme.dim('"' + mod.quote + '"')}`);
    lines.push(`    ${theme.secondary(mod.description)}`);
    lines.push(`    ${theme.dim(`Size: ${mod.size} │ ${mod.commands.length} commands │ by ${mod.author}`)}`);

    if (!isInstalled) {
      lines.push(`    ${theme.accent(`phantom install @phantom/${mod.name}`)}`);
    }

    lines.push('');
  }

  lines.push(`  ${'─'.repeat(70)}`);
  lines.push(`  ${theme.secondary(`${modules.length} modules available │ ${installedModules.length} installed`)}`);
  lines.push('');

  return lines.join('\n');
}
