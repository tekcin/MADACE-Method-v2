/**
 * Syntax Highlighting for Multi-line Input
 *
 * Provides basic syntax highlighting for YAML/JSON content
 */

import chalk from 'chalk';

/**
 * Detect content type (YAML or JSON)
 */
export function detectContentType(content: string): 'yaml' | 'json' | 'plain' {
  const trimmed = content.trim();

  // JSON detection
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // YAML detection (key: value patterns, lists, etc.)
  if (
    /^\s*[\w-]+\s*:/.test(content) || // key: value
    /^\s*-\s+/.test(content) // list items
  ) {
    return 'yaml';
  }

  return 'plain';
}

/**
 * Highlight YAML content
 */
export function highlightYAML(content: string): string {
  const lines = content.split('\n');
  const highlighted = lines.map((line) => {
    // Comments (# ...)
    if (line.trim().startsWith('#')) {
      return chalk.gray(line);
    }

    // Key-value pairs (key: value)
    const keyValueMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)$/);
    if (keyValueMatch) {
      const indent = keyValueMatch[1] || '';
      const key = keyValueMatch[2] || '';
      const separator = keyValueMatch[3] || '';
      const value = keyValueMatch[4] || '';
      return indent + chalk.cyan(key) + chalk.gray(separator) + highlightYAMLValue(value);
    }

    // List items (- item)
    const listMatch = line.match(/^(\s*-\s+)(.*)$/);
    if (listMatch) {
      const bullet = listMatch[1] || '';
      const content = listMatch[2] || '';
      return chalk.yellow(bullet) + highlightYAMLValue(content);
    }

    // Default
    return line;
  });

  return highlighted.join('\n');
}

/**
 * Highlight YAML value (string, number, boolean, null)
 */
function highlightYAMLValue(value: string): string {
  const trimmed = value.trim();

  // Null
  if (trimmed === 'null' || trimmed === '~') {
    return chalk.gray(value);
  }

  // Boolean
  if (trimmed === 'true' || trimmed === 'false') {
    return chalk.magenta(value);
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return chalk.yellow(value);
  }

  // String (quoted)
  if (/^["'].*["']$/.test(trimmed)) {
    return chalk.green(value);
  }

  // Default (unquoted string)
  return chalk.white(value);
}

/**
 * Highlight JSON content
 */
export function highlightJSON(content: string): string {
  try {
    // Try to parse and pretty-print
    const parsed = JSON.parse(content);
    const prettyJSON = JSON.stringify(parsed, null, 2);

    // Highlight pretty JSON
    return prettyJSON.replace(
      /(".*?")|(true|false|null)|(-?\d+(\.\d+)?)|(\{|\}|\[|\]|,|:)/g,
      (match, string, boolean, number, _, punctuation) => {
        if (string) return chalk.green(match); // Strings
        if (boolean || match === 'null') return chalk.magenta(match); // Booleans/null
        if (number) return chalk.yellow(match); // Numbers
        if (punctuation) return chalk.gray(match); // Punctuation
        return match;
      }
    );
  } catch {
    // Invalid JSON - return as-is
    return content;
  }
}

/**
 * Highlight content based on detected type
 */
export function highlightContent(content: string): string {
  const type = detectContentType(content);

  switch (type) {
    case 'yaml':
      return highlightYAML(content);
    case 'json':
      return highlightJSON(content);
    default:
      return content;
  }
}

/**
 * Format multi-line input with line numbers and syntax highlighting
 */
export function formatMultilineInput(lines: string[]): string {
  const content = lines.join('\n');
  const type = detectContentType(content);
  const highlighted = highlightContent(content);
  const numberedLines = highlighted.split('\n').map((line, index) => {
    const lineNumber = chalk.dim(`${(index + 1).toString().padStart(3)} │ `);
    return lineNumber + line;
  });

  const header = chalk.bold.cyan(
    `\n┌─ ${type.toUpperCase()} Input ─────────────────────────────────────────\n`
  );
  const footer = chalk.bold.cyan('└───────────────────────────────────────────────────────────\n');

  return header + numberedLines.join('\n') + '\n' + footer;
}
