// PHANTOM TUI - Boot Sequence
import { theme, progressBar, box, doubleBox, matrixRain, PHANTOM_LOGO_ASCII, animatedMatrixRain } from '../theme/index.js';
import { PHANTOM_ASCII, PHANTOM_VERSION, TAGLINE, BOOT_SYSTEMS } from '@phantom-pm/core';

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

  // Phase 1: Animated Matrix rain (specification style)
  console.log('');
  const animations = animatedMatrixRain(5, 70, 3);
  for (const frame of animations) {
    clearScreen();
    console.log('');
    console.log(frame);
    await sleep(100);
  }
  await sleep(300);

  // Phase 2: ASCII logo with Matrix rain
  clearScreen();
  console.log('');
  console.log(theme.green(PHANTOM_LOGO_ASCII));
  console.log('');
  console.log(theme.dim(`  v${PHANTOM_VERSION} — ${TAGLINE}`));
  console.log('');
  console.log(theme.secondary('  Initializing systems...'));
  console.log('');

  await sleep(400);

  // Phase 3: Boot each system with progress (Matrix-style)
  for (let i = 0; i < BOOT_SYSTEMS.length; i++) {
    const system = BOOT_SYSTEMS[i];

    // Animate progress bar with Matrix green
    const steps = 10;
    for (let step = 0; step <= steps; step++) {
      const progress = Math.round((step / steps) * 100);
      const bar = progressBar(progress, 20, '▓', '░');
      process.stdout.write(`\r  [${bar}] ${theme.secondary(system.padEnd(18))}${step === steps ? theme.check : ' '}`);
      await sleep(40 + Math.random() * 60);
    }
    console.log('');
  }

  console.log('');

  // Phase 4: Welcome message in Matrix-themed box
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

  console.log(doubleBox(welcomeContent, undefined, 46));
  console.log('');
  
  // Final Matrix rain flourish
  console.log(matrixRain(60, 2));
  await sleep(500);
}

export async function showFirstRunSetup(): Promise<void> {
  console.log(theme.secondary('  First time? Let\'s set up:'));
  console.log('');
  
  // Import inquirer dynamically to avoid issues in non-TTY environments
  try {
    const inquirer = await import('inquirer');
    
    // Check if we're in a TTY environment
    if (!process.stdin.isTTY) {
      // Non-interactive mode - show instructions
      showStaticSetupInstructions();
      return;
    }
    
    // Interactive mode - create actual prompts
    const answers = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'aiModel',
        message: 'Choose your AI model:',
        choices: [
          { name: 'Ollama (local, free, private)', value: 'ollama' },
          { name: 'Claude (Anthropic API)', value: 'claude' },
          { name: 'GPT-4 (OpenAI API)', value: 'gpt4' },
          { name: 'Custom (any OpenAI-compatible endpoint)', value: 'custom' }
        ],
        default: 'ollama'
      },
      {
        type: 'list',
        name: 'setupAction',
        message: 'Feed me your product:',
        choices: [
          { name: 'Point to a codebase', value: 'codebase' },
          { name: 'Upload Figma exports', value: 'figma' },
          { name: 'Drop screenshots', value: 'screenshots' },
          { name: 'Skip for now', value: 'skip' }
        ],
        default: 'skip'
      }
    ]);
    
    console.log('');
    console.log(theme.success('  Configuration saved!'));
    
    // Show appropriate next steps based on selections
    switch (answers.setupAction) {
      case 'codebase':
        console.log(theme.secondary('  Next: Run: ') + theme.accent('phantom context add ./path/to/your/codebase'));
        break;
      case 'figma':
        console.log(theme.secondary('  Next: Run: ') + theme.accent('phantom context add ./designs'));
        break;
      case 'screenshots':
        console.log(theme.secondary('  Next: Run: ') + theme.accent('phantom context add ./screenshots'));
        break;
      case 'skip':
        console.log(theme.secondary('  You can add context later with: ') + theme.accent('phantom context add <path>'));
        break;
    }
    
    console.log('');
    console.log(theme.success('  Ready.') + theme.secondary(' Type ') + theme.accent('phantom help') + theme.secondary(' to get started.'));
    console.log('');
    
  } catch (error) {
    // Fallback to static display if inquirer fails
    console.log(theme.warning('  Interactive setup unavailable. Showing instructions:'));
    console.log('');
    showStaticSetupInstructions();
  }
}

function showStaticSetupInstructions(): void {
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
  console.log(theme.success('  Ready.') + theme.secondary(" Type 'phantom help' or just tell me what you need."));
  console.log('');
}
