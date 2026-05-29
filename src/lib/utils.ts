// =============================================================================
// AI Coding Standards — Example Source Files
// =============================================================================
// IMPORTANT: This project is a TEMPLATE AND CONFIGURATION DISTRIBUTION TOOL,
// not a runtime library. The source files below exist for three reasons:
//
// 1. ESLint + TypeScript have real code to validate (avoids "nothing to lint")
// 2. They demonstrate the coding standards this repository enforces
// 3. They provide example type patterns for target projects to follow
//
// Consumers should NOT install this package as a runtime dependency.
// Instead, use `npm run setup` to deploy rules, configs, and hooks to a
// target project, then replace these example files with real application code.
// =============================================================================

/**
 * Formats a numeric amount as a compact currency string using the
 * `Intl.NumberFormat` API.
 *
 * @param amount  - The numeric value to format. Must be a finite, non-negative number.
 * @param currency - ISO 4217 currency code. Defaults to `'USD'`.
 * @returns A localized currency string (e.g. `'$1,000'`, `'€500'`).
 * @throws {TypeError} If `amount` is negative, `NaN`, or `Infinity`.
 *
 * @example
 * ```ts
 * formatCurrency(1000);       // '$1,000'
 * formatCurrency(1234.567);   // '$1,234.57'
 * formatCurrency(100, 'EUR'); // '€100'
 * ```
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
 * Clamps a numeric value between a minimum and maximum boundary (inclusive).
 *
 * @param value - The value to clamp.
 * @param min   - The lower boundary (inclusive).
 * @param max   - The upper boundary (inclusive).
 * @returns The clamped value — `min` if `value < min`, `max` if `value > max`,
 *          otherwise `value` itself.
 * @throws {RangeError} If `min` is greater than `max`.
 *
 * @example
 * ```ts
 * clampValue(5, 0, 10);    // 5
 * clampValue(-3, 0, 10);   // 0
 * clampValue(100, 0, 10);  // 10
 * ```
 */
export function clampValue(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`min (${min}) must not exceed max (${max})`);
  }

  return Math.min(Math.max(value, min), max);
}

/**
 * Safely parses a JSON string without throwing. Returns a discriminated
 * result object containing either the parsed data or an error message.
 *
 * @typeParam T - The expected type of the parsed data.
 * @param json - The JSON string to parse.
 * @returns An object with either `{ data: T, error: null }` on success or
 *          `{ data: null, error: string }` on failure.
 *
 * @example
 * ```ts
 * const result = safeJsonParse<User>('{"id":1}');
 * if (result.data) {
 *   console.log(result.data); // User
 * } else {
 *   console.error(result.error); // "JSON parse failed: ..."
 * }
 * ```
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
 * Returns a promise that resolves after the specified number of milliseconds.
 * Useful for rate limiting, retries with backoff, and testing async behavior.
 *
 * @param ms - Delay duration in milliseconds. Must be a non-negative integer.
 * @returns A promise that resolves to `void` after the delay.
 * @throws {TypeError} If `ms` is negative or not an integer.
 *
 * @example
 * ```ts
 * await delay(1000); // wait 1 second
 * await delay(0);    // yield to the event loop
 * ```
 */
export function delay(ms: number): Promise<void> {
  if (ms < 0 || !Number.isInteger(ms)) {
    throw new TypeError(`Delay must be a non-negative integer, got ${ms}`);
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}
