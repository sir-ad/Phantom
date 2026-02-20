// ╔══════════════════════════════════════════════════════════════════╗
// ║  PHANTOM CORE — "There is no spoon."                            ║
// ║                                                                  ║
// ║  The beating heart of Phantom. Everything flows through here:    ║
// ║  context engine, AI manager, module system, agent discovery,     ║
// ║  and the runtime that ties it all together.                      ║
// ║                                                                  ║
// ║  This is where LLMs become Product Managers.                     ║
// ╚══════════════════════════════════════════════════════════════════╝
export * from './brand.js';
export * from './constants.js';
export * from './config.js';
export * from './modules.js'; // Export the module system
export * from './ai/manager.js';
export * from './context.js';
export * from './prompts.js';

export * from './prd.js';
export * from './integrations.js';
export * from './runtime.js';
export * from './discovery/index.js';
export * from './agent-discovery.js';
export * from './nudge-engine.js';
export * from './ai/manager.js';
export * from './auto-register.js';
export * from './agents/index.js';

export * from './agents/BaseAgent.js';
export * from './agents/Swarm.js';
export * from './agent-registry.js';
export * from './agents/tools/memory.js';
export * from './skills/registry.js';
export * from './skills/standard.js';
export * from './planning/index.js'; // Check if getSwarm is here too? Grep said agents/Swarm.ts
export * from './planning/swarm-routines.js';
export * from './os-gateway.js';
export * from './mcp/client.js';
export * from './voice/wispr.js';
