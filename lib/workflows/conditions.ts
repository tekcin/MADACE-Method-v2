/**
 * Workflow Condition Evaluator
 * STORY-V3-006: Add Conditional Workflow Execution
 *
 * Supports:
 * - Variable substitution: ${VAR}, {{VAR}}
 * - Comparison operators: ===, !==, >, <, >=, <=
 * - Boolean operators: &&, ||, !
 * - String, number, and boolean values
 *
 * Examples:
 * - "${LEVEL} === 0"
 * - "${TEAM_SIZE} > 5 && ${SECURITY} === 'high'"
 * - "${EXISTING_CODEBASE} === true"
 * - "!${DEBUG_MODE}"
 */

export interface ConditionEvaluationOptions {
  throwOnError?: boolean; // If true, throws on evaluation errors (default: true)
  strictMode?: boolean; // If true, undefined variables throw errors (default: true)
}

export class ConditionEvaluationError extends Error {
  constructor(
    message: string,
    public readonly condition: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ConditionEvaluationError';
  }
}

/**
 * Evaluate a condition string with variable substitution
 *
 * @param condition - Condition string to evaluate (e.g., "${LEVEL} === 0")
 * @param variables - Variables to substitute (e.g., { LEVEL: 0 })
 * @param options - Evaluation options
 * @returns Boolean result of the condition evaluation
 * @throws ConditionEvaluationError if condition is invalid
 */
export function evaluateCondition(
  condition: string,
  variables: Record<string, unknown>,
  options: ConditionEvaluationOptions = {}
): boolean {
  const { throwOnError = true, strictMode = true } = options;

  try {
    // Step 1: Validate condition is not empty
    if (!condition || condition.trim() === '') {
      throw new ConditionEvaluationError('Condition cannot be empty', condition);
    }

    // Step 2: Substitute variables
    const resolved = substituteVariables(condition, variables, strictMode);

    // Step 3: Evaluate the expression
    const result = evaluateExpression(resolved);

    // Step 4: Ensure result is boolean
    if (typeof result !== 'boolean') {
      throw new ConditionEvaluationError(
        `Condition must evaluate to boolean, got: ${typeof result}`,
        condition
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ConditionEvaluationError) {
      if (throwOnError) throw error;
      return false;
    }

    if (throwOnError) {
      throw new ConditionEvaluationError(
        `Failed to evaluate condition: ${error instanceof Error ? error.message : String(error)}`,
        condition,
        error instanceof Error ? error : undefined
      );
    }

    return false;
  }
}

/**
 * Substitute variables in a condition string
 * Supports both ${VAR} and {{VAR}} syntax
 */
export function substituteVariables(
  condition: string,
  variables: Record<string, unknown>,
  strictMode: boolean = true
): string {
  let result = condition;

  // Replace ${VAR} and {{VAR}} with actual values
  // Use regex to find all variable references
  const doublePattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const singlePattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

  // Replace double curly braces {{VAR}}
  result = result.replace(doublePattern, (match, varName) => {
    if (!(varName in variables)) {
      if (strictMode) {
        throw new ConditionEvaluationError(`Variable not found: ${varName}`, condition);
      }
      return 'undefined';
    }
    return formatValue(variables[varName]);
  });

  // Replace single curly braces with dollar sign ${VAR}
  result = result.replace(singlePattern, (match, varName) => {
    if (!(varName in variables)) {
      if (strictMode) {
        throw new ConditionEvaluationError(`Variable not found: ${varName}`, condition);
      }
      return 'undefined';
    }
    return formatValue(variables[varName]);
  });

  return result;
}

/**
 * Format a value for substitution in a condition
 */
function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`; // Escape quotes
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Evaluate a boolean expression
 * Uses Function constructor for safe evaluation (no eval)
 *
 * Supported operators:
 * - Comparison: ===, !==, >, <, >=, <=
 * - Boolean: &&, ||, !
 * - Parentheses for grouping
 */
function evaluateExpression(expression: string): unknown {
  // Sanitize expression to prevent code injection
  const sanitized = sanitizeExpression(expression);

  try {
    // Use Function constructor to evaluate expression
    // This is safer than eval() as it doesn't have access to local scope
    const func = new Function(`return (${sanitized});`);
    const result = func();
    return result; // Return raw result, not converted to boolean
  } catch (error) {
    throw new ConditionEvaluationError(
      `Failed to evaluate expression: ${error instanceof Error ? error.message : String(error)}`,
      expression,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Sanitize expression to prevent code injection
 * Only allows safe operators and values
 */
function sanitizeExpression(expression: string): string {
  // Remove whitespace for easier validation
  const trimmed = expression.trim();

  // Allow: numbers, strings, booleans, null, undefined, operators, parentheses
  const allowedPattern = /^[0-9a-zA-Z\s'".,!()\[\]{}=&|<>+\-*/%]+$/;

  if (!allowedPattern.test(trimmed)) {
    throw new ConditionEvaluationError('Expression contains invalid characters', expression);
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /\beval\b/i,
    /\bfunction\b/i,
    /\bFunction\b/i,
    /\breturn\b/i,
    /\bthis\b/i,
    /\bwindow\b/i,
    /\bglobal\b/i,
    /\bprocess\b/i,
    /\brequire\b/i,
    /\bimport\b/i,
    /\bexport\b/i,
    /\bdelete\b/i,
    /\bnew\b/i,
    /\btypeof\b/i,
    /\binstanceof\b/i,
    /\bin\b/i,
    /\bvoid\b/i,
    /\byield\b/i,
    /\basync\b/i,
    /\bawait\b/i,
    /\bclass\b/i,
    /\bsuper\b/i,
    /\bthrow\b/i,
    /\btry\b/i,
    /\bcatch\b/i,
    /\bfinally\b/i,
    /\bfor\b/i,
    /\bwhile\b/i,
    /\bdo\b/i,
    /\bswitch\b/i,
    /\bcase\b/i,
    /\bbreak\b/i,
    /\bcontinue\b/i,
    /\bwith\b/i,
    /\bdebugger\b/i,
    /\bvar\b/i,
    /\blet\b/i,
    /\bconst\b/i,
    /=>/,
    /\.\./,
    /\[.*\]/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      throw new ConditionEvaluationError(
        `Expression contains dangerous pattern: ${pattern}`,
        expression
      );
    }
  }

  return trimmed;
}

/**
 * Helper functions for common condition patterns
 */

export const ConditionHelpers = {
  /**
   * Check if value equals expected (loose equality)
   */
  eq: (value: unknown, expected: unknown): boolean => value == expected,

  /**
   * Check if value does not equal expected (loose inequality)
   */
  ne: (value: unknown, expected: unknown): boolean => value != expected,

  /**
   * Check if value is greater than expected
   */
  gt: (value: unknown, expected: unknown): boolean => {
    if (typeof value === 'number' && typeof expected === 'number') {
      return value > expected;
    }
    return false;
  },

  /**
   * Check if value is less than expected
   */
  lt: (value: unknown, expected: unknown): boolean => {
    if (typeof value === 'number' && typeof expected === 'number') {
      return value < expected;
    }
    return false;
  },

  /**
   * Check if value is greater than or equal to expected
   */
  gte: (value: unknown, expected: unknown): boolean => {
    if (typeof value === 'number' && typeof expected === 'number') {
      return value >= expected;
    }
    return false;
  },

  /**
   * Check if value is less than or equal to expected
   */
  lte: (value: unknown, expected: unknown): boolean => {
    if (typeof value === 'number' && typeof expected === 'number') {
      return value <= expected;
    }
    return false;
  },

  /**
   * Check if value is truthy
   */
  truthy: (value: unknown): boolean => Boolean(value),

  /**
   * Check if value is falsy
   */
  falsy: (value: unknown): boolean => !value,

  /**
   * Check if value is null or undefined
   */
  isNullOrUndefined: (value: unknown): boolean => value === null || value === undefined,

  /**
   * Check if array/string contains value
   */
  contains: (haystack: unknown, needle: unknown): boolean => {
    if (typeof haystack === 'string' && typeof needle === 'string') {
      return haystack.includes(needle);
    }
    if (Array.isArray(haystack)) {
      return haystack.includes(needle);
    }
    return false;
  },
};
