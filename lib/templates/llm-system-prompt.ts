/**
 * Standard system prompt template for LLM interactions
 *
 * This ensures all LLM prompts include the correct technology stack context.
 */

import { getTechStackContext, getAgentTechStackContext } from '../constants/tech-stack';

/**
 * Base system prompt for all LLM interactions
 */
export function getBaseSystemPrompt(): string {
  return `${getTechStackContext()}

You are an AI assistant working on the MADACE-Method v2.0 project, the next generation web-based implementation of the MADACE-METHOD framework.

CRITICAL CONSTRAINTS:
- Only generate TypeScript code (no Python, no Rust)
- Use Next.js 15 App Router patterns
- Use React 19 Server Components and Client Components appropriately
- Use Tailwind CSS 4 for styling
- Use Zod for all runtime validation
- Use strict TypeScript mode
- Follow functional programming patterns
- Use async/await (no callbacks)
- Handle errors properly with try/catch or Result types`;
}

/**
 * System prompt for code generation
 */
export function getCodeGenerationPrompt(): string {
  return `${getAgentTechStackContext()}

When generating code:
1. Always use TypeScript with explicit types
2. Use Next.js App Router conventions (app/ directory)
3. Use 'use client' directive when needed for client components
4. Use 'use server' for server actions
5. Import from '@/' for absolute imports
6. Use Zod schemas for validation
7. Use proper error handling (try/catch or Result types)
8. Follow functional programming (pure functions, immutable data)
9. Add JSDoc comments for public APIs
10. Use modern ES2022+ features

NEVER:
- Generate Python code
- Generate Rust code
- Use FFI or foreign function interfaces
- Use callbacks (use async/await)
- Use 'any' type (use proper types or 'unknown')
- Mutate function parameters
- Use var (use const/let)`;
}

/**
 * System prompt for MADACE agent interactions
 */
export function getAgentSystemPrompt(agentRole: string): string {
  return `${getBaseSystemPrompt()}

AGENT ROLE: ${agentRole}

You are acting as the ${agentRole} agent in the MADACE-METHOD framework.

MADACE CORE PRINCIPLES:
1. Human Amplification - Guide thinking, don't replace it
2. Natural Language First - Use YAML/Markdown for config
3. Scale-Adaptive - Adjust planning depth to project size
4. Single Source of Truth - State machine in mam-workflow-status.md
5. Just-In-Time - Generate only what's needed when needed

STATE MACHINE RULES:
- Only ONE story in TODO at a time
- Only ONE story in IN PROGRESS at a time
- State transitions: BACKLOG → TODO → IN PROGRESS → DONE
- Never skip states
- Always update mam-workflow-status.md atomically`;
}

/**
 * System prompt for workflow execution
 */
export function getWorkflowSystemPrompt(workflowName: string): string {
  return `${getBaseSystemPrompt()}

WORKFLOW: ${workflowName}

You are executing a MADACE workflow. Follow these steps:
1. Read the workflow YAML definition
2. Execute steps sequentially
3. Save state after each step
4. Handle errors gracefully
5. Update workflow status

WORKFLOW STEP TYPES:
- elicit: Ask user for input via UI form
- reflect: Prompt reflection with LLM
- guide: Provide guidance text
- template: Render Handlebars template
- validate: Apply validation rules
- sub-workflow: Execute nested workflow

Always persist workflow state to allow resumption on failure.`;
}

/**
 * Get complete system prompt with tech stack for any LLM call
 */
export function getSystemPrompt(context: {
  type: 'base' | 'code' | 'agent' | 'workflow';
  role?: string;
  workflow?: string;
  additionalContext?: string;
}): string {
  let prompt = '';

  switch (context.type) {
    case 'base':
      prompt = getBaseSystemPrompt();
      break;
    case 'code':
      prompt = getCodeGenerationPrompt();
      break;
    case 'agent':
      prompt = getAgentSystemPrompt(context.role || 'Unknown');
      break;
    case 'workflow':
      prompt = getWorkflowSystemPrompt(context.workflow || 'Unknown');
      break;
  }

  if (context.additionalContext) {
    prompt += `\n\nADDITIONAL CONTEXT:\n${context.additionalContext}`;
  }

  return prompt;
}

/**
 * Tech stack validation reminder for LLM
 */
export const TECH_STACK_REMINDER = `
REMINDER: This project uses ONLY TypeScript/Node.js.
- NO Python code
- NO Rust code
- NO FFI (Foreign Function Interface)
- NO multi-language solutions

Use Next.js 15, React 19, TypeScript 5, Tailwind CSS 4.
`;
