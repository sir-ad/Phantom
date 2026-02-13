#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { pathToFileURL } from 'url';

const ROOT = resolve(join(import.meta.dirname, '..', '..'));
const TMP_ROOT = join(ROOT, '.tmp-installer-test');
const INSTALL_DIR = join(TMP_ROOT, 'bin');
const HOME_DIR = join(TMP_ROOT, 'home');
const PHANTOM_HOME = join(TMP_ROOT, '.phantom');
const MANIFEST_PATH = join(ROOT, 'releases', 'manifest.local.json');

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || '');
    throw new Error(`${cmd} ${args.join(' ')} failed with exit code ${result.status}`);
  }
  return result.stdout;
}

function main() {
  rmSync(TMP_ROOT, { recursive: true, force: true });
  mkdirSync(INSTALL_DIR, { recursive: true });
  mkdirSync(HOME_DIR, { recursive: true });
  mkdirSync(PHANTOM_HOME, { recursive: true });

  run('node', ['scripts/release/build-local-install-artifacts.mjs']);
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(`manifest not found: ${MANIFEST_PATH}`);
  }

  const manifestUrl = pathToFileURL(MANIFEST_PATH).toString();
  run('sh', ['scripts/install.sh'], {
    HOME: HOME_DIR,
    PHANTOM_HOME,
    PHANTOM_INSTALL_DIR: INSTALL_DIR,
    PHANTOM_MANIFEST_URL: manifestUrl,
    PATH: `${INSTALL_DIR}:${process.env.PATH || ''}`,
  });

  const phantomBin = join(INSTALL_DIR, 'phantom');
  if (!existsSync(phantomBin)) {
    throw new Error(`phantom binary missing at ${phantomBin}`);
  }

  const version = run(phantomBin, ['--version'], {
    PHANTOM_HOME,
    PATH: `${INSTALL_DIR}:${process.env.PATH || ''}`,
  }).trim();

  const statusRaw = run(phantomBin, ['status', '--json'], {
    PHANTOM_HOME,
    PATH: `${INSTALL_DIR}:${process.env.PATH || ''}`,
  });
  JSON.parse(statusRaw);

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  process.stdout.write(`Installer test passed.\nVersion: ${version}\nManifest: ${manifest.version}\n`);
}

main();
