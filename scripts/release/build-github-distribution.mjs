#!/usr/bin/env node
import { build } from 'esbuild';
import { chmodSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(join(import.meta.dirname, '..', '..'));
const DIST_DIR = join(ROOT, 'dist');
const CLI_ENTRY = join(ROOT, 'packages', 'cli', 'dist', 'index.js');
const BUNDLE_PATH = join(DIST_DIR, 'phantom-cli.cjs');
const LAUNCHER_PATH = join(DIST_DIR, 'phantom.js');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

async function main() {
  if (!existsSync(CLI_ENTRY)) {
    fail(`Missing CLI build artifact: ${CLI_ENTRY}. Run \"npm run build\" first.`);
  }

  rmSync(DIST_DIR, { recursive: true, force: true });
  mkdirSync(DIST_DIR, { recursive: true });

  await build({
    entryPoints: [CLI_ENTRY],
    outfile: BUNDLE_PATH,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    bundle: true,
    external: ['playwright', 'playwright-core', 'chromium-bidi'],
    sourcemap: false,
    legalComments: 'none',
  }).catch((error) => fail(`esbuild bundle failed: ${String(error)}`));

  const launcher = `#!/usr/bin/env node\nrequire('./phantom-cli.cjs');\n`;
  writeFileSync(LAUNCHER_PATH, launcher, 'utf8');
  chmodSync(LAUNCHER_PATH, 0o755);

  process.stdout.write(`Distribution bundle ready: ${LAUNCHER_PATH}\n`);
}

await main();
