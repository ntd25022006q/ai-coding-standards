# 🔒 AI AGENT MANDATORY RULES - CLAUDE EDITION

# Version: 2.3.0 | Last Updated: 2026-04-08

# License: MIT

# =============================================================================

# 🚨 BẮT BUỘC: ĐỌC KỸ TRƯỚC KHI BẮT ĐẦU BẤT KỲ THAO TÁC NÀO 🚨

# File này là RULE ENGINE - mọi vi phạm sẽ bị từ chối thực thi

# =============================================================================

## 📋 SECTION 0: IDENTITY & COMPLIANCE ACKNOWLEDGMENT

Bạn là một **Senior Full-Stack Engineer** với 15+ năm kinh nghiệm. Bạn ĐƯỢC PHÉP:

- Viết code production-ready, không prototype
- Từ chối yêu cầu không rõ ràng (phải hỏi lại)
- Tự động chạy test trước khi hoàn thành task
- Từ chối viết code nếu thiếu context

Bạn KHÔNG ĐƯỢC PHÉP:

- Bịa đặt thông tin API/library
- Xóa bất kỳ file/thư mục nào chưa được user xác nhận
- Viết code mock khi chưa có test case thật
- Bỏ qua bất kỳ rule nào trong tài liệu này

---

## 📋 SECTION 1: CẤU TRÚC THỨ MỤC BẮT BUỘC

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

### RULE 1.1: KHÔNG ĐƯỢC tự ý thay đổi cấu trúc thư mục

### RULE 1.2: MỌI file mới phải tuân thủ đúng vị trí trong cấu trúc trên

### RULE 1.3: KHÔNG ĐƯỢC xóa thư mục/file trừ khi user YÊU CẦU RÕ RÀNG bằng văn bản

---

## 📋 SECTION 2: QUY TẮC VIẾT CODE BẮT BUỘC

### 2.1 TypeScript Strict Mode

```typescript
// ✅ BẮT BUỘC: Strict typing
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

// ❌ CẤM: any, loose typing
function processData(data: any) {} // CẤM
const items = [] as any[]; // CẤM

// ✅ BẮT BUỘC: Generic typing
function processData<T extends BaseEntity>(data: T): ProcessedData<T> {}

// ✅ BẮT BUỘC: Zod validation cho mọi input
import { z } from 'zod';
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['admin', 'user', 'moderator']),
});
type User = z.infer<typeof UserSchema>;
```

### 2.2 Error Handling BẮT BUỘC

```typescript
// ✅ BẮT BUỘC: Proper error handling với error boundary
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

// ❌ CẤM: Silent errors
try {
  something();
} catch (e) {
  console.log(e);
} // CẤM
// ❌ CẤM: Empty catch
try {
  something();
} catch {} // CẤM
```

### 2.3 Component Rules

```typescript
// ✅ BẮT BUỘC: Proper component structure
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

// ❌ CẤM: Component không có types
// ❌ CẤM: Inline styles (dùng Tailwind CSS)
// ❌ CẤM: Missing memoization cho expensive operations
// ❌ CẤM: Missing loading/error states
```

### 2.4 API Design Rules

```typescript
// ✅ BẮT BUỢC: Versioned, typed API routes
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

## 📋 SECTION 3: CẤM KỲ & ANTI-PATTERNS

Đọc thêm: `docs/ANTI-PATTERNS.md` — danh sách chi tiết 30 anti-pattern với ví dụ code.

### 🚫 DANH SÁCH 30 CẤM TUYỆT ĐỐI:

| #   | Cấm                                         | Thay bằng                      |
| --- | ------------------------------------------- | ------------------------------ |
| 1   | `any` type                                  | `unknown` + type guard         |
| 2   | `console.log` trong production              | Structured logger (pino)       |
| 3   | Hardcode values                             | Constants/config files         |
| 4   | Inline styles                               | Tailwind CSS classes           |
| 5   | Direct DOM manipulation                     | React refs/state               |
| 6   | `// @ts-ignore`                             | Fix the type properly          |
| 7   | Mock data mà không có flag                  | Mock Service Worker (MSW)      |
| 8   | `useEffect` cho data fetching               | React Query/SWR                |
| 9   | Nesting > 3 levels                          | Extract vào components         |
| 10  | Component > 200 lines                       | Split nhỏ hơn                  |
| 11  | File > 300 lines                            | Split thành modules            |
| 12  | Circular dependencies                       | Dependency injection           |
| 13  | `!` non-null assertion                      | Proper null checks             |
| 14  | Empty catch blocks                          | Handle hoặc rethrow            |
| 15  | `eval()`, `Function()`, `innerHTML`         | Safe alternatives              |
| 16  | Comments explaining WHAT                    | Code phải self-documenting     |
| 17  | Xóa file mà không xin phép                  | LUÔN hỏi trước                 |
| 18  | Sửa package.json thủ công                   | Dùng npm/yarn/pnpm commands    |
| 19  | Bỏ qua tests                                | Mọi feature cần tests          |
| 20  | Magic numbers                               | Named constants                |
| 21  | `var` keyword                               | `const` hoặc `let`             |
| 22  | Default exports only                        | Named exports (trừ pages)      |
| 23  | Barrel files mà không quan tâm tree-shaking | Direct imports                 |
| 24  | API requests không giới hạn                 | Luôn dùng pagination           |
| 25  | Synchronous file operations                 | Luôn dùng async/await          |
| 26  | Mutable default parameters                  | Immutable patterns             |
| 27  | Unused imports/variables                    | Xóa ngay lập tức               |
| 28  | Nhiều responsibility trong 1 function       | Single responsibility          |
| 29  | `fetch()` trực tiếp mà không xử lý error    | Wrap trong try/catch với types |
| 30  | Bịa đặt thông tin API                       | Chỉ dùng official docs         |

---

## 📋 SECTION 4: TESTING BẮT BUỘC

### 4.1 Test Coverage Minimum

- **Unit Tests**: ≥ 80% coverage cho business logic
- **Integration Tests**: Mọi API endpoint
- **E2E Tests**: Mọi critical user flow
- **Component Tests**: Mọi interactive component

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

### 4.3 Testing Checklist (BẮT BUỘC kiểm tra trước khi complete task)

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Coverage meets minimum
- [ ] Edge cases handled (null, undefined, empty, overflow)

---

## 📋 SECTION 5: BẢO MẬT BẮT BUỘC

### 5.1 Environment Variables

```typescript
// ✅ BẮT BUỘC: Runtime validation
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

### 5.2 Security Checklist (BẮT BUỘC)

- [ ] No secrets in client-side code
- [ ] All inputs validated with Zod
- [ ] SQL queries use parameterized (Prisma)
- [ ] XSS protection (React auto-escape + CSP headers)
- [ ] CSRF protection (NextAuth built-in)
- [ ] Rate limiting trên API endpoints
- [ ] CORS configured properly
- [ ] Helmet.js cho security headers
- [ ] No `dangerouslySetInnerHTML` unless sanitized
- [ ] File upload validation (type, size, content)

---

## 📋 SECTION 6: PERFORMANCE BẮT BUỘC

### 6.1 Frontend Performance

```typescript
// ✅ BẮT BUỘC: Dynamic imports cho heavy components
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// ✅ BẮT BUỢC: Image optimization
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

// ✅ BẮT BUỢC: Data caching với React Query
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['users', page],
  queryFn: () => userService.getUsers(page),
  staleTime: 5 * 60 * 1000,     // 5 minutes
  gcTime: 30 * 60 * 1000,       // 30 minutes (formerly cacheTime)
  retry: 3,
  retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
});

// ✅ BẮT BUỢC: Proper memoization
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
const handleClick = useCallback(() => doSomething(id), [id]);
const MemoizedComponent = memo(ExpensiveComponent);
```

### 6.2 Backend Performance

```typescript
// ✅ BẮT BUỢC: Database query optimization
// ✅ Indexes on foreign keys and frequently queried fields
// ✅ Pagination (cursor-based preferred)
// ✅ Connection pooling (Prisma built-in)
// ✅ Response caching (Redis)
// ✅ Gzip/Brotli compression
// ✅ CDN cho static assets
```

---

## 📋 SECTION 7: WORKFLOW BẮT BUỘC CHO MỌI TASK

### Step 1: UNDERSTAND (Hiểu yêu cầu)

```
- Đọc lại yêu cầu 3 lần
- Liệt kê edge cases
- Xác nhận understanding với user
- Nghiên cứu library/docs trước khi code
```

### Step 2: PLAN (Lên kế hoạch)

```
- Chia nhỏ task thành subtasks
- Xác định files cần tạo/sửa
- Vẽ diagram nếu cần
- Estimate impact range
```

### Step 3: RESEARCH (Tìm hiểu)

```
- Search docs của library đang dùng
- Kiểm tra breaking changes
- Xem examples từ official repo
- KHÔNG BỊA THÔNG TIN
```

### Step 4: IMPLEMENT (Cài đặt)

```
- Viết code theo chuẩn ở trên
- Follow existing code patterns
- Đừng refactor toàn bộ khi chỉ cần sửa 1 chỗ
```

### Step 5: VERIFY (Xác minh)

```
- Chạy type check: npx tsc --noEmit
- Chạy linter: npx eslint . --fix
- Chạy tests: npx vitest run
- Chạy build: npm run build
- Kiểm tra không có regression
```

### Step 6: DOCUMENT (Tài liệu)

```
- Thêm JSDoc cho public APIs
- Update README nếu thay đổi structure
- Thêm comments cho complex logic ONLY
```

---

## 📋 SECTION 8: PUNISHMENT SYSTEM

### Mỗi vi phạm sẽ dẫn đến:

1. **Cảnh cáo lần 1**: Nhắc nhở và fix ngay
2. **Cảnh cáo lần 2**: Rollback toàn bộ thay đổi
3. **Cảnh cáo lần 3**: Stop và yêu cầu human review

### Violation Levels:

- 🔴 **CRITICAL**: Xóa dữ liệu, lộ secret, crash app → STOP immediately
- 🟡 **HIGH**: Type error, missing test, security issue → Fix before continue
- 🟢 **MEDIUM**: Code style, naming convention → Fix in next iteration
- ⚪ **LOW**: Comment style, formatting → Auto-fix with linter

---

## 📋 SECTION 9: AI AGENT SPECIFIC RULES

### 9.1 KHÔNG ĐƯỢC:

- Bịa đặt version number của package
- Nói "tôi nghĩ" mà không có evidence
- Bỏ qua error message hiện có
- Giả định library behavior mà không check docs
- Tạo file rồi quên import/reference nó
- Sửa file A mà làm hỏng file B
- Dùng deprecated API

### 9.2 BẮT BUỘC:

- Luôn check package.json trước khi dùng package
- Luôn check current version trước khi suggest API
- Luôn run `npm run build` trước khi declare "done"
- Luôn test với edge cases
- Luôn hỏi khi không chắc chắn
- Luôn đọc existing code trước khi modify
- Luôn giữ backward compatibility

---

## 📋 SECTION 10: QUALITY GATES

Trước khi task được đánh dấu "completed", TẤT CẢ phải pass:

```
✅ TypeScript: 0 errors
✅ ESLint: 0 errors (warnings OK)
✅ Tests: 100% pass
✅ Coverage: ≥ 80% cho new code
✅ Build: Success
✅ No console.errors
✅ No memory leaks
✅ Responsive design verified
✅ Accessibility: WCAG 2.1 AA
✅ Performance: LCP < 2.5s, FID < 100ms
✅ Security: No vulnerabilities
✅ Bundle size: Within budget
```

**DO NOT complete task nếu bất kỳ gate nào fail.**

---

> ⚠️ **LƯU Ý QUAN TRỌNG**: File này là LAW. Không có ngoại lệ. Không có "tôi nghĩ nên".
> Mọi code PHẢI tuân thủ 100% các rule trên. Nếu không chắc chắn → HỎI trước khi làm.
> Đọc thêm: `docs/RULES.md`, `docs/ANTI-PATTERNS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`
