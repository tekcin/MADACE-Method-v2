/**
 * MADACE Status Provider Types
 *
 * Unified status checking system for all MADACE entities.
 * Provides a consistent interface for querying status across stories, epics, workflows, and states.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Entity Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Types of entities that can be queried for status
 *
 * - story: Individual user stories with lifecycle tracking
 * - epic: Collections of related stories
 * - workflow: Execution state of workflow definitions
 * - state: Overall state machine status
 */
export type EntityType = 'story' | 'epic' | 'workflow' | 'state';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Output Format Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Output formats for status results
 *
 * - table: Human-readable tabular format (terminal/console)
 * - json: Machine-readable JSON format (API/integration)
 * - markdown: Documentation-friendly markdown format
 */
export type StatusFormat = 'table' | 'json' | 'markdown';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Status Result Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Result returned by status providers
 *
 * Contains the entity type, its unique identifier, and associated data.
 * The data structure varies by entity type but follows consistent patterns.
 */
export interface StatusResult {
  /**
   * Type of entity this status represents
   */
  entityType: EntityType;

  /**
   * Unique identifier for this entity (optional for global state queries)
   */
  entityId?: string;

  /**
   * Status data payload (structure varies by entity type)
   *
   * Examples:
   * - Story: { status: 'in-progress', points: 5, epic: 'MAM-001', ... }
   * - Epic: { stories: [...], totalPoints: 25, completedPoints: 10, ... }
   * - Workflow: { currentStep: 'elicit-requirements', progress: 0.4, ... }
   * - State: { backlog: [...], todo: {...}, inProgress: {...}, done: [...] }
   */
  data: Record<string, unknown>;

  /**
   * Timestamp when status was retrieved (ISO 8601 format)
   */
  timestamp: string;

  /**
   * Optional metadata (warnings, errors, context info)
   */
  metadata?: {
    warnings?: string[];
    errors?: string[];
    [key: string]: unknown;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Status Provider Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Interface for status providers
 *
 * All status providers (story, epic, workflow, state) implement this interface
 * to ensure consistent status querying across the MADACE system.
 *
 * @example
 * ```typescript
 * // Story status provider
 * const storyProvider: IStatusProvider = new StoryStatusProvider();
 * const canHandle = storyProvider.detectEntity('STORY-001'); // true
 * const status = await storyProvider.getStatus('STORY-001');
 * const output = storyProvider.formatOutput(status, 'table');
 * console.log(output);
 * ```
 *
 * @example
 * ```typescript
 * // State machine provider (no entity ID needed)
 * const stateProvider: IStatusProvider = new StateStatusProvider();
 * const status = await stateProvider.getStatus(); // Global state
 * const json = stateProvider.formatOutput(status, 'json');
 * ```
 */
export interface IStatusProvider {
  /**
   * Detect if this provider can handle the given input
   *
   * Uses pattern matching, ID format validation, or heuristics
   * to determine if this provider is appropriate for the input.
   *
   * @param input - Entity identifier or query string
   * @returns true if this provider can handle the input
   *
   * @example
   * ```typescript
   * storyProvider.detectEntity('STORY-001'); // true
   * storyProvider.detectEntity('EPIC-MAM'); // false
   * ```
   */
  detectEntity(input: string): boolean;

  /**
   * Get status for the specified entity
   *
   * Retrieves current status information from the underlying data source.
   * For global queries (like state machine status), entityId can be omitted.
   *
   * @param entityId - Optional entity identifier (omit for global queries)
   * @returns Promise resolving to status result
   * @throws Error if entity not found or access fails
   *
   * @example
   * ```typescript
   * // Specific entity
   * const storyStatus = await provider.getStatus('STORY-001');
   *
   * // Global query
   * const globalState = await provider.getStatus();
   * ```
   */
  getStatus(entityId?: string): Promise<StatusResult>;

  /**
   * Format status result for display
   *
   * Converts status data into the requested output format.
   * Handles layout, styling, and structure appropriate for each format.
   *
   * @param result - Status result to format
   * @param format - Desired output format
   * @returns Formatted string ready for display or serialization
   *
   * @example
   * ```typescript
   * // Table format (human-readable)
   * const table = provider.formatOutput(result, 'table');
   * // ┌─────────────┬────────────────┐
   * // │ Story       │ STORY-001      │
   * // │ Status      │ in-progress    │
   * // └─────────────┴────────────────┘
   *
   * // JSON format (machine-readable)
   * const json = provider.formatOutput(result, 'json');
   * // { "entityType": "story", "entityId": "STORY-001", ... }
   *
   * // Markdown format (documentation)
   * const md = provider.formatOutput(result, 'markdown');
   * // ## Story: STORY-001
   * // **Status:** in-progress
   * ```
   */
  formatOutput(result: StatusResult, format: StatusFormat): string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utility Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Status provider registry entry
 *
 * Used for registering and discovering status providers at runtime.
 */
export interface StatusProviderEntry {
  /**
   * Entity type this provider handles
   */
  entityType: EntityType;

  /**
   * Provider instance
   */
  provider: IStatusProvider;

  /**
   * Priority for provider selection (higher = preferred)
   *
   * Used when multiple providers might handle the same entity type.
   */
  priority?: number;
}

/**
 * Options for status queries
 *
 * Additional configuration for status retrieval operations.
 */
export interface StatusQueryOptions {
  /**
   * Include detailed metadata in results
   */
  includeMetadata?: boolean;

  /**
   * Filter results by date range
   */
  dateRange?: {
    from: string; // ISO 8601
    to: string; // ISO 8601
  };

  /**
   * Include related entities in results
   */
  includeRelated?: boolean;

  /**
   * Custom query parameters (provider-specific)
   */
  [key: string]: unknown;
}
