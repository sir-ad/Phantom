#!/usr/bin/env node

// Test Story Writer module

import { StoryWriterModule } from '../packages/modules/dist/story-writer.js';

async function testStoryWriter() {
  console.log('Testing PHANTOM Story Writer Module...\n');
  
  // Create a sample PRD for testing
  const samplePRD = `# Sample Product Requirements Document

## Overview
A modern authentication system with social login, two-factor authentication, and passwordless login options.

## Features

### 1. Social Login
Users should be able to log in using Google, GitHub, and Apple accounts.

### 2. Two-Factor Authentication
Add an extra layer of security with TOTP-based 2FA using authenticator apps.

### 3. Passwordless Login
Allow users to log in via email magic links or SMS codes.

### 4. User Profile Management
Users can update their profile information, change passwords, and manage connected accounts.

### 5. Admin Dashboard
Administrators can view user statistics, manage roles, and configure authentication settings.

## Technical Requirements
- OAuth 2.0 and OpenID Connect compliance
- JWT token-based authentication
- Secure session management
- Rate limiting and security headers
- Audit logging`;

  // Write sample PRD to file
  const { writeFileSync, unlinkSync } = await import('fs');
  const prdPath = './test-prd.md';
  writeFileSync(prdPath, samplePRD);
  
  try {
    const storyWriter = new StoryWriterModule({
      outputDir: './.phantom/output',
      includeEpics: true,
      includeTechnicalNotes: true,
    });
    
    console.log('Generating user stories from PRD...\n');
    const sprints = await storyWriter.generateStoriesFromPRD(prdPath, 2);
    
    console.log(`✅ Generated ${sprints.length} sprints:\n`);
    
    sprints.forEach((sprint: any, index: number) => {
      console.log(`Sprint ${index + 1}: ${sprint.name}`);
      console.log(`  Dates: ${sprint.startDate} to ${sprint.endDate}`);
      console.log(`  Goal: ${sprint.goal}`);
      console.log(`  Stories: ${sprint.stories.length}`);
      
      const totalPoints = sprint.stories.reduce((sum: number, story: any) => sum + story.storyPoints, 0);
      console.log(`  Total Points: ${totalPoints}/${sprint.capacity}`);
      
      console.log('\n  Top Stories:');
      sprint.stories.slice(0, 3).forEach((story: any, i: number) => {
        console.log(`    ${i + 1}. ${story.title}`);
        console.log(`       Priority: ${story.priority}, Points: ${story.storyPoints}`);
        console.log(`       Labels: ${story.labels.join(', ')}`);
      });
      
      console.log('');
    });
    
    console.log('🎉 Story Writer test complete!');
    console.log('Output saved to ./.phantom/output/');
    
  } catch (error) {
    console.error('❌ Story Writer test failed:', error);
  } finally {
    // Clean up test file
    try {
      unlinkSync(prdPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

testStoryWriter().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
