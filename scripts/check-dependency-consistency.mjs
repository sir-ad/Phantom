#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const PACKAGES_DIR = join(ROOT, 'packages');

function fail(message) {
  console.error(`dependency-consistency: ${message}`);
  process.exitCode = 1;
}

function loadWorkspacePackages() {
  const map = new Map();
  for (const dir of readdirSync(PACKAGES_DIR)) {
    const pkgPath = join(PACKAGES_DIR, dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (pkg.name) {
      map.set(pkg.name, {
        version: pkg.version,
        path: resolve(PACKAGES_DIR, dir),
      });
    }
  }
  return map;
}

function checkNpmLs() {
  try {
    execSync('npm ls --all --json', { stdio: 'pipe' });
  } catch (error) {
    const output = error?.stdout ? String(error.stdout) : '';
    if (output.includes('"problems"')) {
      fail('npm ls reported dependency problems (invalid/missing/peer conflicts).');
      return;
    }
    fail('npm ls failed. Run `npm ci` and retry.');
  }
}

function checkWorkspaceShadows(workspaces) {
  for (const dir of readdirSync(PACKAGES_DIR)) {
    const packageRoot = join(PACKAGES_DIR, dir);
    const scopedDir = join(packageRoot, 'node_modules', '@phantom-pm');
    if (!existsSync(scopedDir)) continue;

    for (const candidate of readdirSync(scopedDir)) {
      const packageName = `@phantom-pm/${candidate}`;
      const expected = workspaces.get(packageName);
      if (!expected) continue;

      const target = join(scopedDir, candidate);
      const stat = lstatSync(target);
      if (!stat.isSymbolicLink()) {
        fail(`stale local install detected at ${target}. Remove package-local node_modules and run npm ci.`);
        continue;
      }

      const resolvedTarget = resolve(realpathSync(target));
      const expectedTarget = resolve(expected.path);
      if (resolvedTarget !== expectedTarget) {
        fail(
          `workspace package shadowed at ${target}. Expected link to ${expectedTarget}, got ${resolvedTarget}.`
        );
      }
    }
  }
}

function main() {
  if (!existsSync(PACKAGES_DIR)) {
    fail('packages directory not found');
    return;
  }

  const workspaces = loadWorkspacePackages();
  checkNpmLs();
  checkWorkspaceShadows(workspaces);

  if (process.exitCode && process.exitCode !== 0) {
    return;
  }

  console.log('dependency-consistency: OK');
}

main();
