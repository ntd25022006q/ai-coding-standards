# ============================================

# 🚫 ANTI-PATTERNS - DANH SÁCH CẤM TUYỆT ĐỐI

# Version: 2.3.0 | 2026-04-08

# ============================================

# AI Agent KHÔNG ĐƯỢC thực hiện bất kỳ pattern nào dưới đây

# Vi phạm = DỪNG ngay + Báo cáo cho user

# ============================================

## 1. TYPE ANTI-PATTERNS

### ❌ AP-001: Using `any` type

```typescript
// ❌ CẤM
function processData(data: any) {
  return data.name;
}
const items: any[] = [];

// ✅ THAY BẰNG
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return String((data as { name: unknown }).name);
  }
  throw new ValidationError('Invalid data format');
}
```

### ❌ AP-002: Type assertion abuse

```typescript
// ❌ CẤM
const user = data as User;
const value = something!; // non-null assertion
const list = data as unknown as MyType; // double assertion

// ✅ THAY BẰNG
const user = UserSchema.parse(data);
const value = something ?? defaultValue;
if (!something) throw new NotFoundError('...');
```

### ❌ AP-003: Suppressing TypeScript errors

```typescript
// ❌ CẤM
// @ts-ignore
// @ts-expect-error
const result = problematicCall();

// ✅ THAY BẰNG
// Fix the actual type issue
const result = safeCall();
```

---

## 2. COMPONENT ANTI-PATTERNS

### ❌ AP-004: Giant component (>200 lines)

```typescript
// ❌ CẤM: Component quá lớn
function Dashboard() {
  // 200+ lines of mixed logic
  return <div>{/* everything */}</div>;
}

// ✅ THAY BẰNG: Split vào smaller components
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
}
```

### ❌ AP-005: useEffect for data fetching

```typescript
// ❌ CẤM
useEffect(() => {
  setLoading(true);
  fetch('/api/users')
    .then((r) => r.json())
    .then((data) => setUsers(data))
    .catch((e) => setError(e))
    .finally(() => setLoading(false));
}, []);

// ✅ THAY BẰNG: React Query
const {
  data: users,
  isLoading,
  error,
} = useQuery({
  queryKey: ['users'],
  queryFn: () => fetchUsers(),
});
```

### ❌ AP-006: Inline styles

```typescript
// ❌ CẤM
<div style={{ display: 'flex', padding: '16px', backgroundColor: 'red' }}>

// ✅ THAY BẰNG: Tailwind CSS
<div className="flex p-4 bg-red-500">
```

### ❌ AP-007: Missing loading/error states

```typescript
// ❌ CẤM
function UserList() {
  const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// ✅ THAY BẰNG
function UserList() {
  const { data, isLoading, error } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  if (isLoading) return <UserListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState message="No users found" />;

  return <ul>{data.map(u => <UserItem key={u.id} user={u} />)}</ul>;
}
```

### ❌ AP-008: Prop drilling too deep (>3 levels)

```typescript
// ❌ CẤM
<GrandParent user={user}>
  <Parent>
    <Child>
      <GrandChild email={user.email} /> {/* drilling */}
    </Child>
  </Parent>
</GrandParent>

// ✅ THAY BẰNG: Context or Zustand store
const { user } = useAuthStore();
```

---

## 3. STATE MANAGEMENT ANTI-PATTERNS

### ❌ AP-009: Too many useState in one component

```typescript
// ❌ CẤM
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ✅ THAY BẰNG: useReducer or react-hook-form
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<UserFormData>({
  resolver: zodResolver(UserSchema),
});
```

### ❌ AP-010: Global state for local data

```typescript
// ❌ CẤM: Global state cho modal open/close
const store = create((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));

// ✅ THAY BẰNG: Local state
const [isOpen, setIsOpen] = useState(false);
```

---

## 4. API ANTI-PATTERNS

### ❌ AP-011: Unvalidated API input

```typescript
// ❌ CẤM
export async function POST(request: Request) {
  const body = await request.json();
  await db.user.create({ data: body }); // No validation!
}

// ✅ THAY BẰNG
export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateUserSchema.parse(body);
  await db.user.create({ data: validated });
}
```

### ❌ AP-012: Missing error handling in API

```typescript
// ❌ CẤM
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}

// ✅ THAY BẰNG
export async function GET() {
  try {
    const users = await userService.getAll();
    return Response.json({ success: true, data: users });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### ❌ AP-013: Unversioned API

```typescript
// ❌ CẤM
app / api / users / route.ts; // No version
app / api / users / [id] / route.ts;

// ✅ THAY BẰNG
app / api / v1 / users / route.ts; // Versioned
app / api / v1 / users / [id] / route.ts;
```

---

## 5. DATABASE ANTI-PATTERNS

### ❌ AP-014: N+1 query problem

```typescript
// ❌ CẤM
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ THAY BẰNG
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

### ❌ AP-015: Selecting too many fields

```typescript
// ❌ CẤM: Select ALL columns including sensitive ones
const users = await prisma.user.findMany();

// ✅ THAY BẰNG: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // KHÔNG select password hash
    role: true,
  },
});
```

### ❌ AP-016: Missing database indexes

```prisma
// ❌ CẤM: No indexes on frequently queried fields
model User {
  email String @unique
  role  String
}

// ✅ THAY BẰNG: Add proper indexes
model User {
  email String @unique
  role  String

  @@index([role])
  @@index([createdAt])
  @@index([email, role])
}
```

---

## 6. SECURITY ANTI-PATTERNS

### ❌ AP-017: Hardcoded secrets

```typescript
// ❌ CẤM
const API_KEY = 'sk-1234567890abcdef';
const DB_URL = 'postgres://user:password@localhost:5432/db';

// ✅ THAY BẰNG: Environment variables with validation
const { API_KEY } = env; // Validated at startup
```

### ❌ AP-018: InnerHTML without sanitization

```typescript
// ❌ CẤM
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ THAY BẰNG: Sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### ❌ AP-019: Client-side secrets exposure

```typescript
// ❌ CẤM: Secret in client component
const apiKey = process.env.SECRET_KEY; // Exposed to browser!

// ✅ THAY BẰNG: Server-side only + API route
// app/api/v1/external/route.ts (server-side)
const apiKey = process.env.SECRET_KEY; // Safe
```

---

## 7. PERFORMANCE ANTI-PATTERNS

### ❌ AP-020: Unoptimized images

```typescript
// ❌ CẤM
<img src="/hero.jpg" alt="Hero" width={1200} height={600} />

// ✅ THAY BẰNG: next/image
<Image src="/hero.jpg" alt="Hero" width={1200} height={600}
  priority sizes="(max-width: 768px) 100vw, 1200px" />
```

### ❌ AP-021: Missing memoization

```typescript
// ❌ CẤM
function Parent() {
  const items = heavyComputation(data);
  return <Child items={items} onClick={() => doSomething()} />;
}

// ✅ THAY BẰNG
function Parent() {
  const items = useMemo(() => heavyComputation(data), [data]);
  const handleClick = useCallback(() => doSomething(), []);
  return <Child items={items} onClick={handleClick} />;
}
```

### ❌ AP-022: Loading all data at once

```typescript
// ❌ CẤM
const allPosts = await prisma.post.findMany(); // Thousands of records

// ✅ THAY BẰNG: Pagination
const posts = await prisma.post.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

---

## 8. WORKFLOW ANTI-PATTERNS

### ❌ AP-023: Modifying unrelated files

```
User asks: "Fix the login button color"
AI does: Changes button color + reformats 5 unrelated files + adds comments
```

→ **QUY TẮC: Chỉ thay đổi những file CẦN THIẾT cho task hiện tại**

### ❌ AP-024: Deleting files to "fix" issues

```
AI encounters error → Deletes the file instead of fixing it
```

→ **QUY TẮC: KHÔNG BAO GIỜ xóa file để fix bug. Fix the bug.**

### ❌ AP-025: Fabricating API documentation

```
User asks: "How to use X library?"
AI responds: "You can use X.doSomething()" (function doesn't exist)
```

→ **QUY TẮC: Nghiên cứu docs TRƯỚC khi trả lời. Không bịa.**

### ❌ AP-026: Skipping verification

```
AI writes code → Says "Done!" → Code doesn't compile
```

→ **QUY TẮC: CHẠY tsc, eslint, test, build TRƯỚC khi báo done**

### ❌ AP-027: Infinite loop in code

```typescript
// ❌ CẤM
while (true) {
  // No break condition
}

// ❌ CẤM
useEffect(() => {
  setCount((c) => c + 1); // Infinite re-render
});
```

→ **QUY TẮC: Mọi loop PHẢI có termination condition. useEffect PHẢI có dependency array đúng.**

### ❌ AP-028: Magic numbers

```typescript
// ❌ CẤM
if (status === 429) {
  retry(30000);
} // What is 429? What is 30000?

// ✅ THAY BẰNG
const HTTP_STATUS = {
  TOO_MANY_REQUESTS: 429,
} as const;

const RETRY_DELAYS = {
  RATE_LIMIT: 30_000, // 30 seconds
} as const;

if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
  retry(RETRY_DELAYS.RATE_LIMIT);
}
```

### ❌ AP-029: Empty error handling

```typescript
// ❌ CẤM
try {
  await riskyOperation();
} catch (e) {}
try {
  await riskyOperation();
} catch (e) {
  console.log(e);
}

// ✅ THAY BẰNG
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new AppError('Operation failed', 'OPERATION_ERROR', 500);
}
```

### ❌ AP-030: Circular dependencies

```typescript
// a.ts imports b.ts, b.ts imports a.ts → Circular!
// ❌ CẤM

// ✅ THAY BẰNG: Extract shared types to separate file
// types.ts → shared types
// a.ts → imports from types.ts only
// b.ts → imports from types.ts only
```

---

> ⚠️ **AI AGENT**: Nếu bạn phát hiện bất kỳ anti-pattern nào trong code,
> BẮT BUỘC phải fix hoặc report cho user.
> KHÔNG bao giờ bỏ qua anti-pattern.
