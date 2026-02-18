import { DocumentationEngine } from '../src/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of the repo
const rootDir = path.resolve(__dirname, '../../..');
const docsDir = path.join(rootDir, 'docs');
const outputDir = path.join(rootDir, 'docs-dist'); // or docs-site/build if replacing? 
// User wants to remove docs-site. Let's output to `docs-dist` for now.

console.log(`Building docs from ${docsDir} to ${outputDir}...`);

// Ensure docs dir exists (it might not yet, we need to migrate content first)
if (!fs.existsSync(docsDir)) {
    console.error(`Error: Docs directory ${docsDir} does not exist.`);
    process.exit(1);
}

const engine = new DocumentationEngine({
    inputDir: docsDir,
    outputDir: outputDir,
    title: 'Phantom Documentation'
});

await engine.build();
