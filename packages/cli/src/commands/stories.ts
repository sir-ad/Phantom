// PHANTOM CLI - Stories Commands

import { Command } from 'commander';
import { getModuleManager } from '@phantom-pm/core';
import { theme } from '@phantom-pm/tui';

export function registerStoriesCommands(program: Command) {
  const stories = program
    .command('stories')
    .description('Generate user stories from feature description or PRD');

  stories
    .command('generate')
    .description('Generate user stories from a feature description')
    .argument('<feature>', 'Feature description')
    .option('-c, --count <number>', 'Number of stories to generate', '5')
    .option('--no-edge-cases', 'Skip edge case stories')
    .option('-o, --output <filename>', 'Output filename', 'user-stories.md')
    .option('--json', 'Output as JSON')
    .action(async (feature: string, options: { count?: string; edgeCases?: boolean; output?: string; json?: boolean }) => {
      try {
        const moduleManager = getModuleManager();
        
        // Ensure story-writer module is installed
        if (!moduleManager.isInstalled('story-writer')) {
          console.log('');
          console.log(theme.warning('  Story Writer module not installed. Installing...'));
          await moduleManager.install('story-writer');
        }
        
        const result = await moduleManager.executeCommand('story-writer', 'stories generate', {
          feature,
          count: parseInt(options.count || '5'),
          includeEdgeCases: options.edgeCases !== false,
          output: options.output,
          _: ['generate', feature],
        });

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log('');
        console.log(theme.success('  Stories generated successfully!'));
        console.log(`  ${theme.secondary('Feature:')} ${feature}`);
        console.log(`  ${theme.secondary('Stories:')} ${result.stories?.length || 0}`);
        console.log(`  ${theme.secondary('Total Points:')} ${result.totalPoints || 0}`);
        if (result.filePath) {
          console.log(`  ${theme.secondary('Output:')} ${result.filePath}`);
        }
        console.log('');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate stories';
        if (options.json) {
          console.log(JSON.stringify({ status: 'error', error: message }, null, 2));
        } else {
          console.log('');
          console.log(theme.error(`  ${message}`));
          console.log('');
        }
        process.exitCode = 1;
      }
    });

  stories
    .command('from-prd')
    .description('Generate user stories from a PRD file')
    .argument('<prd-path>', 'Path to PRD file')
    .option('-s, --sprints <number>', 'Number of sprints to plan', '2')
    .option('--json', 'Output as JSON')
    .action(async (prdPath: string, options: { sprints?: string; json?: boolean }) => {
      try {
        const moduleManager = getModuleManager();
        
        // Ensure story-writer module is installed
        if (!moduleManager.isInstalled('story-writer')) {
          console.log('');
          console.log(theme.warning('  Story Writer module not installed. Installing...'));
          await moduleManager.install('story-writer');
        }
        
        const result = await moduleManager.executeCommand('story-writer', 'stories from-prd', {
          prdPath,
          sprintCount: parseInt(options.sprints || '2'),
          _: ['from-prd', prdPath],
        });

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log('');
        console.log(theme.success('  Stories generated from PRD successfully!'));
        console.log(`  ${theme.secondary('PRD Path:')} ${prdPath}`);
        console.log(`  ${theme.secondary('Sprints:')} ${result.sprints?.length || 0}`);
        console.log(`  ${theme.secondary('Total Stories:')} ${result.totalStories || 0}`);
        if (result.outputPath) {
          console.log(`  ${theme.secondary('Output:')} ${result.outputPath}`);
        }
        console.log('');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate stories from PRD';
        if (options.json) {
          console.log(JSON.stringify({ status: 'error', error: message }, null, 2));
        } else {
          console.log('');
          console.log(theme.error(`  ${message}`));
          console.log('');
        }
        process.exitCode = 1;
      }
    });

  stories
    .description('Show story generation usage')
    .action(() => {
      console.log('');
      console.log(theme.title('  USER STORY GENERATION'));
      console.log(theme.secondary('  AI-powered user story generation from features or PRDs'));
      console.log('');
      console.log(`  ${theme.accent('phantom stories generate "User authentication system"')}`);
      console.log(`  ${theme.accent('phantom stories from-prd ./my-product-prd.md')}`);
      console.log(`  ${theme.accent('phantom stories generate "Payment processing" --count 8')}`);
      console.log('');
    });
}