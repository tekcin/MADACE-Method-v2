/**
 * Entity Validator
 *
 * Validates NLU entities to ensure values are correct and safe
 * Checks database existence, format correctness, and security constraints
 */

import path from 'path';
import type { NLUEntity, MadaceEntityType } from './types';
import * as agentService from '@/lib/services/agent-service';
import { createStateMachine } from '@/lib/state/machine';
import type { StoryState } from '@/lib/state/types';

/**
 * Entity validation result
 */
export interface EntityValidationResult {
  valid: boolean;
  entity: NLUEntity;
  errors: string[];
  warnings: string[];
  normalized?: string; // Normalized/corrected value
}

/**
 * Entity validation options
 */
export interface EntityValidationOptions {
  /**
   * Project root directory for path validation
   */
  projectRoot?: string;

  /**
   * Allowed file extensions for file paths
   */
  allowedExtensions?: string[];

  /**
   * Whether to allow fuzzy matching for correction
   */
  allowFuzzyCorrection?: boolean;
}

/**
 * Entity Validator
 *
 * Validates entities extracted from user input to ensure they are:
 * - Correctly formatted
 * - Actually exist in the system (for database entities)
 * - Safe to use (for paths and config keys)
 */
export class EntityValidator {
  private options: EntityValidationOptions;

  constructor(options: EntityValidationOptions = {}) {
    this.options = {
      projectRoot: options.projectRoot || process.cwd(),
      allowedExtensions: options.allowedExtensions || ['.md', '.yaml', '.yml', '.json', '.ts', '.tsx', '.js', '.jsx'],
      allowFuzzyCorrection: options.allowFuzzyCorrection ?? true,
    };
  }

  /**
   * Validate a single entity
   */
  async validateEntity(entity: NLUEntity): Promise<EntityValidationResult> {
    const result: EntityValidationResult = {
      valid: true,
      entity,
      errors: [],
      warnings: [],
    };

    // Validate based on entity type
    switch (entity.type) {
      case '@agent':
        await this.validateAgent(entity, result);
        break;

      case '@workflow':
        await this.validateWorkflow(entity, result);
        break;

      case '@story':
        await this.validateStory(entity, result);
        break;

      case '@state':
        this.validateState(entity, result);
        break;

      case '@file_path':
        this.validateFilePath(entity, result);
        break;

      case '@config_key':
        this.validateConfigKey(entity, result);
        break;

      case '@number':
        this.validateNumber(entity, result);
        break;

      case '@date':
        this.validateDate(entity, result);
        break;

      default:
        result.warnings.push(`Unknown entity type: ${entity.type}`);
    }

    // If there are errors, mark as invalid
    if (result.errors.length > 0) {
      result.valid = false;
    }

    return result;
  }

  /**
   * Validate multiple entities
   */
  async validateEntities(entities: NLUEntity[]): Promise<EntityValidationResult[]> {
    const results: EntityValidationResult[] = [];

    for (const entity of entities) {
      const result = await this.validateEntity(entity);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate agent entity - check if agent exists in database
   */
  private async validateAgent(entity: NLUEntity, result: EntityValidationResult): Promise<void> {
    const agentName = entity.value;

    if (!agentName || typeof agentName !== 'string') {
      result.errors.push('Agent name is required');
      return;
    }

    try {
      // Check if agent exists in database
      const agent = await agentService.getAgentByName(agentName);

      if (!agent) {
        result.errors.push(`Agent "${agentName}" not found in database`);
        result.warnings.push('Try listing all agents with "list agents" command');
        return;
      }

      // Store normalized agent name (from database)
      result.normalized = agent.name;
    } catch (error) {
      result.errors.push(`Failed to validate agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate workflow entity - check if workflow exists
   */
  private async validateWorkflow(entity: NLUEntity, result: EntityValidationResult): Promise<void> {
    const workflowName = entity.value;

    if (!workflowName || typeof workflowName !== 'string') {
      result.errors.push('Workflow name is required');
      return;
    }

    // TODO: Implement workflow validation when workflow engine is ready
    // For now, just warn that workflow validation is not yet implemented
    result.warnings.push('Workflow validation not yet implemented');
    result.normalized = workflowName.toLowerCase();
  }

  /**
   * Validate story entity - check story ID format matches MADACE convention
   */
  private async validateStory(entity: NLUEntity, result: EntityValidationResult): Promise<void> {
    const storyId = entity.value;

    if (!storyId || typeof storyId !== 'string') {
      result.errors.push('Story ID is required');
      return;
    }

    // MADACE story ID format: [PREFIX-NUMBER] (e.g., DB-001, NLU-002, CLI-003)
    const storyIdPattern = /^[A-Z]+-\d{3}$/;

    if (!storyIdPattern.test(storyId)) {
      result.errors.push(`Invalid story ID format: "${storyId}". Expected format: [PREFIX-NUMBER] (e.g., DB-001, NLU-002)`);
      return;
    }

    // Check if story exists in state machine
    try {
      const statusFile = process.env.STATUS_FILE || 'docs/mam-workflow-status.md';
      const stateMachine = createStateMachine(statusFile);
      await stateMachine.load();

      const status = stateMachine.getStatus();
      const allStories = [
        ...status.backlog,
        ...status.todo,
        ...status.inProgress,
        ...status.done,
      ];

      const story = allStories.find((s) => s.id === storyId);

      if (!story) {
        result.errors.push(`Story "${storyId}" not found in workflow status`);
        result.warnings.push('Check docs/mam-workflow-status.md for valid story IDs');
        return;
      }

      // Store normalized story ID
      result.normalized = story.id;
    } catch (error) {
      result.warnings.push(`Could not verify story existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate state entity - check if state is a valid MADACE state
   */
  private validateState(entity: NLUEntity, result: EntityValidationResult): void {
    const stateName = entity.value;

    if (!stateName || typeof stateName !== 'string') {
      result.errors.push('State name is required');
      return;
    }

    // Valid MADACE states
    const validStates: StoryState[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];

    // Normalize state name (uppercase, replace spaces with underscores)
    const normalizedState = stateName.toUpperCase().replace(/\s+/g, '_');

    if (!validStates.includes(normalizedState as StoryState)) {
      result.errors.push(`Invalid state: "${stateName}". Valid states: ${validStates.join(', ')}`);
      return;
    }

    result.normalized = normalizedState;
  }

  /**
   * Validate file path - ensure path is within project boundaries
   */
  private validateFilePath(entity: NLUEntity, result: EntityValidationResult): void {
    const filePath = entity.value;

    if (!filePath || typeof filePath !== 'string') {
      result.errors.push('File path is required');
      return;
    }

    // Resolve path to absolute
    const absolutePath = path.resolve(this.options.projectRoot!, filePath);
    const projectRoot = path.resolve(this.options.projectRoot!);

    // Security check: Ensure path is within project boundaries
    if (!absolutePath.startsWith(projectRoot)) {
      result.errors.push(`File path "${filePath}" is outside project boundaries`);
      return;
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext && !this.options.allowedExtensions!.includes(ext)) {
      result.warnings.push(
        `File extension "${ext}" is not in allowed list: ${this.options.allowedExtensions!.join(', ')}`
      );
    }

    result.normalized = path.relative(projectRoot, absolutePath);
  }

  /**
   * Validate config key - ensure key follows dot notation format
   */
  private validateConfigKey(entity: NLUEntity, result: EntityValidationResult): void {
    const configKey = entity.value;

    if (!configKey || typeof configKey !== 'string') {
      result.errors.push('Configuration key is required');
      return;
    }

    // Config key format: alphanumeric with dots and underscores (e.g., project_name, llm.provider, modules.mam.enabled)
    const configKeyPattern = /^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/i;

    if (!configKeyPattern.test(configKey)) {
      result.errors.push(
        `Invalid config key format: "${configKey}". Expected format: alphanumeric with dots and underscores (e.g., project_name, llm.provider)`
      );
      return;
    }

    result.normalized = configKey.toLowerCase();
  }

  /**
   * Validate number - ensure value is numeric
   */
  private validateNumber(entity: NLUEntity, result: EntityValidationResult): void {
    const value = entity.value;

    if (value === undefined || value === null) {
      result.errors.push('Number value is required');
      return;
    }

    // Try to parse as number
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
      result.errors.push(`Invalid number: "${value}"`);
      return;
    }

    result.normalized = num.toString();
  }

  /**
   * Validate date - ensure value is a valid date
   */
  private validateDate(entity: NLUEntity, result: EntityValidationResult): void {
    const dateValue = entity.value;

    if (!dateValue) {
      result.errors.push('Date value is required');
      return;
    }

    // Try to parse as date
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      result.errors.push(`Invalid date: "${dateValue}"`);
      return;
    }

    // Store normalized ISO date string
    result.normalized = date.toISOString();
  }
}

/**
 * Create entity validator with default options
 */
export function createEntityValidator(options?: EntityValidationOptions): EntityValidator {
  return new EntityValidator(options);
}
