# Security Policy

Owner: PhantomPM Security Team  
Last Updated: 2026-02-15  
Status: Beta

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in PHANTOM, please follow these steps:

1. **Do NOT create a public issue** for security vulnerabilities
2. Email security@phantom.pm with the subject line "PHANTOM Security Vulnerability"
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (if applicable)

### Response Time

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix Timeline**: Based on severity (critical issues prioritized)
- **Disclosure**: Coordinated with reporter

## Scope

Security-sensitive areas include:

1. **Installer scripts and manifest parsing**
2. **Configuration and secrets handling**
3. **MCP server input handling**
4. **Integration connection and external actions**
5. **AI provider API key management**
6. **File system access and permissions**
7. **Network communication and data transmission**

## Security Features

### Current Implementation

1. **Local-first architecture** - All processing happens on your machine by default
2. **Installer checksum verification** - Ensures integrity of downloaded artifacts
3. **API key isolation** - Keys stored securely and never transmitted unnecessarily
4. **Input validation** - Strict validation of all user inputs and command arguments
5. **Module sandboxing** - Modules run with restricted permissions
6. **Audit logging** - Security-relevant actions are logged for review

### Planned Enhancements

1. **Full keychain and encryption hardening**
2. **Advanced permission controls for modules**
3. **Network isolation for sensitive operations**
4. **Runtime security monitoring**
5. **Automated security scanning in CI/CD**
6. **Third-party security audit**

## Best Practices for Users

### API Key Management

- Use environment variables instead of config files for sensitive keys
- Rotate API keys regularly
- Use role-based access controls where supported
- Monitor API usage for unusual patterns

### Module Security

- Only install modules from trusted sources
- Review module code before installation
- Keep modules updated to latest versions
- Monitor module permissions and access

### Local Security

- Keep PHANTOM updated to latest version
- Use secure file permissions for config files
- Regularly review audit logs
- Enable security features in configuration

## Dependencies

We regularly audit dependencies for known vulnerabilities:

- **Automated scanning** through GitHub Dependabot
- **Manual review** of critical dependencies
- **Quick patching** for high-severity issues
- **Dependency pinning** to prevent unexpected updates

## Data Privacy

PHANTOM is committed to your privacy:

- **Zero data collection** - No telemetry or usage tracking by default
- **Local processing** - Your data stays on your machine
- **Transparent operations** - Clear indication of external communications
- **User control** - You control what data is processed and transmitted

## Incident Response

In the event of a security incident:

1. **Immediate containment** - Isolate affected systems
2. **Investigation** - Determine scope and impact
3. **Remediation** - Develop and deploy fixes
4. **Communication** - Notify affected users transparently
5. **Post-mortem** - Document lessons learned and prevent recurrence

## Contact

For security-related questions or concerns:

- **Email**: security@phantom.pm
- **PGP Key**: Available upon request
- **Vulnerability Disclosure**: Coordinated disclosure program

## Acknowledgments

We appreciate the security research community and welcome responsible disclosure. Researchers who help improve PHANTOM's security will be acknowledged (with consent) in our release notes.
