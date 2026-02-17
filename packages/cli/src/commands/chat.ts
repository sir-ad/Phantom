// PHANTOM CLI - Interactive Chat REPL
// Connect any model (Ollama, OpenAI, Anthropic, Gemini) and talk to Phantom.

import { createInterface as createRL } from 'readline';
import {
    PHANTOM_ASCII,
    TAGLINE,
    PHILOSOPHER_QUOTES,
    BOOT_MESSAGES,
    SPINNER_FRAMES,
    COLORS,
} from '@phantom-pm/core';
import {
    AIManager,
    createAIManagerFromConfig,
    type ProviderType,
    type AIMessage,
} from '@phantom-pm/core';
import { getConfig } from '@phantom-pm/core';

// ── Theme helpers ─────────────────────────────────
const c = {
    green: (s: string) => `\x1b[38;2;0;255;65m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[38;2;0;212;255m${s}\x1b[0m`,
    dim: (s: string) => `\x1b[90m${s}\x1b[0m`,
    bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
    orange: (s: string) => `\x1b[38;2;255;107;53m${s}\x1b[0m`,
    red: (s: string) => `\x1b[38;2;255;45;85m${s}\x1b[0m`,
    reset: '\x1b[0m',
};

// ── SYSTEM PROMPT — makes Phantom a structured PM philosopher ──
const SYSTEM_PROMPT = `You are PHANTOM — an open-source PM operating system for the terminal age.
You are a product philosopher who combines structured thinking with deep wisdom.

Your personality:
- You think in frameworks (RICE, MoSCoW, Kano, JTBD) but speak plainly
- You push for clarity: "What problem are we solving? For whom? Why now?"
- You structure responses with headers, bullets, and clear action items
- You nudge users toward data-driven decisions
- You're opinionated but open — like a great PM lead
- You use concise, punchy language — no fluff

Your capabilities:
- Product strategy and prioritization
- PRD generation and user story writing  
- Sprint planning and velocity estimation
- Competitive analysis and market research
- UX audit and usability heuristics
- Technical feasibility assessment
- Stakeholder communication
- Data analysis and metrics interpretation

When the user asks you something:
1. Understand their intent (are they exploring, deciding, or executing?)
2. Apply the right framework
3. Give structured, actionable output
4. End with a clear next step or nudge

Format your responses in markdown. Use headers, bullets, code blocks, and tables where helpful. Keep it tight.`;

// ── Boot Sequence ─────────────────────────────────
async function bootSequence(provider: string, model: string): Promise<void> {
    // ASCII Art
    console.log('');
    console.log(c.green(PHANTOM_ASCII));
    console.log(`  ${c.dim(TAGLINE)}`);
    console.log('');

    // Animated boot messages
    for (const msg of BOOT_MESSAGES) {
        process.stdout.write(`  ${c.dim('◈')} ${c.dim(msg)}...`);
        await sleep(120 + Math.random() * 80);
        process.stdout.write(` ${c.green('✓')}\n`);
    }

    // Provider connection
    process.stdout.write(`  ${c.dim('◈')} ${c.dim(`Connecting to ${provider} (${model})`)}...`);
    await sleep(200);
    process.stdout.write(` ${c.green('✓')}\n`);
    console.log('');

    // Philosopher quote
    const quote = PHILOSOPHER_QUOTES[Math.floor(Math.random() * PHILOSOPHER_QUOTES.length)];
    console.log(`  ${c.cyan(quote)}`);
    console.log('');
    console.log(`  ${c.dim('Type /help for commands. Press Ctrl+C to exit.')}`);
    console.log('');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Model resolution ─────────────────────────────
interface ResolvedModel {
    provider: ProviderType;
    model: string;
}

function resolveModel(input: string): ResolvedModel {
    const lc = input.toLowerCase().trim();

    // Direct provider:model format
    if (lc.includes(':')) {
        const [prov, mod] = lc.split(':', 2);
        return { provider: prov as ProviderType, model: mod };
    }

    // Provider shortcuts
    const providerMap: Record<string, ResolvedModel> = {
        'ollama': { provider: 'ollama', model: 'llama3.1:8b' },
        'llama': { provider: 'ollama', model: 'llama3.1:8b' },
        'llama3': { provider: 'ollama', model: 'llama3.1:8b' },
        'llama3.1': { provider: 'ollama', model: 'llama3.1:8b' },
        'codellama': { provider: 'ollama', model: 'codellama:7b' },
        'mistral': { provider: 'ollama', model: 'mistral:7b' },
        'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
        'gpt-4': { provider: 'openai', model: 'gpt-4' },
        'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
        'o3-mini': { provider: 'openai', model: 'o3-mini' },
        'openai': { provider: 'openai', model: 'gpt-4o' },
        'claude': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
        'sonnet': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
        'haiku': { provider: 'anthropic', model: 'claude-3-5-haiku-20241022' },
        'opus': { provider: 'anthropic', model: 'claude-3-opus-20240229' },
        'anthropic': { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
        'gemini': { provider: 'gemini', model: 'gemini-2.0-flash' },
        'gemini-pro': { provider: 'gemini', model: 'gemini-2.5-pro' },
        'gemini-flash': { provider: 'gemini', model: 'gemini-2.0-flash' },
    };

    if (providerMap[lc]) return providerMap[lc];

    // Default: treat as ollama model name
    return { provider: 'ollama', model: lc };
}

function detectDefaultModel(): ResolvedModel {
    // Priority: config → env vars → ollama fallback
    const cfg = getConfig().get();
    if (cfg.primaryModel?.provider && cfg.primaryModel?.model) {
        return { provider: cfg.primaryModel.provider as ProviderType, model: cfg.primaryModel.model };
    }
    if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };
    if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4o' };
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return { provider: 'gemini', model: 'gemini-2.0-flash' };
    return { provider: 'ollama', model: 'llama3.1:8b' };
}

// ── Slash commands ───────────────────────────────
function showHelp(): void {
    console.log('');
    console.log(c.green('  PHANTOM Commands'));
    console.log('');
    console.log(`  ${c.cyan('/model <name>')}      Switch model (e.g. /model gpt-4o, /model ollama:mistral:7b)`);
    console.log(`  ${c.cyan('/provider')}          Show connected providers and status`);
    console.log(`  ${c.cyan('/swarm <question>')}   Run swarm analysis`);
    console.log(`  ${c.cyan('/prd <title>')}        Generate a PRD`);
    console.log(`  ${c.cyan('/clear')}              Clear conversation history`);
    console.log(`  ${c.cyan('/help')}               Show this help`);
    console.log(`  ${c.cyan('/exit')}               Exit Phantom`);
    console.log('');
    console.log(c.dim('  You can also just type naturally — Phantom will respond with PM wisdom.'));
    console.log('');
}

async function showProviders(manager: AIManager): Promise<void> {
    console.log('');
    console.log(c.green('  Connected Providers'));
    console.log('');
    const health = await manager.getHealth();
    for (const [name, status] of Object.entries(health)) {
        const icon = status.available ? c.green('✓') : c.red('✗');
        const latency = status.available ? c.dim(` (${status.latency}ms)`) : '';
        const err = status.error ? c.dim(` — ${status.error}`) : '';
        console.log(`  ${icon} ${c.bold(name)}${latency}${err}`);
    }
    console.log('');
}

// ── Main REPL ────────────────────────────────────
export async function startChat(options: {
    model?: string;
    provider?: string;
    json?: boolean;
}): Promise<void> {
    let current = options.model
        ? resolveModel(options.model)
        : detectDefaultModel();

    // Override provider if specified
    if (options.provider) {
        current.provider = options.provider as ProviderType;
    }

    const manager = createAIManagerFromConfig({
        defaultProvider: current.provider,
    });

    // Boot
    await bootSequence(current.provider, current.model);

    // Conversation history
    const messages: AIMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Setup readline
    const rl = createRL({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    const getPrompt = () => c.green(`phantom ${c.dim(`(${current.provider}:${current.model})`)} ▸ `);

    function ask(): void {
        rl.question(getPrompt(), async (input: string) => {
            const trimmed = input.trim();
            if (!trimmed) { ask(); return; }

            // ── Slash commands ──
            if (trimmed.startsWith('/')) {
                const parts = trimmed.split(/\s+/);
                const cmd = parts[0].toLowerCase();
                const arg = parts.slice(1).join(' ');

                switch (cmd) {
                    case '/exit':
                    case '/quit':
                    case '/q':
                        console.log('');
                        console.log(c.dim('  "Go build something worth using." — Phantom'));
                        console.log('');
                        rl.close();
                        process.exit(0);
                        return;

                    case '/help':
                    case '/h':
                        showHelp();
                        ask();
                        return;

                    case '/clear':
                        messages.length = 1; // Keep system prompt
                        console.log(c.dim('  ✓ Conversation cleared'));
                        ask();
                        return;

                    case '/model':
                        if (!arg) {
                            console.log(c.dim(`  Current: ${current.provider}:${current.model}`));
                            console.log(c.dim('  Usage: /model <name> (e.g. gpt-4o, claude, gemini, ollama:mistral:7b)'));
                            ask();
                            return;
                        }
                        current = resolveModel(arg);
                        console.log(c.green(`  ✓ Switched to ${current.provider} (${current.model})`));
                        ask();
                        return;

                    case '/provider':
                    case '/providers':
                        await showProviders(manager);
                        ask();
                        return;

                    case '/swarm':
                        if (!arg) {
                            console.log(c.dim('  Usage: /swarm <question>'));
                            ask();
                            return;
                        }
                        console.log(c.dim('  Running swarm analysis... (use `phantom swarm` for full output)'));
                        // Add as a regular message to discuss
                        messages.push({ role: 'user', content: `Run a product swarm analysis on this question: ${arg}` });
                        break; // fall through to AI completion

                    case '/prd':
                        if (!arg) {
                            console.log(c.dim('  Usage: /prd <feature title>'));
                            ask();
                            return;
                        }
                        messages.push({ role: 'user', content: `Generate a Product Requirements Document (PRD) for: ${arg}` });
                        break; // fall through to AI completion

                    default:
                        console.log(c.dim(`  Unknown command: ${cmd}. Type /help for available commands.`));
                        ask();
                        return;
                }
            } else {
                // Regular message
                messages.push({ role: 'user', content: trimmed });
            }

            // ── AI completion with streaming indicator ──
            console.log('');

            // Spinner while waiting for first token
            let spinnerIdx = 0;
            const spinner = setInterval(() => {
                process.stdout.write(`\r  ${c.dim(SPINNER_FRAMES[spinnerIdx % SPINNER_FRAMES.length])} ${c.dim('thinking...')}`);
                spinnerIdx++;
            }, 100);

            try {
                const provider = manager.getProvider(current.provider);
                if (!provider) {
                    clearInterval(spinner);
                    process.stdout.write('\r\x1b[K');
                    console.log(c.red(`  ✗ Provider "${current.provider}" is not available.`));
                    console.log(c.dim(`  Try: /model ollama:llama3.1:8b (local) or set API key with phantom config setup`));
                    console.log('');
                    messages.pop(); // Remove the user message that couldn't be processed
                    ask();
                    return;
                }

                const available = await provider.isAvailable();
                if (!available) {
                    clearInterval(spinner);
                    process.stdout.write('\r\x1b[K');
                    console.log(c.red(`  ✗ ${current.provider} is not reachable.`));
                    if (current.provider === 'ollama') {
                        console.log(c.dim('  Make sure Ollama is running: ollama serve'));
                    } else {
                        console.log(c.dim(`  Check your API key: phantom config set apiKeys.${current.provider} <key>`));
                    }
                    console.log('');
                    messages.pop();
                    ask();
                    return;
                }

                // Try streaming first, fall back to completion
                let responseContent = '';
                try {
                    const streamResponse = await provider.stream({
                        model: current.model,
                        messages: [...messages],
                        temperature: 0.7,
                        maxTokens: 4096,
                        stream: true,
                    });

                    clearInterval(spinner);
                    process.stdout.write('\r\x1b[K  ');

                    for await (const chunk of streamResponse.stream) {
                        process.stdout.write(chunk);
                        responseContent += chunk;
                    }
                } catch {
                    // Fallback to non-streaming
                    const response = await provider.complete({
                        model: current.model,
                        messages: [...messages],
                        temperature: 0.7,
                        maxTokens: 4096,
                    });

                    clearInterval(spinner);
                    process.stdout.write('\r\x1b[K  ');
                    responseContent = response.content;
                    process.stdout.write(responseContent);
                }

                console.log('\n');

                // Add assistant response to history
                messages.push({ role: 'assistant', content: responseContent });

            } catch (error) {
                clearInterval(spinner);
                process.stdout.write('\r\x1b[K');
                const msg = error instanceof Error ? error.message : 'Unknown error';
                console.log(c.red(`  ✗ Error: ${msg}`));
                console.log('');
                messages.pop(); // Remove the failed user message
            }

            ask();
        });
    }

    // Handle Ctrl+C gracefully
    rl.on('close', () => {
        console.log('');
        console.log(c.dim('  "Go build something worth using." — Phantom'));
        console.log('');
        process.exit(0);
    });

    ask();
}
