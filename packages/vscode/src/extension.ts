import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

let dashboardProcess: ChildProcess | undefined;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Phantom');
    outputChannel.appendLine('Phantom extension activating...');

    // Register Dashboard View Provider
    const provider = new PhantomDashboardProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('phantom.dashboard', provider)
    );

    // Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('phantom.dashboard.open', () => {
            vscode.commands.executeCommand('workbench.view.extension.phantom-app');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('phantom.prd.generate', async () => {
            const title = await vscode.window.showInputBox({ prompt: 'Enter PRD Title' });
            if (title) {
                vscode.window.showInformationMessage(`Generating PRD: ${title}...`);
                // Call CLI
                const cliPath = getCliPath(context);
                if (cliPath) {
                    runCliValues(cliPath, ['prd', 'generate', '--title', title]);
                }
            }
        })
    );

    // Start Dashboard Server
    startDashboardServer(context);
}

export function deactivate() {
    if (dashboardProcess) {
        outputChannel.appendLine('Stopping dashboard server...');
        dashboardProcess.kill();
    }
}

function getCliPath(context: vscode.ExtensionContext): string | undefined {
    // Check bundled resource first
    const bundledPath = context.asAbsolutePath(path.join('resources', 'phantom-cli.mjs'));
    return bundledPath;
}

function startDashboardServer(context: vscode.ExtensionContext) {
    const cliPath = getCliPath(context);
    if (!cliPath) {
        outputChannel.appendLine('Error: Could not find Phantom CLI');
        return;
    }

    outputChannel.appendLine(`Starting dashboard from: ${cliPath}`);

    // Spawn: node <cli> dashboard --port 3333
    dashboardProcess = spawn('node', [cliPath, 'dashboard', '--port', '3333'], {
        env: { ...process.env, PHANTOM_MCP_DEBUG: 'true' }
    });

    dashboardProcess.stdout?.on('data', (data) => {
        outputChannel.append(`[Dashboard] ${data}`);
    });

    dashboardProcess.stderr?.on('data', (data) => {
        outputChannel.append(`[Dashboard Error] ${data}`);
    });

    dashboardProcess.on('error', (err) => {
        outputChannel.appendLine(`Failed to start dashboard: ${err.message}`);
        vscode.window.showErrorMessage(`Phantom Dashboard failed to start: ${err.message}`);
    });

    dashboardProcess.on('exit', (code) => {
        outputChannel.appendLine(`Dashboard process exited with code ${code}`);
    });
}

function runCliValues(cliPath: string, args: string[]) {
    outputChannel.appendLine(`Running CLI: ${args.join(' ')}`);
    const proc = spawn('node', [cliPath, ...args]);

    proc.stdout.on('data', d => outputChannel.append(d.toString()));
    proc.stderr.on('data', d => outputChannel.append(d.toString()));

    proc.on('close', code => {
        if (code === 0) {
            vscode.window.showInformationMessage('Phantom Task Completed');
        } else {
            vscode.window.showErrorMessage(`Phantom Task Failed (Exit ${code})`);
        }
    });
}

class PhantomDashboardProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Phantom Dashboard</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: var(--vscode-editor-background); }
                iframe { width: 100%; height: 100%; border: none; }
                .loading { display: flex; justify-content: center; align-items: center; height: 100%; color: var(--vscode-foreground); font-family: var(--vscode-font-family); }
            </style>
        </head>
        <body>
            <iframe src="http://localhost:3333" onload="this.style.visibility='visible'; document.getElementById('loading').style.display='none';"></iframe>
            <div id="loading" class="loading">Loading Phantom Dashboard...</div>
        </body>
        </html>`;
    }
}
