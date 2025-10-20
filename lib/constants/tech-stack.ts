/**
 * MADACE_RUST_PY Technology Stack
 *
 * This is the single source of truth for all technology versions.
 * Update this file when upgrading dependencies.
 *
 * @version 1.0.0
 * @updated 2025-10-20
 */

export const TECH_STACK = {
  // Core Framework
  framework: {
    name: 'Next.js',
    version: '15.5.6',
    pattern: 'App Router',
  },

  // UI Library
  ui: {
    name: 'React',
    version: '19.0.0',
  },

  // Language
  language: {
    name: 'TypeScript',
    version: '5.7.3',
    mode: 'strict',
  },

  // Runtime
  runtime: {
    name: 'Node.js',
    version: '20+',
    requirement: '>=20.0.0',
  },

  // Styling
  styling: {
    name: 'Tailwind CSS',
    version: '4.1.1',
  },

  // Core Libraries
  libraries: {
    validation: {
      name: 'Zod',
      version: '4.1.12',
    },
    yaml: {
      name: 'js-yaml',
      version: '4.1.0',
    },
    templates: {
      name: 'Handlebars',
      version: '4.7.8',
    },
  },

  // Development Tools
  tools: {
    linter: {
      name: 'ESLint',
      version: '9.19.0',
    },
    packageManager: {
      name: 'npm',
      version: '11.6.0',
    },
  },

  // LLM Providers
  llm: {
    providers: ['Google Gemini', 'Anthropic Claude', 'OpenAI GPT', 'Local Models (Ollama)'],
  },

  // Deployment
  deployment: {
    primary: 'Docker',
    alternative: 'Vercel',
    imageSize: {
      production: '~200MB',
      development: '~2-3GB',
    },
  },
} as const;

/**
 * Architecture summary
 */
export const ARCHITECTURE = {
  pattern: 'Full-stack TypeScript',
  runtimes: 1,
  languages: 1,
  stateStorage: 'File-based (YAML, JSON, Markdown)',
} as const;

/**
 * Get formatted tech stack string for display
 */
export function getTechStackString(): string {
  return `Next.js ${TECH_STACK.framework.version} • React ${TECH_STACK.ui.version} • TypeScript ${TECH_STACK.language.version} • Node.js ${TECH_STACK.runtime.version} • Tailwind CSS ${TECH_STACK.styling.version}`;
}

/**
 * Get tech stack context for LLM prompts
 *
 * ALWAYS include this in LLM prompts to ensure correct technology usage.
 */
export function getTechStackContext(): string {
  return `TECH STACK CONTEXT:
- Framework: ${TECH_STACK.framework.name} ${TECH_STACK.framework.version} (${TECH_STACK.framework.pattern})
- Language: ${TECH_STACK.language.name} ${TECH_STACK.language.version} (${TECH_STACK.language.mode} mode)
- Runtime: ${TECH_STACK.runtime.name} ${TECH_STACK.runtime.version}
- UI: ${TECH_STACK.ui.name} ${TECH_STACK.ui.version} + ${TECH_STACK.styling.name} ${TECH_STACK.styling.version}
- Validation: ${TECH_STACK.libraries.validation.name} ${TECH_STACK.libraries.validation.version}
- YAML: ${TECH_STACK.libraries.yaml.name} ${TECH_STACK.libraries.yaml.version}
- Templates: ${TECH_STACK.libraries.templates.name} ${TECH_STACK.libraries.templates.version}
- Pattern: ${ARCHITECTURE.pattern} (single runtime, no FFI)`;
}

/**
 * Get tech stack context for agent prompts
 * This should be injected into every agent prompt that generates code.
 */
export function getAgentTechStackContext(): string {
  return `You are working with the following technology stack:

${getTechStackContext()}

IMPORTANT RULES:
1. Only use TypeScript (version ${TECH_STACK.language.version})
2. Use Next.js ${TECH_STACK.framework.version} App Router patterns
3. Use React ${TECH_STACK.ui.version} Server Components where appropriate
4. Use Zod for runtime validation
5. Use Tailwind CSS ${TECH_STACK.styling.version} for styling
6. Use js-yaml for YAML parsing
7. Use Handlebars for templates
8. Target Node.js ${TECH_STACK.runtime.version}
9. Enable TypeScript strict mode
10. No Python, no Rust, no FFI - TypeScript only`;
}

/**
 * Validate current environment against required tech stack
 */
export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Node.js version
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0] || '0');
  if (nodeMajor < 20) {
    errors.push(`Node.js ${TECH_STACK.runtime.version} required, found ${nodeVersion}`);
  }

  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    warnings.push('Running in development mode');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
