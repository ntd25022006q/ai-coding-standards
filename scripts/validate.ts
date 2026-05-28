#!/usr/bin/env node

/**
 * AI Coding Standards - Cross-Platform Validation Script (TypeScript/Node.js)
 * Runs 10 coding standards checks to ensure code is production-ready.
 * Works natively on Windows, macOS, and Linux.
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const logOk = (msg: string) => console.log(`  ${colors.green}✓${colors.reset} ${msg}`);
const logWarn = (msg: string) => console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`);
const logErr = (msg: string) => console.log(`  ${colors.red}✗${colors.reset} ${msg}`);

let errors = 0;
let warnings = 0;

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function scanForbidden(
  dir: string,
  forbiddenPatterns: string[],
): Promise<{ found: boolean }> {
  if (!(await fileExists(dir))) return { found: false };
  let found = false;
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) {
      const subResult = await scanForbidden(full, forbiddenPatterns);
      if (subResult.found) found = true;
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      const content = await fs.readFile(full, 'utf8');
      for (const pattern of forbiddenPatterns) {
        if (content.includes(pattern)) {
          logErr(`Found forbidden pattern "${pattern}" in: ${path.relative(rootDir, full)}`);
          found = true;
          errors++;
        }
      }
    }
  }
  return { found };
}

// Strip JSDoc and line comments from source so that console.log
// mentions in documentation examples are not flagged as violations.
function stripComments(content: string): string {
  // Remove multi-line comments (including JSDoc)
  let stripped = content.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments
  stripped = stripped.replace(/\/\/.*$/gm, '');
  return stripped;
}

async function scanConsole(dir: string): Promise<number> {
  if (!(await fileExists(dir))) return 0;
  let consoleCount = 0;
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) {
      consoleCount += await scanConsole(full);
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      const content = await fs.readFile(full, 'utf8');
      const codeOnly = stripComments(content);
      if (codeOnly.includes('console.log')) {
        consoleCount++;
      }
    }
  }
  return consoleCount;
}

async function scanEmptyCatch(dir: string, regex: RegExp): Promise<number> {
  if (!(await fileExists(dir))) return 0;
  let emptyCatchCount = 0;
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) {
      emptyCatchCount += await scanEmptyCatch(full, regex);
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      const content = await fs.readFile(full, 'utf8');
      if (regex.test(content)) {
        logErr(`Empty catch block in: ${path.relative(rootDir, full)}`);
        emptyCatchCount++;
        errors++;
      }
    }
  }
  return emptyCatchCount;
}

async function scanSecrets(dir: string, secretRegexes: RegExp[]): Promise<number> {
  if (!(await fileExists(dir))) return 0;
  let secretCount = 0;
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) {
      if (entry !== 'node_modules' && entry !== '.git') {
        secretCount += await scanSecrets(full, secretRegexes);
      }
    } else if (
      stat.isFile() &&
      (entry.endsWith('.ts') ||
        entry.endsWith('.tsx') ||
        entry.endsWith('.js') ||
        entry.endsWith('.json'))
    ) {
      const content = await fs.readFile(full, 'utf8');
      for (const rx of secretRegexes) {
        if (rx.test(content)) {
          logErr(`Possible hardcoded secret in: ${path.relative(rootDir, full)}`);
          secretCount++;
          errors++;
          break;
        }
      }
    }
  }
  return secretCount;
}

async function checkFileSizes(dir: string): Promise<number> {
  if (!(await fileExists(dir))) return 0;
  let largeCount = 0;
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = await fs.stat(full);
    if (stat.isDirectory()) {
      largeCount += await checkFileSizes(full);
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      const content = await fs.readFile(full, 'utf8');
      const lines = content.split('\n').length;
      if (lines > 300) {
        logWarn(`${path.relative(rootDir, full)}: ${lines} lines (>300 max)`);
        largeCount++;
      }
    }
  }
  return largeCount;
}

async function main(): Promise<void> {
  console.log(
    `\n${colors.bold}${colors.blue}╔══════════════════════════════════════════════════════════════╗`,
  );
  console.log(`║     🔒 AI AGENT QUALITY VALIDATION (CROSS-PLATFORM)          ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // 1. Required project files
  console.log(`${colors.yellow}[1/10] Checking required project files...${colors.reset}`);
  const required = ['package.json'];
  const optional = ['tsconfig.json', '.gitignore'];

  for (const file of required) {
    if (await fileExists(path.join(rootDir, file))) {
      logOk(file);
    } else {
      logErr(`${file} (MISSING)`);
      errors++;
    }
  }
  for (const file of optional) {
    if (await fileExists(path.join(rootDir, file))) {
      logOk(file);
    } else {
      logWarn(`${file} (recommended)`);
      warnings++;
    }
  }

  // 1b. AI Rule files
  console.log(`\n     Checking AI rule files...`);
  const aiRules = ['CLAUDE.md', '.cursorrules', '.clinerules', '.windsurfrules'];
  for (const file of aiRules) {
    if (await fileExists(path.join(rootDir, file))) {
      logOk(file);
    } else {
      logWarn(`${file} (missing - AI agents may not follow rules)`);
      warnings++;
    }
  }

  // 1c. Copilot instructions
  const copilotPath = path.join(rootDir, '.github', 'copilot-instructions.md');
  if (await fileExists(copilotPath)) {
    logOk('.github/copilot-instructions.md');
  } else {
    logWarn('.github/copilot-instructions.md (missing - Copilot may not follow rules)');
    warnings++;
  }

  // 2. TypeScript strict mode
  console.log(`\n${colors.yellow}[2/10] Checking TypeScript strict mode...${colors.reset}`);
  const tsconfigPath = path.join(rootDir, 'tsconfig.json');
  if (await fileExists(tsconfigPath)) {
    try {
      const content = await fs.readFile(tsconfigPath, 'utf8');
      if (content.includes('"strict": true') || content.includes('"strict":true')) {
        logOk('TypeScript strict mode enabled');
      } else {
        logErr('TypeScript strict mode NOT enabled in tsconfig.json');
        errors++;
      }
    } catch (e: unknown) {
      logErr('Failed to read tsconfig.json: ' + (e instanceof Error ? e.message : String(e)));
      errors++;
    }
  } else {
    logWarn('tsconfig.json not found (skipped)');
  }

  // 3. Forbidden patterns
  console.log(`\n${colors.yellow}[3/10] Scanning for forbidden patterns...${colors.reset}`);
  const srcDir = path.join(rootDir, 'src');
  const anyType = ': ' + 'any';
  const asAny = 'as ' + 'any';
  const tsIgnore = '@ts-' + 'ignore';
  const tsExpect = '@ts-' + 'expect-error';
  const forbidden = [asAny, anyType, tsIgnore, tsExpect];
  const forbiddenResult = await scanForbidden(srcDir, forbidden);
  if (!forbiddenResult.found) {
    logOk('No forbidden patterns found');
  }

  // 4. console.log in source
  console.log(`\n${colors.yellow}[4/10] Scanning for console statements...${colors.reset}`);
  const consoleCount = await scanConsole(srcDir);
  if (consoleCount > 0) {
    logWarn(`Found console statements in ${consoleCount} file(s)`);
    warnings++;
  } else {
    logOk('No console statements found');
  }

  // 5. Empty catch blocks
  console.log(`\n${colors.yellow}[5/10] Scanning for empty catch blocks...${colors.reset}`);
  const emptyCatchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g;
  const emptyCatchCount = await scanEmptyCatch(srcDir, emptyCatchRegex);
  if (emptyCatchCount === 0) {
    logOk('No empty catch blocks found');
  }

  // 6. Hardcoded secrets
  console.log(`\n${colors.yellow}[6/10] Scanning for hardcoded secrets...${colors.reset}`);
  const secretRegexes = [
    /password\s*=\s*["'][^"']{3,}["']/gi,
    /api_key\s*=\s*["'][^"']{3,}["']/gi,
    /secret\s*=\s*["'][^"']{3,}["']/gi,
    /sk-[a-zA-Z0-9]{20,}/g,
    /AIza[a-zA-Z0-9]{30,}/g,
  ];
  const secretCount = await scanSecrets(srcDir, secretRegexes);
  if (secretCount === 0) {
    logOk('No hardcoded secrets detected');
  }

  // 7. File sizes (<300 lines)
  console.log(`\n${colors.yellow}[7/10] Checking file sizes...${colors.reset}`);
  const largeCount = await checkFileSizes(srcDir);
  if (largeCount > 0) {
    warnings += largeCount;
  } else {
    logOk('All files within size limits');
  }

  // 8. TypeScript compilation
  console.log(`\n${colors.yellow}[8/10] Running TypeScript compilation check...${colors.reset}`);
  try {
    execSync('npm run typecheck', { cwd: rootDir, stdio: 'pipe' });
    logOk('TypeScript: 0 errors');
  } catch (e: unknown) {
    logErr('TypeScript compilation failed');
    if (e instanceof Error && 'stdout' in e) {
      const stdout = (e as { stdout: Buffer }).stdout;
      console.log(stdout.toString().split('\n').slice(0, 10).join('\n'));
    }
    errors++;
  }

  // 9. ESLint
  console.log(`\n${colors.yellow}[9/10] Running ESLint...${colors.reset}`);
  try {
    execSync('npm run lint', { cwd: rootDir, stdio: 'pipe' });
    logOk('ESLint: 0 errors, 0 warnings');
  } catch (e: unknown) {
    logErr('ESLint validation failed');
    if (e instanceof Error && 'stdout' in e) {
      const stdout = (e as { stdout: Buffer }).stdout;
      console.log(stdout.toString().split('\n').slice(0, 10).join('\n'));
    }
    errors++;
  }

  // 10. Tests
  console.log(`\n${colors.yellow}[10/10] Running tests...${colors.reset}`);
  try {
    execSync('npm run test', { cwd: rootDir, stdio: 'pipe' });
    logOk('All tests passed');
  } catch (e: unknown) {
    logErr('Tests failed');
    if (e instanceof Error && 'stdout' in e) {
      const stdout = (e as { stdout: Buffer }).stdout;
      console.log(stdout.toString().split('\n').slice(0, 10).join('\n'));
    }
    errors++;
  }

  // Summary
  console.log(
    `\n${colors.bold}${colors.blue}══════════════════════════════════════════════════${colors.reset}`,
  );
  if (errors === 0 && warnings === 0) {
    console.log(
      `${colors.green}${colors.bold}✅ ALL CHECKS PASSED! Code is ready for commit.${colors.reset}\n`,
    );
    process.exit(0);
  } else if (errors === 0) {
    console.log(
      `${colors.yellow}${colors.bold}⚠️  PASSED with ${warnings} warning(s). Review recommended.${colors.reset}\n`,
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}${colors.bold}❌ FAILED: ${errors} error(s), ${warnings} warning(s)${colors.reset}`,
    );
    console.log(`${colors.red}   Fix ALL errors before committing.${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error('Validation script failed:', err);
  process.exit(1);
});
