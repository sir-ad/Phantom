import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const ROOT_DIR = path.resolve('./packages');

// Define the exact regex replacements
const REPLACEMENTS = [
    { from: /gpt-4-turbo-preview/g, to: 'o3-mini' },
    { from: /gpt-4-vision-preview/g, to: 'gpt-4.5-preview' },
    { from: /claude-3-opus-20240229/g, to: 'claude-4.6-opus' },
    { from: /claude-3-5-sonnet-20241022/g, to: 'claude-3-7-sonnet-20250219' },
    { from: /gemini-2\.0-flash/g, to: 'gemini-3.1-pro' },
    { from: /gemini-2\.5-pro/g, to: 'gemini-3.1-pro' },
    { from: /gemini-1\.5-pro/g, to: 'gemini-3.1-pro' }
];

console.log('Initiating Frontier Model Sweep...');

// Find all ts/tsx files in packages, ignoring dist, node_modules, and vscode/resources
const files = globSync('**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/node_modules/**', '**/dist/**', '**/vscode/resources/**']
});

let modifiedFiles = 0;

for (const relPath of files) {
    const fullPath = path.join(ROOT_DIR, relPath);
    let original = fs.readFileSync(fullPath, 'utf8');
    let content = original;

    for (const rule of REPLACEMENTS) {
        content = content.replace(rule.from, rule.to);
    }

    if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated models in: ${relPath}`);
        modifiedFiles++;
    }
}

console.log(`Sweep complete. Upgraded models in ${modifiedFiles} files.`);
