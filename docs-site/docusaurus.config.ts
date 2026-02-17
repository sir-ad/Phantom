import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Phantom',
  tagline: 'The open-source PM Operating System for the terminal age.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://sir-ad.github.io',
  baseUrl: '/Phantom/',

  organizationName: 'sir-ad',
  projectName: 'Phantom',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/sir-ad/Phantom/tree/main/docs-site/',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/phantom-social.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Phantom',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/sir-ad/Phantom',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Installation', to: '/docs/installation' },
            { label: 'Features', to: '/docs/features/chat' },
          ],
        },
        {
          title: 'Technical',
          items: [
            { label: 'Architecture', to: '/docs/architecture' },
            { label: 'MCP Server', to: '/docs/mcp' },
            { label: 'AI Providers', to: '/docs/providers' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/sir-ad/Phantom' },
            { label: 'Contributing', to: '/docs/contributing' },
            { label: 'Issues', href: 'https://github.com/sir-ad/Phantom/issues' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Phantom. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
