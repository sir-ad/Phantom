import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { AgentSwarm, getSwarm, generatePRD, prdToMarkdown, getRuntimeHealth } from '@phantom-pm/core';
import { AttachmentBuilder } from 'discord.js';

export async function startDiscordBot() {
    const token = process.env.DISCORD_BOT_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !clientId) {
        console.warn('⚠️ DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID not found. Discord bot disabled.');
        return;
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    const commands = [
        new SlashCommandBuilder()
            .setName('analyze')
            .setDescription('Run Agent Swarm analysis')
            .addStringOption(option =>
                option.setName('question')
                    .setDescription('The question to analyze')
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName('prd')
            .setDescription('Generate a PRD')
            .addStringOption(option =>
                option.setName('title')
                    .setDescription('Title of the PRD')
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName('status')
            .setDescription('Check system health'),
    ];

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing Discord application (/) commands.');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully reloaded Discord application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === 'status') {
            try {
                const health = getRuntimeHealth(process.cwd());
                const msg =
                    `**System Status**\n` +
                    `CPU: ${health.cpu}%\n` +
                    `Memory: ${health.memory.used}GB / ${health.memory.total}GB\n` +
                    `Uptime: ${health.uptime}\n` +
                    `Context Docs: ${health.contextDocs}\n` +
                    `Integrations: ${health.integrations.filter(i => i.connected).length} connected`;

                await interaction.reply(msg);
            } catch (error) {
                await interaction.reply(`Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (interaction.commandName === 'analyze') {
            const question = interaction.options.getString('question')!;
            await interaction.reply(`Running Swarm Analysis on: "${question}"...\n(This usually takes 10-20 seconds)`);

            try {
                const swarm = getSwarm();
                const result = await swarm.runSwarm(question);

                const summary =
                    `**Consensus:** ${result.consensus}\n` +
                    `**Confidence:** ${result.overallConfidence}%\n` +
                    `**Recommendation:** ${result.recommendation}\n`;

                const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(result, null, 2)), { name: `analysis_${Date.now()}.json` });

                await interaction.followUp({ content: summary, files: [attachment] });

            } catch (error) {
                await interaction.followUp(`Swarm Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (interaction.commandName === 'prd') {
            const title = interaction.options.getString('title')!;
            await interaction.reply(`Generating PRD for: "${title}"...`);

            try {
                const prd = generatePRD(title);
                const markdown = prdToMarkdown(prd);

                const attachment = new AttachmentBuilder(Buffer.from(markdown), { name: `PRD_${prd.id}.md` });

                await interaction.followUp({ content: `PRD Generated: ${prd.title} (ID: ${prd.id})`, files: [attachment] });

            } catch (error) {
                await interaction.followUp(`PRD Error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    });

    console.log('Starting Phantom Discord Bot...');
    client.login(token);
    return client;
}
