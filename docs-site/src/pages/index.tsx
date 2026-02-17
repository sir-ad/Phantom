import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <pre className={styles.ascii}>
          {`░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀`}
        </pre>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs">
            Get Started →
          </Link>
          <Link
            className="button button--outline button--lg"
            href="https://github.com/sir-ad/Phantom">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Interactive PM Chat',
    description: 'Talk to your LLM like a senior PM. Phantom applies RICE, MoSCoW, and Kano frameworks automatically.',
    icon: '💬',
  },
  {
    title: 'Swarm Intelligence',
    description: '7 virtual agents debate your product question and produce a consensus recommendation.',
    icon: '🐝',
  },
  {
    title: 'PRD Generation',
    description: 'Generate full Product Requirements Documents from a single sentence.',
    icon: '📋',
  },
  {
    title: 'Model Agnostic',
    description: 'Connect Ollama, OpenAI, Anthropic, or Gemini. Switch models mid-conversation.',
    icon: '🔌',
  },
  {
    title: 'MCP Server',
    description: 'Use Phantom tools from Cursor, Windsurf, Claude Desktop, and 16+ agents.',
    icon: '🔗',
  },
  {
    title: 'Fully Local',
    description: 'All data stays on your machine. No telemetry, no accounts, no cloud dependency.',
    icon: '🔒',
  },
];

function Feature({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function QuickStart() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <h2>Quick Start</h2>
        <div className={styles.codeBlock}>
          <pre>
            <code>
              {`# Install
curl -fsSL https://raw.githubusercontent.com/sir-ad/Phantom/main/scripts/install.sh | sh

# Or via npm
npm install -g phantom-pm

# Launch
phantom`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="The open-source Product Management Operating System for the terminal.">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
        <QuickStart />
      </main>
    </Layout>
  );
}
