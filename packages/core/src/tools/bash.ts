import { exec } from 'child_process';
import { promisify } from 'util';
import type { AgentTool } from '../skills/registry.js';

const execAsync = promisify(exec);

export interface BashResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    command: string;
    error?: string;
}

export async function executeBash(
    command: string,
    options: {
        cwd?: string;
        timeout?: number;
        env?: Record<string, string>;
    } = {}
): Promise<BashResult> {
    const {
        cwd = process.cwd(),
        timeout = 30000,
        env = { ...process.env, ...options.env }
    } = options;

    try {
        const { stdout, stderr } = await execAsync(command, {
            cwd,
            timeout,
            env,
            shell: '/bin/bash'
        });

        return {
            success: true,
            stdout,
            stderr,
            exitCode: 0,
            command
        };
    } catch (error: any) {
        return {
            success: false,
            stdout: error.stdout || '',
            stderr: error.stderr || error.message,
            exitCode: error.code || 1,
            command,
            error: error.message
        };
    }
}

export const bashTool: AgentTool = {
    name: 'bash',
    description: 'Execute bash command. Returns stdout, stderr, exit code. Use for all terminal operations, git, npm, file manipulation lacking native tools.',
    parameters: {
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'Bash command to execute'
            },
            timeout: {
                type: 'number',
                description: 'Timeout in milliseconds (default: 30000)'
            }
        },
        required: ['command']
    },
    handler: async (args: { command: string, timeout?: number }) => {
        return await executeBash(args.command, { timeout: args.timeout });
    }
};
