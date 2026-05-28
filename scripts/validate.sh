#!/bin/bash
# ============================================
# 🔒 QUALITY VALIDATION SCRIPT v2.0.0
# ============================================
# Portable: works with BOTH ripgrep (rg) AND grep
# Usage: ./validate.sh [--fix] [--ci]
# ============================================

set -uo pipefail
# NOTE: NOT using set -e so we can report ALL errors, not just the first

# ============================================
# COLORS
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

FIX_MODE=false
CI_MODE=false

for arg in "$@"; do
  case "$arg" in
    --fix) FIX_MODE=true ;;
    --ci)  CI_MODE=true ;;
    -*)    echo "Unknown option: $arg"; exit 1 ;;
  esac
done

ERRORS=0
WARNINGS=0

# ============================================
# HELPER FUNCTIONS
# ============================================
log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}  ✓${NC} $1"; }
log_warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }
log_err()   { echo -e "${RED}  ✗${NC} $1"; }

# ============================================
# PORTABLE SEARCH: works with rg OR grep
# ============================================
if command -v rg &>/dev/null; then
  # ripgrep available - fast path
  search_files() {
    rg -l "$1" -g '*.ts' -g '*.tsx' "${2:-src/}" 2>/dev/null || true
  }
  search_count() {
    local count
    count=$(rg -c "$1" -g '*.ts' -g '*.tsx' "${2:-src/}" 2>/dev/null | grep -cv ':0$' || true)
    echo "${count:-0}"
  }
else
  # Fallback: portable across Linux (GNU grep) and macOS (BSD grep)
  search_files() {
    local dir="${2:-src/}"
    if [ -d "$dir" ]; then
      find "$dir" -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 2>/dev/null | \
        xargs -0 grep -rl "$1" 2>/dev/null || true
    fi
  }
  search_count() {
    local dir="${2:-src/}"
    if [ -d "$dir" ]; then
      local count
      count=$(find "$dir" -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 2>/dev/null | \
        xargs -0 grep -rl "$1" 2>/dev/null | wc -l | tr -d ' ')
      echo "${count:-0}"
    else
      echo "0"
    fi
  }
fi

# ============================================
# HEADER
# ============================================
echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🔒 AI AGENT QUALITY VALIDATION v2.0.0                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ============================================
# CHECK 1: Required project files
# ============================================
echo -e "${YELLOW}[1/10] Checking required project files...${NC}"

REQUIRED_FILES=("package.json")
OPTIONAL_FILES=("tsconfig.json" ".gitignore")

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    log_ok "$file"
  else
    log_err "$file (MISSING)"
    ERRORS=$((ERRORS + 1))
  fi
done

for file in "${OPTIONAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    log_ok "$file"
  else
    log_warn "$file (recommended)"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# ============================================
# CHECK 1b: AI Rule files
# ============================================
echo ""
echo -e "${YELLOW}     Checking AI rule files...${NC}"

AI_RULE_FILES=("CLAUDE.md" ".cursorrules" ".clinerules" ".windsurfrules")

AI_MISSING=0
for file in "${AI_RULE_FILES[@]}"; do
  if [ -f "$file" ]; then
    log_ok "$file"
  else
    log_warn "$file (missing - AI agents may not follow rules)"
    AI_MISSING=$((AI_MISSING + 1))
  fi
done

if [ -f ".github/copilot-instructions.md" ]; then
  log_ok "copilot-instructions.md"
else
  log_warn "copilot-instructions.md (missing)"
  AI_MISSING=$((AI_MISSING + 1))
fi

# ============================================
# CHECK 2: TypeScript strict mode
# ============================================
echo ""
echo -e "${YELLOW}[2/10] Checking TypeScript strict mode...${NC}"

if [ -f "tsconfig.json" ]; then
  # Follow extends chain to find strict mode
  STRICT_FOUND=false
  CHECKED_FILES="tsconfig.json"
  CURRENT_FILE="tsconfig.json"
  MAX_DEPTH=5
  DEPTH=0

  while [ -n "$CURRENT_FILE" ] && [ $DEPTH -lt $MAX_DEPTH ]; do
    if grep -q '"strict"[[:space:]]*:[[:space:]]*true' "$CURRENT_FILE" 2>/dev/null; then
      STRICT_FOUND=true
      break
    fi
    # Check for extends directive
    EXTENDS_FILE=$(grep -oE '"extends"[[:space:]]*:[[:space:]]*"[^"]+"' "$CURRENT_FILE" 2>/dev/null | head -1 | grep -oE '"[^"]+"$' | tr -d '"')
    if [ -n "$EXTENDS_FILE" ]; then
      CURRENT_FILE="$EXTENDS_FILE"
      DEPTH=$((DEPTH + 1))
    else
      CURRENT_FILE=""
    fi
  done

  if [ "$STRICT_FOUND" = true ]; then
    log_ok "TypeScript strict mode enabled"
  else
    log_err "TypeScript strict mode NOT enabled"
    echo -e "      Add \"strict\": true to tsconfig.json or tsconfig.base.json"
    ERRORS=$((ERRORS + 1))
  fi

  # Check noUncheckedIndexedAccess in any tsconfig file
  if grep -rq '"noUncheckedIndexedAccess"' tsconfig*.json 2>/dev/null; then
    log_ok "noUncheckedIndexedAccess enabled"
  fi
else
  log_warn "tsconfig.json not found (skipped)"
fi

# ============================================
# CHECK 3: Forbidden patterns (any, @ts-ignore)
# ============================================
echo ""
echo -e "${YELLOW}[3/10] Scanning for forbidden patterns...${NC}"

# Also run shellcheck on scripts if available
if command -v shellcheck &>/dev/null; then
  SHELL_FILES=$(find scripts/ hooks/ -name '*.sh' -type f 2>/dev/null || true)
  if [ -n "$SHELL_FILES" ]; then
    SHELLCHECK_OUTPUT=$(echo "$SHELL_FILES" | xargs shellcheck --severity=warning 2>&1) || true
    if echo "$SHELLCHECK_OUTPUT" | grep -q "SC[0-9]"; then
      SHELL_ISSUES=$(echo "$SHELLCHECK_OUTPUT" | grep -c "SC[0-9]" || true)
      log_warn "shellcheck: ${SHELL_ISSUES} issue(s) in shell scripts"
      WARNINGS=$((WARNINGS + 1))
    else
      log_ok "shellcheck: no issues in shell scripts"
    fi
  fi
fi

if [ -d "src/" ]; then
  FORBIDDEN_PATTERNS=("as any" ": any" "@ts-ignore" "@ts-expect-error")
  FOUND_FORBIDDEN=false

  for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    matches=$(search_files "$pattern" "src/")
    if [ -n "$matches" ]; then
      count=$(echo "$matches" | wc -l | tr -d ' ')
      log_err "Found '${pattern}' in ${count} file(s)"
      echo "$matches" | head -5 | while read -r f; do
        echo -e "        → $f"
      done
      if [ "$FIX_MODE" = true ]; then
        echo -e "      ${YELLOW}→ Fix: search and replace '${pattern}' in the listed files${NC}"
      fi
      ERRORS=$((ERRORS + 1))
      FOUND_FORBIDDEN=true
    fi
  done

  if [ "$FOUND_FORBIDDEN" = false ]; then
    log_ok "No forbidden patterns found"
  fi
else
  log_warn "src/ directory not found (skipped)"
fi

# ============================================
# CHECK 4: console.log in source
# ============================================
echo ""
echo -e "${YELLOW}[4/10] Scanning for console statements...${NC}"

if [ -d "src/" ]; then
  CONSOLE_COUNT=$(search_count "console\.log" "src/")

  if [ "$CONSOLE_COUNT" -gt 0 ]; then
    log_warn "Found console statements in ${CONSOLE_COUNT} file(s)"
    echo -e "      Use structured logger (pino/winston) instead of console"
    WARNINGS=$((WARNINGS + 1))
  else
    log_ok "No console statements found"
  fi
else
  log_warn "src/ directory not found (skipped)"
fi

# ============================================
# CHECK 5: Empty catch blocks
# ============================================
echo ""
echo -e "${YELLOW}[5/10] Scanning for empty catch blocks...${NC}"

if [ -d "src/" ]; then
  # Use grep for this since the pattern is simple and universal
  EMPTY_CATCH=0
  while IFS= read -r file; do
    if [ -f "$file" ]; then
      # Portable pattern: works on both Linux (grep -E) and macOS
      if grep -qE 'catch[[:space:]]*\([^)]*\)[[:space:]]*\{[[:space:]]*\}' "$file" 2>/dev/null; then
        log_err "Empty catch block in: $file"
        EMPTY_CATCH=$((EMPTY_CATCH + 1))
      fi
    fi
  done < <(find src/ -name '*.ts' -o -name '*.tsx' 2>/dev/null)

  if [ "$EMPTY_CATCH" -gt 0 ]; then
    ERRORS=$((ERRORS + 1))
  else
    log_ok "No empty catch blocks found"
  fi
else
  log_warn "src/ directory not found (skipped)"
fi

# ============================================
# CHECK 6: Hardcoded secrets
# ============================================
echo ""
echo -e "${YELLOW}[6/10] Scanning for hardcoded secrets...${NC}"

if [ -d "src/" ]; then
  SECRET_PATTERNS=(
    'password\s*=\s*["\x27][^"\x27]{3,}["\x27]'
    'api_key\s*=\s*["\x27][^"\x27]{3,}["\x27]'
    'secret\s*=\s*["\x27][^"\x27]{3,}["\x27]'
    'sk-[a-zA-Z0-9]{20,}'
    'AIza[a-zA-Z0-9]{30,}'
  )

  FOUND_SECRETS=false
  for pattern in "${SECRET_PATTERNS[@]}"; do
    matches=$(search_files "$pattern" "src/")
    if [ -n "$matches" ]; then
      count=$(echo "$matches" | wc -l | tr -d ' ')
      log_err "Possible hardcoded secret in ${count} file(s)"
      FOUND_SECRETS=true
      ERRORS=$((ERRORS + 1))
    fi
  done

  if [ "$FOUND_SECRETS" = false ]; then
    log_ok "No hardcoded secrets detected"
  fi
else
  log_warn "src/ directory not found (skipped)"
fi

# ============================================
# CHECK 7: File sizes (<300 lines)
# ============================================
echo ""
echo -e "${YELLOW}[7/10] Checking file sizes...${NC}"

if [ -d "src/" ]; then
  LARGE_COUNT=0
  while IFS= read -r file; do
    if [ -f "$file" ]; then
      lines=$(wc -l < "$file" | tr -d ' ')
      if [ "$lines" -gt 300 ]; then
        log_warn "$file: ${lines} lines (>300 max)"
        LARGE_COUNT=$((LARGE_COUNT + 1))
      fi
    fi
  done < <(find src/ \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null)

  if [ "$LARGE_COUNT" -gt 0 ]; then
    WARNINGS=$((WARNINGS + LARGE_COUNT))
  else
    log_ok "All files within size limits"
  fi
else
  log_warn "src/ directory not found (skipped)"
fi

# ============================================
# CHECK 8: TypeScript compilation
# ============================================
echo ""
echo -e "${YELLOW}[8/10] Running TypeScript compilation check...${NC}"

if command -v npx &>/dev/null && [ -f "tsconfig.json" ]; then
  # Check if typescript is installed (not the wrong 'tsc' package)
  if node --input-type=commonjs -e "try { require.resolve('typescript/package.json'); process.exit(0); } catch { process.exit(1); }" 2>/dev/null; then
    TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
    TSC_EXIT=$?
    if [ $TSC_EXIT -eq 0 ]; then
      log_ok "TypeScript: 0 errors"
    else
      log_err "TypeScript compilation failed"
      # Show first 10 errors
      echo "$TSC_OUTPUT" | head -10 | while read -r line; do
        echo -e "      $line"
      done
      ERRORS=$((ERRORS + 1))
    fi
  else
    log_warn "TypeScript not installed (skipped)"
    log_warn "Install: npm install --save-dev typescript"
    WARNINGS=$((WARNINGS + 1))
  fi
elif [ ! -f "tsconfig.json" ]; then
  log_warn "tsconfig.json not found (skipped)"
else
  log_warn "npx not found (skipped)"
fi

# ============================================
# CHECK 9: ESLint
# ============================================
echo ""
echo -e "${YELLOW}[9/10] Running ESLint...${NC}"

ESLINT_CONFIG=""
if [ -f "eslint.config.mjs" ]; then
  ESLINT_CONFIG="eslint.config.mjs"
elif [ -f "eslint.config.js" ]; then
  ESLINT_CONFIG="eslint.config.js"
elif [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
  ESLINT_CONFIG="eslintrc"
fi

if command -v npx &>/dev/null && [ -n "$ESLINT_CONFIG" ]; then
  ESLINT_OUTPUT=$(npx eslint . --max-warnings=0 2>&1)
  ESLINT_EXIT=$?
  if [ $ESLINT_EXIT -eq 0 ]; then
    log_ok "ESLint: 0 errors, 0 warnings"
  else
    # Check if ESLint failed because of missing dependencies
    if echo "$ESLINT_OUTPUT" | grep -q "Cannot find module\|ERR_MODULE_NOT_FOUND\|Cannot find package"; then
      log_warn "ESLint dependencies not installed (skipped)"
      log_warn "Install them first: npm install --save-dev eslint typescript-eslint @eslint/js"
      WARNINGS=$((WARNINGS + 1))
    # Check if all files are ignored (normal for template repos without src/)
    elif echo "$ESLINT_OUTPUT" | grep -q "all of the files.*are ignored\|no files to lint"; then
      log_warn "ESLint: no lintable files found (skipped - normal for template repos)"
      WARNINGS=$((WARNINGS + 1))
    elif [ "$FIX_MODE" = true ]; then
      echo -e "      ${YELLOW}Attempting auto-fix...${NC}"
      npx eslint . --fix 2>&1 || true
      echo -e "      ${YELLOW}Re-running ESLint after fix...${NC}"
      if npx eslint . --max-warnings=0 2>&1; then
        log_ok "ESLint: auto-fixed successfully"
      else
        log_err "ESLint: errors remain after auto-fix"
        ERRORS=$((ERRORS + 1))
      fi
    else
      log_err "ESLint found issues (run with --fix to auto-fix)"
      ERRORS=$((ERRORS + 1))
    fi
  fi
else
  log_warn "ESLint config not found (skipped)"
fi

# ============================================
# CHECK 10: Tests
# ============================================
echo ""
echo -e "${YELLOW}[10/10] Running tests...${NC}"

if command -v npx &>/dev/null; then
  TEST_OK=false
  TEST_OUTPUT=""

  # Check if vitest is installed
  if node --input-type=commonjs -e "try { require.resolve('vitest/package.json'); process.exit(0); } catch { process.exit(1); }" 2>/dev/null; then
    TEST_OUTPUT=$(npx vitest run --reporter=verbose 2>&1) || true
    # Check if vitest actually loaded properly (no config errors)
    if echo "$TEST_OUTPUT" | grep -q "failed to load config\|Startup Error\|ERR_MODULE_NOT_FOUND"; then
      log_warn "Vitest config error (check vitest.config.ts and deps)"
      WARNINGS=$((WARNINGS + 1))
    elif echo "$TEST_OUTPUT" | grep -q "Tests.*passed\|No test files found"; then
      TEST_OK=true
    fi
  # Try jest
  elif node --input-type=commonjs -e "try { require.resolve('jest/package.json'); process.exit(0); } catch { process.exit(1); }" 2>/dev/null; then
    TEST_OUTPUT=$(npx jest --passWithNoTests 2>&1) || true
    if echo "$TEST_OUTPUT" | grep -q "Tests.*passed\|No tests found"; then
      TEST_OK=true
    fi
  fi

  if [ "$TEST_OK" = true ]; then
    # Check if there were actually tests to run
    if echo "$TEST_OUTPUT" | grep -q "No test"; then
      log_warn "No test files found (add tests for your code)"
      WARNINGS=$((WARNINGS + 1))
    else
      log_ok "All tests passed"
    fi
  elif [ -z "$TEST_OUTPUT" ]; then
    log_warn "No test runner configured (vitest or jest)"
    log_warn "Install: npm install --save-dev vitest"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  log_warn "npx not found (skipped)"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo -e "${BOLD}${BLUE}══════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✅ ALL CHECKS PASSED! Code is ready for commit.${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}${BOLD}⚠️  PASSED with ${WARNINGS} warning(s). Review recommended.${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}❌ FAILED: ${ERRORS} error(s), ${WARNINGS} warning(s)${NC}"
  echo -e "${RED}   Fix ALL errors before committing.${NC}"
  exit 1
fi
