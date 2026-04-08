#!/bin/bash
# ============================================
# 🔒 AI AGENT CODING STANDARDS - SETUP SCRIPT
# Version: 2.0.0 | 2026-04-08
# ============================================
# ONE COMMAND to enforce AI agent coding standards
# Usage: bash setup.sh [target-directory]
# ============================================

set -euo pipefail

# ============================================
# COLORS & HELPERS
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}  ✓${NC} $1"; }
log_warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }
log_err()   { echo -e "${RED}  ✗${NC} $1"; }

# Detect path of THIS script (works when called from anywhere)
SCRIPT_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RULES_DIR="$(cd "$SCRIPT_PATH/.." && pwd)"
TARGET_DIR="$(cd "${1:-.}" 2>/dev/null && pwd || echo "${1:-.}")"

# ============================================
# BANNER
# ============================================
echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🔒 AI AGENT CODING STANDARDS - SETUP v2.0.0            ║"
echo "║     One Command. Zero Tolerance. Production Ready.         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ============================================
# STEP 0: PREREQUISITES CHECK
# ============================================
log_info "Checking prerequisites..."

PREREQ_OK=true

if ! command -v node &>/dev/null; then
  log_err "Node.js is NOT installed. Required: Node.js >= 20"
  PREREQ_OK=false
else
  NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
  if [ "$NODE_MAJOR" -lt 20 ]; then
    log_err "Node.js v${NODE_MAJOR} is too old. Required: >= 20"
    PREREQ_OK=false
  else
    log_ok "Node.js v$(node -v) detected"
  fi
fi

if ! command -v npm &>/dev/null; then
  log_err "npm is NOT installed"
  PREREQ_OK=false
else
  log_ok "npm v$(npm -v) detected"
fi

if [ "$PREREQ_OK" = false ]; then
  echo ""
  log_err "Prerequisites check FAILED. Fix above errors and retry."
  exit 1
fi
echo ""

# ============================================
# STEP 1: VALIDATE TARGET DIRECTORY
# ============================================
log_info "Validating target directory: $TARGET_DIR"

if [ ! -d "$TARGET_DIR" ]; then
  log_err "Directory does not exist: $TARGET_DIR"
  exit 1
fi
log_ok "Target directory exists"

if [ ! -f "$TARGET_DIR/package.json" ]; then
  log_warn "No package.json found. Setup will install rule files only."
  log_warn "For full functionality, run this in a Node.js project root."
fi
echo ""

# ============================================
# STEP 2: COPY AI AGENT RULE FILES
# ============================================
log_info "Installing AI agent rule files..."

copy_file() {
  local src="$1"
  local dst="$2"
  if [ -f "$RULES_DIR/$src" ]; then
    # Backup existing file if it differs
    if [ -f "$dst" ] && ! cmp -s "$RULES_DIR/$src" "$dst"; then
      local backup="${dst}.bak"
      cp "$dst" "$backup"
      log_warn "$(basename "$dst") exists — backed up to $(basename "$backup")"
    fi
    cp "$RULES_DIR/$src" "$dst"
    log_ok "$(basename "$dst")"
    return 0
  else
    log_warn "Source not found: $src (skipped)"
    return 1
  fi
}

copy_file "CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
copy_file ".cursorrules" "$TARGET_DIR/.cursorrules"
copy_file ".clinerules" "$TARGET_DIR/.clinerules"
copy_file ".windsurfrules" "$TARGET_DIR/.windsurfrules"

# GitHub Copilot instructions
mkdir -p "$TARGET_DIR/.github"
copy_file ".github/copilot-instructions.md" "$TARGET_DIR/.github/copilot-instructions.md"

# Copy .gitignore for repo (merge if exists)
if [ ! -f "$TARGET_DIR/.gitignore" ]; then
  copy_file ".gitignore" "$TARGET_DIR/.gitignore"
else
  log_warn ".gitignore already exists (preserved)"
fi

# Copy .editorconfig and .npmrc if not exists
if [ ! -f "$TARGET_DIR/.editorconfig" ]; then
  copy_file ".editorconfig" "$TARGET_DIR/.editorconfig"
else
  log_warn ".editorconfig already exists (preserved)"
fi

if [ ! -f "$TARGET_DIR/.npmrc" ]; then
  copy_file ".npmrc" "$TARGET_DIR/.npmrc"
else
  log_warn ".npmrc already exists (preserved)"
fi

echo ""

# ============================================
# STEP 3: COPY DOCUMENTATION
# ============================================
log_info "Installing documentation..."

mkdir -p "$TARGET_DIR/docs"

for doc in RULES.md ANTI-PATTERNS.md ARCHITECTURE.md SECURITY.md COMPARISON.md; do
  copy_file "docs/$doc" "$TARGET_DIR/docs/$doc"
done

echo ""

# ============================================
# STEP 4: COPY CONFIG FILES
# ============================================
log_info "Installing configuration files..."

# ESLint config (.mjs for maximum compatibility)
if [ -f "$RULES_DIR/configs/eslint/eslint.config.mjs" ]; then
  cp "$RULES_DIR/configs/eslint/eslint.config.mjs" "$TARGET_DIR/eslint.config.mjs"
  log_ok "eslint.config.mjs"
else
  log_warn "eslint.config.mjs not found"
fi

# Prettier
copy_file "configs/prettier/.prettierrc" "$TARGET_DIR/.prettierrc"
copy_file "configs/prettier/.prettierignore" "$TARGET_DIR/.prettierignore"

# TypeScript base config (reference file, not replacement)
if [ -f "$RULES_DIR/configs/typescript/tsconfig.base.json" ]; then
  cp "$RULES_DIR/configs/typescript/tsconfig.base.json" "$TARGET_DIR/tsconfig.base.json"
  log_ok "tsconfig.base.json (reference)"
fi

# Create tsconfig.json if not exists (extends tsconfig.base.json)
if [ ! -f "$TARGET_DIR/tsconfig.json" ]; then
  cat > "$TARGET_DIR/tsconfig.json" << 'TSEOF'
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "noEmit": true,
    "incremental": true
  },
  "include": ["src/**/*", "tests/**/*", "next-env.d.ts"],
  "exclude": ["node_modules"]
}
TSEOF
  log_ok "tsconfig.json (extends tsconfig.base.json)"
else
  log_warn "tsconfig.json already exists (preserved)"
fi

echo ""

# ============================================
# STEP 5: SETUP GIT HOOKS
# ============================================
log_info "Setting up Git hooks..."

if command -v git &>/dev/null && git -C "$TARGET_DIR" rev-parse --is-inside-work-tree &>/dev/null; then
  HOOKS_DIR="$TARGET_DIR/.git/hooks"

  if [ -f "$RULES_DIR/hooks/pre-commit" ]; then
    if [ -f "$HOOKS_DIR/pre-commit" ] && ! cmp -s "$RULES_DIR/hooks/pre-commit" "$HOOKS_DIR/pre-commit"; then
      cp "$HOOKS_DIR/pre-commit" "$HOOKS_DIR/pre-commit.bak"
      log_warn "pre-commit hook exists — backed up to pre-commit.bak"
    fi
    cp "$RULES_DIR/hooks/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit" 2>/dev/null || log_warn "chmod failed (manual: chmod +x .git/hooks/pre-commit)"
    log_ok "pre-commit hook"
  fi

  if [ -f "$RULES_DIR/hooks/pre-push" ]; then
    if [ -f "$HOOKS_DIR/pre-push" ] && ! cmp -s "$RULES_DIR/hooks/pre-push" "$HOOKS_DIR/pre-push"; then
      cp "$HOOKS_DIR/pre-push" "$HOOKS_DIR/pre-push.bak"
      log_warn "pre-push hook exists — backed up to pre-push.bak"
    fi
    cp "$RULES_DIR/hooks/pre-push" "$HOOKS_DIR/pre-push"
    chmod +x "$HOOKS_DIR/pre-push" 2>/dev/null || log_warn "chmod failed (manual: chmod +x .git/hooks/pre-push)"
    log_ok "pre-push hook"
  fi

  # Ensure git reads hooks from .git/hooks (not a custom hooks/ directory)
  git -C "$TARGET_DIR" config core.hooksPath .git/hooks
  log_ok "Git hooks activated (core.hooksPath set)"

  # CI/CD workflow (copy from template directory)
  mkdir -p "$TARGET_DIR/.github/workflows"
  copy_file "configs/github/quality-check.yml" "$TARGET_DIR/.github/workflows/quality-check.yml"
else
  log_warn "Not a git repository. Git hooks skipped."
  log_warn "Initialize git first: git init"
fi

echo ""

# ============================================
# STEP 6: SETUP VALIDATION SCRIPT
# ============================================
log_info "Installing validation script..."

mkdir -p "$TARGET_DIR/scripts"

if [ -f "$RULES_DIR/scripts/validate.sh" ]; then
  cp "$RULES_DIR/scripts/validate.sh" "$TARGET_DIR/scripts/validate.sh"
  chmod +x "$TARGET_DIR/scripts/validate.sh" 2>/dev/null || log_warn "chmod failed (manual: chmod +x scripts/validate.sh)"
  log_ok "validate.sh"
fi

# Testing configs (copy if vitest.config.ts not already present)
if [ ! -f "$TARGET_DIR/vitest.config.ts" ] && [ -f "$RULES_DIR/configs/testing/vitest.config.ts" ]; then
  cp "$RULES_DIR/configs/testing/vitest.config.ts" "$TARGET_DIR/vitest.config.ts"
  log_ok "vitest.config.ts (testing config)"
fi
if [ -f "$RULES_DIR/configs/testing/tests-setup.example.tsx" ]; then
  mkdir -p "$TARGET_DIR/tests"
  if [ ! -f "$TARGET_DIR/tests/setup.tsx" ]; then
    cp "$RULES_DIR/configs/testing/tests-setup.example.tsx" "$TARGET_DIR/tests/setup.tsx"
    log_ok "tests/setup.tsx (test mocks)"
  else
    log_warn "tests/setup.tsx already exists (preserved)"
  fi
fi

echo ""

# ============================================
# STEP 7: SETUP MCP CONFIG (OPTIONAL)
# ============================================
log_info "Setting up MCP configuration..."

mkdir -p "$TARGET_DIR/.claude"

if [ -f "$RULES_DIR/mcp/mcp-config.json" ]; then
  cp "$RULES_DIR/mcp/mcp-config.json" "$TARGET_DIR/.claude/mcp.json"
  log_ok ".claude/mcp.json"
fi

echo ""

# ============================================
# STEP 8: CHECK & INSTALL DEV DEPENDENCIES
# ============================================
if [ -f "$TARGET_DIR/package.json" ]; then
  log_info "Checking devDependencies..."

  # Required packages
  REQUIRED_ESLINT_PKGS=(
    "@eslint/js"
    "typescript-eslint"
    "eslint"
    "eslint-plugin-react"
    "eslint-plugin-react-hooks"
    "eslint-config-prettier"
  )

  MISSING_PKGS=()
  for pkg in "${REQUIRED_ESLINT_PKGS[@]}"; do
    if ! node --input-type=commonjs -e "
      try {
        require.resolve('${pkg}');
        process.exit(0);
      } catch { process.exit(1); }
    " 2>/dev/null; then
      MISSING_PKGS+=("$pkg")
    fi
  done

  if [ ${#MISSING_PKGS[@]} -gt 0 ]; then
    echo -e "${YELLOW}  ⚠ Missing ${#MISSING_PKGS[@]} devDependencies:${NC}"
    printf '    - %s\n' "${MISSING_PKGS[@]}"
    echo ""
    echo -e "${YELLOW}  Install them with:${NC}"
    echo -e "    npm install --save-dev ${MISSING_PKGS[*]}"
    echo ""
    echo -e "${YELLOW}  Optional (recommended):${NC}"
    echo "    npm install --save-dev prettier prettier-plugin-tailwindcss"
    echo "    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom"
    echo "    npm install --save-dev @testing-library/user-event jsdom @vitejs/plugin-react vite vite-tsconfig-paths @vitest/coverage-v8"
    echo ""
  else
    log_ok "All required ESLint packages installed"
  fi
fi

echo ""

# ============================================
# FINAL SUMMARY
# ============================================
echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     ✅ SETUP COMPLETE                                       ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                            ║"
echo "║  📄 AI Rule Files (5 agents):                               ║"
echo "║     CLAUDE.md / .cursorrules / .clinerules /                ║"
echo "║     .windsurfrules / copilot-instructions.md                ║"
echo "║                                                            ║"
echo "║  📖 Documentation (5 files):                                ║"
echo "║     docs/RULES.md / ANTI-PATTERNS.md /                     ║"
echo "║     ARCHITECTURE.md / SECURITY.md / COMPARISON.md             ║"
echo "║                                                            ║"
echo "║  ⚙️  Configs:                                              ║"
echo "║     eslint.config.mjs / .prettierrc / tsconfig.base.json    ║"
echo "║                                                            ║"
echo "║  🔒 Protection:                                             ║"
echo "║     pre-commit hook / pre-push hook / quality-check.yml     ║"
echo "║     scripts/validate.sh / .claude/mcp.json                 ║"
echo "║                                                            ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  🚀 Next steps:                                             ║"
echo "║  1. Install missing devDependencies (see above)             ║"
echo "║  2. Run: ./scripts/validate.sh                              ║"
echo "║  3. Commit and push - hooks will enforce quality            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
