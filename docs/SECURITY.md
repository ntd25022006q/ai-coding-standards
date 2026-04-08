# ============================================

# 🔐 CHUẨN BẢO MẬT ỨNG DỤNG

# Version: 2.3.0 | 2026-04-08

# ============================================

## 1. OWASP TOP 10 - NGUYÊN TẮC PHÒNG NGỪA

### 1.1 Broken Access Control (A01:2021)

```typescript
// ✅ BẮT BUỢC: Middleware kiểm tra quyền
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  const protectedPaths = ['/dashboard', '/api/v1/users', '/settings'];
  const adminPaths = ['/admin', '/api/v1/admin'];

  // Check protected routes
  if (protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin routes
  if (adminPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Rate limiting headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
```

### 1.2 Cryptographic Failures (A02:2021)

```typescript
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ✅ Password hashing (bcrypt, KHÔNG dùng md5/sha1)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // 12 salt rounds
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ✅ Token generation (crypto.randomBytes, KHÔNG dùng Math.random)
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

// ✅ API key generation
export function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('base64url')}`;
}

// ❌ CẤM
const hash = md5(password); // Too weak
const token = Math.random().toString(36); // Predictable
```

### 1.3 Injection (A03:2021)

```typescript
// ✅ ĐÚNG: Parameterized queries (Prisma built-in)
const users = await prisma.user.findMany({
  where: { email: userInput }, // Prisma auto-parameterizes
});

// ✅ ĐÚNG: Input validation
const sanitized = CreateUserSchema.parse(userInput);

// ❌ CẤM: Raw SQL with concatenation
const result = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${userInput}'`);

// ✅ ĐÚNG: Raw SQL with parameters (if needed)
const result = await prisma.$queryRaw<User[]>(
  Prisma.sql`SELECT * FROM users WHERE email = ${userInput}`,
);
```

### 1.4 Insecure Design (A04:2021)

```typescript
// ✅ Rate limiting
import rateLimit from 'express-rate-limit';

// API rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Account lockout after failed attempts
export async function checkAccountLock(email: string): Promise<void> {
  const attempts = await redis.get(`login_attempts:${email}`);

  if (Number(attempts) >= 5) {
    const lockTime = await redis.ttl(`login_lock:${email}`);
    throw new AppError(`Account locked. Try again in ${lockTime} seconds`, 'ACCOUNT_LOCKED', 429);
  }
}

export async function recordFailedAttempt(email: string): Promise<void> {
  const key = `login_attempts:${email}`;
  const attempts = await redis.incr(key);
  await redis.expire(key, 15 * 60); // Reset after 15 minutes

  if (attempts >= 5) {
    await redis.set(`login_lock:${email}`, '1', 'EX', 30 * 60); // Lock 30 min
    throw new AppError('Account locked due to too many failed attempts', 'ACCOUNT_LOCKED', 429);
  }
}
```

### 1.5 Security Misconfiguration (A05:2021)

```typescript
// next.config.ts - Security headers
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

// ✅ Environment validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  // ... all required env vars
});

// Validate at startup
export const env = envSchema.parse(process.env);
```

### 1.6 Vulnerable & Outdated Components (A06:2021)

```json
// ✅ package.json - minimal, audited dependencies
// Rule: Run `npm audit` before every release
// Rule: Run `npm outdated` weekly
// Rule: Use `npm ci` instead of `npm install` in CI

// Automated security checks in CI
// .github/workflows/security.yml
// - npm audit --audit-level=high
// - Snyk scan
// - Dependabot enabled
```

### 1.7 Authentication Failures (A07:2021)

```typescript
// ✅ Secure session management
export const authConfig = {
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes for access token
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token', // __Secure prefix
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

// ✅ CSRF protection
// NextAuth has built-in CSRF protection with double-submit cookie pattern

// ✅ Secure password requirements
const PasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(128, 'At most 128 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[a-z]/, 'At least one lowercase letter')
    .regex(/[0-9]/, 'At least one number')
    .regex(/[^A-Za-z0-9]/, 'At least one special character')
    // Check against common passwords
    .refine((p) => !COMMON_PASSWORDS.includes(p.toLowerCase()), 'Password is too common'),
});
```

---

## 2. API SECURITY

### 2.1 Input Validation (All Endpoints)

```typescript
// ✅ Validate EVERY input with Zod
const UUIDSchema = z.string().uuid();

// Path parameter validation
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = UUIDSchema.safeParse(id);
  if (!userId.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ID', message: 'Invalid user ID' } },
      { status: 400 },
    );
  }
  // ...
}
```

### 2.2 Output Sanitization

```typescript
// ✅ NEVER expose sensitive fields
// Use Prisma select to control output
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    // password: NEVER include
    // internalNotes: NEVER include
    role: true,
    createdAt: true,
  },
});

// ✅ Sanitize HTML before output
import DOMPurify from 'isomorphic-dompurify';
const cleanContent = DOMPurify.sanitize(userContent);
```

### 2.3 API Rate Limiting

```typescript
// Redis-based rate limiting
export async function rateLimitCheck(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 900,
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetAt: new Date(Date.now() + ttl * 1000),
  };
}

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { allowed, remaining } = await rateLimitCheck(ip, 10, 60);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0' },
      },
    );
  }
  // ...
}
```

---

## 3. FILE UPLOAD SECURITY

```typescript
import { z } from 'zod';
import path from 'path';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
]);

const MAX_FILE_SIZE = {
  avatar: 2 * 1024 * 1024, // 2MB
  document: 10 * 1024 * 1024, // 10MB
  image: 5 * 1024 * 1024, // 5MB
};

const DANGEROUS_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.js',
  '.vbs',
  '.wsf',
  '.hta',
  '.php',
  '.asp',
  '.jsp',
  '.cgi',
  '.sql',
  '.dll',
  '.so',
  '.dylib',
]);

function validateUpload(file: File, type: keyof typeof MAX_FILE_SIZE): void {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new ValidationError(`File type '${file.type}' is not allowed`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE[type]) {
    const maxMB = MAX_FILE_SIZE[type] / 1024 / 1024;
    throw new ValidationError(`File size exceeds ${maxMB}MB limit`);
  }

  // Check extension (from original name)
  const ext = path.extname(file.name).toLowerCase();
  if (DANGEROUS_EXTENSIONS.has(ext)) {
    throw new ValidationError(`File extension '${ext}' is not allowed`);
  }
}

// ✅ Sanitize filename
function sanitizeFileName(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const name = path
    .basename(filename, ext)
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Remove special chars
    .substring(0, 50); // Limit length

  return `${name}_${Date.now()}${ext}`;
}
```

---

## 4. CORS CONFIGURATION

```typescript
// next.config.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours preflight cache
};
```

---

## 5. SECURITY CHECKLIST

### Pre-Deployment

- [ ] `npm audit` passes with 0 high/critical vulnerabilities
- [ ] No secrets in client-side bundle (`npm run build` → search for keys)
- [ ] Environment variables validated at startup
- [ ] Security headers configured
- [ ] Rate limiting enabled on all public endpoints
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] CSP headers prevent XSS
- [ ] File upload validation in place
- [ ] Authentication/authorization tested
- [ ] SQL injection protection verified
- [ ] CSRF protection enabled
- [ ] Session management secure
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't log secrets
- [ ] Dependencies are up-to-date

### Continuous

- [ ] Dependabot enabled for auto-updates
- [ ] Security scanning in CI/CD
- [ ] Monitoring for suspicious activity
- [ ] Regular security reviews

---

## 6. CONTENT SECURITY POLICY

```typescript
// Comprehensive CSP configuration
const cspHeader = [
  // Default: only allow same origin
  `default-src 'self'`,

  // Scripts: self + specific allowed patterns
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,

  // Styles: self + inline (needed for Tailwind)
  `style-src 'self' 'unsafe-inline'`,

  // Images: self + blob + data + known CDNs
  `img-src 'self' blob: data: https://assets.example.com`,

  // Fonts: self + known font CDNs
  `font-src 'self' https://fonts.gstatic.com`,

  // Connect: self + known API endpoints
  `connect-src 'self' https://api.example.com`,

  // Frames: none (prevent clickjacking)
  `frame-ancestors 'none'`,

  // Forms: same origin only
  `form-action 'self'`,

  // Base URI: same origin only
  `base-uri 'self'`,

  // No plugins
  `object-src 'none'`,

  // Upgrade insecure requests
  `upgrade-insecure-requests`,
].join('; ');
```

---

> 🔒 **QUAN TRỌNG**: Bảo mật không phải optional. Mọi rule trên là BẮT BUỘC.
> Violation = Critical bug = Fix ngay lập tức.
