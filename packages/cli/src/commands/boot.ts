// PHANTOM CLI - The 1-Click No-Clone Installer Sequence

import { Command } from 'commander';
import { Box, Text } from 'ink';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';
import unzip from 'unzip-stream';

export function registerBootCommands(program: Command) {
    program
        .command('boot')
        .description('Download and initialize the Phantom UX and OS Gateway elements')
        .action(async () => {
            console.log('🎭 Initializing Phantom OS 1-Click Sequence...');

            const phantomDir = path.join(os.homedir(), '.phantom');
            const webDir = path.join(phantomDir, 'web');

            if (!fs.existsSync(phantomDir)) {
                fs.mkdirSync(phantomDir, { recursive: true });
            }

            console.log(`\n📦 Target Directory: ${phantomDir}`);

            const artifactUrl = 'https://github.com/sir-ad/Phantom/releases/latest/download/phantom-web-ui.zip';

            try {
                // Determine if Web UI already exists
                if (fs.existsSync(webDir)) {
                    console.log('✓ Web UI is already installed locally. Overwriting...');
                    fs.rmSync(webDir, { recursive: true, force: true });
                }

                console.log('⬇️  Downloading Matrix UI from GitHub Releases...');
                const response = await fetch(artifactUrl);

                if (!response.ok) {
                    throw new Error(`Failed to download UI: ${response.statusText}`);
                }

                console.log('📦 Extracting assets...');

                // We pipe the fetch stream directly into the unzip function targeting the local directory
                await new Promise((resolve, reject) => {
                    response.body
                        .pipe(unzip.Extract({ path: webDir }))
                        .on('close', resolve)
                        .on('error', reject);
                });

                console.log('\n✅ Phantom OS Matrix UI successfully booted to ~/.phantom/web');

                // --- Add global command availability ---
                const shell = process.env.SHELL || '';
                let rcFile = '';
                if (shell.includes('zsh')) {
                    rcFile = path.join(os.homedir(), '.zshrc');
                } else if (shell.includes('bash')) {
                    rcFile = path.join(os.homedir(), '.bashrc');
                }

                if (rcFile && fs.existsSync(rcFile)) {
                    const rcContent = fs.readFileSync(rcFile, 'utf8');
                    const aliasLine = `alias phantom="npx @phantom-pm/cli@latest"`;

                    if (!rcContent.includes(aliasLine)) {
                        fs.appendFileSync(rcFile, `\n# Added by Phantom Boot\n${aliasLine}\n`);
                        console.log(`✓ Added global 'phantom' alias to ${path.basename(rcFile)}`);
                        console.log(`  Run 'source ${rcFile}' or restart your terminal to use it.`);
                    } else {
                        console.log(`✓ Global 'phantom' alias already exists in ${path.basename(rcFile)}`);
                    }
                } else {
                    console.log(`\n⚠️  Could not auto-configure global 'phantom' command.`);
                    console.log(`   Please add this to your shell profile manually:`);
                    console.log(`   alias phantom="npx @phantom-pm/cli@latest"`);
                }

                console.log('\n🚀 Next Steps:');
                console.log('  1. Run "phantom server" to activate the Matrix Interface');
                console.log('  2. Open the Chrome Extension panel and enable Developer Mode to side-load.');

            } catch (error: any) {
                console.error('\n❌ Boot Error:', error.message);
                console.error('Note: Are the GitHub release assets accessible at v3.0.0?');
                process.exit(1);
            }
        });
}
