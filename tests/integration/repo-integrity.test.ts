import { describe, it, expect } from 'vitest';

// =============================================================================
// Integration Tests: Repo Structure Validation
// =============================================================================
// Verifies that all 34 expected files exist and are non-empty.
// This test ensures the repo template is complete after cloning.
// =============================================================================

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');

interface FileSpec {
  path: string;
  description: string;
}

const REQUIRED_FILES: FileSpec[] = [
  // AI rule files (5 agents)
  { path: 'CLAUDE.md', description: 'Claude rules' },
  { path: '.cursorrules', description: 'Cursor rules' },
  { path: '.clinerules', description: 'Claude Code CLI rules' },
  { path: '.windsurfrules', description: 'Windsurf rules' },
  { path: '.github/copilot-instructions.md', description: 'GitHub Copilot rules' },

  // Root configs
  { path: 'package.json', description: 'NPM package config' },
  { path: 'tsconfig.json', description: 'TypeScript config' },
  { path: 'eslint.config.mjs', description: 'ESLint flat config' },
  { path: '.prettierrc', description: 'Prettier config' },
  { path: '.prettierignore', description: 'Prettier ignore' },
  { path: '.gitignore', description: 'Git ignore' },
  { path: '.editorconfig', description: 'Editor config' },
  { path: '.nvmrc', description: 'Node.js version' },
  { path: '.npmrc', description: 'NPM config' },
  { path: 'LICENSE', description: 'MIT License' },
  { path: 'README.md', description: 'Project README' },

  // Scripts
  { path: 'scripts/setup.sh', description: 'Setup script' },
  { path: 'scripts/validate.sh', description: 'Validation script' },

  // Git hooks
  { path: 'hooks/pre-commit', description: 'Pre-commit hook' },
  { path: 'hooks/pre-push', description: 'Pre-push hook' },

  // CI/CD
  { path: '.github/workflows/quality-check.yml', description: 'CI/CD workflow' },

  // Configs (templates for target projects)
  { path: 'configs/eslint/eslint.config.mjs', description: 'ESLint template' },
  { path: 'configs/eslint/eslint.config.nextjs.mjs', description: 'ESLint Next.js template' },
  { path: 'configs/prettier/.prettierrc', description: 'Prettier template' },
  { path: 'configs/prettier/.prettierignore', description: 'Prettier ignore template' },
  { path: 'configs/typescript/tsconfig.base.json', description: 'TypeScript base template' },
  { path: 'configs/testing/vitest.config.ts', description: 'Vitest config template' },
  { path: 'configs/testing/tests-setup.example.tsx', description: 'Test setup template' },
  { path: 'configs/github/quality-check.yml', description: 'CI/CD template for targets' },

  // Documentation
  { path: 'docs/RULES.md', description: 'Coding rules' },
  { path: 'docs/ANTI-PATTERNS.md', description: 'Anti-patterns' },
  { path: 'docs/ARCHITECTURE.md', description: 'Architecture guide' },
  { path: 'docs/SECURITY.md', description: 'Security guide' },
  { path: 'docs/COMPARISON.md', description: 'Comparison analysis' },

  // MCP
  { path: 'mcp/mcp-config.json', description: 'MCP config' },
  { path: 'mcp/tools/optional-mcp-tools.json', description: 'Optional MCP tools' },
];

describe('Repo template integrity', () => {
  it(`should have all ${REQUIRED_FILES.length} required files`, () => {
    const missing: string[] = [];

    for (const file of REQUIRED_FILES) {
      const fullPath = join(REPO_ROOT, file.path);
      if (!existsSync(fullPath)) {
        missing.push(`${file.path} (${file.description})`);
      }
    }

    expect(missing, `Missing files:\n  ${missing.join('\n  ')}`).toHaveLength(0);
  });

  it('all required files should be non-empty', () => {
    const empty: string[] = [];

    for (const file of REQUIRED_FILES) {
      const fullPath = join(REPO_ROOT, file.path);
      if (existsSync(fullPath) && statSync(fullPath).size === 0) {
        empty.push(file.path);
      }
    }

    expect(empty, `Empty files:\n  ${empty.join('\n  ')}`).toHaveLength(0);
  });

  it('package.json should have correct name and version', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf-8')) as Record<
      string,
      unknown
    >;
    expect(pkg.name).toBe('ai-agent-coding-standards');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.type).toBe('module');
  });

  it('tsconfig.json should enable strict mode', () => {
    const tsconfig = JSON.parse(
      readFileSync(join(REPO_ROOT, 'configs/typescript/tsconfig.base.json'), 'utf-8'),
    ) as Record<string, unknown>;
    expect((tsconfig.compilerOptions as Record<string, unknown>).strict).toBe(true);
    expect((tsconfig.compilerOptions as Record<string, unknown>).noUncheckedIndexedAccess).toBe(
      true,
    );
  });

  it('.prettierrc should be valid JSON', () => {
    const content = readFileSync(join(REPO_ROOT, '.prettierrc'), 'utf-8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('all shell scripts should have shebang', () => {
    const scripts = [
      'scripts/setup.sh',
      'scripts/validate.sh',
      'hooks/pre-commit',
      'hooks/pre-push',
    ];

    const noShebang: string[] = [];
    for (const script of scripts) {
      const fullPath = join(REPO_ROOT, script);
      const firstLine = readFileSync(fullPath, 'utf-8').split('\n')[0];
      if (!firstLine?.startsWith('#!/bin/')) {
        noShebang.push(script);
      }
    }

    expect(noShebang, `Missing shebang:\n  ${noShebang.join('\n  ')}`).toHaveLength(0);
  });
});
