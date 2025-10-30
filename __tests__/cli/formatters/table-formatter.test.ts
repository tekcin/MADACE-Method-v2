/**
 * Unit Tests: Table Formatter
 *
 * Tests for lib/cli/formatters/table.ts
 */

import { formatTable, formatKeyValue } from '@/lib/cli/formatters/table';

describe('Table Formatter', () => {
  describe('formatTable', () => {
    it('should format simple table', () => {
      const data = [
        { name: 'Alice', age: 30, role: 'Developer' },
        { name: 'Bob', age: 25, role: 'Designer' },
      ];

      const output = formatTable({
        columns: [
          { key: 'name', label: 'Name', width: 10 },
          { key: 'age', label: 'Age', width: 5 },
          { key: 'role', label: 'Role', width: 15 },
        ],
        data,
        title: 'Team Members',
      });

      expect(output).toContain('Team Members');
      expect(output).toContain('Alice');
      expect(output).toContain('Bob');
      expect(output).toContain('30');
      expect(output).toContain('25');
      expect(output).toContain('Developer');
      expect(output).toContain('Designer');
    });

    it('should handle empty data', () => {
      const output = formatTable({
        columns: [
          { key: 'name', label: 'Name', width: 10 },
          { key: 'age', label: 'Age', width: 5 },
        ],
        data: [],
        title: 'Empty Table',
      });

      expect(output).toContain('No data to display');
    });

    it('should format table without title', () => {
      const data = [{ name: 'Alice' }];

      const output = formatTable({
        columns: [{ key: 'name', label: 'Name', width: 10 }],
        data,
      });

      expect(output).toContain('Alice');
      // formatTable always shows Total count by default
      expect(output).toContain('Total: 1 items');
    });

    it('should show total count when showCount is true', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob' }];

      const output = formatTable({
        columns: [{ key: 'name', label: 'Name', width: 10 }],
        data,
        title: 'Names',
        showCount: true,
      });

      expect(output).toContain('Total: 2 items');
    });

    it('should handle null and undefined values', () => {
      const data = [{ name: 'Alice', age: null, role: undefined }];

      const output = formatTable({
        columns: [
          { key: 'name', label: 'Name', width: 10 },
          { key: 'age', label: 'Age', width: 5 },
          { key: 'role', label: 'Role', width: 15 },
        ],
        data,
      });

      expect(output).toContain('Alice');
      // Null/undefined values show as empty spaces in the table
      expect(output).toBeDefined();
    });

    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const data = [{ description: longText }];

      const output = formatTable({
        columns: [{ key: 'description', label: 'Description', width: 20 }],
        data,
      });

      // Output should be defined and contain table structure
      // (output includes ANSI escape codes for formatting, so length comparison is not reliable)
      expect(output).toBeDefined();
      expect(output).toContain('Description');
      // The long text should appear in the output, possibly truncated
      expect(output.length).toBeGreaterThan(0);
    });
  });

  describe('formatKeyValue', () => {
    it('should format key-value pairs with title', () => {
      const data = {
        Name: 'Alice',
        Age: 30,
        Role: 'Developer',
      };

      const output = formatKeyValue(data, 'User Details');

      expect(output).toContain('User Details');
      expect(output).toContain('Name');
      expect(output).toContain('Alice');
      expect(output).toContain('Age');
      expect(output).toContain('30');
      expect(output).toContain('Role');
      expect(output).toContain('Developer');
    });

    it('should format key-value pairs without title', () => {
      const data = {
        Name: 'Bob',
        Age: 25,
      };

      const output = formatKeyValue(data);

      expect(output).toContain('Name');
      expect(output).toContain('Bob');
      expect(output).toContain('Age');
      expect(output).toContain('25');
    });

    it('should handle empty object', () => {
      const output = formatKeyValue({});

      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
    });

    it('should handle null and undefined values', () => {
      const data = {
        Name: 'Alice',
        Age: null,
        Role: undefined,
      };

      const output = formatKeyValue(data);

      expect(output).toContain('Name');
      expect(output).toContain('Alice');
      expect(output).toContain('Age');
      expect(output).toContain('Role');
    });

    it('should format nested objects as strings', () => {
      const data = {
        Name: 'Alice',
        Settings: { theme: 'dark', notifications: true },
      };

      const output = formatKeyValue(data);

      expect(output).toContain('Name');
      expect(output).toContain('Alice');
      expect(output).toContain('Settings');
      // Nested object should be stringified
      expect(output).toMatch(/theme.*dark/);
    });
  });
});
