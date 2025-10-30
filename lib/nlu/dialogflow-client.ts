/**
 * Dialogflow CX Client
 *
 * Wrapper for Google Cloud Dialogflow CX integration
 * Implements INLUProvider interface for natural language understanding
 */

import { SessionsClient } from '@google-cloud/dialogflow-cx';
import type {
  INLUProvider,
  NLUParseRequest,
  NLUParseResponse,
  NLUIntent,
  NLUEntity,
  NLUConfig,
} from './types';

/**
 * Dialogflow CX Provider
 *
 * Integrates with Google Cloud Dialogflow CX for intent classification and entity extraction
 */
export class DialogflowCXProvider implements INLUProvider {
  private client: SessionsClient;
  private projectId: string;
  private location: string;
  private agentId: string;
  private confidenceThreshold: number;
  private defaultLanguage: string;

  constructor(config: NLUConfig) {
    if (!config.dialogflow) {
      throw new Error('Dialogflow CX configuration is required');
    }

    const { projectId, location, agentId, credentials } = config.dialogflow;

    if (!projectId || !location || !agentId) {
      throw new Error('Dialogflow CX projectId, location, and agentId are required');
    }

    this.projectId = projectId;
    this.location = location;
    this.agentId = agentId;
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
    this.defaultLanguage = config.defaultLanguage || 'en';

    // Initialize Dialogflow CX client
    const clientOptions: any = {};

    if (credentials) {
      if (typeof credentials === 'string') {
        // Path to service account key file
        clientOptions.keyFilename = credentials;
      } else {
        // Service account key object
        clientOptions.credentials = credentials;
      }
    }
    // If no credentials provided, use default application credentials (GOOGLE_APPLICATION_CREDENTIALS env var)

    this.client = new SessionsClient(clientOptions);
  }

  /**
   * Parse user input using Dialogflow CX
   */
  async parse(request: NLUParseRequest): Promise<NLUParseResponse> {
    try {
      const { text, sessionId, languageCode = this.defaultLanguage } = request;

      // Construct session path
      const sessionPath = this.client.projectLocationAgentSessionPath(
        this.projectId,
        this.location,
        this.agentId,
        sessionId
      );

      // Prepare detect intent request
      const detectIntentRequest = {
        session: sessionPath,
        queryInput: {
          text: {
            text: text,
          },
          languageCode: languageCode,
        },
      };

      // Send request to Dialogflow CX
      const [response] = await this.client.detectIntent(detectIntentRequest);

      // Parse response
      const queryResult = response.queryResult;

      if (!queryResult) {
        throw new Error('No query result from Dialogflow CX');
      }

      // Extract intent
      const intent: NLUIntent = {
        name: queryResult.intent?.name?.split('/').pop() || 'unknown',
        displayName: queryResult.intent?.displayName || 'Unknown',
        confidence: queryResult.intentDetectionConfidence || 0,
        parameters: this.extractParameters(queryResult.parameters),
        requiresFollowUp: queryResult.match?.matchType === 'INTENT',
      };

      // Extract entities
      const entities: NLUEntity[] = this.extractEntities(queryResult.parameters);

      // Determine if should fallback to menu mode
      const shouldFallbackToMenu = intent.confidence < this.confidenceThreshold;

      return {
        intent,
        entities,
        responseText: queryResult.responseMessages?.[0]?.text?.text?.[0],
        shouldFallbackToMenu,
        sessionId,
        raw: queryResult,
      };
    } catch (error) {
      console.error('[DialogflowCX] Parse error:', error);
      throw new Error(
        `Failed to parse intent: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract parameters from Dialogflow CX query result
   */
  private extractParameters(parameters: any): Record<string, any> {
    if (!parameters || !parameters.fields) {
      return {};
    }

    const extracted: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters.fields)) {
      extracted[key] = this.parseParameterValue(value);
    }

    return extracted;
  }

  /**
   * Parse parameter value from Dialogflow CX struct format
   */
  private parseParameterValue(value: any): any {
    if (!value) return null;

    // Handle different value types
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.numberValue !== undefined) return value.numberValue;
    if (value.boolValue !== undefined) return value.boolValue;
    if (value.listValue !== undefined) {
      return value.listValue.values?.map((v: any) => this.parseParameterValue(v)) || [];
    }
    if (value.structValue !== undefined) {
      return this.extractParameters(value.structValue);
    }

    return null;
  }

  /**
   * Extract entities from parameters
   */
  private extractEntities(parameters: any): NLUEntity[] {
    const entities: NLUEntity[] = [];

    if (!parameters || !parameters.fields) {
      return entities;
    }

    for (const [key, value] of Object.entries(parameters.fields)) {
      const entityValue = this.parseParameterValue(value);

      if (entityValue) {
        entities.push({
          type: `@${key}`,
          value: String(entityValue),
          originalText: String(entityValue), // Dialogflow CX doesn't provide original text separately
          confidence: 1.0, // Dialogflow CX doesn't provide per-entity confidence
        });
      }
    }

    return entities;
  }

  /**
   * Test connection to Dialogflow CX
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to parse a simple greeting to test connection
      const testRequest: NLUParseRequest = {
        text: 'hello',
        sessionId: `test-${Date.now()}`,
        languageCode: this.defaultLanguage,
      };

      await this.parse(testRequest);
      return true;
    } catch (error) {
      console.error('[DialogflowCX] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'dialogflow-cx';
  }

  /**
   * Get current configuration
   */
  getConfig(): {
    projectId: string;
    location: string;
    agentId: string;
    confidenceThreshold: number;
  } {
    return {
      projectId: this.projectId,
      location: this.location,
      agentId: this.agentId,
      confidenceThreshold: this.confidenceThreshold,
    };
  }
}

/**
 * Create Dialogflow CX provider from environment variables
 */
export function createDialogflowProviderFromEnv(): DialogflowCXProvider {
  const config: NLUConfig = {
    provider: 'dialogflow',
    dialogflow: {
      projectId: process.env.DIALOGFLOW_PROJECT_ID || '',
      location: process.env.DIALOGFLOW_LOCATION || 'global',
      agentId: process.env.DIALOGFLOW_AGENT_ID || '',
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to service account key
    },
    confidenceThreshold: parseFloat(process.env.NLU_CONFIDENCE_THRESHOLD || '0.7'),
    defaultLanguage: process.env.NLU_DEFAULT_LANGUAGE || 'en',
  };

  if (!config.dialogflow?.projectId || !config.dialogflow?.agentId) {
    throw new Error(
      'Dialogflow CX environment variables are not set. ' +
        'Please set DIALOGFLOW_PROJECT_ID and DIALOGFLOW_AGENT_ID'
    );
  }

  return new DialogflowCXProvider(config);
}
