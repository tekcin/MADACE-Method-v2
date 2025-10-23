/**
 * Legacy Pattern Converter
 *
 * Converts legacy template variable patterns to Handlebars syntax.
 *
 * Supported patterns:
 * - {variable-name} → {{variable_name}} (old MADACE style)
 * - ${variable} → {{variable}} (shell/JS style)
 * - %VAR% → {{VAR}} (Windows style)
 */

/**
 * Legacy pattern types
 */
export type LegacyPatternType = 'madace' | 'shell' | 'windows';

/**
 * Legacy pattern detection result
 */
export interface LegacyPatternDetection {
  /**
   * Whether legacy patterns were found
   */
  found: boolean;

  /**
   * Pattern types detected
   */
  patterns: LegacyPatternType[];

  /**
   * Number of replacements made
   */
  replacements: number;
}

/**
 * Convert legacy template patterns to Handlebars syntax
 *
 * @param template - Template string with potential legacy patterns
 * @param warnOnLegacy - Log warnings when legacy patterns are found
 * @returns Converted template and detection result
 */
export function convertLegacyPatterns(
  template: string,
  warnOnLegacy = true
): { template: string; detection: LegacyPatternDetection } {
  let converted = template;
  const patterns: Set<LegacyPatternType> = new Set();
  let totalReplacements = 0;

  // Pattern 1: {variable-name} → {{variable_name}}
  // Match: {word-with-dashes} but NOT {{already-handlebars}}
  const madacePattern = /(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_-]*)\}(?!\})/g;
  const madaceMatches = converted.match(madacePattern);
  if (madaceMatches) {
    patterns.add('madace');
    converted = converted.replace(madacePattern, (match, varName) => {
      totalReplacements++;
      // Convert dashes to underscores for Handlebars compatibility
      const normalized = varName.replace(/-/g, '_');
      return `{{${normalized}}}`;
    });
  }

  // Pattern 2: ${variable} → {{variable}}
  // Match: ${word} but NOT ${{already-converted}}
  const shellPattern = /\$(?!\{)\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const shellMatches = converted.match(shellPattern);
  if (shellMatches) {
    patterns.add('shell');
    converted = converted.replace(shellPattern, (match, varName) => {
      totalReplacements++;
      return `{{${varName}}}`;
    });
  }

  // Pattern 3: %VAR% → {{VAR}}
  // Match: %WORD% (typically uppercase)
  const windowsPattern = /%([a-zA-Z_][a-zA-Z0-9_]*)%/g;
  const windowsMatches = converted.match(windowsPattern);
  if (windowsMatches) {
    patterns.add('windows');
    converted = converted.replace(windowsPattern, (match, varName) => {
      totalReplacements++;
      return `{{${varName}}}`;
    });
  }

  const detection: LegacyPatternDetection = {
    found: patterns.size > 0,
    patterns: Array.from(patterns),
    replacements: totalReplacements,
  };

  // Log warning if legacy patterns were found
  if (warnOnLegacy && detection.found) {
    console.warn(
      `[TemplateEngine] Legacy patterns detected (${detection.patterns.join(', ')}). ` +
        `${detection.replacements} replacement(s) made. ` +
        `Consider updating templates to use Handlebars syntax: {{variable}}`
    );
  }

  return { template: converted, detection };
}

/**
 * Check if template contains legacy patterns (without converting)
 *
 * @param template - Template string to check
 * @returns Whether legacy patterns are present
 */
export function hasLegacyPatterns(template: string): boolean {
  const madacePattern = /(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_-]*)\}(?!\})/;
  const shellPattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/;
  const windowsPattern = /%([a-zA-Z_][a-zA-Z0-9_]*)%/;

  return (
    madacePattern.test(template) || shellPattern.test(template) || windowsPattern.test(template)
  );
}

/**
 * Get list of legacy variables in template
 *
 * @param template - Template string
 * @returns Array of variable names found in legacy patterns
 */
export function extractLegacyVariables(template: string): string[] {
  const variables: Set<string> = new Set();

  // Extract from {variable-name} pattern
  const madacePattern = /(?<!\{)\{([a-zA-Z_][a-zA-Z0-9_-]*)\}(?!\})/g;
  let match: RegExpExecArray | null;
  while ((match = madacePattern.exec(template)) !== null) {
    if (match[1]) {
      variables.add(match[1].replace(/-/g, '_'));
    }
  }

  // Extract from ${variable} pattern
  const shellPattern = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  while ((match = shellPattern.exec(template)) !== null) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  // Extract from %VAR% pattern
  const windowsPattern = /%([a-zA-Z_][a-zA-Z0-9_]*)%/g;
  while ((match = windowsPattern.exec(template)) !== null) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
}
