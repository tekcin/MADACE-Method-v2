/**
 * CLI Integration Module
 *
 * Provides adapters for CLI tools (Claude, Gemini) to work with MADACE
 * using the same TypeScript business logic as the Web UI.
 */

// Types
export * from './types';

// Base adapter
export * from './adapter';

// CLI adapters
export * from './claude';
export * from './gemini';

// Configuration generator
export * from './config-generator';

// CLI Commands
export * from './commands/status';
export * from './commands/assess-scale';
