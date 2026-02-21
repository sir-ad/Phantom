import { getExternalLinkManager } from '@phantom-pm/core';
import { FigmaLinkAdapter } from './figma.js';

/**
 * Register all built-in external link adapters.
 */
export function registerAllAdapters() {
    const manager = getExternalLinkManager();

    // Register Figma
    manager.registerAdapter(new FigmaLinkAdapter());

    // TODO: Add more adapters here (Notion, Jira, etc.)
    console.log('[Modules] Registered External Link Adapters');
}
