<div align="center">

# 🤖 AI Coding Standards

**Bộ template distribution tool — cài đặt rule files, ESLint/Prettier/TS configs, và git hooks vào project của bạn qua 1 lệnh `npm run setup`.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/)

</div>

---

## ⚠️ Honest Disclosure — Repo này là gì và không phải là gì?

Repo này **KHÔNG phải là runtime library**. Nó là **template distribution tool**: một bộ sưu tập các rule files (CLAUDE.md, .cursorrules, .clinerules, .windsurfrules, copilot-instructions.md), config files (ESLint, Prettier, TypeScript), và git hooks (pre-commit, pre-push) được đóng gói để deploy vào project khác qua 1 lệnh.

| Repo này LÀM | Repo này KHÔNG làm |
| --- | --- |
| Cài đặt 5 AI rule files vào project đích (Cursor, Claude, Copilot, Cline, Windsurf) | Không phải runtime dependency — `src/` chỉ có 3 utility function demo (formatCurrency, clampValue, safeJsonParse) |
| Cài đặt ESLint 9 flat config, Prettier 3, tsconfig strict mode | Không thay thế được cho ESLint plugin riêng biệt (eslint-plugin-react, typescript-eslint) — chỉ reference config |
| Cài đặt pre-commit + pre-push hook để chặn commit khi validate fail | Không phải CI/CD service — chỉ là shell script chạy local |
| Cung cấp script `validate.sh` / `validate.ts` chạy 10 quality check (file size, console.log, empty catch, secrets, ...) | Không thay thế cho SonarQube / CodeQL — không có taint analysis, không có SAST |
| Có 38 unit test + integration test tự kiểm tra | Test chỉ verify chính template, không verify project đích sau khi setup |

**Cách dùng đúng**: clone repo này, chạy `npm run setup .` từ project của bạn, rồi **replace** `src/` và `tests/` bằng code thật của bạn. Đừng `require('ai-agent-coding-standards')` trong production code.

## ✨ Features

- **Multi-Agent Rules** — Configs for Cursor, Claude, Copilot, Cline, and Windsurf
- **10-Point Validation** — Comprehensive quality gate suite
- **MCP Integration** — Model Context Protocol tool definitions
- **Zero Mock Data** — Real validation, no placeholder logic
- **Strict Enforcement** — ESLint + Prettier + TypeScript strict mode

## 🛠️ Tech Stack

| Category   | Technology                   |
| ---------- | ---------------------------- |
| Language   | TypeScript 5                 |
| Testing    | Vitest 3                     |
| Linting    | ESLint 9                     |
| Formatting | Prettier 3                   |
| Runtime    | Node.js 20+                  |
| Config     | MCP (Model Context Protocol) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/ntd25022006q/ai-coding-standards.git
cd ai-coding-standards

# Install dependencies
npm install

# Run validation suite
npm run validate

# Run all checks
npm run check:all
```

### Available Scripts

| Script                  | Description                       |
| ----------------------- | --------------------------------- |
| `npm run validate`      | Run the 10-point validation suite |
| `npm run lint`          | Check code with ESLint            |
| `npm run typecheck`     | TypeScript compilation check      |
| `npm run format:check`  | Verify Prettier formatting        |
| `npm run test`          | Run Vitest test suite             |
| `npm run test:coverage` | Run tests with coverage report    |
| `npm run build`         | Verify TypeScript compiles        |
| `npm run check:all`     | Run all checks sequentially       |

## 📁 Project Structure

```
ai-coding-standards/
├── src/                # Source code and utilities
│   ├── index.ts        # Main entry point
│   ├── types/          # TypeScript type definitions
│   └── lib/            # Shared utilities
├── mcp/                # Model Context Protocol configs
│   ├── mcp-config.json # MCP server configuration
│   └── tools/          # MCP tool definitions
├── hooks/              # Git hooks (pre-commit, pre-push)
├── scripts/            # Setup and validation scripts
└── .github/workflows/  # CI/CD pipeline definitions
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

## 📄 License

MIT -- Copyright (c) 2026 Nguyen Tien Dat. All rights reserved.
