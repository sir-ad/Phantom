import { Telegraf } from 'telegraf';
import { AgentSwarm, getSwarm, generatePRD, prdToMarkdown, getRuntimeHealth } from '@phantom-pm/core';

export async function startTelegramBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.warn('⚠️ TELEGRAM_BOT_TOKEN not found. Telegram bot disabled.');
        return;
    }

    const bot = new Telegraf(token);

    // Middleware to log
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`[Telegram] Response time: ${ms}ms`);
    });

    bot.command('start', (ctx) => {
        ctx.reply(
            'Ghost in the machine. Online. 👻\n\n' +
            'Commands:\n' +
            '/analyze <question> - Run Agent Swarm analysis\n' +
            '/prd <title> - Generate a PRD\n' +
            '/status - System health check\n' +
            '/help - Show this message'
        );
    });

    bot.command('help', (ctx) => {
        ctx.reply(
            'Commands:\n' +
            '/analyze <question> - Run 7 AI Agents to analyze a product question.\n' +
            '/prd <title> - Generate a deterministic PRD based on local context.\n' +
            '/status - Check CPU, Memory, and Integration health.'
        );
    });

    bot.command('status', async (ctx) => {
        try {
            const health = getRuntimeHealth(process.cwd());
            const msg =
                `**System Status**\n` +
                `CPU: ${health.cpu}%\n` +
                `Memory: ${health.memory.used}GB / ${health.memory.total}GB\n` +
                `Uptime: ${health.uptime}\n` +
                `Context Docs: ${health.contextDocs}\n` +
                `Integrations: ${health.integrations.filter(i => i.connected).length} connected`;

            ctx.replyWithMarkdown(msg);
        } catch (error) {
            ctx.reply(`Error getting status: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    bot.command('analyze', async (ctx) => {
        const question = ctx.message.text.replace('/analyze', '').trim();
        if (!question) {
            return ctx.reply('Please provide a question. Usage: /analyze <question>');
        }

        ctx.reply(`Running Swarm Analysis on: "${question}"...\n(This usually takes 10-20 seconds)`);

        try {
            const swarm = getSwarm();
            const result = await swarm.runSwarm(question);

            const summary =
                `**Consensus:** ${result.consensus}\n` +
                `**Confidence:** ${result.overallConfidence}%\n` +
                `**Recommendation:** ${result.recommendation}\n`;

            await ctx.replyWithMarkdown(summary);

            // Send detailed JSON
            await ctx.replyWithDocument({
                source: Buffer.from(JSON.stringify(result, null, 2)),
                filename: `analysis_${Date.now()}.json`
            });

        } catch (error) {
            ctx.reply(`Swarm Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    bot.command('prd', async (ctx) => {
        const title = ctx.message.text.replace('/prd', '').trim();
        if (!title) {
            return ctx.reply('Please provide a title. Usage: /prd <title>');
        }

        ctx.reply(`Generating PRD for: "${title}"...`);

        try {
            const prd = generatePRD(title);
            const markdown = prdToMarkdown(prd);

            await ctx.replyWithDocument({
                source: Buffer.from(markdown),
                filename: `PRD_${prd.id}.md`
            }, {
                caption: `PRD Generated: ${prd.title} (ID: ${prd.id})`
            });

        } catch (error) {
            ctx.reply(`PRD Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    console.log('Starting Phantom Telegram Bot...');
    bot.launch().then(() => {
        console.log('Telegram Bot is running!');
    }).catch(err => {
        console.error('Failed to launch Telegram bot:', err);
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
}
