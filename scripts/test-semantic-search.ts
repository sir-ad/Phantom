#!/usr/bin/env node

// Test semantic search functionality

import { getContextEngine } from '../packages/core/dist/context.js';

async function testSemanticSearch() {
  console.log('Testing PHANTOM Semantic Search...\n');
  
  const context = getContextEngine();
  
  // Add current directory to context
  console.log('Indexing current directory...');
  const stats = await context.addPath(process.cwd());
  console.log(`Indexed ${stats.totalFiles} files`);
  console.log(`By type:`, stats.byType);
  console.log(`Health score: ${stats.healthScore}\n`);
  
  // Get embedding stats (if available)
  try {
    const embeddingStats = (context as any).getEmbeddingStats();
    if (embeddingStats) {
      console.log('Embedding Engine Stats:');
      console.log(`Total embeddings: ${embeddingStats.totalEmbeddings}`);
      console.log(`By type:`, embeddingStats.byType);
      console.log();
    }
  } catch {
    // Embedding engine not available
  }
  
  // Test searches
  const testQueries = [
    'authentication system',
    'database schema',
    'API endpoints',
    'React components',
    'TypeScript types',
    'configuration files',
  ];
  
  for (const query of testQueries) {
    console.log(`Search: "${query}"`);
    const results = await context.search(query);
    
    console.log(`Found ${results.length} results:`);
    results.slice(0, 3).forEach((entry, i) => {
      console.log(`  ${i + 1}. ${entry.relativePath} (${entry.type})`);
      if (entry.metadata.language) {
        console.log(`     Language: ${entry.metadata.language}`);
      }
      if (entry.metadata.lines) {
        console.log(`     Lines: ${entry.metadata.lines}`);
      }
    });
    
    if (results.length > 3) {
      console.log(`  ... and ${results.length - 3} more`);
    }
    console.log();
  }
}

testSemanticSearch().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});