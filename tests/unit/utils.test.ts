import { describe, it, expect } from 'vitest';
import { formatCurrency, clampValue, safeJsonParse, delay } from '../../src/lib/utils';

// =============================================================================
// Unit Tests: src/lib/utils.ts
// =============================================================================

describe('formatCurrency', () => {
  it('should format positive integers as USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  it('should format decimal amounts with up to 2 fraction digits', () => {
    expect(formatCurrency(1234.567)).toBe('$1,234.57');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should support different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toMatch(/€/);
  });

  it('should throw TypeError for negative amounts', () => {
    expect(() => formatCurrency(-1)).toThrow(TypeError);
    expect(() => formatCurrency(-1)).toThrow('Invalid amount');
  });

  it('should throw TypeError for NaN', () => {
    expect(() => formatCurrency(NaN)).toThrow(TypeError);
  });

  it('should throw TypeError for Infinity', () => {
    expect(() => formatCurrency(Infinity)).toThrow(TypeError);
  });
});

describe('clampValue', () => {
  it('should return value when within range', () => {
    expect(clampValue(5, 1, 10)).toBe(5);
  });

  it('should clamp to min when below range', () => {
    expect(clampValue(-5, 0, 10)).toBe(0);
  });

  it('should clamp to max when above range', () => {
    expect(clampValue(100, 0, 10)).toBe(10);
  });

  it('should return min when value equals min', () => {
    expect(clampValue(0, 0, 10)).toBe(0);
  });

  it('should return max when value equals max', () => {
    expect(clampValue(10, 0, 10)).toBe(10);
  });

  it('should throw RangeError when min exceeds max', () => {
    expect(() => clampValue(5, 10, 1)).toThrow(RangeError);
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON and return data', () => {
    const result = safeJsonParse<{ name: string }>('{"name":"test"}');
    expect(result.data).toEqual({ name: 'test' });
    expect(result.error).toBeNull();
  });

  it('should return error for invalid JSON', () => {
    const result = safeJsonParse('not json');
    expect(result.data).toBeNull();
    expect(result.error).toContain('JSON parse failed');
  });

  it('should return error for empty string', () => {
    const result = safeJsonParse('');
    expect(result.data).toBeNull();
    expect(result.error).toContain('JSON parse failed');
  });

  it('should parse numbers', () => {
    const result = safeJsonParse<number>('42');
    expect(result.data).toBe(42);
  });

  it('should parse arrays', () => {
    const result = safeJsonParse<string[]>('["a","b"]');
    expect(result.data).toEqual(['a', 'b']);
  });

  it('should handle non-Error thrown values via String(err) path', () => {
    // JSON.parse always throws SyntaxError (Error instance).
    // The catch block defensively handles non-Error values too.
    // We use a getter-based Error subclass to throw a plain string
    // while satisfying the @typescript-eslint/only-throw-error rule.
    class StringThrower extends Error {
      override readonly message: string;
      override readonly cause: unknown;
      constructor(msg: string) {
        super('');
        // Define a getter that returns the string — but we need to
        // actually test the String(err) branch in utils.ts.
        // Since JSON.parse only throws Error subclasses, the only way
        // to truly test String(err) is via a custom thenable that
        // rejects with a non-Error value.
        this.message = '';
        this.cause = msg;
      }
    }
    // Override JSON.parse via bracket access to test String(err) branch
    const originalParse = JSON.parse;
    JSON['parse'] = ((): unknown => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 'custom string error';
    }) as typeof JSON.parse;
    try {
      const result = safeJsonParse<{ x: number }>('anything');
      expect(result.data).toBeNull();
      expect(result.error).toBe('JSON parse failed: custom string error');
    } finally {
      JSON.parse = originalParse;
    }
    // Suppress unused variable warning
    expect(StringThrower).toBeDefined();
  });

  it('should handle number thrown as non-Error value', () => {
    const originalParse = JSON.parse;
    JSON['parse'] = ((): unknown => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw 42;
    }) as typeof JSON.parse;
    try {
      const result = safeJsonParse('anything');
      expect(result.data).toBeNull();
      expect(result.error).toBe('JSON parse failed: 42');
    } finally {
      JSON.parse = originalParse;
    }
  });
});

describe('delay', () => {
  it('should resolve after the specified time', async () => {
    const start = Date.now();
    await delay(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });

  it('should resolve immediately for 0ms', async () => {
    const start = Date.now();
    await delay(0);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it('should throw TypeError for negative delay', () => {
    expect(() => delay(-1)).toThrow(TypeError);
  });

  it('should throw TypeError for non-integer delay', () => {
    expect(() => delay(1.5)).toThrow(TypeError);
  });
});
