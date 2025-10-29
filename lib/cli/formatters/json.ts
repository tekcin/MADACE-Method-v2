/**
 * JSON Output Formatter
 *
 * Formats data as JSON for CLI output (machine-readable)
 */

/**
 * Format data as JSON with optional pretty-printing
 */
export function formatJSON(data: unknown, pretty = true): string {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Format success response
 */
export function formatSuccess(message: string, data?: unknown): string {
  return formatJSON({
    success: true,
    message,
    data,
  });
}

/**
 * Format error response
 */
export function formatError(message: string, error?: unknown): string {
  return formatJSON({
    success: false,
    error: message,
    details: error,
  });
}
