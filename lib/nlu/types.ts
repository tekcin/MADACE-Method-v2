/**
 * NLU (Natural Language Understanding) Types
 *
 * Defines interfaces for NLU service integration (Dialogflow CX, Rasa, etc.)
 */

/**
 * NLU Intent Result
 *
 * Represents a classified user intent with confidence score and extracted parameters
 */
export interface NLUIntent {
  /**
   * Intent name (e.g., 'create_agent', 'run_workflow', 'check_status')
   */
  name: string;

  /**
   * Display name for the intent
   */
  displayName: string;

  /**
   * Confidence score (0.0 - 1.0)
   * Only act on intents with confidence > 0.7
   */
  confidence: number;

  /**
   * Extracted parameters/entities from user input
   */
  parameters: Record<string, any>;

  /**
   * Whether the intent requires follow-up questions
   */
  requiresFollowUp: boolean;
}

/**
 * NLU Entity
 *
 * Represents an extracted entity from user input
 */
export interface NLUEntity {
  /**
   * Entity type (e.g., '@agent', '@workflow', '@story', '@state')
   */
  type: string;

  /**
   * Extracted value
   */
  value: string;

  /**
   * Original text from user input
   */
  originalText: string;

  /**
   * Confidence score for this entity (0.0 - 1.0)
   */
  confidence: number;
}

/**
 * NLU Parse Request
 *
 * Input to NLU service for intent classification
 */
export interface NLUParseRequest {
  /**
   * User input text to parse
   */
  text: string;

  /**
   * Session ID for context tracking
   */
  sessionId: string;

  /**
   * User ID for personalization
   */
  userId?: string;

  /**
   * Agent ID if user is talking to specific agent
   */
  agentId?: string;

  /**
   * Language code (default: 'en')
   */
  languageCode?: string;
}

/**
 * NLU Parse Response
 *
 * Output from NLU service after intent classification
 */
export interface NLUParseResponse {
  /**
   * Classified intent
   */
  intent: NLUIntent;

  /**
   * Extracted entities
   */
  entities: NLUEntity[];

  /**
   * Full response text from NLU service
   */
  responseText?: string;

  /**
   * Whether to fallback to menu mode (confidence < 0.7)
   */
  shouldFallbackToMenu: boolean;

  /**
   * Session ID used for this request
   */
  sessionId: string;

  /**
   * Raw response from NLU service (for debugging)
   */
  raw?: any;
}

/**
 * NLU Configuration
 *
 * Configuration for NLU service integration
 */
export interface NLUConfig {
  /**
   * NLU provider ('dialogflow' | 'rasa' | 'luis')
   */
  provider: 'dialogflow' | 'rasa' | 'luis';

  /**
   * Dialogflow CX specific config
   */
  dialogflow?: {
    /**
     * Google Cloud project ID
     */
    projectId: string;

    /**
     * Dialogflow CX location (e.g., 'us-central1', 'global')
     */
    location: string;

    /**
     * Dialogflow CX agent ID
     */
    agentId: string;

    /**
     * Service account credentials (JSON key file path or object)
     */
    credentials?: string | object;
  };

  /**
   * Rasa specific config
   */
  rasa?: {
    /**
     * Rasa server URL
     */
    serverUrl: string;

    /**
     * Authentication token (if required)
     */
    token?: string;
  };

  /**
   * Confidence threshold (0.0 - 1.0)
   * Default: 0.7
   */
  confidenceThreshold?: number;

  /**
   * Default language code
   * Default: 'en'
   */
  defaultLanguage?: string;
}

/**
 * NLU Provider Interface
 *
 * Interface that all NLU providers must implement
 */
export interface INLUProvider {
  /**
   * Parse user input and return intent + entities
   */
  parse(request: NLUParseRequest): Promise<NLUParseResponse>;

  /**
   * Test connection to NLU service
   */
  testConnection(): Promise<boolean>;

  /**
   * Get provider name
   */
  getProviderName(): string;
}

/**
 * Intent Action Handler
 *
 * Function signature for handling a specific intent
 */
export type IntentActionHandler = (
  intent: NLUIntent,
  entities: NLUEntity[]
) => Promise<any>;

/**
 * Intent Action Registry
 *
 * Maps intent names to action handlers
 */
export interface IntentActionRegistry {
  [intentName: string]: IntentActionHandler;
}

/**
 * Predefined Intent Names
 *
 * Core intents supported by MADACE
 */
export enum MadaceIntent {
  // Agent Operations
  CREATE_AGENT = 'create_agent',
  LIST_AGENTS = 'list_agents',
  SHOW_AGENT = 'show_agent',
  EDIT_AGENT = 'edit_agent',
  DELETE_AGENT = 'delete_agent',

  // Workflow Operations
  RUN_WORKFLOW = 'run_workflow',
  LIST_WORKFLOWS = 'list_workflows',
  SHOW_WORKFLOW = 'show_workflow',
  PAUSE_WORKFLOW = 'pause_workflow',
  RESUME_WORKFLOW = 'resume_workflow',

  // State Machine Operations
  CHECK_STATUS = 'check_status',
  TRANSITION_STORY = 'transition_story',
  SHOW_STATS = 'show_stats',

  // Configuration Operations
  GET_CONFIG = 'get_config',
  SET_CONFIG = 'set_config',
  EDIT_CONFIG = 'edit_config',

  // Project Operations
  INIT_PROJECT = 'init_project',
  PROJECT_STATUS = 'project_status',

  // General
  HELP = 'help',
  GREETING = 'greeting',
  GOODBYE = 'goodbye',
}

/**
 * Entity Types
 *
 * Core entity types supported by MADACE
 */
export enum MadaceEntityType {
  AGENT = '@agent',
  WORKFLOW = '@workflow',
  STORY = '@story',
  STATE = '@state',
  FILE_PATH = '@file_path',
  CONFIG_KEY = '@config_key',
  NUMBER = '@number',
  DATE = '@date',
}
