// ╔══════════════════════════════════════════════════════════════════╗
// ║  PHANTOM BRAND — "There is no spoon... but there is a brand."   ║
// ║                                                                  ║
// ║  Single source of truth for every link, name, contact, and URL  ║
// ║  in the Phantom ecosystem. Import this instead of hardcoding.    ║
// ╚══════════════════════════════════════════════════════════════════╝

export const BRAND = {
    // ─── Identity ──────────────────────────────────────────────────
    name: 'Phantom',
    fullName: 'Phantom PM Operating System',
    tagline: 'The invisible force behind every great product.',
    subtitle: 'Open source PM operating system for the terminal age.',
    description: 'AI-native product management OS — 23 modules, local-first, zero data collection.',

    // ─── Versioning ────────────────────────────────────────────────
    version: '1.0.0',
    codename: 'The Matrix',

    // ─── URLs ──────────────────────────────────────────────────────
    website: 'https://sir-ad.github.io/Phantom/',
    github: 'https://github.com/sir-ad/Phantom',
    npm: 'https://www.npmjs.com/package/@phantom-pm/cli',
    docs: 'https://sir-ad.github.io/Phantom/',
    changelog: 'https://github.com/sir-ad/Phantom/blob/main/CHANGELOG.md',
    issues: 'https://github.com/sir-ad/Phantom/issues',
    discussions: 'https://github.com/sir-ad/Phantom/discussions',
    releases: 'https://github.com/sir-ad/Phantom/releases',

    // ─── Author & Contact ─────────────────────────────────────────
    author: {
        name: 'sir-ad',
        github: 'https://github.com/sir-ad',
    },

    // ─── Support ───────────────────────────────────────────────────
    support: {
        issues: 'https://github.com/sir-ad/Phantom/issues/new',
        security: 'https://github.com/sir-ad/Phantom/security/advisories/new',
        contributing: 'https://github.com/sir-ad/Phantom/blob/main/CONTRIBUTING.md',
    },

    // ─── Legal ─────────────────────────────────────────────────────
    license: 'MIT',
    licenseUrl: 'https://github.com/sir-ad/Phantom/blob/main/LICENSE',

    // ─── Registry & Distribution ───────────────────────────────────
    packages: {
        cli: '@phantom-pm/cli',
        core: '@phantom-pm/core',
        modules: '@phantom-pm/modules',
        tui: '@phantom-pm/tui',
        integrations: '@phantom-pm/integrations',
    },

    // ─── MCP Configuration ────────────────────────────────────────
    mcp: {
        serverName: 'phantom-pm',
        command: 'npx',
        args: ['-y', '@phantom-pm/cli', 'mcp', 'serve'],
        description: 'Phantom PM Operating System — 23 AI-powered product management superpowers',
    },

    // ─── IDE Integration Paths ────────────────────────────────────
    ideConfigs: {
        cursor: {
            global: '~/.cursor/mcp.json',
            project: '.cursor/mcp.json',
            configKey: 'mcpServers',
        },
        windsurf: {
            global: '~/.codeium/windsurf/mcp_config.json',
            configKey: 'mcpServers',
        },
        vscode: {
            project: '.vscode/mcp.json',
            configKey: 'servers',
        },
        claudeDesktop: {
            global: '~/Library/Application Support/Claude/claude_desktop_config.json',
            configKey: 'mcpServers',
        },
        claudeCode: {
            install: 'claude mcp add phantom-pm -- npx -y @phantom-pm/cli mcp serve',
        },
    },

    // ─── Badges & Shields ─────────────────────────────────────────
    badges: {
        license: 'https://img.shields.io/github/license/sir-ad/Phantom?style=flat-square&color=00FF41',
        build: 'https://img.shields.io/github/actions/workflow/status/sir-ad/Phantom/ci.yml?style=flat-square&label=build&color=00FF41',
        release: 'https://img.shields.io/github/v/release/sir-ad/Phantom?style=flat-square&color=00D4FF',
        node: 'https://img.shields.io/badge/node-%3E%3D20-00FF41?style=flat-square',
        platform: 'https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-00D4FF?style=flat-square',
    },

    // ─── Topics & Keywords ────────────────────────────────────────
    topics: [
        'product-management', 'ai', 'cli', 'mcp', 'llm',
        'terminal', 'agents', 'ollama', 'openai', 'open-source',
        'consulting', 'frameworks', 'prd', 'sprint-planning',
    ],
} as const;

export type Brand = typeof BRAND;
