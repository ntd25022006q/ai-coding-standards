#!/usr/bin/env node

/**
 * AI Agent Coding Standards - Cross-Platform Setup Script (TypeScript/Node.js)
 * Installs all AI rules, hooks, configs, and documentation.
 * Works natively on Windows, macOS, and Linux.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesDir = path.resolve(__dirname, '..');

// Get target directory from command line arguments, default to current dir
const targetArg = process.argv[2] || '.';
const targetDir = path.resolve(process.cwd(), targetArg);

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const logInfo = (msg: string) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`);
const logOk = (msg: string) => console.log(`  ${colors.green}✓${colors.reset} ${msg}`);
const logWarn = (msg: string) => console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`);
const logErr = (msg: string) => console.log(`  ${colors.red}✗${colors.reset} ${msg}`);

console.log(
  `\n${colors.bold}${colors.blue}╔══════════════════════════════════════════════════════════════╗`,
);
console.log(`║     🔒 AI AGENT CODING STANDARDS - SETUP (CROSS-PLATFORM)    ║`);
console.log(`║     One Command. Zero Tolerance. Production Ready.         ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

// 1. Prerequisites Check
logInfo('Checking prerequisites...');
try {
  const nodeVer = process.version;
  const major = parseInt(nodeVer.replace('v', '').split('.')[0], 10);
  if (major < 20) {
    logErr(`Node.js version is too old: ${nodeVer}. Required: >= 20`);
    process.exit(1);
  }
  logOk(`Node.js ${nodeVer} detected`);

  const npmVer = execSync('npm -v', { stdio: 'pipe' }).toString().trim();
  logOk(`npm v${npmVer} detected`);
} catch (e: unknown) {
  logErr('Prerequisites check failed: ' + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
}

// 2. Validate Target Dir
logInfo(`Validating target directory: ${targetDir}`);
if (!fs.existsSync(targetDir)) {
  logErr(`Target directory does not exist: ${targetDir}`);
  process.exit(1);
}
logOk('Target directory exists');

// Helper to copy file with backup if exists
function copyFile(srcRel: string, destAbs: string) {
  const srcAbs = path.join(rulesDir, srcRel);
  if (!fs.existsSync(srcAbs)) {
    logWarn(`Source file not found: ${srcRel} (skipped)`);
    return;
  }

  if (fs.existsSync(destAbs)) {
    const srcBuf = fs.readFileSync(srcAbs);
    const destBuf = fs.readFileSync(destAbs);
    if (!srcBuf.equals(destBuf)) {
      const backup = `${destAbs}.bak`;
      fs.copyFileSync(destAbs, backup);
      logWarn(`${path.basename(destAbs)} exists — backed up to ${path.basename(backup)}`);
    }
  }

  // Ensure parent dir exists
  const parent = path.dirname(destAbs);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }

  fs.copyFileSync(srcAbs, destAbs);
  logOk(path.basename(destAbs));
}

// 3. Install AI Rules
logInfo('Installing AI agent rule files...');
copyFile('CLAUDE.md', path.join(targetDir, 'CLAUDE.md'));
copyFile('.cursorrules', path.join(targetDir, '.cursorrules'));
copyFile('.clinerules', path.join(targetDir, '.clinerules'));
copyFile('.windsurfrules', path.join(targetDir, '.windsurfrules'));
copyFile(
  '.github/copilot-instructions.md',
  path.join(targetDir, '.github', 'copilot-instructions.md'),
);

// Base files if missing
if (!fs.existsSync(path.join(targetDir, '.gitignore'))) {
  copyFile('.gitignore', path.join(targetDir, '.gitignore'));
}
if (!fs.existsSync(path.join(targetDir, '.editorconfig'))) {
  copyFile('.editorconfig', path.join(targetDir, '.editorconfig'));
}
if (!fs.existsSync(path.join(targetDir, '.npmrc'))) {
  copyFile('.npmrc', path.join(targetDir, '.npmrc'));
}

// 4. Install Documentation
logInfo('Installing documentation...');
const docs = ['RULES.md', 'ANTI-PATTERNS.md', 'ARCHITECTURE.md', 'SECURITY.md', 'COMPARISON.md'];
for (const doc of docs) {
  copyFile(`docs/${doc}`, path.join(targetDir, 'docs', doc));
}

// 5. Install Config files
logInfo('Installing configuration files...');
copyFile('configs/eslint/eslint.config.mjs', path.join(targetDir, 'eslint.config.mjs'));
copyFile('configs/prettier/.prettierrc', path.join(targetDir, '.prettierrc'));
copyFile('configs/prettier/.prettierignore', path.join(targetDir, '.prettierignore'));
copyFile('configs/typescript/tsconfig.base.json', path.join(targetDir, 'tsconfig.base.json'));

if (!fs.existsSync(path.join(targetDir, 'tsconfig.json'))) {
  const defaultTsconfig = {
    extends: './tsconfig.base.json',
    compilerOptions: {
      plugins: [{ name: 'next' }],
      noEmit: true,
      incremental: true,
    },
    include: ['src/**/*', 'tests/**/*', 'next-env.d.ts'],
    exclude: ['node_modules'],
  };
  fs.writeFileSync(path.join(targetDir, 'tsconfig.json'), JSON.stringify(defaultTsconfig, null, 2));
  logOk('tsconfig.json');
}

// 6. Setup Git Hooks
logInfo('Setting up Git hooks...');
try {
  const isGit =
    execSync('git rev-parse --is-inside-work-tree', { cwd: targetDir, stdio: 'pipe' })
      .toString()
      .trim() === 'true';
  if (isGit) {
    const gitHooksDir = path.join(targetDir, '.git', 'hooks');
    copyFile('hooks/pre-commit', path.join(gitHooksDir, 'pre-commit'));
    copyFile('hooks/pre-push', path.join(gitHooksDir, 'pre-push'));

    // Set permission on unix
    try {
      execSync(
        `chmod +x "${path.join(gitHooksDir, 'pre-commit')}" "${path.join(gitHooksDir, 'pre-push')}"`,
        { stdio: 'ignore' },
      );
    } catch {
      // Intentional: chmod failure is non-critical
    }

    execSync('git config core.hooksPath .git/hooks', { cwd: targetDir, stdio: 'ignore' });
    logOk('Git hooks activated');
  }
} catch {
  logWarn('Not a Git repository. Git hooks setup skipped.');
}

// 7. Install scripts
logInfo('Installing validation scripts...');
copyFile('scripts/validate.ts', path.join(targetDir, 'scripts', 'validate.ts'));

console.log(
  `\n${colors.bold}${colors.green}╔══════════════════════════════════════════════════════════════╗`,
);
console.log(`║     ✅ SETUP COMPLETE (CROSS-PLATFORM)                       ║`);
console.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);
