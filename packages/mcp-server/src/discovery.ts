// PHANTOM Agent Discovery System
// Auto-detects installed AI agents and registers PHANTOM with them

import { spawnSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * Self-Discovery Mechanism
 * 
 * When AI agents start, they check for available MCP servers.
 * PHANTOM registers itself so agents automatically know it exists.
 */

export class PhantomDiscovery {
  static readonly AGENT_CONFIG_PATHS = {
    'claude-code': join(homedir(), '.claude', 'settings.json'),
    'cursor': join(homedir(), '.cursor/settings.json'),
    'zed': join(homedir(), '.config/zed/settings.json'),
    'vscode': join(homedir(), 'Library/Application Support/Code/User/settings.json'),
    'codex': join(homedir(), 'Library/Application Support/Codex/User/settings.json'),
    'antigravity': join(homedir(), 'Library/Application Support/Antigravity/User/settings.json'),
    'qoder': join(homedir(), 'Library/Application Support/Qoder/User/settings.json'),
  };

  private static readonly AGENT_NAMES = {
    'claude-code': 'Claude Code',
    'cursor': 'Cursor',
    'zed': 'Zed Editor',
    'vscode': 'Visual Studio Code',
    'codex': 'Codex AI',
    'antigravity': 'AntiGravity AI',
    'qoder': 'Qoder AI',
  };

  /**
   * Register PHANTOM with agent's MCP registry
   * This happens automatically when PHANTOM is installed
   */
  static async registerWithAgent(agentType: keyof typeof PhantomDiscovery.AGENT_CONFIG_PATHS): Promise<boolean> {
    try {
      const configPath = this.AGENT_CONFIG_PATHS[agentType];
      const agentName = this.AGENT_NAMES[agentType];
      
      if (!configPath) {
        console.log(`❌ Unknown agent type: ${agentType}`);
        return false;
      }

      // Check if agent config exists
      if (!existsSync(configPath)) {
        console.log(`○ ${agentName} config not found (skipped)`);
        return false;
      }

      // Read existing config
      let config: any = {};
      try {
        const configContent = readFileSync(configPath, 'utf8');
        config = JSON.parse(configContent);
      } catch (error) {
        config = {};
      }

      // Ensure mcpServers object exists
      if (!config.mcpServers) {
        config.mcpServers = {};
      }

      // Register PHANTOM MCP server
      config.mcpServers.phantom = {
        command: 'phantom',
        args: ['mcp', 'serve'],
        description: 'PHANTOM PM Operating System - Product management superpowers',
        capabilities: [
          'Generate PRDs',
          'Analyze product decisions',
          'Create user stories',
          'Plan sprints',
          'Access product context',
        ],
      };

      // Write updated config
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log(`✓ Registered with ${agentName} (MCP enabled)`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to register with ${this.AGENT_NAMES[agentType]}:`, error);
      return false;
    }
  }

  /**
   * Auto-detection during agent startup
   * Agent checks: "Is PHANTOM available?"
   */
  static async detectPhantom(): Promise<boolean> {
    try {
      const result = spawnSync('phantom', ['--version'], { 
        stdio: 'pipe',
        timeout: 5000
      });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  /**
   * Detect all installed agents
   */
  static detectInstalledAgents(): Array<{type: string, name: string, installed: boolean}> {
    const agents = [
      { type: 'claude-code', name: 'Claude Code', command: 'cursor' },
      { type: 'cursor', name: 'Cursor', command: 'cursor' },
      { type: 'zed', name: 'Zed Editor', command: 'zed' },
      { type: 'vscode', name: 'Visual Studio Code', command: 'code' },
      { type: 'codex', name: 'Codex AI', command: 'codex' },
      { type: 'antigravity', name: 'AntiGravity AI', command: 'antigravity' },
      { type: 'qoder', name: 'Qoder AI', command: 'qoder' },
    ];

    return agents.map(agent => {
      try {
        // Special handling for apps that might not have CLI commands
        if (agent.command === 'codex' || agent.command === 'antigravity' || agent.command === 'qoder') {
          // Check if the app is running
          const processCheck = spawnSync('pgrep', ['-f', agent.command], { 
            stdio: 'pipe',
            timeout: 3000
          });
          return {
            type: agent.type,
            name: agent.name,
            installed: processCheck.status === 0 || processCheck.stdout.toString().trim() !== ''
          };
        } else {
          // Standard CLI command check
          const result = spawnSync(agent.command, ['--version'], { 
            stdio: 'pipe',
            timeout: 3000
          });
          return {
            type: agent.type,
            name: agent.name,
            installed: result.status === 0
          };
        }
      } catch {
        return {
          type: agent.type,
          name: agent.name,
          installed: false
        };
      }
    });
  }

  /**
   * Auto-register with all detected agents
   */
  static async autoRegisterAll(): Promise<void> {
    console.log('🔍 Detecting installed AI agents...\n');
    
    const agents = this.detectInstalledAgents();
    const installedAgents = agents.filter(agent => agent.installed);
    
    if (installedAgents.length === 0) {
      console.log('No supported AI agents detected.');
      console.log(this.getSuggestedInstall());
      return;
    }

    console.log(`Found ${installedAgents.length} installed agent${installedAgents.length > 1 ? 's' : ''}:`);
    installedAgents.forEach(agent => {
      console.log(`  ✓ ${agent.name}`);
    });
    console.log('');

    console.log('🔌 Registering PHANTOM with agents...\n');
    
    let successCount = 0;
    for (const agent of installedAgents) {
      const success = await this.registerWithAgent(agent.type as any);
      if (success) successCount++;
    }

    console.log(`\n🎯 Registration complete!`);
    console.log(`✓ Successfully registered with ${successCount}/${installedAgents.length} agents`);
    
    if (successCount > 0) {
      console.log('\n✨ Your AI agents now have PM superpowers!');
      console.log('Next time you work on a feature in your IDE,');
      console.log('your agent will automatically use PHANTOM.');
    }
  }

  /**
   * Suggest installation if not found
   */
  static getSuggestedInstall(): string {
    return `
# PHANTOM not found. Install with:
npm install -g https://codeload.github.com/sir-ad/Phantom/tar.gz/refs/heads/main

# Or:
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh
    `.trim();
  }

  /**
   * Health check - verify MCP server and agent registrations
   */
  static async healthCheck(): Promise<void> {
    console.log('🏥 PHANTOM Health Check\n');
    
    // Check MCP server
    const mcpRunning = await this.detectPhantom();
    console.log(`◉ MCP Server: ${mcpRunning ? 'Running' : 'Not responding'}`);
    
    // Check agent registrations
    const agents = this.detectInstalledAgents();
    for (const agent of agents) {
      if (agent.installed) {
        const configPath = this.AGENT_CONFIG_PATHS[agent.type as keyof typeof this.AGENT_CONFIG_PATHS];
        let registered = false;
        
        if (configPath && existsSync(configPath)) {
          try {
            const config = JSON.parse(readFileSync(configPath, 'utf8'));
            registered = config.mcpServers?.phantom !== undefined;
          } catch {
            registered = false;
          }
        }
        
        console.log(`◉ ${agent.name}: ${registered ? 'Connected' : 'Not registered'}`);
      }
    }
  }
}

// Post-install hook - automatically register with detected agents
if (import.meta.url === `file://${process.argv[1]}`) {
  PhantomDiscovery.autoRegisterAll().catch(console.error);
}
