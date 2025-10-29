/**
 * Standard Handlebars Helpers
 *
 * Built-in and MADACE-specific helpers for template rendering.
 */

import Handlebars from 'handlebars';
import { getTechStackContext, getAgentTechStackContext } from '@/lib/constants/tech-stack';

/**
 * Register all standard helpers with Handlebars
 */
export function registerStandardHelpers(): void {
  // String manipulation helpers
  Handlebars.registerHelper('uppercase', (str: string) => {
    if (typeof str !== 'string') return '';
    return str.toUpperCase();
  });

  Handlebars.registerHelper('lowercase', (str: string) => {
    if (typeof str !== 'string') return '';
    return str.toLowerCase();
  });

  Handlebars.registerHelper('capitalize', (str: string) => {
    if (typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  });

  Handlebars.registerHelper('titlecase', (str: string) => {
    if (typeof str !== 'string') return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  });

  // Date helpers
  Handlebars.registerHelper('date', (format?: string) => {
    const now = new Date();

    if (!format || format === 'iso') {
      return now.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    if (format === 'datetime') {
      return now.toISOString(); // Full ISO datetime
    }

    if (format === 'timestamp') {
      return now.getTime().toString();
    }

    if (format === 'human') {
      return now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Default to ISO date
    return now.toISOString().split('T')[0];
  });

  Handlebars.registerHelper('year', () => {
    return new Date().getFullYear().toString();
  });

  // Comparison helpers
  Handlebars.registerHelper('eq', function (a: unknown, b: unknown) {
    return a === b;
  });

  Handlebars.registerHelper('ne', function (a: unknown, b: unknown) {
    return a !== b;
  });

  Handlebars.registerHelper('gt', function (a: number, b: number) {
    return a > b;
  });

  Handlebars.registerHelper('gte', function (a: number, b: number) {
    return a >= b;
  });

  Handlebars.registerHelper('lt', function (a: number, b: number) {
    return a < b;
  });

  Handlebars.registerHelper('lte', function (a: number, b: number) {
    return a <= b;
  });

  // Logical helpers
  Handlebars.registerHelper('and', function (...args: unknown[]) {
    // Last arg is Handlebars options object
    const values = args.slice(0, -1);
    return values.every(Boolean);
  });

  Handlebars.registerHelper('or', function (...args: unknown[]) {
    // Last arg is Handlebars options object
    const values = args.slice(0, -1);
    return values.some(Boolean);
  });

  Handlebars.registerHelper('not', function (value: unknown) {
    return !value;
  });

  // Data formatting helpers
  Handlebars.registerHelper('json', function (obj: unknown, pretty?: boolean) {
    try {
      if (pretty === true) {
        return JSON.stringify(obj, null, 2);
      }
      return JSON.stringify(obj);
    } catch {
      return '{}';
    }
  });

  Handlebars.registerHelper('join', function (arr: unknown[], separator = ', ') {
    if (!Array.isArray(arr)) return '';
    return arr.join(separator);
  });

  Handlebars.registerHelper('length', function (arr: unknown[] | string) {
    if (Array.isArray(arr) || typeof arr === 'string') {
      return arr.length;
    }
    return 0;
  });

  // MADACE-specific helpers
  Handlebars.registerHelper('tech-stack', function () {
    return new Handlebars.SafeString(getTechStackContext());
  });

  Handlebars.registerHelper('agent-tech-stack', function () {
    return new Handlebars.SafeString(getAgentTechStackContext());
  });

  Handlebars.registerHelper('agent-role', function (name: string) {
    const roles: Record<string, string> = {
      pm: 'Product Manager - Scale-Adaptive Planning Expert',
      analyst: 'Business Analyst - Requirements Engineering Specialist',
      architect: 'Software Architect - Technical Design Authority',
      sm: 'Scrum Master - Agile Workflow Facilitator',
      dev: 'Developer - Implementation Expert',
    };

    return roles[name.toLowerCase()] || 'Unknown Role';
  });

  // Assessment-specific helpers
  Handlebars.registerHelper('badge', function (level: number) {
    const badges: Record<number, string> = {
      0: '🟢',
      1: '🟡',
      2: '🟠',
      3: '🔴',
      4: '🟣',
    };

    return badges[level] || '⚪';
  });

  // Utility helpers
  Handlebars.registerHelper('default', function (value: unknown, defaultValue: unknown) {
    return value ?? defaultValue;
  });

  Handlebars.registerHelper('truncate', function (str: string, length: number, suffix = '...') {
    if (typeof str !== 'string') return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  });

  Handlebars.registerHelper('replace', function (str: string, search: string, replace: string) {
    if (typeof str !== 'string') return '';
    return str.replace(new RegExp(search, 'g'), replace);
  });

  Handlebars.registerHelper('startswith', function (str: string, prefix: string) {
    if (typeof str !== 'string') return false;
    return str.startsWith(prefix);
  });

  Handlebars.registerHelper('endswith', function (str: string, suffix: string) {
    if (typeof str !== 'string') return false;
    return str.endsWith(suffix);
  });

  Handlebars.registerHelper('contains', function (str: string, substring: string) {
    if (typeof str !== 'string') return false;
    return str.includes(substring);
  });

  // Math helpers
  Handlebars.registerHelper('add', function (a: number, b: number) {
    return a + b;
  });

  Handlebars.registerHelper('subtract', function (a: number, b: number) {
    return a - b;
  });

  Handlebars.registerHelper('multiply', function (a: number, b: number) {
    return a * b;
  });

  Handlebars.registerHelper('divide', function (a: number, b: number) {
    if (b === 0) return 0;
    return a / b;
  });

  Handlebars.registerHelper('round', function (num: number, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(num * multiplier) / multiplier;
  });

  // List helpers
  Handlebars.registerHelper('first', function (arr: unknown[]) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[0];
  });

  Handlebars.registerHelper('last', function (arr: unknown[]) {
    if (!Array.isArray(arr) || arr.length === 0) return undefined;
    return arr[arr.length - 1];
  });

  Handlebars.registerHelper('slice', function (arr: unknown[], start: number, end?: number) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(start, end);
  });

  Handlebars.registerHelper('reverse', function (arr: unknown[]) {
    if (!Array.isArray(arr)) return [];
    return [...arr].reverse();
  });

  Handlebars.registerHelper('sort', function (arr: unknown[]) {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort();
  });

  // Debug helper
  Handlebars.registerHelper('debug', function (context: unknown) {
    // eslint-disable-next-line no-console
    console.log('[Template Debug]', context);
    return '';
  });

  Handlebars.registerHelper('log', function (message: string) {
    // eslint-disable-next-line no-console
    console.log(`[Template Log] ${message}`);
    return '';
  });
}

/**
 * Get list of all registered helper names
 */
export function getRegisteredHelpers(): string[] {
  return Object.keys(Handlebars.helpers);
}

/**
 * Check if a helper is registered
 */
export function isHelperRegistered(name: string): boolean {
  return name in Handlebars.helpers;
}
