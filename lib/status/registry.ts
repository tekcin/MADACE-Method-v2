/**
 * MADACE Status Provider Registry
 *
 * Central registry for managing status providers with auto-detection and routing.
 * Implements provider discovery pattern for unified status checking across all entity types.
 */

import type { IStatusProvider, StatusResult, StatusFormat } from './types';
import { StoryStatusProvider } from './providers/story-provider';
import { EpicStatusProvider } from './providers/epic-provider';
import { WorkflowStatusProvider } from './providers/workflow-provider';
import { StateMachineStatusProvider } from './providers/state-machine-provider';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Registry Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Status provider registry
 *
 * Manages a collection of status providers and routes queries to the appropriate provider
 * based on input pattern detection. Supports custom provider registration and maintains
 * a priority-ordered list for provider selection.
 *
 * @example
 * ```typescript
 * const registry = new StatusProviderRegistry();
 *
 * // Auto-detect and route to appropriate provider
 * const status = await registry.getStatus('STORY-001');
 * console.log(status);
 *
 * // Register custom provider
 * registry.registerProvider('custom', new MyCustomProvider());
 * ```
 */
export class StatusProviderRegistry {
  /**
   * Map of provider name to provider instance
   */
  private providers: Map<string, IStatusProvider> = new Map();

  /**
   * Registration order (used for detection priority)
   * More specific providers should be registered first
   */
  private providerOrder: string[] = [];

  /**
   * Create a new status provider registry
   *
   * Default providers are registered automatically in priority order:
   * 1. story - Specific story IDs (STORY-001, US-001, etc.)
   * 2. epic - Epic IDs (EPIC-V3-001, etc.)
   * 3. workflow - Workflow names (pm-planning, etc.)
   * 4. state-machine - Global state overview (default fallback)
   */
  constructor() {
    this.registerDefaultProviders();
  }

  /**
   * Register a status provider
   *
   * Providers are registered by name and added to the detection priority order.
   * If a provider with the same name exists, it will be replaced.
   *
   * @param name - Provider identifier (for lookup and debugging)
   * @param provider - Provider instance implementing IStatusProvider
   *
   * @example
   * ```typescript
   * registry.registerProvider('story', new StoryStatusProvider());
   * registry.registerProvider('custom', new MyCustomProvider());
   * ```
   */
  registerProvider(name: string, provider: IStatusProvider): void {
    this.providers.set(name, provider);

    // Add to order if not already present
    if (!this.providerOrder.includes(name)) {
      this.providerOrder.push(name);
    }
  }

  /**
   * Detect entity type from input string
   *
   * Loops through registered providers in priority order and uses the first
   * provider that claims to handle the input via its detectEntity() method.
   *
   * @param input - Query string (entity ID, keyword, or empty for default)
   * @returns Detected provider and name, or null if no match found
   *
   * @example
   * ```typescript
   * // Story ID detection
   * const detected = registry.detectEntityType('STORY-001');
   * // Returns: { provider: StoryStatusProvider, name: 'story' }
   *
   * // Epic ID detection
   * const detected = registry.detectEntityType('EPIC-V3-001');
   * // Returns: { provider: EpicStatusProvider, name: 'epic' }
   *
   * // Default (empty input)
   * const detected = registry.detectEntityType('');
   * // Returns: { provider: StateMachineStatusProvider, name: 'state-machine' }
   * ```
   */
  detectEntityType(input: string): { provider: IStatusProvider; name: string } | null {
    // Try each provider in registration order (most specific first)
    for (const name of this.providerOrder) {
      const provider = this.providers.get(name);

      if (provider && provider.detectEntity(input)) {
        return { provider, name };
      }
    }

    return null;
  }

  /**
   * Get status using auto-detection
   *
   * Detects the appropriate provider based on input pattern and routes
   * the query to that provider. Formats the result according to the
   * requested format.
   *
   * @param input - Query string (optional, defaults to state machine overview)
   * @param format - Output format (default: table)
   * @returns Formatted status string
   * @throws Error if no provider can handle the input
   *
   * @example
   * ```typescript
   * // Get specific story status
   * const status = await registry.getStatus('STORY-001', 'table');
   * console.log(status);
   *
   * // Get epic status
   * const epicStatus = await registry.getStatus('EPIC-V3-001', 'json');
   *
   * // Get state machine overview (default)
   * const overview = await registry.getStatus();
   * ```
   */
  async getStatus(input?: string, format: StatusFormat = 'table'): Promise<string> {
    // Default to empty string for state machine detection
    const queryInput = input || '';

    // Detect appropriate provider
    const detected = this.detectEntityType(queryInput);

    if (!detected) {
      throw new Error(`No status provider found for input: "${queryInput}"`);
    }

    // Get status from detected provider
    const result = await detected.provider.getStatus(queryInput || undefined);

    // Format output
    return detected.provider.formatOutput(result, format);
  }

  /**
   * Get status result (raw data)
   *
   * Similar to getStatus() but returns the raw StatusResult object
   * instead of a formatted string. Useful for programmatic access.
   *
   * @param input - Query string (optional)
   * @returns StatusResult object with data and metadata
   * @throws Error if no provider can handle the input
   *
   * @example
   * ```typescript
   * const result = await registry.getStatusResult('STORY-001');
   * console.log(result.entityType); // 'story'
   * console.log(result.data.status); // 'in-progress'
   * ```
   */
  async getStatusResult(input?: string): Promise<StatusResult> {
    const queryInput = input || '';
    const detected = this.detectEntityType(queryInput);

    if (!detected) {
      throw new Error(`No status provider found for input: "${queryInput}"`);
    }

    return detected.provider.getStatus(queryInput || undefined);
  }

  /**
   * Get specific provider by name
   *
   * Retrieves a registered provider by its registration name.
   * Useful for direct access to a specific provider.
   *
   * @param name - Provider name (as registered)
   * @returns Provider instance or undefined if not found
   *
   * @example
   * ```typescript
   * const storyProvider = registry.getProvider('story');
   * if (storyProvider) {
   *   const status = await storyProvider.getStatus('STORY-001');
   * }
   * ```
   */
  getProvider(name: string): IStatusProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * List all registered providers
   *
   * Returns an array of provider names in registration order.
   *
   * @returns Array of provider names
   *
   * @example
   * ```typescript
   * const providers = registry.listProviders();
   * console.log(providers); // ['story', 'epic', 'workflow', 'state-machine']
   * ```
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Register default built-in providers
   *
   * Registers providers in priority order (specific to general):
   * 1. story - Handles STORY-001, US-001, TASK-001 patterns
   * 2. epic - Handles EPIC-V3-001, EPIC-MAM patterns
   * 3. workflow - Handles workflow names (pm-planning, dev-implementation)
   * 4. state-machine - Handles empty input and state keywords (default fallback)
   *
   * @private
   */
  private registerDefaultProviders(): void {
    // Register in priority order (most specific to most general)
    this.registerProvider('story', new StoryStatusProvider());
    this.registerProvider('epic', new EpicStatusProvider());
    this.registerProvider('workflow', new WorkflowStatusProvider());
    this.registerProvider('state-machine', new StateMachineStatusProvider());
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Singleton Instance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Singleton registry instance
 *
 * Lazy-initialized on first access via getStatusRegistry()
 */
let registryInstance: StatusProviderRegistry | null = null;

/**
 * Get singleton registry instance
 *
 * Returns the global status provider registry instance, creating it if needed.
 * All default providers are registered automatically on first access.
 *
 * @returns Global StatusProviderRegistry instance
 *
 * @example
 * ```typescript
 * const registry = getStatusRegistry();
 * const status = await registry.getStatus('STORY-001');
 * ```
 */
export function getStatusRegistry(): StatusProviderRegistry {
  if (!registryInstance) {
    registryInstance = new StatusProviderRegistry();
  }
  return registryInstance;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Convenience Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Convenience function to get status
 *
 * Uses the global registry to auto-detect entity type and return formatted status.
 * This is the primary entry point for most status queries.
 *
 * @param input - Query string (optional, defaults to state machine)
 * @param format - Output format (default: table)
 * @returns Formatted status string
 * @throws Error if no provider can handle the input
 *
 * @example
 * ```typescript
 * // Get story status as table
 * console.log(await getStatus('STORY-001'));
 *
 * // Get epic status as JSON
 * console.log(await getStatus('EPIC-V3-001', 'json'));
 *
 * // Get workflow status as markdown
 * console.log(await getStatus('pm-planning', 'markdown'));
 *
 * // Get state machine overview (default)
 * console.log(await getStatus());
 * ```
 */
export async function getStatus(input?: string, format: StatusFormat = 'table'): Promise<string> {
  const registry = getStatusRegistry();
  return registry.getStatus(input, format);
}

/**
 * Convenience function to get status result
 *
 * Uses the global registry to auto-detect entity type and return raw status data.
 * Useful for programmatic access without formatting overhead.
 *
 * @param input - Query string (optional, defaults to state machine)
 * @returns StatusResult object with data and metadata
 * @throws Error if no provider can handle the input
 *
 * @example
 * ```typescript
 * // Get story data
 * const result = await getStatusResult('STORY-001');
 * console.log(result.data.status); // 'in-progress'
 *
 * // Get state machine data
 * const state = await getStatusResult();
 * console.log(state.data.backlog); // 42
 * ```
 */
export async function getStatusResult(input?: string): Promise<StatusResult> {
  const registry = getStatusRegistry();
  return registry.getStatusResult(input);
}
