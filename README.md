# AI Coding Standards

> **Một repo duy nhất. Một lệnh git clone. Ép TẤT CẢ AI Agent tuân thủ chuẩn mực code production-ready.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Shell Scripts](https://img.shields.io/badge/shell-bash%20%7C%20POSIX-green)](https://www.gnu.org/software/bash/)
[![TypeScript Strict](https://img.shields.io/badge/typescript-strict-blue)](https://www.typescriptlang.org/)
[![Cross Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey)]()

---

## Tại sao cần repo này?

AI coding agents (Claude, Cursor, Claude Code, Windsurf, GitHub Copilot) đang thay đổi cách chúng ta viết code. Nhưng chúng có **29 vấn đề nghiêm trọng** khiến code production không đạt chuẩn:

- Bịa đặt API documentation mà không kiểm tra
- Xóa nhầm file/thư mục khi fix bug
- Viết code không chạy được sau khi báo "done"
- Thiếu test, thiếu error handling, thiếu security
- Code style không nhất quán giữa các agent
- Sửa chỗ nọ làm hỏng chỗ kia

Repo này giải quyết **TẤT CẢ** 29 vấn đề trên bằng **6 lớp phòng thủ tự động**.

---

## Bảng so sánh: Trước vs Sau khi dùng repo này

| Tiêu chí           | KHÔNG dùng AI Coding Standards                        | Dùng AI Coding Standards                                                 |
| ------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| **Code quality**   | Tùy thuộc vào từng lần AI generate, không ổn định     | ESLint + TypeScript strict chặn lỗi tự động                              |
| **Anti-patterns**  | AI thường xuyên sinh `any`, `@ts-ignore`, console.log | 30 anti-pattern bị detect tự động, commit bị block                       |
| **Error handling** | Thường thiếu try-catch, empty catch blocks            | Bắt buộc structured error handling trong mọi layer                       |
| **TypeScript**     | Loose typing, type assertion lạm dụng                 | Strict mode + noUncheckedIndexedAccess + noImplicitReturns               |
| **Security**       | Hardcoded secrets, thiếu validation                   | Zod runtime validation + OWASP Top 10 checklist                          |
| **Testing**        | AI hay bỏ qua hoặc viết mock giả                      | 80% coverage minimum, AAA pattern, MSW setup sẵn                         |
| **Code review**    | Phải review thủ công từng dòng                        | Git hooks + CI/CD tự động chặn code lỗi                                  |
| **Consistency**    | 5 AI agent khác nhau = 5 style khác nhau              | 1 bộ rule dùng chung cho TẤT CẢ AI agent                                 |
| **Documentation**  | AI không tự tạo docs                                  | 5 tài liệu sẵn: Rules, Anti-patterns, Architecture, Security, Comparison |
| **Performance**    | Không tối ưu, bundle phình to                         | Performance budget: LCP < 2.5s, JS < 200KB gzipped                       |
| **API Design**     | Endpoint không version, input không validate          | Versioned API + Zod schema cho mọi endpoint                              |
| **Git workflow**   | Commit message tùy hứng                               | Conventional Commits + branch strategy chuẩn                             |

---

## Thống kê chi tiết

> **Lưu ý**: Các con số dưới đây dựa trên quan sát thực tế từ các project sử dụng AI coding agents (GitHub Octoverse 2025, cộng đồng developer). Đây là ước tính trung bình, không phải benchmark chính thức. Kết quả thực tế có thể khác tùy project và agent.

### So sánh số lượng lỗi code trung bình

| Loại lỗi                          | Trung bình không có standards | Có AI Coding Standards       | Cơ chế phòng thủ                            |
| --------------------------------- | ----------------------------- | ---------------------------- | ------------------------------------------- |
| `any` type                        | 15-25 lần/project             | 0 (ESLint block)             | `@typescript-eslint/no-explicit-any: error` |
| `@ts-ignore` / `@ts-expect-error` | 8-12 lần/project              | 0 (ESLint block)             | Flat config + pre-commit                    |
| console.log trong production      | 20-40 lần/project             | 0 (ESLint warn)              | `no-console: error`                         |
| Empty catch blocks                | 5-10 lần/project              | 0 (validate.sh detect)       | Regex scan + pre-commit                     |
| Missing error handling            | 10-20 lỗi/project             | 0 (rule bắt buộc)            | AI rule files + CI/CD                       |
| Hardcoded secrets                 | 2-5 lần/project               | 0 (CI/CD scan)               | Regex pattern + npm audit                   |
| Component > 200 lines             | 3-8 file/project              | 0 (validate.sh check)        | Line count check                            |
| File > 300 lines                  | 5-10 file/project             | 0 (validate.sh check)        | Line count check                            |
| Missing TypeScript strict         | N/A                           | 0 (luôn bật)                 | tsconfig strict mode                        |
| Code không chạy được              | 30-50% lần generate           | < 1% (validate trước commit) | 3 lớp: hooks + CI + validate                |
| Test coverage < 80%               | Thường 0-30%                  | Đảm bảo >= 80%               | Vitest threshold + CI gate                  |

### Phân tích chi tiết

**1. Tại sao `any` type gần như bị loại bỏ hoàn toàn?**

ESLint config trong repo này bật rule `@typescript-eslint/no-explicit-any` ở mức `error`. Nghĩa là mỗi lần AI agent cố gắng dùng `any` type, ESLint sẽ chặn ngay lập tức. Thay vào đó, agent bắt buộc dùng `unknown` + type guard hoặc Zod parse. Điều này đảm bảo type safety xuyên suốt toàn bộ codebase, ngăn chặn runtime type errors — nguyên nhân hàng đầu gây crash ứng dụng.

**2. Tại sao console.log biến mất?**

Rule `no-console` được cấu hình ở mức `error`, chỉ cho phép `console.warn` và `console.error`. Điều này buộc AI agent phải dùng structured logger (pino/winston) thay vì console.log. Structured logging cho phép search, filter, alert trong production monitoring (Datadog, Grafana, etc.), điều mà console.log không thể làm được.

**3. Tại sao code luôn chạy được?**

Có 3 lớp kiểm tra tự động: (1) pre-commit hook chạy TypeScript check + ESLint trước MỖI commit, (2) pre-push hook chạy full validation + build + tests trước MỖI push, (3) CI/CD chạy 7 quality gates trên GitHub Actions. Code lỗi không thể vượt qua 3 lớp này để vào main branch.

**4. Tại sao 30 anti-patterns bị phát hiện?**

validate.sh scan toàn bộ source code bằng ripgrep (hoặc grep fallback) để tìm các pattern như `as any`, `: any`, `@ts-ignore`, empty catch blocks, hardcoded secrets (password, api_key, secret), magic numbers, v.v. Mỗi file vi phạm được liệt kê chi tiết với số dòng cụ thể.

---

## Cài đặt - CHỈ 1 LỆNH

> **Yêu cầu**: Node.js >= 20 (repo có `.nvmrc`, chạy `nvm use` hoặc đảm bảo Node version đúng)

```bash
# 1. Clone repo
git clone https://github.com/ntd25022006q/ai-coding-standards.git

# 2. Chuyển vào project của bạn
cd /path/to/your/project

# 3. Chạy setup - XONG!
bash /path/to/ai-coding-standards/scripts/setup.sh .
```

> **Lưu ý về Git Hooks**: Hooks trong `hooks/` là template. `setup.sh` sẽ copy vào `.git/hooks/` và chmod +x tự động. Git KHÔNG tự đọc thư mục tùy chỉnh — bạn **phải chạy setup.sh** hoặc thủ công copy + chmod +x.

### Hoặc dùng npm (nếu đã cài trong project)

```bash
npm install --save-dev typescript eslint prettier
npm run setup    # Copy rules, configs, hooks vào project
npm run validate # Chạy 10 checks tự động
```

### Setup script sẽ tự động:

1. Copy 5 AI rule files vào project root
2. Copy 4 tài liệu vào `docs/`
3. Copy ESLint + Prettier + TypeScript configs
4. Tạo `tsconfig.json` nếu chưa có
5. Cài đặt Git hooks (pre-commit + pre-push)
6. Cài đặt CI/CD workflow (GitHub Actions)
7. Kiểm tra và liệt kê devDependencies cần install
8. Copy validation script + MCP config

---

## 5 AI Agents được hỗ trợ

| AI Agent               | Rule File                         | Cách hoạt động                  |
| ---------------------- | --------------------------------- | ------------------------------- |
| **Claude** (claude.ai) | `CLAUDE.md`                       | Claude tự đọc khi mở project    |
| **Cursor**             | `.cursorrules`                    | Cursor tự load khi mở workspace |
| **Claude Code** (CLI)  | `.clinerules`                     | Claude Code CLI đọc tự động     |
| **Windsurf**           | `.windsurfrules`                  | Windsurf load khi mở project    |
| **GitHub Copilot**     | `.github/copilot-instructions.md` | Copilot đọc từ repo settings    |

Mỗi file rule chứa quy tắc **nhất quán**: 10 section, 30 absolute bans, 6-step workflow, quality gates.

---

## 6 Lớng phòng thủ

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1: AI Rule Files (5 files)                   │
│  → AI Agent ĐỌC rule tự động khi mở project         │
├─────────────────────────────────────────────────────┤
│  LAYER 2: Git Hooks (pre-commit + pre-push)          │
│  → CHẶN commit/push nếu code có lỗi                 │
├─────────────────────────────────────────────────────┤
│  LAYER 3: CI/CD Gates (7 GitHub Actions jobs)        │
│  → CHẶN merge vào main nếu bất kỳ gate fail         │
├─────────────────────────────────────────────────────┤
│  LAYER 4: Validation Script (10 checks tự động)      │
│  → Scan code, detect anti-patterns, báo cáo chi tiết  │
├─────────────────────────────────────────────────────┤
│  LAYER 5: Config Files (ESLint + TS + Prettier)      │
│  → Enforce at save/compile time trong editor          │
├─────────────────────────────────────────────────────┤
│  LAYER 6: Documentation (4 tài liệu chuyên sâu)       │
│  → Reference hoàn chỉnh cho developer                 │
└─────────────────────────────────────────────────────┘
```

### Chi tiết từng lớp:

**Layer 1 - Rule Files**: Mỗi AI agent đọc file rule tương ứng. File chứa identity, quy tắc code, 30 absolute bans, testing rules, security checklist, quality gates. Tổng cộng ~14,000+ từ cho mỗi agent.

**Layer 2 - Git Hooks**: pre-commit chạy TypeScript check + ESLint + forbidden patterns scan trên staged files. pre-push chạy full validation + build + tests. Không thể bypass (trừ --no-verify, không khuyến nghị).

**Layer 3 - CI/CD**: GitHub Actions workflow `.github/workflows/quality-check.yml` bảo vệ **chính repo này** (integrity check: 7 jobs kiểm tra template files, shell syntax, JSON, ESLint, TypeScript, security, setup dry-run). Khi setup.sh copy `configs/github/quality-check.yml` vào target project, workflow đó sẽ chạy quality gates cho target project (typecheck, lint, test, build, security, validate).

**Layer 4 - Validation Script**: 10 checks tự động: required files, TypeScript strict, forbidden patterns, console statements, empty catch blocks, hardcoded secrets, file sizes, TypeScript compilation, ESLint, tests. Hoạt động cross-platform (macOS + Linux).

**Layer 5 - Config Files**: ESLint flat config với type-aware linting (recommendedTypeChecked + no-floating-promises + no-misused-promises), TypeScript strict mode với noUncheckedIndexedAccess, Prettier formatting, .editorconfig chuẩn hóa. Git hooks tự activate qua `npm prepare` script.

**Layer 6 - Documentation**: 5 tài liệu chuyên sâu: RULES.md (14 phần, 1000+ dòng), ANTI-PATTERNS.md (30 patterns với code ví dụ), ARCHITECTURE.md (Clean Architecture 4 layers), SECURITY.md (OWASP Top 10 implementation), COMPARISON.md (so sánh chuyên sâu).

---

## 30 Anti-Pattern bị cấm

| #   | Anti-Pattern                      | Phạt           | Giải pháp                     |
| --- | --------------------------------- | -------------- | ----------------------------- |
| 1   | `any` type                        | Block commit   | `unknown` + type guard        |
| 2   | `@ts-ignore` / `@ts-expect-error` | Block commit   | Fix type properly             |
| 3   | Giant component (>200 lines)      | Warning        | Split smaller                 |
| 4   | `useEffect` cho data fetching     | Block commit   | React Query / SWR             |
| 5   | Inline styles                     | ESLint error   | Tailwind CSS                  |
| 6   | Missing loading/error states      | Rule violation | Skeleton + ErrorBoundary      |
| 7   | Prop drilling >3 levels           | Rule violation | Context / Zustand             |
| 8   | Too many useState                 | Rule violation | useReducer / react-hook-form  |
| 9   | Global state cho local data       | Rule violation | Local state                   |
| 10  | Unvalidated API input             | Rule violation | Zod schema                    |
| 11  | Missing error handling            | Rule violation | try-catch + structured logger |
| 12  | Unversioned API                   | Rule violation | /api/v1/...                   |
| 13  | N+1 query                         | Performance    | Prisma include                |
| 14  | Selecting all DB fields           | Security       | Explicit select               |
| 15  | Missing DB indexes                | Performance    | @@index                       |
| 16  | Hardcoded secrets                 | CI/CD block    | Env vars + Zod validation     |
| 17  | Unsanitized innerHTML             | Security       | DOMPurify                     |
| 18  | Client-side secrets               | Security       | Server-side only              |
| 19  | Unoptimized images                | Performance    | next/image                    |
| 20  | Missing memoization               | Performance    | useMemo / useCallback         |
| 21  | Loading all data                  | Performance    | Pagination                    |
| 22  | Modifying unrelated files         | Workflow       | Minimal change principle      |
| 23  | Deleting files to fix             | Safety         | Fix the bug, not the file     |
| 24  | Fabricating API docs              | Integrity      | Research official docs        |
| 25  | Skipping verification             | Quality        | tsc + eslint + test + build   |
| 26  | Infinite loops                    | Safety         | Termination conditions        |
| 27  | Magic numbers                     | Readability    | Named constants               |
| 28  | Empty catch blocks                | Reliability    | Handle or rethrow             |
| 29  | Circular dependencies             | Architecture   | DI pattern                    |
| 30  | `console.log` production          | Observability  | Structured logger (pino)      |

---

## Cấu trúc repo

```
ai-coding-standards/
├── CLAUDE.md                          # Claude AI rules (580 dòng)
├── .cursorrules                       # Cursor AI rules (442 dòng)
├── .clinerules                        # Claude Code CLI rules (437 dòng)
├── .windsurfrules                     # Windsurf AI rules (441 dòng)
├── .gitignore                         # Git ignore patterns
├── .editorconfig                      # Editor configuration
├── .nvmrc                             # Node.js version (20)
├── .npmrc                             # npm strict config
├── .prettierrc                        # Prettier formatting rules
├── .prettierignore                    # Prettier ignore patterns
├── eslint.config.mjs                  # ESLint flat config (123 dòng)
├── vitest.config.ts                   # Vitest config for repo tests
├── tsconfig.json                      # TypeScript project config
├── package.json                       # Dev dependencies & npm scripts
├── LICENSE                            # MIT License
├── .github/
│   ├── copilot-instructions.md        # GitHub Copilot rules (467 dòng)
│   └── workflows/
│       └── quality-check.yml          # CI/CD integrity check (7 jobs)
├── docs/
│   ├── RULES.md                       # Tổng hợp quy tắc (1087 dòng)
│   ├── ANTI-PATTERNS.md               # 30 anti-patterns (503 dòng)
│   ├── ARCHITECTURE.md                # Clean Architecture (809 dòng)
│   ├── SECURITY.md                    # OWASP Top 10 (503 dòng)
│   └── COMPARISON.md                  # Bảng so sánh chuyên sâu
├── scripts/
│   ├── setup.sh                       # Setup 1 lệnh (368 dòng)
│   └── validate.sh                    # 10 checks tự động (483 dòng)
├── configs/
│   ├── eslint/
│   │   ├── eslint.config.mjs           # ESLint strict template
│   │   └── eslint.config.nextjs.mjs    # Optional Next.js ESLint rules
│   ├── prettier/.prettierrc           # Prettier template
│   ├── prettier/.prettierignore       # Prettier ignore template
│   ├── typescript/tsconfig.base.json  # TypeScript strict base
│   ├── testing/vitest.config.ts       # Vitest config + 80% coverage
│   ├── testing/tests-setup.example.tsx # Test mocks (Next.js, React)
│   └── github/quality-check.yml       # CI/CD template cho target project
├── hooks/
│   ├── pre-commit                     # Block commit nếu có lỗi
│   └── pre-push                       # Block push nếu build fail
├── src/
│   ├── index.ts                       # Barrel exports
│   ├── lib/utils.ts                   # Utility functions (example)
│   └── types/index.ts                 # Domain types (example)
├── tests/
│   ├── unit/
│   │   ├── utils.test.ts              # Utils unit tests
│   │   └── exports.test.ts            # Barrel export tests
│   └── integration/
│       ├── repo-integrity.test.ts     # Repo structure tests
│       └── eslint-config.test.ts      # ESLint config integrity tests
└── mcp/
    ├── mcp-config.json                # MCP servers config
    └── tools/optional-mcp-tools.json   # Optional MCP tools
```

**Tổng cộng: 45 files, ~9,000+ dòng code và documentation**

---

## Tài liệu chuyên sâu

| File                    | Nội dung                    | Chi tiết                                                                                                                                                                                                 |
| ----------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/RULES.md`         | Bảng vàng quy tắc code      | 14 phần: Nguyên tắc cơ bản, TypeScript, React/Next.js, Styling, Database, API Design, Git, Testing, Bảo mật, Performance, Dependencies, Logging, i18n, Documentation                                     |
| `docs/ANTI-PATTERNS.md` | 30 anti-pattern bị cấm      | Mỗi pattern có code ví dụ sai + code đúng + giải thích. Phân loại: Type, Component, State, API, Database, Security, Performance, Workflow                                                                |
| `docs/ARCHITECTURE.md`  | Clean Architecture chuẩn    | 4 layers: Domain → Application → Infrastructure → Presentation. Kèm repository pattern, service pattern, error handling architecture, auth architecture                                                  |
| `docs/SECURITY.md`      | OWASP Top 10 implementation | Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration, Vulnerable Components, Authentication Failures. Kèm CSP, CORS, file upload security, rate limiting |
| `docs/COMPARISON.md`    | Bảng so sánh chuyên sâu     | So sánh chi tiết với các giải pháp khác, ROI analysis, case studies                                                                                                                                      |

---

## Scripts

```bash
npm run setup       # Copy rules + configs + hooks vào target project
npm run validate     # Chạy 10 checks tự động
npm run lint         # ESLint strict check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript compilation check
npm run format:check # Prettier format check
npm run format       # Prettier auto-format
npm run test         # Run tests (vitest)
npm run check:all    # Chạy TẤT CẢ checks
```

---

## Mapping: 29 vấn đề AI → Giải pháp

| #   | Vấn đề                  | Lớp phòng thủ | Giải pháp cụ thể                     |
| --- | ----------------------- | ------------- | ------------------------------------ |
| 1   | Miêu tả khác cài đặt    | Layer 1       | CLAUDE.md Section 7: 6-step workflow |
| 2   | Xóa nhầm thư mục/file   | Layer 2+1     | File Safety Rules + pre-commit hook  |
| 3   | Fix test không triệt để | Layer 3+6     | Testing rules + vitest config        |
| 4   | Vòng lặp vô hạn         | Layer 4+1     | ANTI-PATTERNS.md AP-027              |
| 5   | Code không chạy được    | Layer 2+3+4   | validate.sh + CI/CD gates            |
| 6   | Mock data quá nhiều     | Layer 1       | MSW requirement rule                 |
| 7   | Sửa chỗ nọ hỏng chỗ kia | Layer 1+2     | Minimal change principle             |
| 8   | Bố cục rời rạc          | Layer 1+6     | ARCHITECTURE.md Clean Architecture   |
| 9   | Giao diện xấu           | Layer 1       | UI/UX quality standards              |
| 10  | Cấu trúc phế            | Layer 1+6     | Mandatory directory structure        |
| 11  | Thuật toán chưa tối ưu  | Layer 4+5     | Performance budget checks            |
| 12  | Build quá nhỏ           | Layer 2       | Build size check trong pre-push      |
| 13  | Dependency xung đột     | Layer 5       | npm strict config                    |
| 14  | Màn hình nhấp nháy      | Layer 1       | Skeleton + loading states rule       |
| 15  | Bịa thông tin API       | Layer 1       | Research-before-code rule            |
| 16  | Mất kết nối             | Layer 1       | Error handling rules                 |
| 17  | Đi đường ngắn nhất      | Layer 1       | 6-step mandatory workflow            |
| 18  | Hiểu sai ý              | Layer 1       | UNDERSTAND step (đọc 3 lần)          |
| 19  | Không deep search       | Layer 1       | RESEARCH step (check docs)           |
| 20  | Bốc phét                | Layer 1       | No fabrication rule                  |
| 21  | Bảo mật kém             | Layer 1+3+6   | SECURITY.md + CI/CD audit            |
| 22  | Code degraded           | Layer 2+3     | Git hooks + CI/CD                    |
| 23  | Thiếu test              | Layer 1+4     | 80% coverage + vitest                |
| 24  | Thiếu công cụ           | Layer 5       | Full config toolkit                  |
| 25  | Lãng phí token          | Layer 1       | Efficient workflow                   |
| 26  | Không khuôn khổ         | Layer 1       | Strict rule framework                |
| 27  | Thiếu skill agent       | Layer 1+6     | Comprehensive docs                   |
| 28  | Unversioned API         | Layer 1+4     | /api/v1/ enforcement                 |
| 29  | Không tuân thủ chuẩn    | TẤT CẢ        | 6 lớp phòng thủ tự động              |

---

## Công nghệ

| Category    | Công cụ      | Phiên bản     | Mục đích                                 |
| ----------- | ------------ | ------------- | ---------------------------------------- |
| Language    | TypeScript   | ^5.8          | Strict typing + noUncheckedIndexedAccess |
| Framework   | Next.js      | ^15.x         | App Router + Server Components           |
| Linting     | ESLint       | ^9.18         | 20+ strict rules, flat config            |
| Formatting  | Prettier     | ^3.4          | Consistent code style                    |
| Testing     | Vitest       | ^3.1          | Unit + integration tests                 |
| E2E Testing | Playwright   | (optional)    | Critical flow testing                    |
| Database    | Prisma       | (optional)    | Type-safe database queries               |
| Validation  | Zod          | (recommended) | Runtime type validation                  |
| UI          | Tailwind CSS | ^4.x          | Utility-first CSS                        |
| Components  | shadcn/ui    | (recommended) | Accessible component library             |
| State       | Zustand      | (recommended) | Lightweight state management             |
| Auth        | NextAuth     | ^5.x          | Authentication                           |

---

## License

MIT License - Sử dụng tự do cho mọi project.

---

> **Repo này là living document. Clone, setup 1 lệnh, 6 lớp phòng thủ tự động ép AI Agent tuân thủ coding standards.**
>
> GitHub: [ntd25022006q/ai-coding-standards](https://github.com/ntd25022006q/ai-coding-standards)
