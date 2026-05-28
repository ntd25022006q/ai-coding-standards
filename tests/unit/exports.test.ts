import { describe, it, expect } from 'vitest';
import { formatCurrency, clampValue, safeJsonParse, delay } from '../../src/index';
import type {
  BaseEntity,
  UserRole,
  User,
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiResponse,
  PaginationParams,
  PaginationMeta,
} from '../../src/index';

// =============================================================================
// Unit Tests: src/index.ts (barrel export)
// =============================================================================
// Verifies all re-exports from the barrel file resolve correctly.

describe('barrel exports (src/index.ts)', () => {
  it('should re-export all utility functions from lib/utils', () => {
    expect(typeof formatCurrency).toBe('function');
    expect(typeof clampValue).toBe('function');
    expect(typeof safeJsonParse).toBe('function');
    expect(typeof delay).toBe('function');
  });

  it('re-exported functions should produce correct results', () => {
    expect(formatCurrency(42)).toBe('$42');
    expect(clampValue(50, 0, 100)).toBe(50);
    const parsed = safeJsonParse<{ key: string }>('{"key":"value"}');
    expect(parsed.data).toEqual({ key: 'value' });
    expect(parsed.error).toBeNull();
  });

  it('should re-export all type definitions', () => {
    const _entity: BaseEntity = {
      id: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(_entity.id).toBe('1');

    const _role: UserRole = 'admin';
    expect(['admin', 'user', 'moderator']).toContain(_role);

    const _user: User = {
      id: '2',
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@example.com',
      name: 'Test',
      role: 'user',
      isActive: true,
    };
    expect(_user.email).toBe('test@example.com');

    const _err: ApiErrorResponse = {
      success: false,
      error: { code: 'TEST', message: 'test' },
    };
    expect(_err.success).toBe(false);

    const _ok: ApiSuccessResponse<string> = { success: true, data: 'ok' };
    expect(_ok.data).toBe('ok');

    const _resp: ApiResponse<string> = _ok;
    expect(_resp.success).toBe(true);

    const _page: PaginationParams = { page: 1, limit: 10 };
    expect(_page.page).toBe(1);

    const _meta: PaginationMeta = {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    };
    expect(_meta.totalPages).toBe(10);
  });
});
