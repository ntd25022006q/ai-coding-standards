// =============================================================================
// AI Coding Standards — Example Source Files
// =============================================================================
// These files serve two purposes:
// 1. ESLint + TypeScript have real code to validate (no more "nothing to lint")
// 2. Demonstrates the coding standards this repo enforces
// =============================================================================
// Target projects should place their code under src/ following the same patterns.
// =============================================================================

/**
 * Utility: Format a number as compact currency string.
 * Demonstrates: strict typing, named exports, proper error handling.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new TypeError(`Invalid amount: expected a non-negative finite number, got ${amount}`);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Utility: Clamp a number between min and max (inclusive).
 * Demonstrates: explicit return type, no `any`, no magic numbers.
 */
export function clampValue(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`min (${min}) must not exceed max (${max})`);
  }

  return Math.min(Math.max(value, min), max);
}

/**
 * Utility: Safe JSON parse with error context.
 * Demonstrates: structured error handling, Zod-style validation pattern.
 */
export function safeJsonParse<T>(json: string): { data: T | null; error: string | null } {
  try {
    const data = JSON.parse(json) as T;
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: `JSON parse failed: ${message}` };
  }
}

/**
 * Utility: Delay execution (useful for testing and rate limiting).
 * Demonstrates: async/await, explicit return type promise.
 */
export function delay(ms: number): Promise<void> {
  if (ms < 0 || !Number.isInteger(ms)) {
    throw new TypeError(`Delay must be a non-negative integer, got ${ms}`);
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}
