#!/usr/bin/env sh
# PHANTOM agent/IDE upgrade helper
set -eu

PHANTOM_INSTALL_URL="${PHANTOM_INSTALL_URL:-https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh}"

log() {
  printf '%s\n' "$1"
}

warn() {
  printf 'WARN: %s\n' "$1" >&2
}

ensure_phantom() {
  if command -v phantom >/dev/null 2>&1; then
    return
  fi

  log "PHANTOM not found. Installing first..."
  curl -fsSL "$PHANTOM_INSTALL_URL" | sh || {
    warn "Failed to install PHANTOM from $PHANTOM_INSTALL_URL"
    exit 1
  }
}

update_agent_skills() {
  if command -v npx >/dev/null 2>&1; then
    if npx --yes skills --version >/dev/null 2>&1; then
      log "Updating agent skills..."
      if ! npx --yes skills update; then
        warn "skills update failed. Continue with PHANTOM integration checks."
      fi
      return
    fi
  fi
  warn "npx/skills CLI not available. Skipping skills upgrade."
}

connect_targets() {
  if [ "$#" -eq 0 ]; then
    log "Running integration scan..."
    phantom integrate scan || true
    log "Running integration doctor..."
    phantom integrate doctor || true
    return
  fi

  for target in "$@"; do
    log "Connecting integration target: $target"
    if ! phantom integrate connect "$target"; then
      warn "Could not connect target: $target"
    fi
  done

  log "Running integration doctor..."
  phantom integrate doctor || true
}

main() {
  log "PHANTOM agent/IDE upgrade"
  ensure_phantom

  log "Upgrading PHANTOM binary..."
  curl -fsSL "$PHANTOM_INSTALL_URL" | sh -s -- --upgrade

  update_agent_skills
  connect_targets "$@"

  log "Done."
}

main "$@"
