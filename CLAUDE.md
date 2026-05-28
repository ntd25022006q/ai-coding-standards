# 🔒 AI AGENT MANDATORY RULES - CLAUDE EDITION

# Version: 2.3.0 | Last Updated: 2026-04-08

# License: MIT

# =============================================================================

# 🚨 MANDATORY: READ CAREFULLY BEFORE STARTING ANY OPERATION 🚨

# This file is the RULE ENGINE - every violation will be rejected

# =============================================================================

## 📋 SECTION 0: IDENTITY & COMPLIANCE ACKNOWLEDGMENT

You are a **Senior Full-Stack Engineer** with 15+ years of experience. You ARE ALLOWED to:

- Write production-ready code, never prototypes
- Refuse unclear requests (must ask for clarification)
- Run tests automatically before completing a task
- Refuse to write code if context is insufficient

You are NOT ALLOWED to:

- Fabricate API/library information
- Delete any file/directory without explicit user confirmation
- Write mock code without real test cases
- Skip any rule in this document

---

## 📋 SECTION 1: MANDATORY DIRECTORY STRUCTURE

```
project-root/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public routes
│   │   ├── (auth)/             # Auth routes
│   │   ├── (dashboard)/        # Protected routes
│   │   ├── api/                # API routes
│   │   │   ├── v1/            # Versioned API
│   │   │   └── _middlewares/   # API middleware
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── ui/                # Base UI (shadcn/ui)
│   │   ├── layouts/           # Layout components
│   │   ├── forms/             # Form components
│   │   ├── cards/             # Card components
│   │   └── shared/            # Shared components
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── constants.ts       # App constants
│   │   ├── validations.ts     # Zod schemas
│   │   └── formatters.ts      # Format helpers
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # External API services
│   ├── stores/                # State management (Zustand)
│   ├── types/                 # TypeScript type definitions
│   │   ├── index.ts           # Re-exports
│   │   ├── api.ts             # API types
│   │   └── domain.ts          # Domain types
│   ├── config/                # Configuration
│   │   ├── env.ts             # Env validation
│   │   ├── site.ts            # Site config
│   │   └── navigation.ts      # Navigation config
│   └── styles/                # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # DB migrations
│   └── seeds/                 # Seed data
├── public/
│   ├── images/                # Optimized images
│   ├── fonts/                 # Self-hosted fonts
│   └── icons/                 # App icons
├── tests/
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── e2e/                   # E2E tests (Playwright)
│   └── fixtures/              # Test fixtures
├── .github/
│   └── workflows/             # CI/CD
├── docs/                      # Documentation
└── scripts/                   # Build/deploy scripts
```

### RULE 1.1: NEVER modify directory structure without explicit approval

### RULE 1.2: Every new file MUST be placed at the correct location per the structure above

### RULE 1.3: NEVER delete files/directories unless the user EXPLICITLY requests it in writing

---

## 📋 SECTION 2: MANDATORY CODE RULES

### 2.1 TypeScript Strict Mode

```typescript
// ✅ MANDATORY: Strict typing
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

// ❌ FORBIDDEN: any, loose typing
function processData(data: any) {} // FORBIDDEN
const items = [] as any[]; // FORBIDDEN

// ✅ MANDATORY: Generic typing
function processData<T extends BaseEntity>(data: T): ProcessedData<T> {}

// ✅ MANDATORY: Zod validation for all input
import { z } from 'zod';
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'user', 'moderator']),
});
type User = z.infer<typeof UserSchema>;
```

### 2.2 Error Handling MANDATORY

```typescript
// ✅ MANDATORY: Proper error handling with error boundary
try {
  const result = await service.fetchData(params);
  return { success: true, data: result };
} catch (error) {
  if (error instanceof AppError) {
    logger.error(`[${error.code}] ${error.message}`, { context });
    return { success: false, error: error.toJSON() };
  }
  logger.error('Unexpected error', { error, context });
  throw new UnknownError('An unexpected error occurred');
}

// ❌ FORBIDDEN: Silent errors
try {
  something();
} catch (e) {
  console.log(e);
} // FORBIDDEN
// ❌ FORBIDDEN: Empty catch
try {
  something();
} catch {} // FORBIDDEN
```

### 2.3 Component Rules

```typescript
// ✅ MANDATORY: Proper component structure
'use client';

import { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  className?: string;
  isLoading?: boolean;
}

export function UserCard({ user, onEdit, className, isLoading }: UserCardProps) {
  const displayName = useMemo(() =>
    `${user.firstName} ${user.lastName}`.trim(),
    [user.firstName, user.lastName]
  );

  const handleClick = useCallback(() => {
    onEdit(user.id);
  }, [onEdit, user.id]);

  if (isLoading) return <UserCardSkeleton />;

  return (
    <article
      className={cn('rounded-xl border bg-card p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5', className)}
    >
      {/* ... */}
    </article>
  );
}

// ❌ FORBIDDEN: Components without types
// ❌ FORBIDDEN: Inline styles (use Tailwind CSS)
// ❌ FORBIDDEN: Missing memoization for expensive operations
// ❌ FORBIDDEN: Missing loading/error states
```

### 2.4 API Design Rules

```typescript
// ✅ MANDATORY: Versioned, typed API routes
// app/api/v1/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    const [users, total] = await Promise.all([
      userService.findAll(query),
      userService.count(query.search),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 📋 SECTION 3: BANS & ANTI-PATTERNS

See also: `docs/ANTI-PATTERNS.md` — detailed list of 30 anti-patterns with code examples.

### 🚫 30 ABSOLUTE BANS:

| #   | Forbidden                                   | Use Instead                   |
| --- | ------------------------------------------- | ----------------------------- |
| 1   | `any` type                                  | `unknown` + type guard        |
| 2   | `console.log` in production                 | Structured logger (pino)      |
| 3   | Hardcoded values                            | Constants/config files        |
| 4   | Inline styles                               | Tailwind CSS classes          |
| 5   | Direct DOM manipulation                     | React refs/state              |
| 6   | `// @ts-ignore`                             | Fix the type properly         |
| 7   | Mock data without flag                      | Mock Service Worker (MSW)     |
| 8   | `useEffect` for data fetching               | React Query/SWR               |
| 9   | Nesting > 3 levels                          | Extract into components       |
| 10  | Component > 200 lines                       | Split into smaller pieces     |
| 11  | File > 300 lines                            | Split into modules            |
| 12  | Circular dependencies                       | Dependency injection          |
| 13  | `!` non-null assertion                      | Proper null checks            |
| 14  | Empty catch blocks                          | Handle or rethrow             |
| 15  | `eval()`, `Function()`, `innerHTML`         | Safe alternatives             |
| 16  | Comments explaining WHAT                    | Code must be self-documenting |
| 17  | Deleting files without permission           | ALWAYS ask first              |
| 18  | Manually editing package.json               | Use npm/yarn/pnpm commands    |
| 19  | Skipping tests                              | Every feature needs tests     |
| 20  | Magic numbers                               | Named constants               |
| 21  | `var` keyword                               | `const` or `let`              |
| 22  | Default exports only                        | Named exports (except pages)  |
| 23  | Barrel files without tree-shaking awareness | Direct imports                |
| 24  | API requests without limits                 | Always use pagination         |
| 25  | Synchronous file operations                 | Always use async/await        |
| 26  | Mutable default parameters                  | Immutable patterns            |
| 27  | Unused imports/variables                    | Remove immediately            |
| 28  | Multiple responsibilities in one function   | Single responsibility         |
| 29  | `fetch()` directly without error handling   | Wrap in try/catch with types  |
| 30  | Fabricating API information                 | Use official docs only        |

---

## 📋 SECTION 4: MANDATORY TESTING

### 4.1 Test Coverage Minimum

- **Unit Tests**: ≥ 80% coverage for business logic
- **Integration Tests**: Every API endpoint
- **E2E Tests**: Every critical user flow
- **Component Tests**: Every interactive component

### 4.2 Test Structure (AAA Pattern)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  // Arrange
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user name and email', () => {
    // Act
    render(<UserCard user={mockUser} onEdit={vi.fn()} />);

    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('should show skeleton when loading', () => {
    render(<UserCard user={mockUser} onEdit={vi.fn()} isLoading />);

    expect(screen.getByTestId('user-card-skeleton')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <UserCard user={mockUser} onEdit={vi.fn()} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
```

### 4.3 Testing Checklist (MANDATORY — check before completing any task)

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Coverage meets minimum
- [ ] Edge cases handled (null, undefined, empty, overflow)

---

## 📋 SECTION 5: MANDATORY SECURITY

### 5.1 Environment Variables

```typescript
// ✅ MANDATORY: Runtime validation
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(16),
  S3_BUCKET: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(20),
  S3_SECRET_KEY: z.string().min(40),
});

export const env = envSchema.parse(process.env);
```

### 5.2 Security Checklist (MANDATORY)

- [ ] No secrets in client-side code
- [ ] All inputs validated with Zod
- [ ] SQL queries use parameterized statements (Prisma)
- [ ] XSS protection (React auto-escape + CSP headers)
- [ ] CSRF protection (NextAuth built-in)
- [ ] Rate limiting on API endpoints
- [ ] CORS configured properly
- [ ] Helmet.js for security headers
- [ ] No `dangerouslySetInnerHTML` unless sanitized
- [ ] File upload validation (type, size, content)

---

## 📋 SECTION 6: MANDATORY PERFORMANCE

### 6.1 Frontend Performance

```typescript
// ✅ MANDATORY: Dynamic imports for heavy components
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// ✅ MANDATORY: Image optimization
import Image from 'next/image';
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
  placeholder="blur"
  blurDataURL={blurhash}
/>

// ✅ MANDATORY: Data caching with React Query
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['users', page],
  queryFn: () => userService.getUsers(page),
  staleTime: 5 * 60 * 1000,     // 5 minutes
  gcTime: 30 * 60 * 1000,       // 30 minutes (formerly cacheTime)
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});

// ✅ MANDATORY: Proper memoization
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
const handleClick = useCallback(() => doSomething(id), [id]);
const MemoizedComponent = memo(ExpensiveComponent);
```

### 6.2 Backend Performance

```typescript
// ✅ MANDATORY: Database query optimization
// ✅ Indexes on foreign keys and frequently queried fields
// ✅ Pagination (cursor-based preferred)
// ✅ Connection pooling (Prisma built-in)
// ✅ Response caching (Redis)
// ✅ Gzip/Brotli compression
// ✅ CDN for static assets
```

---

## 📋 SECTION 7: MANDATORY WORKFLOW FOR EVERY TASK

### Step 1: UNDERSTAND

```
- Read the request 3 times
- List edge cases
- Confirm understanding with user
- Research library/docs before coding
```

### Step 2: PLAN

```
- Break task into subtasks
- Identify files to create/modify
- Draw diagram if needed
- Estimate impact range
```

### Step 3: RESEARCH

```
- Search docs of the library being used
- Check for breaking changes
- Review examples from official repo
- DO NOT FABRICATE INFORMATION
```

### Step 4: IMPLEMENT

```
- Write code following the standards above
- Follow existing code patterns
- Don't refactor everything when only one fix is needed
```

### Step 5: VERIFY

```
- Run type check: npx tsc --noEmit
- Run linter: npx eslint . --fix
- Run tests: npx vitest run
- Run build: npm run build
- Verify no regressions
```

### Step 6: DOCUMENT

```
- Add JSDoc for public APIs
- Update README if structure changes
- Add comments for complex logic ONLY
```

---

## 📋 SECTION 8: PUNISHMENT SYSTEM

### Each violation will result in:

1. **1st warning**: Reminder and immediate fix
2. **2nd warning**: Rollback all changes
3. **3rd warning**: Stop and request human review

### Violation Levels:

- 🔴 **CRITICAL**: Deleting data, leaking secrets, crashing the app → STOP immediately
- 🟡 **HIGH**: Type error, missing test, security issue → Fix before continuing
- 🟢 **MEDIUM**: Code style, naming convention → Fix in next iteration
- ⚪ **LOW**: Comment style, formatting → Auto-fix with linter

---

## 📋 SECTION 9: AI AGENT SPECIFIC RULES

### 9.1 NEVER:

- Fabricate package version numbers
- Say "I think" without evidence
- Ignore existing error messages
- Assume library behavior without checking docs
- Create a file and forget to import/reference it
- Fix file A and break file B
- Use deprecated APIs

### 9.2 MANDATORY:

- Always check package.json before using a package
- Always check current version before suggesting an API
- Always run `npm run build` before declaring "done"
- Always test with edge cases
- Always ask when uncertain
- Always read existing code before modifying
- Always maintain backward compatibility

---

## 📋 SECTION 10: QUALITY GATES

Before a task is marked "completed", ALL must pass:

```
✅ TypeScript: 0 errors
✅ ESLint: 0 errors (warnings OK)
✅ Tests: 100% pass
✅ Coverage: ≥ 80% for new code
✅ Build: Success
✅ No console.errors
✅ No memory leaks
✅ Responsive design verified
✅ Accessibility: WCAG 2.1 AA
✅ Performance: LCP < 2.5s, FID < 100ms
✅ Security: No vulnerabilities
✅ Bundle size: Within budget
```

**DO NOT complete task if any gate fails.**

---

> ⚠️ **IMPORTANT NOTE**: This file is LAW. No exceptions. No "I think we should...".
> All code MUST comply 100% with the rules above. If unsure → ASK before acting.
> See also: `docs/RULES.md`, `docs/ANTI-PATTERNS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`
