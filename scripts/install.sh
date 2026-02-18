#!/usr/bin/env sh
# PHANTOM installer
# Installs Phantom via npm

set -eu

PHANTOM_COLOR="${PHANTOM_COLOR:-1}"
NPM_PACKAGE="@phantom-pm/cli"

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

check_environment() {
  if ! command -v npm >/dev/null 2>&1; then
    fail "npm is required to install Phantom. Please install Node.js/npm first."
  fi

  if command -v node >/dev/null 2>&1; then
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    [ "$major" -ge 18 ] || warn "Node.js 18+ recommended; detected $(node -v)"
  fi
}

install_phantom() {
  log "Installing $NPM_PACKAGE globally via npm..."
  
  if npm install -g "$NPM_PACKAGE"; then
    log "Successfully installed Phantom!"
    log ""
    log "Run 'phantom --help' to get started."
  else
    log ""
    warn "Global installation failed (likely permission issues)."
    log "Try running with sudo:"
    log "  sudo npm install -g $NPM_PACKAGE"
    log ""
    log "Or run instantly without installation using npx:"
    log "  npx $NPM_PACKAGE --help"
    exit 1
  fi
}

main() {
  show_banner
  check_environment
  install_phantom
}

main "$@"
