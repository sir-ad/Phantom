#!/usr/bin/env node
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import chalk from 'chalk';
import { CodeHealer } from '@phantom-pm/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class PhantomSupervisor {
    private isRunning: boolean = false;
    private healer: CodeHealer;
    private maxRetries = 3;
    private retryCount = 0;

    constructor() {
        this.healer = new CodeHealer();
    }

    public async start() {
        if (this.isRunning) return;
        this.isRunning = true;

        let shouldRestart = true;
        while (shouldRestart) {
            const result = await this.loop();
            shouldRestart = result === -1;
        }
    }

    private loop(): Promise<number | null> {
        return new Promise((resolve) => {
            console.log(chalk.blue('\n[⚡] Phantom Nexus Supervisor active. Watching for runtime anomalies.'));

            const isProd = fs.existsSync(join(__dirname, '../dist/index.js')) && !__filename.endsWith('.ts');

            // Re-execute Phantom from the primary CLI entrypoint
            const cmd = isProd ? 'node' : 'npx';
            const args = isProd
                ? [join(__dirname, '../dist/index.js')]
                : ['tsx', join(__dirname, 'index.tsx')];

            let stderrOutput = '';
            // We pass an environment flag so Phantom knows it's being watched by Supervisor
            const childEnv = { ...process.env, PHANTOM_SUPERVISOR_ACTIVE: '1' };
            const child = spawn(cmd, args, {
                stdio: ['inherit', 'inherit', 'pipe'],
                env: childEnv
            });

            // Capture Stderr string exactly, while also forwarding it to the original TTY
            child.stderr.on('data', (data) => {
                const chunk = data.toString();
                process.stderr.write(chunk);
                stderrOutput += chunk;
            });

            child.on('close', async (code) => {
                if (code !== 0) {
                    console.log(chalk.red.bold(`\n\n[Supervisor] Phantom crashed with exit code ${code}.`));

                    if (this.retryCount >= this.maxRetries) {
                        console.log(chalk.bgRed.white.bold(`[Supervisor] FATAL: Max healing retries (${this.maxRetries}) reached. Exiting.`));
                        resolve(code || 1);
                        return;
                    }

                    this.retryCount++;
                    console.log(chalk.yellow(`[Supervisor] Attempting autonomous self-healing via CodeHealer (Retry ${this.retryCount}/${this.maxRetries})...`));
                    console.log(chalk.dim(`Analyzing Stderr Stack Trace -> Modifying AST...`));

                    try {
                        // The true self-propagation magic: the AST loop resolves, edits source, and returns true if patched via LLM.
                        const fixed = await this.healer.healCodebaseError(stderrOutput);

                        if (fixed) {
                            console.log(chalk.greenBright.bold(`[Supervisor] Healing successful. Source code patched natively.`));
                            console.log(chalk.cyan(`[Supervisor] Restarting Phantom Gateway Daemon...\n`));

                            // Reverting retries on a successful start can be dangerous if the bug triggers immediately.
                            // However, we assume if it fixed one thing, we give it a fresh chance on the next error.
                            this.retryCount = 0;

                            resolve(-1); // Signal to cleanly restart the inner while loop
                        } else {
                            console.log(chalk.red(`[Supervisor] CodeHealer heuristic failed to find a valid patch. Exiting.`));
                            resolve(code || 1);
                        }
                    } catch (err: any) {
                        console.log(chalk.red(`[Supervisor] Internal healer exception. The doctor is dead: ${err.message}`));
                        resolve(code || 1);
                    }
                } else {
                    console.log(chalk.green(`\n[Supervisor] Phantom terminated gracefully.`));
                    resolve(0);
                }
            });
        });
    }
}

// Allow direct CLI invocation `npx tsx scripts/supervisor.ts`
if (process.argv[1].endsWith('supervisor.ts') || process.argv[1].endsWith('supervisor.js')) {
    const supervisor = new PhantomSupervisor();
    supervisor.start().then(() => process.exit(0)).catch((err) => {
        console.error('Fatal Supervisor Wrapper Error:', err);
        process.exit(1);
    });
}
