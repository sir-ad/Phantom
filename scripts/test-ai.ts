#!/usr/bin/env node
// Test script for PHANTOM AI integration
import { getAIManager } from '../packages/core/dist/index.js';

async function testAI() {
  console.log('Testing PHANTOM AI Integration...\n');
  
  const ai = getAIManager();
  
  // Test health check
  console.log('1. Checking provider health...');
  const health = await ai.getHealth();
  console.log('Health status:');
  for (const [provider, status] of Object.entries(health)) {
    console.log(`  ${provider}: ${status.available ? '✅ Available' : '❌ Unavailable'} (${status.latency}ms)`);
    if (status.error) {
      console.log(`    Error: ${status.error}`);
    }
  }
  
  if (!Object.values(health).some(status => status.available)) {
    console.log('\n❌ No AI providers available. Please set up API keys:');
    console.log('   - Set OPENAI_API_KEY in environment');
    console.log('   - Or run Ollama locally (ollama run llama3.1:70b)');
    console.log('   - Or set ANTHROPIC_API_KEY');
    return;
  }
  
  // Test simple completion
  console.log('\n2. Testing simple completion...');
  try {
    const response = await ai.complete({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is PHANTOM?' },
      ],
      temperature: 0.7,
      maxTokens: 100,
    });
    
    console.log(`✅ Success! Model: ${response.model}`);
    console.log(`Response: ${response.content.slice(0, 100)}...`);
    console.log(`Latency: ${response.latency}ms`);
    if (response.usage) {
      console.log(`Tokens: ${response.usage.totalTokens}`);
    }
  } catch (error) {
    console.log(`❌ Completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test agent swarm (if OpenAI/Anthropic available)
  console.log('\n3. Testing agent swarm simulation...');
  const availableProvider = Object.entries(health).find(([_, status]) => status.available)?.[0];
  
  if (availableProvider && ['openai', 'anthropic'].includes(availableProvider)) {
    try {
      const context = {
        contextFiles: 42,
        contextHealth: 85,
        connectedIntegrations: 2,
        totalIntegrations: 5,
        tokenCount: 7,
        healthScore: 85,
      };
      
      const messages: any[] = [
        {
          role: 'system',
          content: `You are a Product Strategy Expert. Analyze from a market positioning and competitive landscape perspective.

Project Context:
- Indexed files: ${context.contextFiles}
- Context health: ${context.contextHealth}%
- Connected integrations: ${context.connectedIntegrations}/${context.totalIntegrations}

Focus on:
1. Market positioning and differentiation
2. Competitive advantages/weaknesses
3. Strategic alignment with company vision
4. Long-term product strategy
5. Go-to-market considerations

Provide a clear verdict (yes/no/maybe/needs-data) with confidence score (0-100) and reasoning.`,
        },
        {
          role: 'user',
          content: 'Question: Should we add dark mode to our application?\n\nRelevant Context:\nProject has 42 files with 85% health score.\n\nPlease provide your analysis with:\n1. Verdict: yes/no/maybe/needs-data\n2. Confidence: 0-100\n3. Reasoning: Your detailed analysis\n\nYour response should start with "Verdict:" followed by your verdict, then "Confidence:" followed by a number, then your reasoning.',
        },
      ];
      
      const response = await ai.complete({
        model: availableProvider === 'openai' ? 'gpt-4-turbo-preview' : 'claude-3-5-sonnet-20241022',
        messages,
        temperature: 0.3,
        maxTokens: 500,
      });
      
      console.log(`✅ Agent response received:`);
      console.log(response.content);
      console.log(`\nModel: ${response.model}, Latency: ${response.latency}ms`);
    } catch (error) {
      console.log(`❌ Agent test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.log('Skipping agent test - requires OpenAI or Anthropic.');
  }
  
  // Show metrics
  console.log('\n4. Current metrics:');
  const metrics = ai.getMetrics();
  if (metrics.length === 0) {
    console.log('No metrics yet.');
  } else {
    for (const metric of metrics) {
      console.log(`${metric.provider}:`);
      console.log(`  Requests: ${metric.totalRequests} (${metric.successfulRequests} ✅ ${metric.failedRequests} ❌)`);
      console.log(`  Avg Latency: ${metric.averageLatency.toFixed(1)}ms`);
      console.log(`  Total Cost: $${metric.totalCost.toFixed(4)}`);
      console.log(`  Last Used: ${metric.lastUsed.toLocaleTimeString()}`);
    }
  }
  
  console.log('\n✅ AI Integration Test Complete');
  console.log('\nNext steps:');
  console.log('1. Set up your API keys in .env file');
  console.log('2. Run: phantom context add ./your-project');
  console.log('3. Run: phantom swarm "Should we add feature X?"');
  console.log('4. Run: phantom prd create "Feature Name"');
}

testAI().catch(console.error);