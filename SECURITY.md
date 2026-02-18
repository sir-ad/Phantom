# Security Policy

## Reporting Vulnerabilities

**Do not open public issues for security vulnerabilities.**

Email **security@phantom.pm** with:
- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Impact assessment

We respond within 48 hours and patch critical issues within 7 days.

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| Core engine (`packages/core/`) | Third-party AI provider APIs |
| MCP server (`packages/mcp-server/`) | User-configured model outputs |
| CLI authentication & config (`packages/cli/`) | Ollama/LM Studio local instances |
| Module execution sandbox | Upstream npm dependencies |

## Security Features

- **Local-first**: All data stays on your machine by default.
- **No telemetry**: Zero data collection, zero phone-home.
- **API key masking**: `phantom config get` redacts sensitive values.
- **Sandboxed modules**: Modules run in isolated contexts.
- **No network by default**: Phantom only connects when you explicitly configure an AI provider.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x | ✅ Active |
| < 1.0 | ❌ EOL |

## Disclosure

We follow [coordinated disclosure](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure). Credit to reporters in release notes (unless you prefer anonymity).

## License

MIT. See [LICENSE](./LICENSE).
