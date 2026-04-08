# ============================================

# 🏗️ CHUẨN KIẾN TRÚC ỨNG DỤNG

# Version: 2.3.0 | 2026-04-08

# ============================================

## 1. KIẾN TRÚC TỔNG THỂ

### 1.1 Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│         (React Components, Pages, UI)                │
│  ┌─────────────────────────────────────────────────┐ │
│  │           Application Layer                     │ │
│  │    (Hooks, Services, State Management)          │ │
│  │  ┌─────────────────────────────────────────────┐│ │
│  │  │         Domain Layer                        ││ │
│  │  │    (Types, Interfaces, Business Rules)      ││ │
│  │  │  ┌─────────────────────────────────────────┐││ │
│  │  │  │       Infrastructure Layer              │││ │
│  │  │  │  (Database, External APIs, Storage)     │││ │
│  │  │  └─────────────────────────────────────────┘││ │
│  │  └─────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.2 Dependency Rule

- **Inner layers MUST NOT depend on outer layers**
- Domain layer has ZERO dependencies
- Infrastructure depends on Domain
- Application depends on Domain
- Presentation depends on Application

### 1.3 Mapping to Next.js

```
Clean Architecture     → Next.js Location
─────────────────────────────────────────
Presentation           → src/app/, src/components/
Application            → src/hooks/, src/services/, src/stores/
Domain                 → src/types/, src/lib/validations.ts
Infrastructure         → src/lib/prisma.ts, src/lib/redis.ts, src/services/
```

---

## 2. DOMAIN LAYER

### 2.1 Types (src/types/)

```typescript
// src/types/domain.ts - Domain entities
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface User extends BaseEntity {
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly emailVerified: boolean;
  readonly avatar?: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

// Value Objects
export type Email = string & { readonly __brand: 'Email' };
export type UserId = string & { readonly __brand: 'UserId' };
export type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };

// Branded type helpers
export function asEmail(value: string): Email {
  if (!value.includes('@')) throw new ValidationError('Invalid email');
  return value as Email;
}

export function asUserId(value: string): UserId {
  if (!value || value.length < 10) throw new ValidationError('Invalid user ID');
  return value as UserId;
}
```

### 2.2 Validation Schemas (src/lib/validations.ts)

```typescript
import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be at most 100 characters')
      .transform((s) => s.trim()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letter')
      .regex(/[a-z]/, 'Password must contain lowercase letter')
      .regex(/[0-9]/, 'Password must contain number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  avatar: z.string().url().optional(),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['asc', 'desc']).default('desc'),
  sortBy: z.string().default('createdAt'),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type PaginationDTO = z.infer<typeof PaginationSchema>;
```

---

## 3. INFRASTRUCTURE LAYER

### 3.1 Database (src/lib/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 3.2 Repository Pattern (src/services/user.repository.ts)

```typescript
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { User, PaginationDTO, PaginationResult } from '@/types';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(params: PaginationDTO): Promise<PaginationResult<User>> {
    const { page, limit, sort, sortBy } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sort },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: await hashPassword(data.password),
      },
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}

export const userRepository = new UserRepository();
```

### 3.3 External Service Pattern (src/services/email.service.ts)

```typescript
import nodemailer from 'nodemailer';
import { env } from '@/config/env';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
    }
    return this.transporter;
  }

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    try {
      await this.getTransporter().sendMail({
        from: `"${env.APP_NAME}" <${env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      logger.info('Email sent', { to, subject });
    } catch (error) {
      logger.error('Email failed to send', { to, subject, error });
      throw new AppError('Failed to send email', 'EMAIL_ERROR', 500);
    }
  }
}

export const emailService = new EmailService();
```

---

## 4. APPLICATION LAYER

### 4.1 Service Pattern (src/services/user.service.ts)

```typescript
import { userRepository } from './user.repository';
import { emailService } from './email.service';
import { NotFoundError, ConflictError } from '@/lib/errors';

class UserService {
  async getAll(params: PaginationDTO): Promise<PaginationResult<User>> {
    return userRepository.findAll(params);
  }

  async getById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User', id);
    return user;
  }

  async create(dto: CreateUserDTO): Promise<User> {
    // Check if email already exists
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictError('Email already registered');

    // Create user
    const user = await userRepository.create(dto);

    // Send welcome email (fire and forget)
    emailService
      .send({
        to: user.email,
        subject: 'Welcome!',
        html: welcomeEmailTemplate(user.name),
      })
      .catch(() => {
        logger.warn('Welcome email failed', { userId: user.id });
      });

    return user;
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User> {
    const user = await this.getById(id); // Ensures exists
    return userRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id); // Ensures exists
    await userRepository.delete(id);
  }
}

export const userService = new UserService();
```

### 4.2 Server Actions (src/app/actions/user.actions.ts)

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { userService } from '@/services/user.service';
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validations';

export async function createUserAction(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);
    const dto = CreateUserSchema.parse(raw);
    const user = await userService.create(dto);
    revalidatePath('/users');
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: serializeError(error) };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData);
    const dto = UpdateUserSchema.parse(raw);
    const user = await userService.update(id, dto);
    revalidatePath('/users');
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: serializeError(error) };
  }
}
```

### 4.3 React Query Hooks (src/hooks/useUsers.ts)

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { CreateUserSchema, type CreateUserDTO, type PaginationDTO } from '@/lib/validations';
import { toast } from 'sonner';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: PaginationDTO) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params: PaginationDTO) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDTO) => userService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDTO }) => userService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
```

---

## 5. PRESENTATION LAYER

### 5.1 Page Structure (src/app/(dashboard)/users/page.tsx)

```typescript
import { Metadata } from 'next';
import { Suspense } from 'react';
import { UserList } from './UserList';
import { UserListSkeleton } from './UserListSkeleton';
import { PageHeader } from '@/components/layouts/PageHeader';

export const metadata: Metadata = {
  title: 'Users | Admin Dashboard',
  description: 'Manage user accounts',
};

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts"
        action={{ label: 'Add User', href: '/users/new' }}
      />

      <Suspense fallback={<UserListSkeleton />}>
        <UserList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
```

### 5.2 Component Architecture

```
src/components/
├── ui/                    # shadcn/ui base components (KHÔNG sửa)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── layouts/               # Layout components
│   ├── PageHeader.tsx
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── forms/                 # Form components
│   ├── UserForm.tsx
│   ├── LoginForm.tsx
│   └── SearchForm.tsx
├── cards/                 # Card components
│   ├── UserCard.tsx
│   ├── StatsCard.tsx
│   └── PostCard.tsx
├── shared/                # Shared between features
│   ├── DataTable.tsx
│   ├── Pagination.tsx
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   └── ErrorBoundary.tsx
└── providers/             # Context providers
    ├── QueryProvider.tsx
    ├── ThemeProvider.tsx
    └── AuthProvider.tsx
```

---

## 6. ERROR HANDLING ARCHITECTURE

### 6.1 Error Classes (src/lib/errors.ts)

```typescript
export class AppError extends Error {
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

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('Validation failed', 'VALIDATION_ERROR', 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Too many requests', 'RATE_LIMIT', 429, true, { retryAfter });
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500, false);
  }
}
```

### 6.2 API Error Handler (src/lib/api-error.ts)

```typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, logger } from './';
import { Prisma } from '@prisma/client';

export function handleApiError(error: unknown): NextResponse {
  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  // Known app error
  if (error instanceof AppError) {
    logger.warn(`[${error.code}] ${error.message}`, { details: error.details });

    return NextResponse.json(
      {
        success: false,
        error: error.toJSON(),
      },
      { status: error.statusCode },
    );
  }

  // Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = mapPrismaError(error);
    logger.error('Database error', { code: error.code, meta: error.meta });

    return NextResponse.json(
      { success: false, error: prismaError },
      { status: prismaError.code === 'NOT_FOUND' ? 404 : 500 },
    );
  }

  // Unknown error
  logger.error('Unexpected error', { error: serializeError(error) });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error instanceof Error
              ? error.message
              : 'Unknown error',
      },
    },
    { status: 500 },
  );
}
```

### 6.3 Error Boundary (src/components/shared/ErrorBoundary.tsx)

```typescript
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. AUTHENTICATION ARCHITECTURE

### 7.1 NextAuth Configuration (src/lib/auth.ts)

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import { userService } from '@/services/user.service';
import { verifyPassword } from '@/lib/password';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = LoginSchema.parse(credentials);

        const user = await userService.findByEmail(email);
        if (!user || !user.password) return null;

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        };
      },
    }),
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
```

---

> 📌 Tài liệu này mô tả kiến trúc chuẩn cho mọi dự án.
> Tuân thủ chặt chẽ để đảm bảo code quality, maintainability, và scalability.
