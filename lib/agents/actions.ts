/**
 * Agent Action Handlers
 *
 * Handles execution of agent menu actions.
 */

import type { ActionHandler, ActionResult, AgentContext } from './types';

/**
 * Base action handler error
 */
export class ActionError extends Error {
  constructor(
    message: string,
    public readonly actionName: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ActionError';
  }
}

/**
 * Parse action string into type and params
 *
 * Examples:
 * - "workflow:status" → { type: "workflow", name: "status" }
 * - "file:read:config.yaml" → { type: "file", name: "read", params: ["config.yaml"] }
 */
export function parseAction(action: string): {
  type: string;
  name: string;
  params: string[];
} {
  const parts = action.split(':');
  return {
    type: parts[0] || '',
    name: parts[1] || '',
    params: parts.slice(2),
  };
}

/**
 * Workflow action handler (stub - will integrate with workflow engine)
 */
export class WorkflowActionHandler implements ActionHandler {
  name = 'workflow';
  description = 'Execute MADACE workflow';

  async execute(context: AgentContext, params?: Record<string, unknown>): Promise<ActionResult> {
    // TODO: Integrate with workflow engine (CORE-013)
    const workflowName = params?.name as string;

    return {
      success: false,
      message: `Workflow execution not yet implemented (workflow: ${workflowName})`,
      error: new Error('Workflow engine not available'),
    };
  }
}

/**
 * Template action handler
 */
export class TemplateActionHandler implements ActionHandler {
  name = 'template';
  description = 'Render template';

  async execute(context: AgentContext, params?: Record<string, unknown>): Promise<ActionResult> {
    // TODO: Integrate with template engine
    const templateName = params?.name as string;

    return {
      success: false,
      message: `Template rendering not yet implemented (template: ${templateName})`,
      error: new Error('Template rendering not available'),
    };
  }
}

/**
 * File read action handler
 */
export class FileReadActionHandler implements ActionHandler {
  name = 'file:read';
  description = 'Read file content';

  async execute(context: AgentContext, params?: Record<string, unknown>): Promise<ActionResult> {
    const filePath = params?.path as string;

    if (!filePath) {
      return {
        success: false,
        message: 'File path is required',
        error: new Error('Missing file path'),
      };
    }

    // Check if file is already loaded
    if (context.loadedFiles.has(filePath)) {
      return {
        success: true,
        message: `File already loaded: ${filePath}`,
        data: context.loadedFiles.get(filePath),
      };
    }

    return {
      success: false,
      message: `File reading not yet implemented: ${filePath}`,
      error: new Error('File reading not available'),
    };
  }
}

/**
 * Action handler registry
 */
export class ActionRegistry {
  private handlers: Map<string, ActionHandler> = new Map();

  /**
   * Register action handler
   */
  register(handler: ActionHandler): void {
    this.handlers.set(handler.name, handler);
  }

  /**
   * Get action handler by name
   */
  get(name: string): ActionHandler | undefined {
    return this.handlers.get(name);
  }

  /**
   * Check if handler exists
   */
  has(name: string): boolean {
    return this.handlers.has(name);
  }

  /**
   * Get all registered handlers
   */
  getAll(): ActionHandler[] {
    return Array.from(this.handlers.values());
  }
}

/**
 * Create default action registry with built-in handlers
 */
export function createActionRegistry(): ActionRegistry {
  const registry = new ActionRegistry();

  // Register built-in handlers
  registry.register(new WorkflowActionHandler());
  registry.register(new TemplateActionHandler());
  registry.register(new FileReadActionHandler());

  return registry;
}
