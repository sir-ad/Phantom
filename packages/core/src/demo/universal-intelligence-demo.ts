// Demo of PHANTOM Universal Intelligence Capabilities

import { ComputerUseSystem } from '../tools';
import { PlanningEngine } from '../planning';

async function demoUniversalIntelligence() {
  console.log('🎭 PHANTOM Universal Intelligence Demo');
  console.log('=====================================\n');

  // Initialize systems
  const computerUse = new ComputerUseSystem();
  const planner = new PlanningEngine();

  // Example 1: Simple task execution
  console.log('📋 Example 1: Simple Task Execution');
  console.log('-----------------------------------');
  
  try {
    const result = await computerUse.executeTask(
      'Create a user authentication system', 
      { projectType: 'nodejs', framework: 'express' }
    );
    
    console.log('✅ Task executed successfully:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Task execution failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 2: Advanced planning
  console.log('📋 Example 2: Advanced Task Planning');
  console.log('-----------------------------------');
  
  try {
    const plan = await planner.planTask(
      'Build a complete e-commerce website with React and Node.js',
      {
        projectType: 'fullstack',
        framework: 'react',
        technologies: ['nodejs', 'mongodb', 'stripe']
      }
    );
    
    console.log('✅ Execution plan generated:');
    console.log(`Intent: ${plan.intent}`);
    console.log(`Subtasks: ${plan.subtasks.length}`);
    console.log(`Tools required: ${plan.tools.join(', ')}`);
    console.log(`Estimated time: ${plan.estimatedTime}ms`);
    console.log(`Estimated cost: $${plan.estimatedCost.toFixed(4)}`);
    
    // Execute the plan
    console.log('\n🚀 Executing plan...');
    const executionResult = await planner.executePlan(plan);
    
    console.log('\n✅ Plan execution completed:');
    console.log(`Success: ${executionResult.success}`);
    console.log(`Execution time: ${executionResult.executionTime}ms`);
    console.log(`Results: ${executionResult.results.length} steps completed`);
    
  } catch (error) {
    console.log('❌ Planning failed:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Example 3: Individual tool demonstration
  console.log('📋 Example 3: Individual Tool Usage');
  console.log('-----------------------------------');
  
  try {
    // Browser tool
    console.log('🌐 Browser Tool:');
    const browser = new (await import('../tools')).BrowserTool();
    const searchResults = await browser.execute({ action: 'search', query: 'best react practices 2024' });
    console.log(`  Search returned ${searchResults.length} results`);
    
    // File system tool
    console.log('\n📁 File System Tool:');
    const filesystem = new (await import('../tools')).FileSystemTool();
    await filesystem.execute({ action: 'create', path: './demo-project' });
    console.log('  Directory created successfully');
    
    // Terminal tool
    console.log('\n⚡ Terminal Tool:');
    const terminal = new (await import('../tools')).TerminalTool();
    const cmdResult = await terminal.execute({ command: 'echo "Hello PHANTOM"' });
    console.log(`  Command output: ${cmdResult.stdout}`);
    
    // Vision tool
    console.log('\n👁️ Vision Tool:');
    const vision = new (await import('../tools')).VisionTool();
    const screenshot = await vision.execute({ action: 'capture' });
    console.log(`  Screenshot captured (${screenshot.length} bytes)`);
    
  } catch (error) {
    console.log('❌ Tool demonstration failed:', error);
  }

  console.log('\n🎉 Demo completed!');
  console.log('\nPHANTOM Universal Intelligence provides:');
  console.log('• 🌐 Web browsing and research capabilities');
  console.log('• 📁 Complete file system control');
  console.log('• ⚡ Terminal/command execution');
  console.log('• 👁️ Screenshot and vision analysis');
  console.log('• 🧠 Autonomous task planning and execution');
  console.log('• 🔗 Multi-tool orchestration');
}

// Run the demo
if (require.main === module) {
  demoUniversalIntelligence().catch(console.error);
}

export { demoUniversalIntelligence };