// PHANTOM TUI - Boot Sequence
import { theme, progressBar, box, doubleBox, matrixRain } from '../theme/index.js';
import { PHANTOM_ASCII, PHANTOM_VERSION, TAGLINE, BOOT_SYSTEMS } from '@phantom/core';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearScreen(): void {
  process.stdout.write('\x1B[2J\x1B[0f');
}

function moveCursor(row: number, col: number): void {
  process.stdout.write(`\x1B[${row};${col}H`);
}

export async function runBootSequence(): Promise<void> {
  clearScreen();

  // Phase 1: Matrix rain
  console.log('');
  console.log(matrixRain(70, 3));
  await sleep(800);

  // Phase 2: ASCII logo
  clearScreen();
  console.log('');
  console.log(theme.green(PHANTOM_ASCII));
  console.log('');
  console.log(theme.dim(`  v${PHANTOM_VERSION} — ${TAGLINE}`));
  console.log('');
  console.log(theme.secondary('  Initializing systems...'));
  console.log('');

  await sleep(400);

  // Phase 3: Boot each system with progress
  for (let i = 0; i < BOOT_SYSTEMS.length; i++) {
    const system = BOOT_SYSTEMS[i];

    // Animate progress bar
    const steps = 8;
    for (let step = 0; step <= steps; step++) {
      const progress = Math.round((step / steps) * 100);
      const bar = progressBar(progress);
      process.stdout.write(`\r  [${bar}] ${theme.secondary(system.padEnd(18))}${step === steps ? theme.check : ' '}`);
      await sleep(50 + Math.random() * 80);
    }
    console.log('');
  }

  console.log('');

  // Phase 4: Welcome message
  const welcomeContent = [
    '',
    `   ${theme.title('Welcome to Phantom.')}`,
    '',
    `   ${theme.secondary('You are now the Operator.')}`,
    '',
    `   ${theme.dim('"I can only show you the door.')}`,
    `   ${theme.dim(' You\'re the one who has to walk')}`,
    `   ${theme.dim(' through it."')}`,
    '',
  ].join('\n');

  console.log(box(welcomeContent, undefined, 46));
  console.log('');
}

export async function showFirstRunSetup(): Promise<void> {
  console.log(theme.secondary('  First time? Let\'s set up:'));
  console.log('');
  console.log(theme.secondary('  ? Choose your AI model:'));
  console.log(`    ${theme.arrow} ${theme.green('Ollama (local, free, private)')}`);
  console.log(`      ${theme.secondary('Claude (Anthropic API)')}`);
  console.log(`      ${theme.secondary('GPT-4 (OpenAI API)')}`);
  console.log(`      ${theme.secondary('Custom (any OpenAI-compatible endpoint)')}`);
  console.log('');
  console.log(theme.secondary('  ? Feed me your product:'));
  console.log(`    ${theme.arrow} ${theme.green('Point to a codebase    → phantom context add ./path')}`);
  console.log(`      ${theme.secondary('Upload Figma exports   → phantom context add ./designs')}`);
  console.log(`      ${theme.secondary('Drop screenshots       → phantom context add ./screenshots')}`);
  console.log(`      ${theme.secondary('Skip for now')}`);
  console.log('');
  console.log(theme.success('  Ready.') + theme.secondary(' Type \'phantom help\' or just tell me what you need.'));
  console.log('');
}
