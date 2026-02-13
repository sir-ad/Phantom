#!/usr/bin/env node
import { build } from 'esbuild';
import { createHash } from 'crypto';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import { spawnSync } from 'child_process';

const ROOT = resolve(join(import.meta.dirname, '..', '..'));
const RELEASE_DIR = join(ROOT, 'releases');
const LOCAL_DIR = join(RELEASE_DIR, 'local');
const STAGE_DIR = join(LOCAL_DIR, 'stage');
const BUNDLE_PATH = join(STAGE_DIR, 'lib', 'phantom-cli.cjs');
const LAUNCHER_PATH = join(STAGE_DIR, 'phantom');
const MANIFEST_PATH = join(RELEASE_DIR, 'manifest.local.json');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function detectPlatform() {
  const osMap = { darwin: 'darwin', linux: 'linux', win32: 'win' };
  const archMap = { x64: 'x64', arm64: 'arm64' };
  const os = osMap[process.platform];
  const arch = archMap[process.arch];
  if (!os || !arch) fail(`Unsupported platform for local release: ${process.platform}/${process.arch}`);
  return `${os}-${arch}`;
}

function sha256(filePath) {
  const content = readFileSync(filePath);
  const hash = createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} failed\n${result.stderr || result.stdout}`);
  }
}

async function main() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const version = pkg.version;
  const platform = detectPlatform();

  rmSync(LOCAL_DIR, { recursive: true, force: true });
  mkdirSync(join(STAGE_DIR, 'lib'), { recursive: true });

  const cliEntry = join(ROOT, 'packages', 'cli', 'dist', 'index.js');
  await build({
    entryPoints: [cliEntry],
    outfile: BUNDLE_PATH,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    bundle: true,
    sourcemap: false,
    legalComments: 'none',
  }).catch((error) => fail(`esbuild bundle failed: ${String(error)}`));

  const launcher = `#!/usr/bin/env sh
set -eu
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18+ is required to run PHANTOM." >&2
  exit 1
fi
exec node "$SCRIPT_DIR/lib/phantom-cli.cjs" "$@"
`;
  writeFileSync(LAUNCHER_PATH, launcher, 'utf8');
  run('chmod', ['+x', LAUNCHER_PATH]);

  const archiveName = `phantom-${platform}.tar.gz`;
  const archivePath = join(LOCAL_DIR, archiveName);
  run('tar', ['-czf', archivePath, '-C', STAGE_DIR, '.']);

  const manifest = {
    schema_version: '1.0',
    version,
    published_at: new Date().toISOString(),
    assets: [
      {
        platform,
        asset_url: pathToFileURL(archivePath).toString(),
        sha256: sha256(archivePath),
        signature: 'local-dev-unsigned',
        size_bytes: statSync(archivePath).size,
      },
    ],
    fallback: {
      npm_package: 'https://codeload.github.com/sir-ad/Phantom/tar.gz/refs/heads/main',
      npx_package: 'https://codeload.github.com/sir-ad/Phantom/tar.gz/refs/heads/main',
      minimum_node: '18.0.0',
    },
  };

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  process.stdout.write(`Local release manifest written: ${MANIFEST_PATH}\n`);
  process.stdout.write(`Local archive written: ${archivePath}\n`);
  process.stdout.write(
    `Run installer test with:\nPHANTOM_MANIFEST_URL="${pathToFileURL(MANIFEST_PATH).toString()}" sh scripts/install.sh\n`
  );
}

await main();
