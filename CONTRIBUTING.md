# Contributing to PHANTOM

Thank you for your interest in contributing to PHANTOM! ✨

PHANTOM is an open-source PM operating system that gives developers and AI agents product management superpowers. We welcome contributions from the community to help make PHANTOM even better.

## Ways to Contribute

There are many ways you can contribute to PHANTOM:

- **Report bugs** - Help us identify and fix issues
- **Suggest features** - Propose new capabilities and improvements
- **Write modules** - Create new PM superpowers for the community
- **Improve documentation** - Make our docs clearer and more comprehensive
- **Submit pull requests** - Fix bugs, add features, improve code quality
- **Test releases** - Help us catch issues before they reach users
- **Spread the word** - Share PHANTOM with your network

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/phantom.git
   cd phantom
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

### Project Structure

PHANTOM follows a monorepo structure:

```
packages/
  cli/           # Command-line interface
  core/          # Core functionality (context, swarm, AI)
  mcp-server/    # MCP protocol implementation
  tui/           # Terminal user interface
  modules/       # Built-in modules
  integrations/  # IDE integration packages
```

### Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Add tests if applicable
4. Ensure all tests pass:
   ```bash
   npm test
   ```

5. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new feature"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request

## Code Style and Quality

### TypeScript

PHANTOM is written in TypeScript with strict type checking enabled. Please ensure your code:

- Uses explicit type annotations
- Follows existing patterns in the codebase
- Passes type checking (`npm run typecheck`)
- Has no linting errors (`npm run lint`)

### Testing

We maintain high test coverage. When adding new functionality:

- Write unit tests for new functions
- Include integration tests for major features
- Ensure existing tests continue to pass
- Aim for 80%+ test coverage

Run tests with:
```bash
npm test
```

### Documentation

- Update README.md if you change functionality
- Add JSDoc comments for public APIs
- Update relevant documentation in the `docs/` directory
- Include examples for new features

## Pull Request Process

### Before Submitting

1. Ensure your code follows the style guide
2. Run all tests and ensure they pass
3. Update documentation as needed
4. Squash commits if necessary
5. Write a clear, descriptive PR title

### PR Requirements

- Clear description of changes
- Related issue numbers (if applicable)
- Test results
- Documentation updates
- Passing CI checks

### Review Process

1. Core maintainers will review your PR
2. Feedback will be provided within 48 hours
3. Address feedback promptly
4. Once approved, your PR will be merged

## Module Development

PHANTOM's power comes from its modular architecture. You can create custom modules that extend PHANTOM's capabilities.

### Creating a Module

1. Follow the module template in the [phantom-modules](https://github.com/PhantomPM/phantom-modules) repository
2. Implement the required interfaces
3. Include comprehensive tests
4. Document your module thoroughly
5. Publish to npm or host privately

### Submitting Community Modules

To submit a module to the community repository:

1. Fork the [phantom-modules](https://github.com/PhantomPM/phantom-modules) repository
2. Add your module following the established structure
3. Include README with usage instructions
4. Submit a Pull Request

## Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots or logs if applicable

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) when creating issues.

## Suggesting Features

We love hearing ideas for new features! When suggesting features, please include:

- Clear description of the proposed feature
- Use cases and benefits
- Potential implementation approaches
- Any alternatives considered

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) when creating issues.

## Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

### Communication

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the project's goals

### Getting Help

If you need help:

1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/PhantomPM/phantom/issues)
3. Join our [Discord community](https://discord.gg/phantom)
4. Create a new issue with your question

## Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes
- Community spotlight (periodic)
- Project documentation

## License

By contributing to PHANTOM, you agree that your contributions will be licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

Thank you for contributing to PHANTOM! Together, we're building the future of product management. 🎭🚀
