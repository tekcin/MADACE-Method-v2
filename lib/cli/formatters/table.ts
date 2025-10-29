/**
 * Table Output Formatter
 *
 * Formats data as ASCII tables for CLI output using cli-table3
 */

import Table from 'cli-table3';

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableOptions {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  title?: string;
}

/**
 * Format data as an ASCII table
 */
export function formatTable(options: TableOptions): string {
  const { columns, data, title } = options;

  if (data.length === 0) {
    return title ? `${title}\n\nNo data to display` : 'No data to display';
  }

  const table = new Table({
    head: columns.map((col) => col.label),
    colWidths: columns.map((col) => col.width ?? null),
    colAligns: columns.map((col) => col.align || 'left'),
    style: {
      head: ['cyan', 'bold'],
      border: ['gray'],
    },
    wordWrap: true,
  });

  // Add data rows
  for (const row of data) {
    const tableRow = columns.map((col) => {
      const value = row[col.key];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    });
    table.push(tableRow);
  }

  let output = '';
  if (title) {
    output += `\n${title}\n\n`;
  }
  output += table.toString();
  output += `\n\nTotal: ${data.length} items\n`;

  return output;
}

/**
 * Format a single key-value pair object
 */
export function formatKeyValue(data: Record<string, unknown>, title?: string): string {
  const table = new Table({
    style: {
      head: ['cyan', 'bold'],
      border: ['gray'],
    },
  });

  for (const [key, value] of Object.entries(data)) {
    let displayValue: string;
    if (value === null || value === undefined) {
      displayValue = '';
    } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value, null, 2);
    } else {
      displayValue = String(value);
    }
    table.push({ [key]: displayValue });
  }

  let output = '';
  if (title) {
    output += `\n${title}\n\n`;
  }
  output += table.toString();
  output += '\n';

  return output;
}

/**
 * Format a simple list
 */
export function formatList(items: string[], title?: string): string {
  let output = '';
  if (title) {
    output += `\n${title}\n\n`;
  }
  for (let i = 0; i < items.length; i++) {
    output += `${i + 1}. ${items[i]}\n`;
  }
  output += `\nTotal: ${items.length} items\n`;
  return output;
}
