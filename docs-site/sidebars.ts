import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    'installation',
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'features/chat',
        'features/swarm',
        'features/prd',
        'features/simulation',
        'features/agents',
      ],
    },
    {
      type: 'category',
      label: 'AI Providers',
      items: [
        'providers/index',
        'providers/ollama',
        'providers/openai',
        'providers/anthropic',
        'providers/gemini',
      ],
    },
    {
      type: 'category',
      label: 'Technical',
      items: [
        'architecture',
        'mcp',
        'modules',
        'cli-reference',
      ],
    },
    'configuration',
    'contributing',
  ],
};

export default sidebars;
