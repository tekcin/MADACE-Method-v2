/**
 * Unit Tests: JSON Formatter
 *
 * Tests for lib/cli/formatters/json.ts
 */

import { formatJSON } from '@/lib/cli/formatters/json';

describe('JSON Formatter', () => {
  describe('formatJSON', () => {
    it('should format simple object', () => {
      const data = { name: 'Alice', age: 30 };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed).toEqual(data);
    });

    it('should format array', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob' }];
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed).toEqual(data);
    });

    it('should format nested objects', () => {
      const data = {
        user: {
          name: 'Alice',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed).toEqual(data);
    });

    it('should pretty-print with indentation', () => {
      const data = { name: 'Alice', age: 30 };
      const output = formatJSON(data);

      // Should have indentation (2 spaces by default)
      expect(output).toContain('  "name"');
      expect(output).toContain('  "age"');
    });

    it('should handle null values', () => {
      const data = { name: 'Alice', age: null };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed.age).toBeNull();
    });

    it('should handle undefined values', () => {
      const data = { name: 'Alice', age: undefined };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      // undefined is not valid JSON, so it should be omitted
      expect(parsed).not.toHaveProperty('age');
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-01-01T00:00:00.000Z');
      const data = { createdAt: date };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed.createdAt).toBe(date.toISOString());
    });

    it('should handle empty object', () => {
      const data = {};
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed).toEqual({});
    });

    it('should handle empty array', () => {
      const data: any[] = [];
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed).toEqual([]);
    });

    it('should handle special characters', () => {
      const data = {
        message: 'Hello "world"\nNew line\tTab',
      };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed.message).toBe('Hello "world"\nNew line\tTab');
    });

    it('should handle numbers and booleans', () => {
      const data = {
        count: 42,
        price: 19.99,
        active: true,
        disabled: false,
      };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed.count).toBe(42);
      expect(parsed.price).toBe(19.99);
      expect(parsed.active).toBe(true);
      expect(parsed.disabled).toBe(false);
    });

    it('should throw on circular references', () => {
      const data: any = { name: 'Alice' };
      data.self = data; // Create circular reference

      // Should throw TypeError on circular reference
      expect(() => formatJSON(data)).toThrow(TypeError);
      expect(() => formatJSON(data)).toThrow(/circular/i);
    });

    it('should format large objects correctly', () => {
      const data = {
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          active: i % 2 === 0,
        })),
      };
      const output = formatJSON(data);

      const parsed = JSON.parse(output);
      expect(parsed.users).toHaveLength(100);
      expect(parsed.users[0].name).toBe('User 0');
      expect(parsed.users[99].name).toBe('User 99');
    });
  });
});
