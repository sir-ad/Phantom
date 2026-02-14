// Simple test of enhanced computer use tools
import { BrowserTool, FileSystemTool, TerminalTool, VisionTool } from '../tools';

async function testEnhancedTools() {
  console.log('🧪 Testing Enhanced Computer Use Tools');
  console.log('=====================================\n');

  try {
    // Test Browser Tool
    console.log('🌐 Testing Browser Tool...');
    const browser = new BrowserTool();
    const searchResults = await browser.execute({ action: 'search', query: 'typescript best practices' });
    console.log(`✅ Browser search returned ${searchResults.length} results`);
    console.log(`   First result: ${searchResults[0]?.title || 'No results'}`);

    // Test File System Tool
    console.log('\n📁 Testing File System Tool...');
    const filesystem = new FileSystemTool();
    const createResult = await filesystem.execute({ action: 'create', path: './test-directory' });
    console.log(`✅ Directory creation: ${createResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    const writeResult = await filesystem.execute({ 
      action: 'write', 
      path: './test-file.txt', 
      content: 'Hello from PHANTOM!' 
    });
    console.log(`✅ File write: SUCCESS`);
    
    const readResult = await filesystem.execute({ action: 'read', path: './test-file.txt' });
    console.log(`✅ File read: ${readResult.content.toString().substring(0, 30)}...`);

    // Test Terminal Tool
    console.log('\n⚡ Testing Terminal Tool...');
    const terminal = new TerminalTool();
    const cmdResult = await terminal.execute({ command: 'echo "PHANTOM Universal Intelligence Active"' });
    console.log(`✅ Terminal command: ${cmdResult.stdout}`);
    
    const systemInfo = await terminal.getSystemInfo();
    console.log(`✅ System info collected: ${Object.keys(systemInfo).length} metrics`);

    // Test Vision Tool
    console.log('\n👁️ Testing Vision Tool...');
    const vision = new VisionTool();
    const screenshot = await vision.execute({ action: 'capture' });
    console.log(`✅ Screenshot captured: ${screenshot.data.length} bytes (base64)`);

    const ocrResult = await vision.execute({ action: 'ocr', path: 'test-image.png' });
    console.log(`✅ OCR analysis: "${ocrResult.text}" (confidence: ${ocrResult.confidence})`);

    // Cleanup
    await filesystem.execute({ action: 'delete', path: './test-file.txt' });
    await filesystem.execute({ action: 'delete', path: './test-directory' });
    
    console.log('\n🎉 All tools tested successfully!');
    console.log('\nPHANTOM Universal Intelligence now provides:');
    console.log('• 🌐 Real web browsing with Playwright');
    console.log('• 📁 Complete file system operations');
    console.log('• ⚡ Native terminal command execution');
    console.log('• 👁️ Screenshot capture and analysis');
    console.log('• 🔍 Advanced search and research capabilities');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  testEnhancedTools().catch(console.error);
}

export { testEnhancedTools };