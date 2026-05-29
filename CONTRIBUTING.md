# Contributing to AI Coding Standards

Thank you for your interest in contributing to this project. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Quality Standards](#quality-standards)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ai-coding-standards.git
   cd ai-coding-standards
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ntd25022006q/ai-coding-standards.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
npm install
```

This will automatically set up git hooks via the `prepare` script. Pre-commit and pre-push checks will run locally.

### Verify Setup

Run the full quality pipeline to make sure everything works:

```bash
npm run check:all
```

## Making Changes

### Branch Naming

Create a branch with a descriptive name using one of the following prefixes:

- `feature/` -- New functionality (e.g., `feature/add-svelte-rules`)
- `fix/` -- Bug fixes (e.g., `fix/pre-commit-false-positive`)
- `docs/` -- Documentation changes (e.g., `docs/update-readme`)
- `chore/` -- Maintenance tasks (e.g., `chore/upgrade-dependencies`)
- `refactor/` -- Code refactoring (e.g., `refactor/simplify-validation`)

```bash
git checkout -b feature/your-feature-name
```

### Code Style

This project enforces the same coding standards it distributes. All code must:

- Pass TypeScript strict mode with zero errors
- Pass ESLint with zero warnings
- Follow Prettier formatting
- Have no `any` types, `@ts-ignore`, or empty catch blocks
- Include tests for new functionality

### File Organization

- Rule files go in the project root (`.cursorrules`, `CLAUDE.md`, etc.)
- Configuration presets go in `configs/`
- Validation and setup scripts go in `scripts/`
- Documentation goes in `docs/`
- Git hooks go in `hooks/`
- Example source code goes in `src/`
- Tests go in `tests/`

## Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type       | Description                            |
| ---------- | -------------------------------------- |
| `feat`     | A new feature                          |
| `fix`      | A bug fix                              |
| `docs`     | Documentation changes                  |
| `style`    | Code style changes (formatting, etc.)  |
| `refactor` | Code refactoring without feature change |
| `test`     | Adding or updating tests               |
| `chore`    | Maintenance tasks, dependency updates  |
| `ci`       | CI/CD configuration changes            |
| `perf`     | Performance improvements               |

### Examples

```
feat(rules): add Svelte agent rule file
fix(hooks): resolve pre-commit false positive on Windows
docs(readme): update architecture diagram
chore(deps): upgrade vitest to 3.2.0
ci(workflows): add dependency caching to CI pipeline
```

### Commit Rules

- Each commit should represent one logical change
- Do not commit code that does not compile
- Do not commit failing tests
- Do not commit secrets or credentials
- Do not force push to `main` or `develop`

## Pull Request Process

1. **Update your branch** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run the full quality pipeline** before pushing:
   ```bash
   npm run check:all
   ```

3. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a pull request** against the `main` branch of the upstream repository.

5. **Fill in the pull request template** with:
   - A clear description of the change
   - The motivation for the change
   - Any breaking changes
   - References to related issues

6. **Wait for CI** -- All CI checks must pass before merging.

7. **Address review feedback** -- Make requested changes and push new commits.

### PR Title

Use the same Conventional Commits format for the PR title:

```
feat(scope): description
```

## Quality Standards

Before submitting a pull request, ensure all of the following pass:

| Check              | Command               | Requirement             |
| ------------------ | --------------------- | ----------------------- |
| TypeScript         | `npm run typecheck`   | 0 errors                |
| ESLint             | `npm run lint`        | 0 errors, 0 warnings   |
| Prettier           | `npm run format:check`| All files formatted     |
| Tests              | `npm run test`        | All tests pass          |
| Test Coverage      | `npm run test:coverage`| >= 80% across metrics  |
| Validation Suite   | `npm run validate`    | 0 errors                |
| Full Pipeline      | `npm run check:all`   | All checks pass         |

### Quick Check

```bash
npm run check:all
```

This runs all checks in sequence. If any step fails, fix the issue before committing.

## Questions?

If you have questions about contributing, please open a GitHub issue with the `question` label.
