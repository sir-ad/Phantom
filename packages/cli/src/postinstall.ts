#!/usr/bin/env node
// Post-install script for PHANTOM CLI
// Automatically registers PHANTOM with detected AI agents

import { PhantomDiscovery } from '@phantom-pm/mcp-server';

async function runPostInstall() {
  try {
    console.log('\n🎭 PHANTOM Post-Installation Setup');
    console.log('=====================================\n');

    // Run auto-registration
    await PhantomDiscovery.autoRegisterAll();

    console.log('\n✅ PHANTOM installation complete!');
    console.log('   1. Restart your AI agents (Cursor, Codex, etc.) to enable integration.');
    console.log('   2. Restart your terminal or run `source ~/.zshrc` (or equivalent) to refresh commands.\n');
  } catch (error) {
    // Don't fail the installation if post-install fails
    console.log('\n⚠️  Post-install setup skipped (non-critical)\n');
  }
}

runPostInstall().catch(() => {
  // Silent fail - don't break installation
});