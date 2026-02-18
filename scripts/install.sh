#!/usr/bin/env sh
# PHANTOM installer
# Installs Phantom via npm and ensures PATH is correct

set -e

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

setup_path() {
  # Try to find where npm installs global binaries
  npm_bin_dir="$(npm prefix -g)/bin"
  
  # Check if this directory is in PATH
  case ":$PATH:" in
    *":$npm_bin_dir:"*) 
      log "NPM bin directory ($npm_bin_dir) is already in PATH."
      ;;
    *)
      warn "NPM bin directory ($npm_bin_dir) is NOT in your PATH."
      warn "You may need to add it manually to your shell configuration."
      log ""
      log "  export PATH=\"$npm_bin_dir:\$PATH\""
      log ""
      ;;
  esac
}

install_phantom() {
  log "Installing $NPM_PACKAGE globally via npm..."
  
  # Try simple install first
  if npm install -g "$NPM_PACKAGE"; then
    log "Successfully installed Phantom!"
  else
    log ""
    warn "Global installation failed (likely permission issues)."
    log "Trying again with sudo..."
    if sudo npm install -g "$NPM_PACKAGE"; then
      log "Successfully installed Phantom with sudo!"
    else
      fail "Installation failed. Please try running 'sudo npm install -g $NPM_PACKAGE' manually."
    fi
  fi

  setup_path

  if command -v phantom >/dev/null 2>&1; then
    log ""
    log "Verified: 'phantom' command is available."
    log "Run 'phantom --help' to get started."
  else
    log ""
    warn "The 'phantom' command is not yet available in your current shell."
    log "You may need to restart your terminal or source your profile."
    log "Alternatively, run instantly with npx:"
    log "  npx $NPM_PACKAGE"
  fi
}

main() {
  show_banner
  check_environment
  install_phantom
}

main "$@"
