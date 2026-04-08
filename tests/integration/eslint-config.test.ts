import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..');

// =============================================================================
// Integration Tests: ESLint Config Integrity
// =============================================================================
// Ensures eslint.config.mjs only references plugins that are installed
// and does not reference plugins that are not in devDependencies.
// =============================================================================

function getPkgDevDeps(): Map<string, string> {
  const pkg = JSON.parse(readFileSync(resolve(REPO_ROOT, 'package.json'), 'utf-8')) as {
    devDependencies?: Record<string, string>;
  };
  const deps = new Map<string, string>();
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
    deps.set(name, version);
  }
  return deps;
}

function getEslintConfigPlugins(): string[] {
  const content = readFileSync(resolve(REPO_ROOT, 'eslint.config.mjs'), 'utf-8');
  const plugins: string[] = [];

  // Match import statements
  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const mod = match[2];
    if (mod) plugins.push(mod);
  }

  return plugins;
}

describe('ESLint config integrity', () => {
  it('should not reference jsx-a11y plugin (not in devDependencies)', () => {
    const configContent = readFileSync(resolve(REPO_ROOT, 'eslint.config.mjs'), 'utf-8');
    expect(configContent).not.toContain('jsx-a11y');
    expect(configContent).not.toContain('jsx_a11y');
  });

  it('should not reference @next/eslint-plugin-next in root config', () => {
    const configContent = readFileSync(resolve(REPO_ROOT, 'eslint.config.mjs'), 'utf-8');
    expect(configContent).not.toContain('@next/eslint-plugin-next');
  });

  it('all imported plugins in eslint.config.mjs should exist in devDependencies', () => {
    const devDeps = getPkgDevDeps();
    const importedModules = getEslintConfigPlugins();

    // Filter out node: built-ins and eslint-config-* (not plugins)
    const pluginModules = importedModules.filter(
      (mod) => !mod.startsWith('node:') && !mod.startsWith('eslint-config-'),
    );

    const missing: string[] = [];
    for (const mod of pluginModules) {
      // For scoped packages like @eslint/js, check the scope + name
      // For regular packages, check directly
      if (!devDeps.has(mod)) {
        missing.push(mod);
      }
    }

    expect(
      missing,
      `Plugins imported but NOT in devDependencies:\n  ${missing.join('\n  ')}`,
    ).toHaveLength(0);
  });

  it('eslint.config.mjs should not contain orphan rule references', () => {
    const configContent = readFileSync(resolve(REPO_ROOT, 'eslint.config.mjs'), 'utf-8');
    const devDeps = getPkgDevDeps();

    // Check for rule prefixes that don't have matching plugins
    const rulePrefixes = configContent.match(/'(@?[\w-]+\/[\w-]+)\/[\w-]+'/g) ?? [];

    const orphanRules: string[] = [];
    for (const ruleRef of rulePrefixes) {
      const prefix = ruleRef.replace(/'/g, '').split('/')[0];

      // Map known prefixes to their npm package names
      const prefixToPkg: Record<string, string> = {
        '@typescript-eslint': 'typescript-eslint',
        react: 'eslint-plugin-react',
        'react-hooks': 'eslint-plugin-react-hooks',
      };

      const requiredPkg = prefixToPkg[prefix as keyof typeof prefixToPkg];
      if (requiredPkg && !devDeps.has(requiredPkg)) {
        orphanRules.push(`${ruleRef} (needs ${requiredPkg})`);
      }
    }

    expect(orphanRules, `Orphan rule references:\n  ${orphanRules.join('\n  ')}`).toHaveLength(0);
  });

  it('@next/eslint-plugin-next should only be in optional config file', () => {
    const nextjsConfig = readFileSync(
      resolve(REPO_ROOT, 'configs/eslint/eslint.config.nextjs.mjs'),
      'utf-8',
    );
    expect(nextjsConfig).toContain('@next/eslint-plugin-next');
    expect(nextjsConfig).toContain('Optional');
  });
});
