#!/usr/bin/env node

// Test GitHub OAuth + API integration

import { GitHubIntegration } from '../packages/integrations/dist/github.js';

async function testGitHubIntegration() {
  console.log('Testing PHANTOM GitHub Integration...\n');
  
  const integration = new GitHubIntegration();
  
  try {
    console.log('1. Starting OAuth flow...');
    console.log('   This will open a browser window for GitHub authentication.');
    console.log('   Note: Requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.\n');
    
    const token = await integration.authenticate();
    console.log(`✅ OAuth successful! Token: ${token.slice(0, 20)}...\n`);
    
    console.log('2. Fetching user info...');
    const user = await integration.getUser();
    console.log(`✅ Logged in as: ${user.name || user.login}`);
    console.log(`   Email: ${user.email || 'Not provided'}`);
    console.log(`   Avatar: ${user.avatar_url}\n`);
    
    console.log('3. Fetching repositories...');
    const repos = await integration.getRepos();
    console.log(`✅ Found ${repos.length} repositories:`);
    repos.slice(0, 5).forEach((repo: any, i: number) => {
      console.log(`   ${i + 1}. ${repo.full_name} - ${repo.description || 'No description'}`);
    });
    if (repos.length > 5) {
      console.log(`   ... and ${repos.length - 5} more\n`);
    }
    
    console.log('4. Testing issue creation...');
    console.log('   This would create a test issue in the first repo.');
    console.log('   Commented out to avoid spam.\n');
    /*
    if (repos.length > 0) {
      const testIssue = await integration.createIssue(
        repos[0].full_name,
        'PHANTOM Integration Test Issue',
        'This issue was created automatically by PHANTOM GitHub integration test.',
        ['phantom', 'test', 'automation']
      );
      console.log(`✅ Issue created: #${testIssue.number} - ${testIssue.title}`);
    }
    */
    
    console.log('5. Testing disconnect...');
    integration.disconnect();
    console.log('✅ Disconnected successfully.\n');
    
    console.log('🎉 GitHub integration test complete!');
    
  } catch (error) {
    console.error('❌ GitHub integration test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('GITHUB_CLIENT_ID') || error.message.includes('client_id')) {
        console.log('\n🔧 Setup instructions:');
        console.log('1. Create a GitHub OAuth App: https://github.com/settings/applications/new');
        console.log('2. Set Authorization callback URL to: http://localhost:3000/auth/github/callback');
        console.log('3. Set environment variables:');
        console.log('   export GITHUB_CLIENT_ID="your_client_id"');
        console.log('   export GITHUB_CLIENT_SECRET="your_client_secret"');
        console.log('\n💡 For testing without OAuth, you can use a personal access token:');
        console.log('   export GITHUB_PAT="your_personal_access_token"');
        console.log('   (Set as accessToken in GitHubIntegration constructor)');
      }
    }
  }
}

testGitHubIntegration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});