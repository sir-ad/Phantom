#!/usr/bin/env sh
# PHANTOM installer
# Intended endpoint target: https://phantom.pm/install

set -eu

PHANTOM_MANIFEST_URL="${PHANTOM_MANIFEST_URL:-https://phantom.pm/releases/manifest.json}"
PHANTOM_INSTALL_DIR="${PHANTOM_INSTALL_DIR:-$HOME/.local/bin}"
PHANTOM_UPGRADE="${PHANTOM_UPGRADE:-0}"
PHANTOM_COLOR="${PHANTOM_COLOR:-1}"

show_banner() {
  if [ "$PHANTOM_COLOR" = "1" ]; then
    GREEN="$(printf '\033[0;32m')"
    NC="$(printf '\033[0m')"
  else
    GREEN=""
    NC=""
  fi

  log "${GREEN}░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█${NC}"
  log "${GREEN}░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█${NC}"
  log "${GREEN}░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀${NC}"
  log ""
  log "PHANTOM — The invisible force behind every great product."
  log ""
}

parse_args() {
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --upgrade)
        PHANTOM_UPGRADE="1"
        ;;
      --manifest-url)
        shift
        [ "$#" -gt 0 ] || fail "--manifest-url requires a value"
        PHANTOM_MANIFEST_URL="$1"
        ;;
      --install-dir)
        shift
        [ "$#" -gt 0 ] || fail "--install-dir requires a value"
        PHANTOM_INSTALL_DIR="$1"
        ;;
      --no-color)
        PHANTOM_COLOR="0"
        ;;
      --help|-h)
        cat <<'HELP'
Usage: install.sh [options]

Options:
  --upgrade                 Upgrade existing PHANTOM installation in place
  --manifest-url <url>      Override release manifest URL
  --install-dir <path>      Override install directory (default: ~/.local/bin)
  --no-color                Disable ANSI colors
  --help                    Show this help output
HELP
        exit 0
        ;;
      *)
        fail "unknown option: $1"
        ;;
    esac
    shift
  done
}

log() {
  printf '%s\n' "$1"
}

warn() {
  printf 'WARN: %s\n' "$1" >&2
}

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "required command missing: $1"
}

check_node() {
  if command -v node >/dev/null 2>&1; then
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    [ "$major" -ge 18 ] || warn "Node.js 18+ recommended; detected $(node -v)"
  fi
}

detect_platform() {
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"

  case "$arch" in
    x86_64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) fail "unsupported architecture: $arch" ;;
  esac

  case "$os" in
    darwin) platform="darwin-$arch" ;;
    linux) platform="linux-$arch" ;;
    *) fail "unsupported OS for this script: $os" ;;
  esac

  printf '%s' "$platform"
}

fetch_manifest() {
  manifest_path="$1"
  curl -fsSL "$PHANTOM_MANIFEST_URL" -o "$manifest_path" || return 1
}

extract_manifest_asset_node() {
  manifest_path="$1"
  platform="$2"
  node - "$manifest_path" "$platform" <<'NODE'
const fs = require('fs');

const [manifestPath, platform] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
  process.exit(2);
}
if (!Array.isArray(manifest.assets)) {
  process.exit(3);
}
const asset = manifest.assets.find((item) => item && item.platform === platform);
if (!asset) {
  process.exit(4);
}
for (const key of ['asset_url', 'sha256', 'signature']) {
  if (typeof asset[key] !== 'string' || asset[key].length === 0) {
    process.exit(5);
  }
}
console.log(manifest.version);
console.log(asset.asset_url);
console.log(asset.sha256);
console.log(asset.signature);
NODE
}

extract_manifest_asset_python() {
  manifest_path="$1"
  platform="$2"
  python3 - "$manifest_path" "$platform" <<'PY'
import json
import sys

manifest_path, platform = sys.argv[1], sys.argv[2]
with open(manifest_path, "r", encoding="utf-8") as fh:
    manifest = json.load(fh)

version = manifest.get("version")
assets = manifest.get("assets", [])
if not isinstance(version, str) or not version.strip():
    raise SystemExit(2)
if not isinstance(assets, list):
    raise SystemExit(3)

asset = next((a for a in assets if isinstance(a, dict) and a.get("platform") == platform), None)
if asset is None:
    raise SystemExit(4)

for key in ("asset_url", "sha256", "signature"):
    value = asset.get(key)
    if not isinstance(value, str) or not value:
        raise SystemExit(5)

print(version)
print(asset["asset_url"])
print(asset["sha256"])
print(asset["signature"])
PY
}

resolve_manifest_asset() {
  manifest_path="$1"
  platform="$2"
  if command -v node >/dev/null 2>&1; then
    extract_manifest_asset_node "$manifest_path" "$platform"
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    extract_manifest_asset_python "$manifest_path" "$platform"
    return
  fi
  fail "manifest parsing requires node or python3"
}

sha256_file() {
  target="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$target" | awk '{print $1}'
    return
  fi
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$target" | awk '{print $1}'
    return
  fi
  if command -v openssl >/dev/null 2>&1; then
    openssl dgst -sha256 "$target" | awk '{print $2}'
    return
  fi
  fail "no SHA256 utility available (sha256sum/shasum/openssl)"
}

install_binary_from_archive() {
  archive_path="$1"
  tmp_dir="$2"

  case "$archive_path" in
    *.zip)
      need_cmd unzip
      unzip -q "$archive_path" -d "$tmp_dir/extract"
      ;;
    *)
      tar -xzf "$archive_path" -C "$tmp_dir/extract"
      ;;
  esac

  binary_path=""
  if [ -f "$tmp_dir/extract/phantom" ]; then
    binary_path="$tmp_dir/extract/phantom"
  else
    binary_path="$(find "$tmp_dir/extract" -type f -name 'phantom' | head -n 1)"
  fi

  [ -n "$binary_path" ] || fail "phantom binary not found in archive"

  mkdir -p "$PHANTOM_INSTALL_DIR"
  binary_root="$(dirname "$binary_path")"
  if [ -d "$binary_root/lib" ]; then
    cp -R "$binary_root"/. "$PHANTOM_INSTALL_DIR"/
  else
    cp "$binary_path" "$PHANTOM_INSTALL_DIR/phantom"
  fi
  chmod +x "$PHANTOM_INSTALL_DIR/phantom"
}

setup_path() {
  shell_name="$(basename "${SHELL:-sh}")"
  case "$shell_name" in
    zsh) rc_file="$HOME/.zshrc" ;;
    bash) rc_file="$HOME/.bashrc" ;;
    fish) rc_file="$HOME/.config/fish/config.fish" ;;
    *) rc_file="$HOME/.profile" ;;
  esac

  if [ "$shell_name" = "fish" ]; then
    path_line="fish_add_path $PHANTOM_INSTALL_DIR"
  else
    path_line="export PATH=\"$PHANTOM_INSTALL_DIR:\$PATH\""
  fi

  if [ -f "$rc_file" ] && grep -Fq "$PHANTOM_INSTALL_DIR" "$rc_file"; then
    :
  else
    mkdir -p "$(dirname "$rc_file")"
    printf '\n# Added by PHANTOM installer\n%s\n' "$path_line" >> "$rc_file"
  fi

  export PATH="$PHANTOM_INSTALL_DIR:$PATH"
}

fallback_npm() {
  if command -v npm >/dev/null 2>&1; then
    warn "falling back to npm install"
    npm install -g @phantompm/cli || fail "fallback npm install failed"
    log "Installed via npm fallback. Run: phantom --version"
    return
  fi
  fail "npm unavailable and binary install path failed"
}

run_post_install_checks() {
  if ! command -v phantom >/dev/null 2>&1; then
    warn "phantom not on current PATH; open a new shell or run: export PATH=\"$PHANTOM_INSTALL_DIR:\$PATH\""
  fi

  if phantom --version >/dev/null 2>&1; then
    version="$(phantom --version 2>/dev/null | tr -d '\r')"
    log "Installed PHANTOM: $version"
  else
    warn "unable to verify phantom version in current shell"
  fi

  if phantom doctor >/dev/null 2>&1; then
    log "Environment check: phantom doctor passed"
  else
    warn "phantom doctor reported warnings. Run 'phantom doctor' for details."
  fi
}

main() {
  parse_args "$@"
  show_banner

  need_cmd curl
  need_cmd tar
  check_node

  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT INT TERM

  platform="$(detect_platform)"
  manifest_path="$tmp_dir/manifest.json"

  if [ "$PHANTOM_UPGRADE" = "1" ]; then
    log "PHANTOM upgrade"
  else
    log "PHANTOM installer"
  fi
  log "Detected platform: $platform"

  if ! fetch_manifest "$manifest_path"; then
    warn "failed to fetch manifest from $PHANTOM_MANIFEST_URL"
    fallback_npm
    exit 0
  fi

  manifest_values="$(resolve_manifest_asset "$manifest_path" "$platform" || true)"
  if [ -z "$manifest_values" ]; then
    warn "no matching binary asset in manifest for $platform"
    fallback_npm
    exit 0
  fi

  release_version="$(printf '%s\n' "$manifest_values" | sed -n '1p')"
  asset_url="$(printf '%s\n' "$manifest_values" | sed -n '2p')"
  expected_sha256="$(printf '%s\n' "$manifest_values" | sed -n '3p')"
  signature_ref="$(printf '%s\n' "$manifest_values" | sed -n '4p')"

  [ -n "$asset_url" ] || fail "manifest asset URL is empty"
  [ -n "$expected_sha256" ] || fail "manifest sha256 is empty"
  [ -n "$signature_ref" ] || fail "manifest signature is empty"

  log "Release version: $release_version"
  log "Downloading binary..."
  asset_ext=".tar.gz"
  case "$asset_url" in
    *.tar.gz) asset_ext=".tar.gz" ;;
    *.tgz) asset_ext=".tgz" ;;
    *.zip) asset_ext=".zip" ;;
  esac
  archive_path="$tmp_dir/phantom-asset$asset_ext"
  curl -fsSL "$asset_url" -o "$archive_path" || {
    warn "binary download failed from $asset_url"
    fallback_npm
    exit 0
  }

  actual_sha256="$(sha256_file "$archive_path")"
  if [ "$actual_sha256" != "$expected_sha256" ]; then
    fail "checksum mismatch (expected $expected_sha256, got $actual_sha256)"
  fi

  mkdir -p "$tmp_dir/extract"
  install_binary_from_archive "$archive_path" "$tmp_dir"
  setup_path
  run_post_install_checks

  if [ "$PHANTOM_UPGRADE" = "1" ]; then
    log "PHANTOM upgrade complete."
  else
    log "PHANTOM install complete."
  fi
  log "Next command: phantom --help"
}

main "$@"
