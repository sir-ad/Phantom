// PHANTOM GitHub Integration - Real OAuth + API Integration

import { randomBytes } from 'crypto';
import { createServer } from 'http';
import { URL } from 'url';
import open from 'open';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getConfig } from '../../core/dist/config.js';

export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{ name: string; color: string }>;
  created_at: string;
  updated_at: string;
}

export class GitHubIntegration {
  private config: GitHubConfig;
  private readonly redirectUri = 'http://localhost:0/auth/github/callback'; // Port 0 = random available port

  constructor(config: Partial<GitHubConfig> = {}) {
    this.config = {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      scope: 'repo,user',
      ...config,
    };
  }

  async authenticate(): Promise<string> {
    // Check for existing token
    if (this.config.accessToken && this.isTokenValid()) {
      return this.config.accessToken;
    }

    // Start OAuth flow
    return this.startOAuthFlow();
  }

  private isTokenValid(): boolean {
    if (!this.config.expiresAt) return false;
    const expiresAt = new Date(this.config.expiresAt);
    return expiresAt > new Date();
  }

  private async startOAuthFlow(): Promise<string> {
    const state = randomBytes(16).toString('hex');
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('scope', this.config.scope || 'repo');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('allow_signup', 'true');

    console.log('Opening GitHub OAuth in browser...');
    await open(authUrl.toString());

    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        
        if (url.pathname === '/auth/github/callback') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const returnedState = url.searchParams.get('state');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<h1>Authorization failed: ${error}</h1>`);
            server.close();
            reject(new Error(`GitHub OAuth error: ${error}`));
            return;
          }

          if (!code || returnedState !== state) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Invalid OAuth response</h1>');
            server.close();
            reject(new Error('Invalid OAuth response'));
            return;
          }

          try {
            const token = await this.exchangeCodeForToken(code);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Success! You can close this window and return to PHANTOM.</h1>');
            server.close();
            resolve(token);
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end(`<h1>Token exchange failed: ${err instanceof Error ? err.message : 'Unknown error'}</h1>`);
            server.close();
            reject(err);
          }
        } else {
          res.writeHead(404);
          res.end();
        }
      });

      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
          const port = address.port;
          console.log(`OAuth server listening on http://localhost:${port}`);
          
          // Update redirect URI
          const updatedAuthUrl = new URL(authUrl.toString());
          updatedAuthUrl.searchParams.set('redirect_uri', `http://localhost:${port}/auth/github/callback`);
          console.log('Opening updated URL in browser...');
          open(updatedAuthUrl.toString());
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('OAuth flow timeout'));
      }, 5 * 60 * 1000);
    });
  }

  private async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (data.error) {
      throw new Error(`GitHub error: ${data.error_description || data.error}`);
    }

    this.config.accessToken = data.access_token;
    this.config.refreshToken = data.refresh_token;
    this.config.expiresAt = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

    // Save token to config
    this.saveToken();

    return data.access_token;
  }

  private saveToken(): void {
    const cfg = getConfig().get();
    const existing = cfg.integrations.find(i => i.name === 'github');
    
    const updatedIntegration = {
      name: 'github',
      connected: true,
      lastConnectedAt: new Date().toISOString(),
      config: {
        target: 'github',
        configured_at: new Date().toISOString(),
        access_token: this.config.accessToken || '',
        refresh_token: this.config.refreshToken || '',
        expires_at: this.config.expiresAt || '',
        scope: this.config.scope || '',
      },
    };

    const nextIntegrations = existing
      ? cfg.integrations.map(i => i.name === 'github' ? { ...i, ...updatedIntegration } : i)
      : [...cfg.integrations, updatedIntegration];

    getConfig().set('integrations', nextIntegrations);
  }

  async getUser(): Promise<GitHubUser> {
    const token = await this.authenticate();
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PHANTOM-PM',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json() as Promise<GitHubUser>;
  }

  async getRepos(org?: string): Promise<GitHubRepo[]> {
    const token = await this.authenticate();
    const url = org 
      ? `https://api.github.com/orgs/${org}/repos`
      : 'https://api.github.com/user/repos';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PHANTOM-PM',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json() as Promise<GitHubRepo[]>;
  }

  async getIssues(repo: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    const token = await this.authenticate();
    const [owner, repoName] = repo.split('/');
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues?state=${state}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PHANTOM-PM',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json() as Promise<GitHubIssue[]>;
  }

  async createIssue(repo: string, title: string, body: string, labels: string[] = []): Promise<GitHubIssue> {
    const token = await this.authenticate();
    const [owner, repoName] = repo.split('/');
    
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'PHANTOM-PM',
      },
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json() as Promise<GitHubIssue>;
  }

  async cloneRepo(repo: string, targetDir: string): Promise<void> {
    const token = await this.authenticate();
    const cloneUrl = `https://${token}@github.com/${repo}.git`;
    
    // Use git CLI to clone
    const { execSync } = await import('child_process');
    execSync(`git clone ${cloneUrl} ${targetDir}`, { stdio: 'inherit' });
  }

  async createRepo(name: string, description: string, isPrivate: boolean = false): Promise<GitHubRepo> {
    const token = await this.authenticate();
    
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'PHANTOM-PM',
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json() as Promise<GitHubRepo>;
  }

  async syncContextFromRepo(repo: string, targetPath: string): Promise<void> {
    // Clone repo if not already cloned
    if (!existsSync(join(targetPath, '.git'))) {
      await this.cloneRepo(repo, targetPath);
    }

    // Add to PHANTOM context
    const { getContextEngine } = await import('../../core/dist/context.js');
    const context = getContextEngine();
    await context.addPath(targetPath);
  }

  disconnect(): void {
    const cfg = getConfig().get();
    const updated = cfg.integrations.map(i => 
      i.name === 'github' 
        ? { 
            ...i, 
            connected: false, 
            config: { 
              ...i.config, 
              access_token: i.config.access_token || '', 
              configured_at: i.config.configured_at || new Date().toISOString()
            } 
          }
        : i
    );
    
    getConfig().set('integrations', updated);
    this.config.accessToken = undefined;
    this.config.refreshToken = undefined;
    this.config.expiresAt = undefined;
  }
}