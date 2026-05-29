/**
 * Domain types for AI Coding Standards.
 *
 * IMPORTANT: This project is a template and configuration distribution tool,
 * not a runtime library. These types serve as reference patterns demonstrating
 * strict interfaces, union types, and discriminated unions with no `any` usage.
 *
 * Target projects should replace these examples with their own domain types
 * following the same patterns enforced by this tool.
 */

/**
 * Base entity interface providing common audit fields shared across
 * all domain objects. Every entity in the system MUST extend this
 * interface to ensure consistent identification and traceability.
 */
export interface BaseEntity {
  /** Unique identifier (UUID or other string-based ID). */
  id: string;
  /** Timestamp when the entity was first persisted. */
  createdAt: Date;
  /** Timestamp of the most recent mutation. */
  updatedAt: Date;
}

/**
 * Union type representing the allowed user roles in the system.
 * New roles MUST be added here first, then propagated to
 * Zod schemas and UI role selectors.
 */
export type UserRole = 'admin' | 'user' | 'moderator';

/**
 * Represents an authenticated user in the system.
 * Extends {@link BaseEntity} with identity and authorization fields.
 */
export interface User extends BaseEntity {
  /** User's email address — used as the primary login identifier. */
  email: string;
  /** Display name (not guaranteed unique). */
  name: string;
  /** Authorization role controlling access to system resources. */
  role: UserRole;
  /** Whether the user account is currently active. Inactive users cannot authenticate. */
  isActive: boolean;
}

/**
 * Discriminated union member representing a failed API response.
 * The `success: false` literal enables type narrowing:
 *
 * ```ts
 * if (!response.success) {
 *   console.error(response.error.message);
 * }
 * ```
 */
export interface ApiErrorResponse {
  /** Discriminant — always `false` for error responses. */
  success: false;
  /** Structured error details. */
  error: {
    /** Machine-readable error code (e.g. `'VALIDATION_ERROR'`, `'NOT_FOUND'`). */
    code: string;
    /** Human-readable error description. */
    message: string;
    /** Optional additional context (validation errors, stack trace, etc.). */
    details?: unknown;
  };
}

/**
 * Discriminated union member representing a successful API response.
 * The `success: true` literal enables type narrowing:
 *
 * ```ts
 * if (response.success) {
 *   console.log(response.data);
 * }
 * ```
 *
 * @typeParam T - The type of the payload data.
 */
export interface ApiSuccessResponse<T> {
  /** Discriminant — always `true` for success responses. */
  success: true;
  /** The response payload. */
  data: T;
}

/**
 * Discriminated union of all possible API response shapes.
 * Use this type as the return annotation for API handler functions
 * to guarantee callers handle both success and error paths.
 *
 * @typeParam T - The type of the payload on success.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Parameters for paginated list queries.
 * All list endpoints MUST accept these fields to ensure
 * consistent pagination across the API surface.
 */
export interface PaginationParams {
  /** 1-indexed page number. */
  page: number;
  /** Maximum number of items per page. */
  limit: number;
}

/**
 * Metadata describing the pagination state of a list response.
 * Returned alongside data so consumers can render page controls
 * without making a separate count request.
 */
export interface PaginationMeta {
  /** Current page number (matches the requested `page`). */
  page: number;
  /** Requested page size (matches the requested `limit`). */
  limit: number;
  /** Total number of items across all pages. */
  total: number;
  /** Total number of pages computed as `Math.ceil(total / limit)`. */
  totalPages: number;
}
