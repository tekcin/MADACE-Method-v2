/**
 * Intent Handler
 *
 * Maps NLU intents to MADACE actions
 * Executes business logic based on classified user intent
 */

import type {
  NLUIntent,
  NLUEntity,
  IntentActionHandler,
  IntentActionRegistry,
  MadaceIntent,
} from './types';
import * as agentService from '@/lib/services/agent-service';
import { getConfigManager } from '@/lib/config/manager';
import { createStateMachine } from '@/lib/state/machine';

/**
 * Intent Action Result
 *
 * Standardized response from intent handlers
 */
export interface IntentActionResult {
  success: boolean;
  data?: any;
  message: string;
  error?: string;
  requiresFollowUp?: boolean;
  followUpQuestion?: string;
}

/**
 * Agent Creation Handler
 */
const handleCreateAgent: IntentActionHandler = async (intent, entities) => {
  try {
    // Extract agent type from entities
    const agentType = entities.find((e) => e.type === '@agent')?.value;

    if (!agentType) {
      return {
        success: false,
        message: 'I need to know what type of agent you want to create.',
        requiresFollowUp: true,
        followUpQuestion: 'What type of agent would you like? (e.g., PM, Analyst, Architect, SM, DEV)',
      };
    }

    // For now, return a message that agent creation requires a YAML file
    // Full implementation would create agent dynamically
    return {
      success: true,
      message: `To create a ${agentType} agent, I'll need some information. You can either:
1. Provide a YAML file path with: madace agents create <file>
2. Or I can guide you through creating one interactively.

Would you like me to help you create the agent definition?`,
      requiresFollowUp: true,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create agent.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * List Agents Handler
 */
const handleListAgents: IntentActionHandler = async (intent, entities) => {
  try {
    // Extract module filter if provided
    const module = entities.find((e) => e.type === '@module')?.value;

    const agents = await agentService.listAgents({
      module: module,
    });

    return {
      success: true,
      data: agents,
      message: `Found ${agents.length} agent${agents.length !== 1 ? 's' : ''}${module ? ` in module ${module}` : ''}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to list agents.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Show Agent Handler
 */
const handleShowAgent: IntentActionHandler = async (intent, entities) => {
  try {
    const agentName = entities.find((e) => e.type === '@agent')?.value;

    if (!agentName) {
      return {
        success: false,
        message: 'Which agent would you like to see?',
        requiresFollowUp: true,
        followUpQuestion: 'Please specify the agent name (e.g., PM, Analyst, Architect)',
      };
    }

    const agent = await agentService.getAgentByName(agentName);

    if (!agent) {
      return {
        success: false,
        message: `Agent "${agentName}" not found.`,
      };
    }

    return {
      success: true,
      data: agent,
      message: `Here's the ${agent.title} agent.`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to show agent.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check Status Handler
 */
const handleCheckStatus: IntentActionHandler = async (intent, entities) => {
  try {
    const statusFile = process.env.STATUS_FILE || 'docs/mam-workflow-status.md';
    const stateMachine = createStateMachine(statusFile);
    await stateMachine.load();
    const status = stateMachine.getStatus();

    return {
      success: true,
      data: status,
      message: `Project status:\n- BACKLOG: ${status.backlog.length} stories\n- TODO: ${status.todo.length} stories\n- IN PROGRESS: ${status.inProgress.length} stories\n- DONE: ${status.done.length} stories`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get project status.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get Config Handler
 */
const handleGetConfig: IntentActionHandler = async (intent, entities) => {
  try {
    const configKey = entities.find((e) => e.type === '@config_key')?.value;
    const configManager = getConfigManager();
    await configManager.load();

    if (!configKey) {
      // Return all config
      const config = configManager.get();
      return {
        success: true,
        data: config,
        message: 'Here\'s the full configuration.',
      };
    }

    const config = configManager.get();
    if (!config) {
      return {
        success: false,
        message: 'Configuration not loaded.',
      };
    }

    // Access config property by key (simplified - assumes top-level keys)
    const value = (config as any)[configKey];

    if (value === undefined) {
      return {
        success: false,
        message: `Configuration key "${configKey}" not found.`,
      };
    }

    return {
      success: true,
      data: { [configKey]: value },
      message: `${configKey}: ${JSON.stringify(value)}`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get configuration.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Set Config Handler
 */
const handleSetConfig: IntentActionHandler = async (intent, entities) => {
  try {
    const configKey = entities.find((e) => e.type === '@config_key')?.value;
    const configValue = entities.find((e) => e.type === '@value')?.value;

    if (!configKey) {
      return {
        success: false,
        message: 'Which configuration key would you like to set?',
        requiresFollowUp: true,
        followUpQuestion: 'Please specify the configuration key (e.g., project_name, llm.provider)',
      };
    }

    if (!configValue) {
      return {
        success: false,
        message: `What value would you like to set for "${configKey}"?`,
        requiresFollowUp: true,
        followUpQuestion: `Please provide the value for ${configKey}`,
      };
    }

    const configManager = getConfigManager();
    await configManager.load();

    const config = configManager.get();
    if (!config) {
      return {
        success: false,
        message: 'Configuration not loaded.',
      };
    }

    // Update config with new value (simplified - assumes top-level keys)
    const updatedConfig = {
      ...config,
      [configKey]: configValue,
    };

    await configManager.saveConfig(updatedConfig);

    return {
      success: true,
      message: `Configuration updated: ${configKey} = ${configValue}`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to set configuration.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Help Handler
 */
const handleHelp: IntentActionHandler = async (intent, entities) => {
  return {
    success: true,
    message: `I can help you with:

**Agents:**
- Create, list, show, edit, or delete agents
- Example: "Show me all agents" or "Create a PM agent"

**Workflows:**
- Run, list, show, pause, or resume workflows
- Example: "Run the planning workflow"

**Project Status:**
- Check project status and statistics
- Example: "What's the project status?"

**Configuration:**
- Get or set configuration values
- Example: "Show me the config" or "Set project name to MyApp"

What would you like to do?`,
  };
};

/**
 * Greeting Handler
 */
const handleGreeting: IntentActionHandler = async (intent, entities) => {
  return {
    success: true,
    message: `Hello! I'm MADACE, your AI-driven development assistant.

I can help you manage agents, run workflows, check project status, and more.

What would you like to do today?`,
  };
};

/**
 * Goodbye Handler
 */
const handleGoodbye: IntentActionHandler = async (intent, entities) => {
  return {
    success: true,
    message: `Goodbye! Feel free to come back anytime you need assistance with your project.`,
  };
};

/**
 * Unknown Intent Handler (fallback)
 */
const handleUnknown: IntentActionHandler = async (intent, entities) => {
  return {
    success: false,
    message: `I'm not sure I understand. Could you rephrase that?

Try asking me to:
- List agents
- Show project status
- Run a workflow
- Get configuration

Or type "help" to see what I can do.`,
  };
};

/**
 * Intent Action Registry
 *
 * Maps intent names to handler functions
 */
const intentRegistry: IntentActionRegistry = {
  // Agent Operations
  create_agent: handleCreateAgent,
  list_agents: handleListAgents,
  show_agent: handleShowAgent,

  // Workflow Operations (TODO: Implement when workflow engine is ready)
  run_workflow: handleUnknown, // Placeholder
  list_workflows: handleUnknown, // Placeholder
  show_workflow: handleUnknown, // Placeholder

  // State Machine Operations
  check_status: handleCheckStatus,
  transition_story: handleUnknown, // Placeholder
  show_stats: handleCheckStatus, // Reuse check_status for now

  // Configuration Operations
  get_config: handleGetConfig,
  set_config: handleSetConfig,

  // General
  help: handleHelp,
  greeting: handleGreeting,
  goodbye: handleGoodbye,
};

/**
 * Handle Intent
 *
 * Main entry point for executing intent-based actions
 */
export async function handleIntent(
  intent: NLUIntent,
  entities: NLUEntity[]
): Promise<IntentActionResult> {
  const handler = intentRegistry[intent.name] || handleUnknown;

  try {
    return await handler(intent, entities);
  } catch (error) {
    console.error('[IntentHandler] Error:', error);
    return {
      success: false,
      message: 'An error occurred while processing your request.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get Available Intents
 *
 * Returns list of all registered intent names
 */
export function getAvailableIntents(): string[] {
  return Object.keys(intentRegistry);
}

/**
 * Register Custom Intent Handler
 *
 * Allows dynamic registration of custom intent handlers
 */
export function registerIntentHandler(
  intentName: string,
  handler: IntentActionHandler
): void {
  intentRegistry[intentName] = handler;
}
