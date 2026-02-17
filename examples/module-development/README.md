# Module Development Examples

Learn how to create custom PHANTOM modules to extend functionality.

## Understanding PHANTOM Modules

PHANTOM modules are Node.js packages that follow a specific structure and interface. They can be installed dynamically and provide additional capabilities to the PHANTOM system.

## Module Structure

A typical PHANTOM module has this structure:

```
my-module/
├── package.json
├── src/
│   ├── index.ts
│   ├── commands/
│   │   ├── generate.ts
│   │   └── analyze.ts
│   └── utils/
│       └── helpers.ts
├── tests/
│   ├── generate.test.ts
│   └── analyze.test.ts
├── README.md
└── tsconfig.json
```

## Creating Your First Module

### 1. Initialize the Module

```bash
mkdir phantom-my-module
cd phantom-my-module
npm init -y
```

### 2. Install Dependencies

```bash
npm install typescript @types/node --save-dev
npm install @phantom/core --save
```

### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Create Module Manifest

In your `package.json`, include the PHANTOM module metadata:

```json
{
  "name": "@phantom/my-module",
  "version": "1.0.0",
  "description": "My custom PHANTOM module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["phantom", "module", "pm"],
  "phantom": {
    "module": {
      "name": "my-module",
      "version": "1.0.0",
      "description": "My custom capabilities",
      "quote": "I know my domain.",
      "author": "Your Name",
      "commands": [
        {
          "name": "my-module generate",
          "description": "Generate custom output",
          "usage": "phantom my-module generate <input>"
        }
      ],
      "dependencies": [],
      "size": "1.0 MB"
    }
  }
}
```

### 5. Implement Module Functionality

Create `src/index.ts`:

```typescript
// PHANTOM Module: My Module v1.0.0
// "I know my domain."

import { getAIManager } from '@phantom/core';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface MyModuleOptions {
  input: string;
  outputPath?: string;
  format?: 'json' | 'markdown';
}

export interface MyModuleResult {
  id: string;
  input: string;
  output: string;
  timestamp: string;
}

/**
 * Generate custom output based on input
 */
export async function generateCustomOutput(options: MyModuleOptions): Promise<MyModuleResult> {
  const ai = getAIManager();
  
  const systemPrompt = `You are an expert in my domain. Generate high-quality output based on the input.
  
  Follow these guidelines:
  1. Be precise and actionable
  2. Include technical details when relevant
  3. Format output appropriately
  
  Input: "${options.input}"`;

  try {
    const response = await ai.complete({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: options.input },
      ],
      temperature: 0.3,
      maxTokens: 2000,
    });

    const result: MyModuleResult = {
      id: `my-module-${Date.now()}`,
      input: options.input,
      output: response.content,
      timestamp: new Date().toISOString(),
    };

    // Save to file if output path provided
    if (options.outputPath) {
      saveOutputToFile(result, options.outputPath, options.format);
    }

    return result;
  } catch (error) {
    // Fallback implementation
    return generateFallbackResult(options);
  }
}

/**
 * Save output to file
 */
function saveOutputToFile(result: MyModuleResult, outputPath: string, format: 'json' | 'markdown' = 'json'): void {
  let content: string;
  
  if (format === 'json') {
    content = JSON.stringify(result, null, 2);
  } else {
    content = `# My Module Output

**Input:** ${result.input}
**Generated:** ${result.timestamp}
**ID:** ${result.id}

## Output

${result.output}`;
  }
  
  writeFileSync(outputPath, content, 'utf-8');
  console.log(`Output saved to: ${outputPath}`);
}

/**
 * Generate fallback result when AI fails
 */
function generateFallbackResult(options: MyModuleOptions): MyModuleResult {
  return {
    id: `fallback-${Date.now()}`,
    input: options.input,
    output: `Fallback output for: ${options.input}
    
This is a placeholder result because the AI service was unavailable.`,
    timestamp: new Date().toISOString(),
  };
}

// Module entry point for CLI
export async function runMyModule(args: Record<string, any>): Promise<any> {
  const input = args.input || args._[0];
  if (!input) {
    throw new Error('Input is required');
  }

  const options: MyModuleOptions = {
    input,
    outputPath: args.output,
    format: args.format || 'json',
  };

  const result = await generateCustomOutput(options);
  
  return {
    success: true,
    result,
    filePath: options.outputPath,
  };
}
```

### 6. Add Tests

Create `tests/generate.test.ts`:

```typescript
import { generateCustomOutput } from '../src/index';

jest.mock('@phantom/core');

describe('My Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCustomOutput', () => {
    it('should generate output from input', async () => {
      const mockResponse = 'Generated output content';
      
      // Mock AI manager
      const { getAIManager } = require('@phantom/core');
      (getAIManager as jest.Mock).mockReturnValue({
        complete: jest.fn().mockResolvedValue({
          content: mockResponse,
          model: 'gpt-4-turbo-preview',
          usage: { totalTokens: 100 },
        }),
      });

      const result = await generateCustomOutput({
        input: 'Test input',
      });

      expect(result.input).toBe('Test input');
      expect(result.output).toBe(mockResponse);
      expect(result.id).toMatch(/^my-module-/);
    });

    it('should handle AI errors gracefully', async () => {
      // Mock AI failure
      const { getAIManager } = require('@phantom/core');
      (getAIManager as jest.Mock).mockReturnValue({
        complete: jest.fn().mockRejectedValue(new Error('AI service unavailable')),
      });

      const result = await generateCustomOutput({
        input: 'Test input',
      });

      expect(result.input).toBe('Test input');
      expect(result.output).toContain('Fallback output');
      expect(result.id).toMatch(/^fallback-/);
    });
  });
});
```

### 7. Create Documentation

Create `README.md`:

```markdown
# @phantom/my-module

My custom PHANTOM module that adds specialized capabilities.

## Installation

```bash
phantom install @phantom/my-module
```

## Usage

### Generate Custom Output

```bash
phantom my-module generate "Your input here"
```

Options:
- `--output <path>` - Save output to file
- `--format <json|markdown>` - Output format (default: json)

## Features

- AI-powered generation
- Fallback mechanisms
- File output support
- JSON and Markdown formats

## Requirements

- PHANTOM CLI v1.0+
- Access to configured AI providers

## License

MIT
```

## Module Integration with PHANTOM Core

### 1. Register Module Commands

In PHANTOM's core, modules are registered in `packages/core/src/modules.ts`:

```typescript
case 'my-module':
  const { runMyModule } = await import('@phantom/my-module');
  runtime = {
    name: 'my-module',
    version: '1.0.0',
    execute: async (command: string, args: Record<string, any>) => {
      if (command === 'my-module generate') {
        return await runMyModule(args);
      }
      throw new Error(`Command not implemented: ${command}`);
    },
    close: async () => {},
  };
  break;
```

### 2. Add CLI Commands

In `packages/cli/src/index.tsx`:

```typescript
const myModuleCommand = program.command('my-module').description('My custom module');

myModuleCommand
  .command('generate <input>')
  .description('Generate custom output')
  .option('-o, --output <path>', 'Output file path')
  .option('--format <type>', 'Output format (json|markdown)', 'json')
  .action(async (input: string, options: { output?: string; format?: string }) => {
    try {
      const moduleManager = getModuleManager();
      
      if (!moduleManager.isInstalled('my-module')) {
        console.log('Installing my-module...');
        await moduleManager.install('my-module');
      }
      
      const result = await moduleManager.executeCommand('my-module', 'my-module generate', {
        input,
        output: options.output,
        format: options.format,
        _: ['generate', input],
      });

      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error.message);
    }
  });
```

## Best Practices

### 1. Error Handling

Always implement robust error handling with fallback mechanisms:

```typescript
try {
  const result = await aiCall();
  return processResult(result);
} catch (error) {
  console.warn('AI service failed, using fallback:', error.message);
  return fallbackImplementation();
}
```

### 2. Configuration Management

Respect user configuration and environment:

```typescript
import { getConfig } from '@phantom/core';

const config = getConfig();
const userPreference = config.get().theme;
```

### 3. File Operations

Handle file operations safely:

```typescript
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

function ensureDirectory(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
```

### 4. Type Safety

Use TypeScript interfaces for all public APIs:

```typescript
export interface ModuleOptions {
  input: string;
  timeout?: number;
  retries?: number;
}

export interface ModuleResult {
  success: boolean;
  data?: any;
  error?: string;
}
```

## Testing Strategies

### Unit Tests

Test individual functions in isolation:

```typescript
describe('myFunction', () => {
  it('should handle valid input', () => {
    const result = myFunction('valid input');
    expect(result).toBeDefined();
  });

  it('should handle edge cases', () => {
    expect(() => myFunction('')).toThrow();
  });
});
```

### Integration Tests

Test module integration with PHANTOM core:

```typescript
import { getModuleManager } from '@phantom/core';

describe('Module Integration', () => {
  it('should register and execute commands', async () => {
    const manager = getModuleManager();
    await manager.install('my-module');
    
    const result = await manager.executeCommand('my-module', 'my-module generate', {
      input: 'test',
    });
    
    expect(result.success).toBe(true);
  });
});
```

## Publishing Your Module

### 1. Build and Test

```bash
npm run build
npm test
npm run prepublishOnly
```

### 2. Publish to npm

```bash
npm login
npm publish --access public
```

### 3. Submit to Community Repository

1. Fork the [phantom-modules](https://github.com/PhantomPM/phantom-modules) repository
2. Add your module to the registry
3. Submit a Pull Request

## Advanced Features

### 1. Context Awareness

Access PHANTOM's context engine:

```typescript
import { getContextEngine } from '@phantom/core';

const context = getContextEngine();
const projectFiles = context.getEntries();
```

### 2. Multiple AI Providers

Support different AI providers:

```typescript
import { getAIManager } from '@phantom/core';

const ai = getAIManager();
const openaiResult = await ai.complete({ model: 'gpt-4', ... });
const anthropicResult = await ai.complete({ model: 'claude-3', ... });
```

### 3. Streaming Responses

Implement streaming for long-running operations:

```typescript
async function* streamResults(input: string) {
  const ai = getAIManager();
  const stream = await ai.stream({ model: 'gpt-4', prompt: input });
  
  for await (const chunk of stream) {
    yield chunk;
  }
}
```

## Community Guidelines

When creating community modules:

1. **Follow naming conventions**: `@phantom/module-name` or `phantom-module-name`
2. **Include comprehensive documentation**: README, examples, API docs
3. **Implement proper error handling**: Graceful degradation when services are unavailable
4. **Write tests**: Unit and integration tests for core functionality
5. **Respect user privacy**: Don't collect or transmit user data without explicit consent
6. **Maintain compatibility**: Follow semantic versioning and deprecation policies

## Getting Help

For module development assistance:

1. Check the [Module Development Guide](../../docs/module-development.md)
2. Review existing modules in the [phantom-modules](https://github.com/PhantomPM/phantom-modules) repository
3. Join the [PHANTOM Discord](https://discord.gg/phantom) #modules channel
4. Create issues in the main repository for core integration questions

## Next Steps

After creating your module:

1. Test it thoroughly with different inputs
2. Document all features and edge cases
3. Add comprehensive tests
4. Publish to npm
5. Submit to the community registry
6. Share with the PHANTOM community