/**
 * Routing Action Handler
 *
 * Implements workflow routing logic for scale-adaptive workflows.
 * Evaluates conditions and selects appropriate target workflows.
 */

import type { WorkflowStep } from '../types';

/**
 * Workflow context for passing data between steps
 */
export interface WorkflowContext extends Record<string, unknown> {
  workflowName?: string;
  parentWorkflow?: string;
  inheritedContext?: WorkflowContext;
  nextWorkflow?: string;
  variables?: Record<string, unknown>;
}

/**
 * Routing rule configuration
 */
export interface RoutingRule {
  level?: number;
  label?: string;
  workflow?: string;
  workflow_path?: string;
  description?: string;
  estimated_duration?: string;
  phases?: string[];
}

/**
 * Routing configuration from workflow YAML
 */
export interface RoutingConfig {
  description?: string;
  rules?: Record<string | number, RoutingRule>;
  default?: RoutingRule;
}

/**
 * Execute routing action - select and load target workflow
 *
 * @param step - Workflow step with routing configuration
 * @param context - Current workflow execution context
 * @returns Path to target workflow
 * @throws Error if routing configuration is missing or no route found
 *
 * @example
 * ```typescript
 * const step = {
 *   id: 'route-to-workflow',
 *   action: 'action',
 *   function: 'routeWorkflow',
 *   input: '{{complexity_result.level}}',
 *   routing: {
 *     rules: {
 *       0: { workflow_path: 'minimal-path.workflow.yaml' },
 *       1: { workflow_path: 'simple-path.workflow.yaml' }
 *     },
 *     default: { workflow_path: 'standard-path.workflow.yaml' }
 *   }
 * };
 *
 * const context = {
 *   complexity_result: { level: 1 }
 * };
 *
 * const targetWorkflow = await executeRouteAction(step, context);
 * // Returns: 'simple-path.workflow.yaml'
 * ```
 */
export async function executeRouteAction(
  step: WorkflowStep,
  context: WorkflowContext
): Promise<string> {
  const routeConfig = (step as unknown as { routing?: RoutingConfig }).routing;

  if (!routeConfig) {
    throw new Error(`Routing configuration missing for step: ${step.name}`);
  }

  // Extract condition value from context
  const conditionExpression = (step as unknown as { input?: string }).input || step.condition;
  if (!conditionExpression) {
    throw new Error(`No input or condition specified for routing step: ${step.name}`);
  }

  const conditionValue = evaluateCondition(conditionExpression, context);

  // Find matching route
  let targetWorkflow: string | undefined;

  if (typeof conditionValue === 'number' || typeof conditionValue === 'string') {
    const rule = routeConfig.rules?.[conditionValue];
    targetWorkflow = rule?.workflow_path || rule?.workflow;
  }

  // Fallback to default if no match
  if (!targetWorkflow && routeConfig.default) {
    targetWorkflow = routeConfig.default.workflow_path || routeConfig.default.workflow;
    console.warn(
      `No route found for condition value: ${conditionValue}, using default: ${targetWorkflow}`
    );
  }

  if (!targetWorkflow) {
    throw new Error(
      `No route found for condition value: ${conditionValue} and no default route configured`
    );
  }

  return targetWorkflow;
}

/**
 * Evaluate condition expression in context
 *
 * Supports:
 * - Handlebars-style variables: `{{var}}`, `{{obj.prop}}`, `{{obj.prop.nested}}`
 * - Direct variable names: `var`, `obj.prop`
 *
 * @param condition - Condition expression to evaluate
 * @param context - Workflow execution context
 * @returns Evaluated value from context
 *
 * @example
 * ```typescript
 * const context = {
 *   complexity_result: { level: 2, score: 18 },
 *   project_type: 'Standard Application'
 * };
 *
 * evaluateCondition('{{complexity_result.level}}', context); // Returns: 2
 * evaluateCondition('complexity_result.score', context);     // Returns: 18
 * evaluateCondition('{{project_type}}', context);            // Returns: 'Standard Application'
 * ```
 */
export function evaluateCondition(condition: string, context: WorkflowContext): unknown {
  // Handle Handlebars-style variables: {{complexity_result.level}}
  const match = condition.match(/\{\{([^}]+)\}\}/);

  if (match && match[1]) {
    const path = match[1].trim();
    return getNestedValue(context, path);
  }

  // Direct variable name
  return getNestedValue(context, condition);
}

/**
 * Get nested property value from object using dot notation
 *
 * @param obj - Object to extract value from
 * @param path - Dot-notation path to property (e.g., 'user.profile.name')
 * @returns Value at path or undefined if not found
 *
 * @example
 * ```typescript
 * const data = {
 *   user: {
 *     profile: { name: 'John', age: 30 },
 *     settings: { theme: 'dark' }
 *   }
 * };
 *
 * getNestedValue(data, 'user.profile.name'); // Returns: 'John'
 * getNestedValue(data, 'user.settings.theme'); // Returns: 'dark'
 * getNestedValue(data, 'user.profile.invalid'); // Returns: undefined
 * ```
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object'
      ? (current as Record<string, unknown>)[key]
      : undefined;
  }, obj as unknown);
}

/**
 * Pass context to sub-workflow
 *
 * Creates a new context object that inherits from parent context
 * while maintaining parent-child relationship tracking.
 *
 * @param targetWorkflow - Path to target workflow
 * @param parentContext - Parent workflow context
 * @returns New context for sub-workflow
 *
 * @example
 * ```typescript
 * const parentContext = {
 *   workflowName: 'scale-adaptive-route',
 *   variables: {
 *     complexity_result: { level: 2, score: 18 },
 *     project_input: { project_type: 'Standard Application' }
 *   }
 * };
 *
 * const subContext = createSubWorkflowContext(
 *   'madace/mam/workflows/standard-path.workflow.yaml',
 *   parentContext
 * );
 *
 * // Result:
 * // {
 * //   ...parentContext,
 * //   parentWorkflow: 'scale-adaptive-route',
 * //   workflowName: 'madace/mam/workflows/standard-path.workflow.yaml',
 * //   inheritedContext: { ...parentContext }
 * // }
 * ```
 */
export function createSubWorkflowContext(
  targetWorkflow: string,
  parentContext: WorkflowContext
): WorkflowContext {
  return {
    ...parentContext,
    parentWorkflow: parentContext.workflowName,
    workflowName: targetWorkflow,
    inheritedContext: parentContext,
  };
}
