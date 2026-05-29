/**
 * @module ai-coding-standards
 *
 * Public API surface for the `ai-agent-coding-standards` package.
 *
 * IMPORTANT: This project is a template and configuration distribution tool,
 * not a runtime library. These exports exist so that ESLint and TypeScript
 * have real code to validate, and to demonstrate the coding standards this
 * repository enforces. Consumers should use `npm run setup` to deploy rules,
 * configs, and hooks to their own project, then replace these example
 * utilities with real application code.
 *
 * ```ts
 * import { formatCurrency, type User, type ApiResponse } from 'ai-agent-coding-standards';
 * ```
 */

// ---------------------------------------------------------------------------
// Utility functions — src/lib/utils.ts
// ---------------------------------------------------------------------------

/** @see {@link formatCurrency} */
export { formatCurrency } from './lib/utils';
/** @see {@link clampValue} */
export { clampValue } from './lib/utils';
/** @see {@link safeJsonParse} */
export { safeJsonParse } from './lib/utils';
/** @see {@link delay} */
export { delay } from './lib/utils';

// ---------------------------------------------------------------------------
// Domain types — src/types/index.ts
// ---------------------------------------------------------------------------

/** @see {@link BaseEntity} */
export type { BaseEntity } from './types/index';
/** @see {@link UserRole} */
export type { UserRole } from './types/index';
/** @see {@link User} */
export type { User } from './types/index';
/** @see {@link ApiErrorResponse} */
export type { ApiErrorResponse } from './types/index';
/** @see {@link ApiSuccessResponse} */
export type { ApiSuccessResponse } from './types/index';
/** @see {@link ApiResponse} */
export type { ApiResponse } from './types/index';
/** @see {@link PaginationParams} */
export type { PaginationParams } from './types/index';
/** @see {@link PaginationMeta} */
export type { PaginationMeta } from './types/index';
