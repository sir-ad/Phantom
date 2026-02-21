import { AgentTool } from '../skills/registry.js';
import * as chokidar from 'chokidar';

export type ToolResultType = 'success' | 'validation_error' | 'execution_error';

export interface ToolResult {
    type: ToolResultType;
    tool: string;
    result?: any;
    error?: string;
    expected_schema?: any;
    received?: any;
    suggestion?: string;
    stack?: string;
    available_tools?: string[];
}

export interface ToolCall {
    name: string;
    args: any;
}

export async function executeToolCall(
    toolCall: ToolCall,
    availableTools: AgentTool[]
): Promise<ToolResult> {
    const tool = availableTools.find(t => t.name === toolCall.name);

    // 1. Validate tool exists
    if (!tool) {
        return {
            type: 'validation_error',
            tool: toolCall.name,
            error: `Tool '${toolCall.name}' does not exist`,
            available_tools: availableTools.map(t => t.name),
            suggestion: 'Check the tool name output exactly, it might be a typo.'
        };
    }

    // 2. Mock Parameter Validation (In production, use z.parse())
    // This verifies that required fields are present if defined in simple schemas
    if (tool.parameters?.required && Array.isArray(tool.parameters.required)) {
        const missingKeys = tool.parameters.required.filter((k: string) => toolCall.args[k] === undefined);
        if (missingKeys.length > 0) {
            return {
                type: 'validation_error',
                tool: toolCall.name,
                error: `Missing required parameters: ${missingKeys.join(', ')}`,
                expected_schema: tool.parameters,
                received: toolCall.args,
                suggestion: `Include the missing keys inside your args payload.`
            };
        }
    }

    // 3. Execute (wrapped in try/catch)
    try {
        const result = await tool.handler(toolCall.args);
        return {
            type: 'success',
            tool: toolCall.name,
            result
        };
    } catch (error: any) {
        return {
            type: 'execution_error',
            tool: toolCall.name,
            error: error.message,
            stack: error.stack,
            suggestion: inferRecoveryStrategy(error)
        };
    }
}

function inferRecoveryStrategy(error: Error): string {
    const errorMsg = error.message.toLowerCase();

    if (errorMsg.includes('enoent')) {
        return 'File not found. Check path or use bash tool to create file first or check directory contents.';
    }
    if (errorMsg.includes('eacces')) {
        return 'Permission denied. Try: chmod +x <file> or run with sudo via bash tool.';
    }
    if (errorMsg.includes('command not found')) {
        return 'Command not installed. Try using the bash tool to npm install it globally.';
    }
    if (errorMsg.includes('cannot find module')) {
        return 'Module missing. Use bash tool to run: npm install in the correct directory.';
    }

    return 'Retry with corrected parameters. Consider using the bash tool to gather more context if stuck.';
}
