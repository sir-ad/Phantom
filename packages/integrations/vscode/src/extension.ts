// PHANTOM VS Code Extension
// Matrix-themed dashboard integration

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('PHANTOM extension activated');

  // Register commands
  const openDashboard = vscode.commands.registerCommand('phantom.openDashboard', () => {
    PhantomPanel.createOrShow(context.extensionUri);
  });

  const generatePRD = vscode.commands.registerCommand('phantom.generatePRD', async () => {
    const featureName = await vscode.window.showInputBox({
      prompt: 'Enter feature name for PRD generation',
      placeHolder: 'e.g., User Authentication System'
    });
    
    if (featureName) {
      // In a real implementation, this would call the PHANTOM MCP server
      vscode.window.showInformationMessage(`Generating PRD for: ${featureName}`);
      // Show the dashboard to display progress
      PhantomPanel.createOrShow(context.extensionUri);
    }
  });

  const analyzeDecision = vscode.commands.registerCommand('phantom.analyzeDecision', async () => {
    const question = await vscode.window.showInputBox({
      prompt: 'Enter product decision question',
      placeHolder: 'e.g., Should we add social login or focus on email authentication?'
    });
    
    if (question) {
      vscode.window.showInformationMessage(`Analyzing: ${question}`);
      PhantomPanel.createOrShow(context.extensionUri);
    }
  });

  context.subscriptions.push(openDashboard, generatePRD, analyzeDecision);
}

export function deactivate() {}

/**
 * PHANTOM Visual Panel in VS Code
 * Shows Matrix-themed UI inside the IDE
 */
class PhantomPanel {
  public static currentPanel: PhantomPanel | undefined;
  private static readonly viewType = 'phantomDashboard';
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._update();
    
    this._panel.onDidDispose(() => this.dispose(), null, []);
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (PhantomPanel.currentPanel) {
      PhantomPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      PhantomPanel.viewType,
      'PHANTOM Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    PhantomPanel.currentPanel = new PhantomPanel(panel, extensionUri);
  }

  public dispose() {
    PhantomPanel.currentPanel = undefined;
    this._panel.dispose();
  }

  private _update() {
    this._panel.title = 'PHANTOM Dashboard';
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PHANTOM Dashboard</title>
  <style>
    body {
      background: #0D1117;
      color: #E6EDF3;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      padding: 20px;
      margin: 0;
      overflow: hidden;
    }
    
    .phantom-header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
    }
    
    .phantom-logo {
      color: #00FF41;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
      animation: glow 2s ease-in-out infinite;
      letter-spacing: 2px;
    }
    
    @keyframes glow {
      0%, 100% { text-shadow: 0 0 10px #00FF41, 0 0 20px #00FF41; }
      50% { text-shadow: 0 0 15px #00FF41, 0 0 30px #00FF41; }
    }
    
    .phantom-subtitle {
      color: #8B949E;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .matrix-rain {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.1;
      z-index: -1;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      height: calc(100vh - 150px);
    }
    
    .panel {
      background: #161B22;
      border: 1px solid #00FF41;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
    }
    
    .panel-title {
      color: #00FF41;
      font-weight: bold;
      margin-bottom: 15px;
      font-size: 16px;
      display: flex;
      align-items: center;
    }
    
    .panel-title::before {
      content: '◉';
      margin-right: 10px;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .agent-status {
      background: #1A1E24;
      border: 1px solid #21262D;
      border-radius: 6px;
      padding: 12px;
      margin: 10px 0;
    }
    
    .agent-name {
      color: #00FF41;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .agent-description {
      color: #8B949E;
      font-size: 12px;
      margin: 5px 0;
    }
    
    .progress-container {
      margin-top: 10px;
    }
    
    .progress-bar {
      background: #21262D;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 5px;
    }
    
    .progress-fill {
      background: linear-gradient(90deg, #00FF41, #00D4FF);
      height: 100%;
      width: 0%;
      transition: width 0.3s ease;
      animation: progressGlow 2s infinite;
    }
    
    @keyframes progressGlow {
      0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 65, 0.5); }
      50% { box-shadow: 0 0 10px rgba(0, 255, 65, 0.8); }
    }
    
    .metric-value {
      color: #00FF41;
      font-weight: bold;
      font-size: 24px;
      text-align: center;
      margin: 10px 0;
    }
    
    .metric-label {
      color: #8B949E;
      font-size: 12px;
      text-align: center;
    }
    
    .action-button {
      background: #00FF41;
      color: #0D1117;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      margin: 5px;
      cursor: pointer;
      font-family: inherit;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .action-button:hover {
      background: #00D4FF;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 212, 255, 0.3);
    }
    
    .notification {
      background: rgba(0, 255, 65, 0.1);
      border: 1px solid #00FF41;
      border-radius: 6px;
      padding: 15px;
      margin: 15px 0;
      animation: fadeIn 0.5s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .notification-title {
      color: #00FF41;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .notification-content {
      color: #E6EDF3;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <canvas class="matrix-rain" id="matrixRain"></canvas>
  
  <div class="phantom-header">
    <pre class="phantom-logo">
░█▀█░█░█░█▀█░█▀█░▀█▀░█▀█░█▄█
░█▀▀░█▀█░█▀█░█░█░░█░░█░█░█░█
░▀░░░▀░▀░▀░▀░▀░▀░░▀░░▀▀▀░▀░▀
    </pre>
    <div class="phantom-subtitle">The invisible force behind every great product.</div>
  </div>
  
  <div class="dashboard-grid">
    <div class="panel">
      <div class="panel-title">AGENT SWARM STATUS</div>
      <div class="agent-status">
        <div class="agent-name">◉ Strategist Agent</div>
        <div class="agent-description">Analyzing market opportunities and competitive landscape</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 85%"></div>
          </div>
        </div>
      </div>
      
      <div class="agent-status">
        <div class="agent-name">◉ Analyst Agent</div>
        <div class="agent-description">Processing user feedback and behavioral data</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 60%"></div>
          </div>
        </div>
      </div>
      
      <div class="agent-status">
        <div class="agent-name">◉ Builder Agent</div>
        <div class="agent-description">Generating technical implementation plans</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 40%"></div>
          </div>
        </div>
      </div>
      
      <button class="action-button" onclick="runSwarm()">RUN SWARM ANALYSIS</button>
    </div>
    
    <div class="panel">
      <div class="panel-title">PRODUCT METRICS</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="metric-value">87%</div>
          <div class="metric-label">HEALTH SCORE</div>
        </div>
        <div>
          <div class="metric-value">42</div>
          <div class="metric-label">CONTEXT FILES</div>
        </div>
        <div>
          <div class="metric-value">12</div>
          <div class="metric-label">ACTIVE AGENTS</div>
        </div>
        <div>
          <div class="metric-value">5</div>
          <div class="metric-label">GENERATED PRDs</div>
        </div>
      </div>
      
      <div class="notification">
        <div class="notification-title">✨ NEW INSIGHT</div>
        <div class="notification-content">User retention increased 15% after implementing dark mode</div>
      </div>
      
      <button class="action-button" onclick="generatePRD()">GENERATE PRD</button>
      <button class="action-button" onclick="analyzeDecision()">ANALYZE DECISION</button>
    </div>
  </div>
  
  <script>
    // Matrix rain effect
    const canvas = document.getElementById('matrixRain');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function drawMatrix() {
      ctx.fillStyle = 'rgba(13, 17, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00FF41';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillText(char, x, y);
        
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    
    setInterval(drawMatrix, 33);
    
    // Button actions (would connect to VS Code commands)
    function runSwarm() {
      vscode.postMessage({ command: 'runSwarm' });
    }
    
    function generatePRD() {
      vscode.postMessage({ command: 'generatePRD' });
    }
    
    function analyzeDecision() {
      vscode.postMessage({ command: 'analyzeDecision' });
    }
    
    // Handle messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.command) {
        case 'updateAgents':
          // Update agent statuses
          break;
        case 'showNotification':
          // Show notification in dashboard
          break;
      }
    });
  </script>
</body>
</html>
    `;
  }
}