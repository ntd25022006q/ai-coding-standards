# AI Coding Standards

**A template distribution tool that installs AI-agent rule files, ESLint/Prettier/TypeScript configs, and Git hooks into a target project with a single `npm run setup` command.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)

---

## Honest Disclosure — Read First

This repository is **not a runtime library**. It is a **template distribution tool**: a curated collection of rule files (CLAUDE.md, .cursorrules, .clinerules, .windsurfrules, copilot-instructions.md), config files (ESLint, Prettier, TypeScript), and Git hooks (pre-commit, pre-push) packaged for deployment into another project via a single command.

### What this repo does

- Installs 5 AI-agent rule files into a target project for Cursor, Claude, Copilot, Cline, and Windsurf.
- Installs ESLint 9 flat config, Prettier 3, and TypeScript strict-mode `tsconfig`.
- Installs `pre-commit` and `pre-push` hooks that block commits when validation fails.
- Provides `scripts/validate.sh` and `scripts/validate.ts` running 10 quality checks (file size, `console.log` detection, empty catch blocks, secret patterns, etc.).
- Ships 38 unit and integration tests that verify the template itself.

### What this repo does not do

- **Not a runtime dependency.** `src/` contains only 3 demo utility functions (`formatCurrency`, `clampValue`, `safeJsonParse`). Do not `require('ai-agent-coding-standards')` in production code.
- **Not a replacement for specialized ESLint plugins** such as `eslint-plugin-react`, `@typescript-eslint/eslint-plugin`, or `eslint-plugin-security`. The ESLint config here is a starting reference, not a comprehensive ruleset.
- **Not a CI/CD service.** Validation runs as a local shell script. There is no dashboard, no build artifact signing, and no centralized reporting.
- **Not a replacement for SonarQube or CodeQL.** There is no taint analysis, no data-flow analysis, and no SAST capability. The 10-point validation is pattern-based static analysis only.
- **Tests do not verify the target project after setup.** They verify the template itself. Users must run their own tests after `npm run setup`.

### Intended usage

```bash
# From your project root
git clone https://github.com/ntd25022006q/ai-coding-standards.git /tmp/acs
cd /tmp/acs
npm install
npm run setup /path/to/your/project
```

Then **replace** `src/` and `tests/` in the target project with your real code. The template is a starting point, not a final solution.

---

## Features

- **5 AI-agent rule files** — Cursor (`.cursorrules`), Claude (`CLAUDE.md`), Copilot (`copilot-instructions.md`), Cline (`.clinerules`), Windsurf (`.windsurfrules`)
- **ESLint 9 flat config** — Strict TypeScript-aware ruleset
- **Prettier 3** — Consistent code formatting
- **TypeScript strict mode** — `tsconfig.base.json` with `strict: true` and `noUncheckedIndexedAccess: true`
- **Git hooks** — `pre-commit` and `pre-push` shell scripts that run validation
- **10-point validation suite** — File size, console statements, empty catch blocks, secret patterns, mock data, debugger statements, dependency guard, type errors, lint errors, format check
- **MCP integration** — `mcp-config.json` template for Model Context Protocol tool definitions

---

## Tech Stack

| Category   | Technology                   |
| ---------- | ---------------------------- |
| Language   | TypeScript 5                 |
| Testing    | Vitest 3 (38 tests)          |
| Linting    | ESLint 9                     |
| Formatting | Prettier 3                   |
| Runtime    | Node.js 20+                  |
| Config     | MCP (Model Context Protocol) |

---

## Available Scripts

| Script                  | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `npm run setup`         | Install rule files, configs, and hooks into a target project |
| `npm run validate`      | Run the 10-point validation suite                            |
| `npm run lint`          | Run ESLint                                                   |
| `npm run typecheck`     | Run `tsc --noEmit`                                           |
| `npm run format:check`  | Verify Prettier formatting                                   |
| `npm run test`          | Run Vitest                                                   |
| `npm run test:coverage` | Run Vitest with coverage report                              |
| `npm run build`         | Verify TypeScript compiles                                   |
| `npm run check:all`     | Run all checks sequentially                                  |

---

## Project Structure

```
ai-coding-standards/
├── src/
│   ├── index.ts                # Public exports (demo utilities only)
│   ├── types/                  # TypeScript type definitions
│   └── lib/                    # Utility functions (formatCurrency, clampValue, safeJsonParse)
├── configs/
│   ├── eslint/                 # ESLint 9 flat config
│   ├── prettier/               # Prettier config
│   └── typescript/             # tsconfig.base.json
├── hooks/                      # pre-commit, pre-push shell scripts
├── scripts/
│   ├── setup.sh / setup.ts     # Template installer
│   └── validate.sh / validate.ts  # 10-point validation
├── rules/                      # CLAUDE.md, .cursorrules, .clinerules, .windsurfrules, copilot-instructions.md
├── mcp/
│   ├── mcp-config.json
│   └── tools/                  # MCP tool definitions
├── tests/
│   ├── unit/                   # Vitest unit tests
│   └── integration/            # Repo integrity tests
└── .github/workflows/          # CI/CD pipeline
```

---

## Testing

```bash
npm run test
npm run test:coverage
```

The test suite includes:

- `tests/unit/utils.test.ts` — 7 tests for `formatCurrency` (including edge cases: NaN, negative numbers, Infinity)
- `tests/unit/exports.test.ts` — Verifies public API exports
- `tests/integration/repo-integrity.test.ts` — Verifies all 30+ required template files exist
- `tests/integration/eslint-config.test.ts` — Verifies ESLint config is valid and loadable

---

## Alternatives

For production linting and code quality, consider:

| Use case                 | Recommended tool                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| TypeScript ESLint rules  | [`@typescript-eslint/eslint-plugin`](https://typescript-eslint.io/)                                |
| React lint rules         | [`eslint-plugin-react`](https://github.com/jsx-eslint/eslint-plugin-react)                         |
| Security lint rules      | [`eslint-plugin-security`](https://github.com/eslint-community/eslint-plugin-security)             |
| Accessibility lint rules | [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)                   |
| Curated Cursor rules     | [`awesome-cursorrules`](https://github.com/PatrickJS/awesome-cursorrules) (10k+ stars)             |
| SAST / taint analysis    | [SonarQube](https://www.sonarsource.com/products/sonarqube/), [CodeQL](https://codeql.github.com/) |

---

## License

MIT License — see [LICENSE](LICENSE). Copyright (c) 2026 Nguyen Tien Dat.
