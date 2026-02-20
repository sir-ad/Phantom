#!/usr/bin/env node
/**
 * PHANTOM npm Publishing Script
 * Publishes all packages to npm with proper versioning and checks
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PACKAGES = [
  '@phantom-pm/memory',
  '@phantom-pm/core',
  '@phantom-pm/adapters',
  '@phantom-pm/agent-communicator',
  '@phantom-pm/browser-agent',
  '@phantom-pm/chat-server',
  '@phantom-pm/discovery-loop',
  '@phantom-pm/docs-engine',
  '@phantom-pm/feedback-hub',
  '@phantom-pm/integrations',
  '@phantom-pm/interview-analyzer',
  '@phantom-pm/usage-intelligence',
  '@phantom-pm/mcp-server',
  '@phantom-pm/modules',
  '@phantom-pm/os-agent',
  '@phantom-pm/tui',
  '@phantom-pm/cli'
];

// Map package names to folder names
const PACKAGE_FOLDERS = {
  '@phantom-pm/memory': 'memory',
  '@phantom-pm/core': 'core',
  '@phantom-pm/adapters': 'adapters',
  '@phantom-pm/agent-communicator': 'agent-communicator',
  '@phantom-pm/browser-agent': 'browser-agent',
  '@phantom-pm/chat-server': 'chat-server',
  '@phantom-pm/discovery-loop': 'discovery-loop',
  '@phantom-pm/docs-engine': 'docs-engine',
  '@phantom-pm/feedback-hub': 'feedback-hub',
  '@phantom-pm/integrations': 'integrations',
  '@phantom-pm/interview-analyzer': 'interview-analyzer',
  '@phantom-pm/usage-intelligence': 'usage-intelligence',
  '@phantom-pm/mcp-server': 'mcp-server',
  '@phantom-pm/modules': 'modules',
  '@phantom-pm/os-agent': 'os-agent',
  '@phantom-pm/tui': 'tui',
  '@phantom-pm/cli': 'cli'
};

console.log('🎭 PHANTOM npm Publishing Script\n');

// Check if logged in to npm
try {
  execSync('npm whoami', { stdio: 'pipe' });
  console.log('✓ Logged in to npm');
} catch (error) {
  console.error('✗ Not logged in to npm. Run: npm login');
  process.exit(1);
}

// Get version from CLI package
const cliPackagePath = join(process.cwd(), 'packages/cli/package.json');
const cliPackage = JSON.parse(readFileSync(cliPackagePath, 'utf8'));
const currentVersion = cliPackage.version;

console.log(`\nCurrent version: ${currentVersion}`);
console.log('Packages to publish:', PACKAGES.join(', '));

// Update all packages to same version
console.log('\n📦 Updating package versions...');
for (const pkg of PACKAGES) {
  const folderName = PACKAGE_FOLDERS[pkg];
  const pkgPath = join(process.cwd(), `packages/${folderName}/package.json`);

  try {
    const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkgJson.version = currentVersion;

    // Update internal dependencies
    if (pkgJson.dependencies) {
      for (const dep of PACKAGES) {
        if (pkgJson.dependencies[dep]) {
          pkgJson.dependencies[dep] = currentVersion;
        }
      }
    }

    writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
    console.log(`  ✓ Updated ${pkg} to v${currentVersion}`);
  } catch (error) {
    console.error(`  ✗ Failed to update ${pkg}:`, error.message);
  }
}

// Build all packages
console.log('\n🔨 Building packages...');
try {
  // Build in order using folder paths
  const buildOrder = [
    'memory', 'core', 'adapters', 'agent-communicator',
    'browser-agent', 'chat-server', 'discovery-loop',
    'docs-engine', 'feedback-hub', 'integrations',
    'interview-analyzer', 'usage-intelligence',
    'mcp-server', 'os-agent', 'modules', 'tui', 'cli'
  ];
  for (const folder of buildOrder) {
    console.log(`  Building packages/${folder}...`);
    execSync(`cd packages/${folder} && npm run build`, { stdio: 'inherit' });
  }
  console.log('✓ Build successful');
} catch (error) {
  console.error('✗ Build failed:', error.message);
  process.exit(1);
}

// Test
console.log('\n🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✓ Tests passed');
} catch (error) {
  console.error('✗ Tests failed:', error.message);
  process.exit(1);
}

// Publish packages in order
console.log('\n🚀 Publishing packages...\n');
const publishOrder = buildOrder.map(folder => ({
  folder,
  name: Object.keys(PACKAGE_FOLDERS).find(key => PACKAGE_FOLDERS[key] === folder)
}));

for (const { folder, name } of publishOrder) {
  console.log(`Publishing ${name}...`);
  try {
    execSync(`cd packages/${folder} && npm publish --access public`, {
      stdio: 'inherit'
    });
    console.log(`  ✓ Published ${name} v${currentVersion}\n`);
  } catch (error) {
    console.error(`  ✗ Failed to publish ${name}:`, error.message);
    console.log('  Attempting to continue with next package...\n');
  }
}

console.log('\n✨ Publish complete!');
console.log('\nVerify installation:');
console.log('  npm install -g @phantom-pm/cli');
console.log('  phantom --version');
console.log('\nView on npm:');
console.log('  https://www.npmjs.com/package/@phantom-pm/cli');