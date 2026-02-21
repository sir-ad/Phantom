import { getAIManager } from '../ai/manager.js';
import * as fs from 'fs/promises';
import { executeBash } from '../tools/bash.js';

export interface CodeContext {
    filepath: string;
    code: string;
    projectRoot: string;
}

export interface ErrorAnalysis {
    root_cause: string;
    error_type: string;
    line_number: number;
    affected_code: string;
    confidence: number;
}

export interface CodeFix {
    old_code: string;
    new_code: string;
    explanation: string;
    test_case: string;
}

export interface VerificationResult {
    success: boolean;
    error?: string;
    output?: string;
}

export interface CodeFixResult {
    success: boolean;
    fix?: CodeFix;
    verification?: VerificationResult;
    error?: string;
}

export class CodeHealer {

    /**
     * Extracts file path from a raw string error (e.g. from tsc or node stderr)
     * and attempts to heal the file.
     */
    async healCodebaseError(stderrOutput: string): Promise<boolean> {
        console.log('\n[Healing] 🩹 Parsing Stderr for broken files...');

        // Find a string resembling a file path (naively assumes mac/linux abstract pathing)
        const match = stderrOutput.match(/(?:\/Users|\/home|C:|src\/)[^\s:]+\.tsx?/i);
        if (!match) {
            console.log('[Healing] Could not locate a valid `.ts` or `.tsx` file path in the stack trace.');
            return false;
        }

        let filepath = match[0];

        // If relative src/ path, resolve from cwd
        if (filepath.startsWith('src/')) {
            filepath = require('path').resolve(process.cwd(), filepath);
        }

        try {
            const fsModule = await import('fs/promises');
            const code = await fsModule.readFile(filepath, 'utf-8');

            const result = await this.healRuntimeError(new Error(stderrOutput), {
                filepath,
                code,
                projectRoot: process.cwd()
            });

            return result.success;
        } catch (err: any) {
            console.log('[Healing] Error parsing file for AST heal:', err.message);
            return false;
        }
    }

    async healRuntimeError(
        error: Error,
        context: CodeContext
    ): Promise<CodeFixResult> {

        console.log('\n[Healing] 🩹 Attempting automatic code fix...');

        try {
            // 1. Analyze error
            const analysis = await this.analyzeError(error, context);

            // 2. Generate fix
            const fix = await this.generateFix(analysis);

            // 3. Create backup
            const backup = await this.createBackup(context.filepath);

            // 4. Apply fix
            const applied = await this.applyFix(fix, context.filepath);

            if (!applied) {
                return { success: false, error: 'Could not match old_code string for replacement.' };
            }

            // 5. Verify fix
            const verification = await this.verifyFix(context);

            if (verification.success) {
                console.log('[Healing] ✓ Code fix applied successfully');
                return { success: true, fix, verification };
            } else {
                // Rollback
                await this.rollback(backup, context.filepath);
                console.log('[Healing] ✗ Code fix failed test phase, rolled back changes.');
                return { success: false, error: verification.error };
            }
        } catch (e: any) {
            console.log('[Healing] ✗ Code fix aborted due to meta-error:', e.message);
            return { success: false, error: e.message };
        }
    }

    private async analyzeError(
        error: Error,
        context: CodeContext
    ): Promise<ErrorAnalysis> {
        const ai = getAIManager();

        const prompt = `
Analyze this runtime error:

Error: ${error.message}
Stack Trace:
${error.stack}

Code (${context.filepath}):
\`\`\`typescript
${context.code}
\`\`\`

Provide analysis in JSON:
{
  "root_cause": "...",
  "error_type": "syntax|type|logic|runtime",
  "line_number": 123,
  "affected_code": "...",
  "confidence": 0.9
}`;

        const response = await ai.complete({
            model: ai.getDefaultProvider()?.getDefaultModel() || 'o3-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            maxTokens: 1000
        });

        return JSON.parse(response.content.replace(/```json|```/g, '').trim());
    }

    private async generateFix(analysis: ErrorAnalysis): Promise<CodeFix> {
        const ai = getAIManager();

        const prompt = `
Generate a fix for this error:

Analysis: ${JSON.stringify(analysis, null, 2)}

Provide fix in JSON:
{
  "old_code": "exact string here",
  "new_code": "replacement code",
  "explanation": "why this fixes the error",
  "test_case": "code to verify fix"
}

IMPORTANT: old_code must match EXACTLY what is in the file (including whitespace) so it can be string-replaced.
`;

        const response = await ai.complete({
            model: ai.getDefaultProvider()?.getDefaultModel() || 'o3-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            maxTokens: 2000
        });

        return JSON.parse(response.content.replace(/```json|```/g, '').trim());
    }

    private async createBackup(filepath: string): Promise<string> {
        const code = await fs.readFile(filepath, 'utf-8');
        return code;
    }

    private async applyFix(fix: CodeFix, filepath: string): Promise<boolean> {
        let code = await fs.readFile(filepath, 'utf-8');
        if (!code.includes(fix.old_code)) {
            console.warn('[Healing] old_code mismatch. Cannot apply string replacement reliably.');
            return false;
        }
        code = code.replace(fix.old_code, fix.new_code);
        await fs.writeFile(filepath, code, 'utf-8');
        return true;
    }

    private async rollback(backup: string, filepath: string) {
        await fs.writeFile(filepath, backup, 'utf-8');
    }

    private async verifyFix(context: CodeContext): Promise<VerificationResult> {
        const testResult = await executeBash('npm run build', {
            cwd: context.projectRoot
        });

        if (!testResult.success) {
            return {
                success: false,
                error: 'Build/Tests failed post-fix',
                output: testResult.stderr
            };
        }

        return { success: true };
    }
}
