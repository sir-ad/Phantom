import { executeBash } from '../tools/bash.js';

export interface HealResult {
    success: boolean;
    action?: string;
    package?: string;
    error?: string;
}

export class InstallationHealer {

    async healInstallationError(error: Error): Promise<HealResult> {
        const errorMsg = error.message.toLowerCase();

        // 1. Missing package
        if (errorMsg.includes('cannot find module')) {
            return await this.fixMissingModule(error);
        }

        // 2. Version conflicts
        if (errorMsg.includes('peer dep') || errorMsg.includes('conflict')) {
            return await this.fixVersionConflict(error);
        }

        // 3. Network timeout
        if (errorMsg.includes('timeout') || errorMsg.includes('enotfound')) {
            return await this.fixNetworkIssue(error);
        }

        return { success: false, error: 'Unknown installation error' };
    }

    private async fixMissingModule(error: Error): Promise<HealResult> {
        const match = error.message.match(/Cannot find module '(.+?)'/);
        if (!match) return { success: false };

        const moduleName = match[1];
        console.log(`\n[Healing] Auto-installing missing module: ${moduleName}`);

        let result = await executeBash(`npm install ${moduleName}`);

        if (!result.success) {
            console.log(`[Healing] Retrying with --legacy-peer-deps...`);
            result = await executeBash(`npm install ${moduleName} --legacy-peer-deps`);
        }

        if (result.success) {
            console.log(`[Healing] ✓ Successfully installed ${moduleName}`);
            return { success: true, action: 'installed', package: moduleName };
        }

        return { success: false, error: result.stderr };
    }

    private async fixVersionConflict(error: Error): Promise<HealResult> {
        console.log(`\n[Healing] Resolving version conflicts...`);
        let result = await executeBash('npm install --legacy-peer-deps');

        if (result.success) {
            console.log(`[Healing] ✓ Resolved with --legacy-peer-deps`);
            return { success: true, action: 'legacy-peer-deps' };
        }

        return { success: false, error: 'Could not resolve version conflicts' };
    }

    private async fixNetworkIssue(error: Error): Promise<HealResult> {
        console.log(`\n[Healing] Handling network issue... retrying with increased timeout...`);
        let result = await executeBash('npm install --fetch-timeout=60000');

        if (result.success) {
            console.log(`[Healing] ✓ Network install succeeded.`);
            return { success: true, action: 'retry-with-timeout' };
        }

        return { success: false, error: 'Network issue persists' };
    }
}
