# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in this repository, please report it responsibly.

### How to Report

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues by:

1. **Email**: Send a detailed report to the repository maintainer via GitHub's private vulnerability reporting feature.
2. **GitHub Security Advisory**: Use the ["Report a vulnerability"](https://github.com/ntd25022006q/ai-coding-standards/security/advisories/new) feature on the Security tab of this repository.

### What to Include

When reporting a vulnerability, please provide:

- A clear description of the issue
- Steps to reproduce the vulnerability
- The potential impact of the vulnerability
- Any suggested mitigations or fixes
- Your contact information for follow-up questions

### Response Timeline

| Stage | Target Time |
|-------|-------------|
| Acknowledgment of report | Within 48 hours |
| Initial assessment | Within 5 business days |
| Status update | Within 10 business days |
| Resolution | Varies by severity |

### Severity Classification

| Severity | Description | Example |
|----------|-------------|---------|
| Critical | Remote code execution, credential exposure | Hardcoded secrets in committed files |
| High | Significant security bypass | Flawed validation allowing injection |
| Medium | Limited security impact | Misconfigured permissions |
| Low | Minimal security impact | Informational findings |

### Disclosure Policy

- We follow a **coordinated disclosure** process.
- Vulnerabilities will be disclosed publicly only after a fix has been released and users have had reasonable time to update.
- We request that reporters allow us 90 days to address the issue before public disclosure.
- We will credit researchers in our security advisories (unless anonymity is requested).

## Security Best Practices for This Repository

This repository is a template and configuration distribution tool. While it does not process user data or run as a service, the following security practices apply:

### Secrets Management

- **Never commit real API keys, tokens, or passwords** to version control.
- All environment variables are referenced via placeholder syntax (e.g., `${GITHUB_TOKEN}`) in configuration templates.
- Use `.env.example` as a reference for required variables; never copy `.env` files into commits.

### Dependency Security

- Run `npm audit` regularly to check for known vulnerabilities.
- Dependabot is configured to automatically propose dependency updates.
- CI pipelines include a security audit step (`npm audit --audit-level=high`).

### Configuration Security

- MCP server configurations use environment variable substitution, not hardcoded credentials.
- Validation scripts scan for hardcoded secrets as part of the 10-point check suite.
- Pre-commit hooks block commits containing forbidden patterns (including potential secrets).

## Scope

This security policy covers:

- The contents of this GitHub repository
- Configuration templates and example code distributed by this project
- CI/CD pipeline definitions

This policy does **not** cover:

- Projects that use this tool's templates (those projects have their own security responsibilities)
- Third-party dependencies (report those to the respective maintainers)
- Issues in tools or agents that this repository configures (e.g., ESLint, TypeScript)
