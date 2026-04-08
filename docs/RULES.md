# ============================================

# 🔒 TỔNG HỢP BẢNG VÀNG QUY TẮC CODE

# Version: 2.3.0 | 2026-04-08

# ============================================

# Đây là tài liệu CHÍNH chứa TẤT CẢ quy tắc

# AI Agent phải tuân thủ khi làm việc trong project

# ============================================

## PHẦN 1: NGUYÊN TẮC CƠ BẢN

### 1.1 Nguyên tắc số 1: KHÔNG BỊA THÔNG TIN

Mọi thông tin về API, library, framework PHẢI được xác minh từ:

- Official documentation
- Official GitHub repository
- Published npm packages (kiểm tra version thật)

**Hình phạt**: Nếu bịa thông tin → Rollback toàn bộ code + báo cáo cho user

### 1.2 Nguyên tắc số 2: KHÔNG XÓA DỮ LIỆU

KHÔNG ĐƯỢC xóa bất kỳ file, thư mục nào trừ khi:

1. User xác nhận bằng văn bản rõ ràng: "Xóa file/folder [tên cụ thể]"
2. Đã liệt kê TẤT CẢ files phụ thuộc
3. Đã backup nếu cần thiết

**Hình phạt**: Nếu xóa nhầm → Dừng ngay, báo cáo, khôi phục

### 1.3 Nguyên tắc số 3: CODE ĐÚNG NGAY LẦN ĐẦU

Mỗi thay đổi phải:

- Được test đầy đủ trước khi báo "done"
- Build thành công
- Không gây regression
- Tuân thủ TẤT CẢ quy tắc trong tài liệu này

### 1.4 Nguyên tắc số 4: HIỂU TRƯỚC KHI LÀM

1. Đọc yêu cầu 3 lần
2. Đọc code hiện tại liên quan
3. Nghiên cứu docs nếu cần
4. Lên kế hoạch thay đổi
5. MỚI bắt đầu code

### 1.5 Nguyên tắc số 5: THAY ĐỔI TỐI THIỂU

Khi sửa bug / thêm feature:

- Chỉ thay đổi những file CẦN thiết
- KHÔNG refactor toàn bộ codebase
- KHÔNG thay đổi format/code style của file không liên quan
- GIỮ backward compatibility

---

## PHẦN 2: QUY TẮC TYPESCRIPT

### 2.1 Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": false
  }
}
```

### 2.2 Type Rules

| Quy tắc                  | Bắt buộc | Chi tiết                    |
| ------------------------ | -------- | --------------------------- |
| Không dùng `any`         | ✅       | Dùng `unknown` + type guard |
| Không dùng `@ts-ignore`  | ✅       | Fix type properly           |
| Không dùng `!` assertion | ✅       | Dùng proper null check      |
| Explicit return type     | ✅       | Mọi function phải có        |
| Interface cho props      | ✅       | Mọi component props         |
| Zod validation           | ✅       | Mọi external input          |
| Branded types            | ⚡       | Cho ID, email, etc. khi cần |

### 2.3 Naming Conventions

| Loại             | Convention                 | Ví dụ               |
| ---------------- | -------------------------- | ------------------- |
| Component        | PascalCase                 | `UserCard.tsx`      |
| Hook             | camelCase với `use` prefix | `useAuth.ts`        |
| Utility function | camelCase                  | `formatDate()`      |
| Constant         | SCREAMING_SNAKE_CASE       | `MAX_RETRY_COUNT`   |
| Type/Interface   | PascalCase                 | `UserData`          |
| Enum             | PascalCase                 | `UserRole`          |
| File (component) | PascalCase                 | `Button.tsx`        |
| File (util)      | camelCase                  | `formatDate.ts`     |
| File (test)      | camelCase + .test          | `userCard.test.tsx` |
| Directory        | kebab-case                 | `user-profile/`     |

---

## PHẦN 3: QUY TẮC REACT / NEXT.JS

### 3.1 Component Structure

```typescript
// Template chuẩn cho một component:
'use client'; // CHỈ khi cần: event handlers, hooks, browser APIs

import { memo, useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'next-intl';

// 1. Types (luôn ở đầu)
interface MyComponentProps {
  /** Description */
  readonly title: string;
  readonly onAction: (id: string) => Promise<void>;
  readonly variant?: 'primary' | 'secondary';
  readonly className?: string;
  readonly children?: React.ReactNode;
}

// 2. Component (memo cho expensive components)
export const MyComponent = memo(function MyComponent({
  title,
  onAction,
  variant = 'primary',
  className,
  children,
}: MyComponentProps) {
  // 3. Hooks
  const [isLoading, setIsLoading] = useState(false);

  // 4. Memos
  const displayTitle = useMemo(() => title.trim(), [title]);

  // 5. Callbacks
  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAction('default-id');
    } catch (error) {
      // Handle error properly
    } finally {
      setIsLoading(false);
    }
  }, [onAction]);

  // 6. Derived state
  const isDisabled = isLoading;

  // 7. Early returns (loading, error, empty)
  if (isLoading) return <MyComponentSkeleton />;

  // 8. Render
  return (
    <div className={cn(
      'rounded-lg border p-4',
      variant === 'primary' && 'bg-primary text-primary-foreground',
      className
    )}>
      <h3>{displayTitle}</h3>
      {children}
    </div>
  );
});
```

### 3.2 Server vs Client Components

| Server Component (default)  | Client Component ('use client')          |
| --------------------------- | ---------------------------------------- |
| Data fetching trực tiếp     | Event handlers (onClick, onChange)       |
| Access database trực tiếp   | useState, useEffect, useReducer          |
| Server-only secrets         | Browser APIs (localStorage, geolocation) |
| Keep sensitive logic server | Custom hooks with state                  |
| Better performance          | Interactive UI elements                  |

### 3.3 Data Fetching

```typescript
// ✅ ĐÚNG: React Query với Server Actions
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUsers(page: number) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => getUsersAction(page),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// ❌ SAI: useEffect cho data fetching
useEffect(() => {
  fetch('/api/users')
    .then((r) => r.json())
    .then(setUsers);
}, []); // CẤM ĐỘI VỚI MỌI TRƯỜNG HỢP
```

### 3.4 State Management

```typescript
// Zustand store pattern:
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isAuthenticated: false,

        login: async (credentials) => {
          const user = await authService.login(credentials);
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          });
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
          });
        },

        setUser: (user) => {
          set((state) => {
            state.user = user;
          });
        },
      })),
      { name: 'auth-storage' },
    ),
    { name: 'AuthStore' },
  ),
);
```

---

## PHẦN 4: QUY TẮC STYLING & UI/UX

### 4.1 Tailwind CSS Rules

```typescript
// ✅ ĐÚNG: Tailwind classes
<div className="flex items-center justify-between gap-4 rounded-xl bg-card p-6 shadow-sm border border-border">

// ✅ ĐÚNG: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// ✅ ĐÚNG: Dark mode support (đã built-in với shadcn/ui)
<div className="bg-background text-foreground dark:bg-[#0a0a0a]">

// ✅ ĐÚNG: Animation với CSS transitions (Tailwind)
<div
  className="opacity-0 translate-y-5 animate-in fade-in slide-in-from-bottom-5 duration-300"
>

// ❌ SAI: Inline styles
<div style={{ display: 'flex', color: 'red' }}>  // CẤM

// ❌ SAI: CSS modules (trừ trường hợp đặc biệt)
import styles from './Component.module.css';  // TRÁNH
```

### 4.2 UI Quality Standards

- **Typography**: Dùng next/font (Geist/Inter) - KHÔNG dùng system fonts
- **Spacing**: Tuân thủ 4px grid (gap-1, gap-2, gap-4, gap-6...)
- **Colors**: Dùng CSS variables từ shadcn/ui theme
- **Shadows**: Dùng predefined shadow classes (shadow-sm, shadow-md...)
- **Border radius**: Consistent (rounded-lg cho cards, rounded-full cho avatars)
- **Transitions**: Smooth 150-300ms ease transitions
- **Responsive**: Mobile-first, test tại 375px, 768px, 1024px, 1440px
- **Accessibility**: aria-labels, semantic HTML, keyboard navigation

### 4.3 Design Tokens

```css
:root {
  /* Spacing scale */
  --spacing-xs: 0.25rem; /* 4px */
  --spacing-sm: 0.5rem; /* 8px */
  --spacing-md: 1rem; /* 16px */
  --spacing-lg: 1.5rem; /* 24px */
  --spacing-xl: 2rem; /* 32px */
  --spacing-2xl: 3rem; /* 48px */

  /* Border radius */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}
```

---

## PHẦN 5: QUY TẮC DATABASE (PRISMA)

### 5.1 Schema Design

```prisma
// ✅ ĐÚNG: Proper schema design
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)

  // Relations
  accounts      Account[]
  sessions      Session[]
  posts         Post[]

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Indexes
  @@index([email])
  @@index([role])
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

### 5.2 Query Rules

```typescript
// ✅ ĐÚNG: Proper Prisma queries với error handling
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // KHÔNG select password hash
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error: ${error.code}`, { id });
      throw new DatabaseError('Failed to fetch user');
    }
    throw error;
  }
}

// ✅ ĐÚNG: Paginated query
export async function getUsers(params: PaginationParams) {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    }),
    prisma.user.count({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
    }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

---

## PHẦN 6: QUY TẮC API DESIGN

### 6.1 RESTful API Standards

```
GET    /api/v1/users          → List users (paginated)
GET    /api/v1/users/:id      → Get user by ID
POST   /api/v1/users          → Create user
PUT    /api/v1/users/:id      → Update user (full)
PATCH  /api/v1/users/:id      → Update user (partial)
DELETE /api/v1/users/:id      → Delete user

# Nested resources
GET    /api/v1/users/:id/posts     → User's posts
POST   /api/v1/users/:id/posts     → Create post for user

# Actions
POST   /api/v1/users/:id/activate  → Activate user
POST   /api/v1/auth/login          → Login
POST   /api/v1/auth/logout         → Logout
POST   /api/v1/auth/refresh        → Refresh token
```

### 6.2 Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}

// List response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 6.3 HTTP Status Codes

| Code | Usage                             |
| ---- | --------------------------------- |
| 200  | Success (GET, PUT, PATCH, DELETE) |
| 201  | Created (POST)                    |
| 204  | No Content (successful DELETE)    |
| 400  | Bad Request (validation error)    |
| 401  | Unauthorized                      |
| 403  | Forbidden                         |
| 404  | Not Found                         |
| 409  | Conflict                          |
| 422  | Unprocessable Entity              |
| 429  | Too Many Requests (rate limited)  |
| 500  | Internal Server Error             |

---

## PHẦN 7: QUY TẮC GIT & VERSION CONTROL

### 7.1 Branch Strategy

```
main (production)
├── develop (staging)
│   ├── feature/JIRA-123-add-login
│   ├── feature/JIRA-456-user-profile
│   ├── bugfix/JIRA-789-fix-pagination
│   └── chore/JIRA-101-update-deps
```

### 7.2 Commit Messages (Conventional Commits)

```
type(scope): description

feat(auth): add OAuth2 login with Google
fix(api): resolve pagination off-by-one error
refactor(components): extract shared Card component
test(users): add integration tests for user CRUD
docs(readme): update installation instructions
chore(deps): upgrade Next.js to 15.x
perf(images): add lazy loading for gallery
style(button): fix hover animation timing
ci(github): add quality gate workflow
```

### 7.3 Commit Rules

- Mỗi commit = 1 logical change
- KHÔNG commit code không build được
- KHÔNG commit test fails
- KHÔNG commit secrets
- KHÔNG force push to main/develop

---

## PHẦN 8: QUY TẮC TESTING

### 8.1 Test Types & Coverage

| Type        | Tool            | Coverage        | Khi nào                          |
| ----------- | --------------- | --------------- | -------------------------------- |
| Unit        | Vitest          | ≥ 80%           | Mọi function util, service, hook |
| Component   | Testing Library | ≥ 70%           | Mọi interactive component        |
| Integration | Vitest + MSW    | 100% API routes | Mọi API endpoint                 |
| E2E         | Playwright      | Critical flows  | Login, signup, checkout...       |

### 8.2 Test File Structure

```
tests/
├── unit/
│   ├── lib/
│   │   ├── utils.test.ts
│   │   ├── validations.test.ts
│   │   └── formatters.test.ts
│   ├── services/
│   │   ├── authService.test.ts
│   │   └── userService.test.ts
│   └── hooks/
│       ├── useAuth.test.ts
│       └── useUsers.test.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   └── users.test.ts
│   └── database/
│       └── userRepo.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── checkout.spec.ts
└── fixtures/
    ├── users.ts
    └── posts.ts
```

### 8.3 Mock Service Worker (MSW) Setup

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const userHandlers = [
  http.get('/api/v1/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);

    return HttpResponse.json({
      success: true,
      data: mockUsers,
      pagination: {
        page,
        limit: 20,
        total: mockUsers.length,
        totalPages: 1,
      },
    });
  }),

  http.post('/api/v1/users', async ({ request }) => {
    const body = (await request.json()) as CreateUserDTO;

    if (!body.email || !body.name) {
      return HttpResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing fields' } },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { success: true, data: { ...body, id: '1', createdAt: new Date().toISOString() } },
      { status: 201 },
    );
  }),
];
```

---

## PHẦN 9: QUY TẮC BẢO MẬT

### 9.1 Environment Variable Validation

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),

  // Storage
  S3_BUCKET: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

### 9.2 Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
  },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

### 9.3 Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const cleanHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
});

// File upload validation
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateUpload(file: File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ValidationError(`File type ${file.type} is not allowed`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }
}
```

---

## PHẦN 10: PERFORMANCE RULES

### 10.1 Frontend Performance Budget

| Metric                         | Target          | Max    |
| ------------------------------ | --------------- | ------ |
| LCP (Largest Contentful Paint) | < 2.5s          | 4.0s   |
| FID (First Input Delay)        | < 100ms         | 300ms  |
| CLS (Cumulative Layout Shift)  | < 0.1           | 0.25   |
| TTFB (Time to First Byte)      | < 800ms         | 1800ms |
| Bundle Size (JS)               | < 200KB gzipped | 500KB  |
| Bundle Size (CSS)              | < 50KB gzipped  | 100KB  |

### 10.2 Performance Patterns

```typescript
// 1. Dynamic imports cho heavy components
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});

// 2. Image optimization
import Image from 'next/image';
<Image
  src={url}
  alt={alt}
  width={width}
  height={height}
  priority={isAboveFold}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={placeholder}
/>

// 3. Font optimization
import { Inter } from 'next/font/google';
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

// 4. Prefetching
import Link from 'next/link';
<Link href="/about" prefetch={isNearViewport}>About</Link>

// 5. React Query caching
useQuery({
  queryKey: ['data', id],
  queryFn: () => fetchData(id),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
});
```

---

## PHẦN 11: DEPENDENCY MANAGEMENT

### 11.1 Dependency Rules

- KHÔNG install package mà không research trước
- KIỂM TRA: package còn maintained không (last publish < 6 tháng)
- KIỂM TRA: weekly downloads > 10k cho production packages
- KIỂM TRA: compatibility với Next.js version hiện tại
- KIỂM TRA: bundle size impact (bundlephobia.com)
- CẬP NHẬT dependencies định kỳ (npm audit + npm update)
- KHÔNG install duplicate packages (ví dụ: lodash và lodash-es)

### 11.2 Core Dependencies (Recommended Stack)

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "typescript": "^5.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",
    "@prisma/client": "^6.x",
    "zod": "^3.x",
    "next-auth": "^5.x",
    "tailwindcss": "^4.x",
    "framer-motion": "^11.x",
    "next-intl": "^3.x",
    "date-fns": "^4.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x"
  },
  "devDependencies": {
    "prisma": "^6.x",
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "msw": "^2.x",
    "@playwright/test": "^1.x",
    "eslint": "^9.x",
    "@types/node": "^22.x",
    "@types/react": "^19.x",
    "prettier": "^3.x",
    "lint-staged": "^15.x",
    "husky": "^9.x"
  }
}
```

---

## PHẦN 12: LOGGING & MONITORING

### 12.1 Structured Logging

```typescript
// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

// Usage:
logger.info('User logged in', { userId: user.id, ip: request.ip });
logger.warn('Rate limit approaching', {
  userId: user.id,
  remaining: rateLimit.remaining,
});
logger.error('Payment failed', {
  userId: user.id,
  error: error.message,
  stack: error.stack,
});
```

### 12.2 Error Tracking Pattern

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly isOperational: boolean = true,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

class ValidationError extends AppError {
  constructor(details: unknown) {
    super('Validation failed', 'VALIDATION_ERROR', 400, true, details);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}
```

---

## PHẦN 13: INTERNATIONALIZATION (i18n)

### 13.1 Structure

```
messages/
├── vi.json    # Vietnamese (default)
├── en.json    # English
└── ja.json    # Japanese
```

### 13.2 Usage

```typescript
import { useTranslations } from 'next-intl';

function UserCard({ user }: { user: User }) {
  const t = useTranslations('UserCard');

  return (
    <div>
      <h3>{t('title')}</h3>
      <p>{t('welcome', { name: user.name })}</p>
      <span>{t('memberSince', { date: formatDate(user.createdAt) })}</span>
    </div>
  );
}
```

---

## PHẦN 14: DOCUMENTATION

### 14.1 Code Comments (minimal, only when needed)

```typescript
// ✅ OK: Complex algorithm explanation
// Uses binary search to find insertion point in O(log n)
function findInsertionPoint(sortedArray: number[], target: number): number {
  // ...
}

// ❌ TRÁNH: Obvious comments
// Get user by ID
function getUserById(id: string) {} // CẦN THIẾT? Không!

// ✅ OK: JSDoc cho public APIs
/**
 * Fetches paginated users with optional search filtering.
 *
 * @param params - Pagination and filter parameters
 * @param params.page - 1-based page number
 * @param params.limit - Items per page (max 100)
 * @param params.search - Optional search string (matches name or email)
 * @returns Paginated result with users and metadata
 * @throws {ValidationError} If params are invalid
 * @throws {DatabaseError} If database query fails
 */
export async function getUsers(params: PaginationParams): Promise<PaginatedResult<User>> {
  // ...
}
```

### 14.2 README Structure

```markdown
# Project Name

## Overview

Brief description of what this project does

## Tech Stack

- Next.js 15, React 19, TypeScript 5
- Prisma, PostgreSQL
- Tailwind CSS, shadcn/ui
- Vitest, Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Installation

\`\`\`bash
git clone <repo>
cd <project>
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
\`\`\`

### Environment Variables

| Variable     | Description                  | Required |
| ------------ | ---------------------------- | -------- |
| DATABASE_URL | PostgreSQL connection string | Yes      |
| ...          | ...                          | ...      |

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Production build         |
| `npm run test`       | Run all tests            |
| `npm run test:unit`  | Unit tests only          |
| `npm run test:e2e`   | E2E tests only           |
| `npm run lint`       | Run ESLint               |
| `npm run format`     | Run Prettier             |
| `npm run db:migrate` | Run database migrations  |
| `npm run db:seed`    | Seed database            |

## Project Structure

Brief directory structure description

## API Documentation

Link to Swagger/Postman collection

## Deployment

Deployment instructions
```

---

> 📌 **QUAN TRỌNG**: Tài liệu này là source of truth cho coding standards.
> Mọi thay đổi phải được review bởi team lead.
> Version mới sẽ được cập nhật vào header.
