/**
 * @module ai-coding-standards
 *
 * Public API surface for the `ai-agent-coding-standards` package.
 * Re-exports every utility function and domain type so consumers can
 * import from a single entry point:
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
