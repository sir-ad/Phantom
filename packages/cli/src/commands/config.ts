// PHANTOM CLI - Configuration Commands

import { getConfig } from '@phantom-pm/core';
import { Command } from 'commander';
import { input, password } from '@inquirer/prompts';

export function registerConfigCommands(program: Command) {
  const config = program
    .command('config')
    .description('Manage PHANTOM configuration and API keys');

  config
    .command('set')
    .description('Set configuration values')
    .argument('<key>', 'Configuration key (e.g., apiKey.openai)')
    .argument('<value>', 'Configuration value')
    .action(async (key, value) => {
      const cfg = getConfig();

      // Parse nested keys like apiKey.openai
      const parts = key.split('.');
      if (parts.length === 1) {
        // Top-level config
        cfg.set(key as any, value as any);
      } else if (parts[0] === 'apiKeys') {
        // API key
        cfg.setAPIKey(parts[1] as any, value);
      }

      console.log(`✅ Set ${key} = ${value.replace(/./g, '*').slice(0, 10)}...`);
    });

  config
    .command('get')
    .description('Get configuration value')
    .argument('[key]', 'Configuration key (e.g., apiKey.openai)')
    .action((key) => {
      const cfg = getConfig();

      if (!key) {
        // Show all config (filter sensitive data)
        const allConfig = cfg.get();
        const filtered = {
          ...allConfig,
          apiKeys: Object.keys(allConfig.apiKeys).reduce((acc: any, k) => ({
            ...acc,
            [k]: allConfig.apiKeys[k as keyof typeof allConfig.apiKeys]
              ? '******'
              : undefined
          }), {}),
        };
        console.log(JSON.stringify(filtered, null, 2));
      } else {
        const parts = key.split('.');
        if (parts.length === 1) {
          // Top-level config
          const value = (cfg.get() as any)[key];
          console.log(value);
        } else if (parts[0] === 'apiKeys') {
          // API key
          const value = cfg.getAPIKey(parts[1] as any);
          console.log(value ? '******' : '(not set)');
        }
      }
    });

  config
    .command('setup')
    .description('Interactive configuration setup wizard')
    .action(async () => {
      console.log('🔧 PHANTOM Configuration Wizard\n');

      const cfg = getConfig();

      // OpenAI API Key
      const openaiKey = await input({
        message: 'OpenAI API Key (optional, for GPT-4, embeddings):',
        default: cfg.getAPIKey('openai') || '',
      });

      if (openaiKey) {
        cfg.setAPIKey('openai', openaiKey);
        console.log('✅ OpenAI API key saved');
      }

      // Anthropic API Key
      const anthropicKey = await input({
        message: 'Anthropic API Key (optional, for Claude):',
        default: cfg.getAPIKey('anthropic') || '',
      });

      if (anthropicKey) {
        cfg.setAPIKey('anthropic', anthropicKey);
        console.log('✅ Anthropic API key saved');
      }

      // Gemini API Key
      const geminiKey = await input({
        message: 'Gemini API Key (optional, for Gemini, from aistudio.google.com):',
        default: cfg.getAPIKey('gemini' as any) || '',
      });

      if (geminiKey) {
        cfg.setAPIKey('gemini' as any, geminiKey);
        console.log('✅ Gemini API key saved');
      }

      // GitHub OAuth
      console.log('\n📦 GitHub Integration (for cloning repos, creating issues):');
      const githubClientId = await input({
        message: 'GitHub OAuth Client ID (optional):',
        default: cfg.getAPIKey('githubClientId') || '',
      });

      const githubClientSecret = await password({
        message: 'GitHub OAuth Client Secret (optional):',
        mask: true,
      });

      if (githubClientId && githubClientSecret) {
        cfg.setAPIKey('githubClientId', githubClientId);
        cfg.setAPIKey('githubClientSecret', githubClientSecret);
        console.log('✅ GitHub OAuth credentials saved');
      }

      // Theme
      const theme = await input({
        message: 'Theme (matrix, cyberpunk, minimal):',
        default: cfg.get().theme || 'matrix',
        validate: (value) => ['matrix', 'cyberpunk', 'minimal'].includes(value)
          ? true
          : 'Please choose matrix, cyberpunk, or minimal',
      });

      cfg.set('theme', theme as any);

      // Save config
      cfg.completeFirstRun();

      console.log('\n🎉 Configuration complete!');
      console.log('You can now use:');
      console.log('  phantom                    Start interactive chat');
      console.log('  phantom chat --model gpt-4o Connect a specific model');
      console.log('  phantom swarm "question"   Run swarm analysis');
      console.log('  phantom model              List available models');
    });

  config
    .command('clear')
    .description('Clear configuration (including API keys)')
    .option('--api-keys', 'Clear only API keys')
    .action((options) => {
      const cfg = getConfig();

      if (options.apiKeys) {
        cfg.clearAPIKeys();
        console.log('✅ Cleared all API keys');
      } else {
        // Reset to defaults
        const defaultConfig = cfg.get();
        defaultConfig.firstRun = true;
        defaultConfig.integrations = [];
        defaultConfig.projects = [];
        defaultConfig.installedModules = [];
        defaultConfig.apiKeys = {};

        cfg.save();
        console.log('✅ Cleared all configuration (reset to defaults)');
      }
    });

  config
    .command('env')
    .description('Show environment configuration status')
    .action(() => {
      const cfg = getConfig();
      const configData = cfg.get();

      console.log('🔍 PHANTOM Configuration Status\n');

      console.log('📊 General:');
      console.log(`  Version: ${configData.version}`);
      console.log(`  Theme: ${configData.theme}`);
      console.log(`  Data Mode: ${configData.dataMode}`);
      console.log(`  First Run: ${configData.firstRun}`);
      console.log(`  Installed Modules: ${configData.installedModules.length}`);

      console.log('\n🔑 API Keys:');
      const apiKeys = configData.apiKeys;
      console.log(`  OpenAI: ${apiKeys.openai ? '✅ Set' : '❌ Not set'}`);
      console.log(`  Anthropic: ${apiKeys.anthropic ? '✅ Set' : '❌ Not set'}`);
      console.log(`  GitHub OAuth: ${apiKeys.githubClientId ? '✅ Set' : '❌ Not set'}`);

      console.log('\n🤖 AI Models:');
      console.log(`  Primary: ${configData.primaryModel.provider} (${configData.primaryModel.model})`);
      console.log(`  Status: ${configData.primaryModel.status}`);

      if (configData.fallbackModel) {
        console.log(`  Fallback: ${configData.fallbackModel.provider} (${configData.fallbackModel.model})`);
      }

      console.log('\n🔗 Integrations:');
      configData.integrations.forEach((integration: any, i: number) => {
        console.log(`  ${i + 1}. ${integration.name}: ${integration.connected ? '✅ Connected' : '❌ Disconnected'}`);
      });

      console.log('\n💡 Environment Variables:');
      console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
      console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set'}`);
      console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Not set'}`);
      console.log(`  GITHUB_CLIENT_ID: ${process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Not set'}`);
    });
}