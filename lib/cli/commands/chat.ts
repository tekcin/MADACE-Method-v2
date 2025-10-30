/**
 * Chat Command
 *
 * Interactive CLI chat mode for conversing with AI agents
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import type { Agent } from '@prisma/client';
import { listAgents } from '@/lib/services/agent-service';
import {
  createSession,
  createMessage,
  listMessages,
  endSession,
  type ChatSessionWithMessages,
} from '@/lib/services/chat-service';
import { createLLMClient } from '@/lib/llm/client';
import { getLLMConfigFromEnv } from '@/lib/llm/config';

/**
 * Chat session state
 */
interface ChatState {
  sessionId: string;
  agent: Agent;
  userId: string;
  messageCount: number;
}

/**
 * Format timestamp for CLI display
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

/**
 * Display chat history (last N messages)
 */
function displayHistory(messages: Array<{ role: string; content: string; timestamp: Date }>, limit = 10) {
  const recent = messages.slice(-limit);

  console.log(chalk.dim('\n─────────────────────────────────────────────'));
  console.log(chalk.bold.white('Chat History:'));
  console.log(chalk.dim('─────────────────────────────────────────────\n'));

  for (const msg of recent) {
    const timestamp = chalk.dim(`[${formatTimestamp(msg.timestamp)}]`);

    if (msg.role === 'user') {
      console.log(chalk.blue.bold('You:') + ' ' + timestamp);
      console.log(chalk.white(msg.content) + '\n');
    } else if (msg.role === 'agent') {
      console.log(chalk.green.bold('Agent:') + ' ' + timestamp);
      console.log(chalk.white(msg.content) + '\n');
    } else {
      console.log(chalk.gray.bold('System:') + ' ' + timestamp);
      console.log(chalk.gray(msg.content) + '\n');
    }
  }

  console.log(chalk.dim('─────────────────────────────────────────────\n'));
}

/**
 * Display welcome message
 */
function displayWelcome(agent: Agent) {
  console.clear();
  console.log(chalk.bold.green('\n🤖 MADACE Chat Mode\n'));
  console.log(chalk.white(`Chatting with: ${chalk.bold(agent.title)}`));
  console.log(chalk.dim(`Agent: ${agent.name} | Module: ${agent.module}\n`));
  console.log(chalk.dim('Commands:'));
  console.log(chalk.dim('  /exit    - End chat session'));
  console.log(chalk.dim('  /history - Show last 10 messages'));
  console.log(chalk.dim('  /multi   - Enter multi-line mode (end with /end)'));
  console.log(chalk.dim('  \\        - Line continuation (type \\ at end of line)\n'));
}

/**
 * Get agent response from LLM
 */
async function getAgentResponse(
  state: ChatState,
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<string> {
  try {
    // Create user message
    await createMessage({
      sessionId: state.sessionId,
      role: 'user',
      content: userMessage,
    });

    // Get LLM client
    const llmConfig = getLLMConfigFromEnv();
    const llmClient = createLLMClient(llmConfig);

    // Build system prompt from agent persona
    const persona = state.agent.persona as { role?: string; identity?: string };
    const systemPrompt = `You are ${state.agent.title}. ${persona.role || ''} ${persona.identity || ''}`;

    // Prepare messages for LLM
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // Get response from LLM
    const response = await llmClient.chat({ messages });

    // Save agent response
    await createMessage({
      sessionId: state.sessionId,
      role: 'agent',
      content: response.content,
    });

    state.messageCount += 2; // User + Agent

    return response.content;
  } catch (error) {
    console.error(chalk.red('\n❌ Error getting agent response:'), error);
    return 'Sorry, I encountered an error processing your message.';
  }
}

/**
 * Multi-line input mode
 */
async function multiLineInput(): Promise<string> {
  const lines: string[] = [];

  console.log(chalk.dim('Multi-line mode (type /end to finish):\n'));

  while (true) {
    const { line } = await inquirer.prompt([
      {
        type: 'input',
        name: 'line',
        message: chalk.dim(`${lines.length + 1}:`),
      },
    ]);

    if (line.trim() === '/end') {
      break;
    }

    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Main chat loop
 */
async function chatLoop(state: ChatState) {
  const conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: chalk.blue.bold('You →'),
      },
    ]);

    const trimmed = input.trim();

    // Handle empty input
    if (!trimmed) continue;

    // Handle commands
    if (trimmed === '/exit') {
      console.log(chalk.yellow('\n👋 Ending chat session...\n'));
      await endSession(state.sessionId);
      console.log(chalk.green(`✓ Chat ended. ${state.messageCount} messages exchanged.\n`));
      break;
    }

    if (trimmed === '/history') {
      const messages = await listMessages(state.sessionId, { limit: 50 });
      displayHistory(messages);
      continue;
    }

    if (trimmed === '/multi') {
      const multiLine = await multiLineInput();
      if (!multiLine.trim()) continue;

      console.log(chalk.dim('\nSending message...\n'));
      const response = await getAgentResponse(state, multiLine, conversationHistory);

      // Update conversation history
      conversationHistory.push({ role: 'user', content: multiLine });
      conversationHistory.push({ role: 'assistant', content: response });
      if (conversationHistory.length > 20) {
        conversationHistory.splice(0, 2); // Keep last 10 exchanges
      }

      console.log(chalk.green.bold('Agent:'));
      console.log(chalk.white(response) + '\n');
      continue;
    }

    // Handle line continuation (ends with \)
    if (trimmed.endsWith('\\')) {
      let fullInput = trimmed.slice(0, -1) + '\n';

      while (true) {
        const { nextLine } = await inquirer.prompt([
          {
            type: 'input',
            name: 'nextLine',
            message: chalk.dim('... →'),
          },
        ]);

        if (nextLine.trim().endsWith('\\')) {
          fullInput += nextLine.trim().slice(0, -1) + '\n';
        } else {
          fullInput += nextLine;
          break;
        }
      }

      console.log(chalk.dim('\nSending message...\n'));
      const response = await getAgentResponse(state, fullInput, conversationHistory);

      conversationHistory.push({ role: 'user', content: fullInput });
      conversationHistory.push({ role: 'assistant', content: response });
      if (conversationHistory.length > 20) {
        conversationHistory.splice(0, 2);
      }

      console.log(chalk.green.bold('Agent:'));
      console.log(chalk.white(response) + '\n');
      continue;
    }

    // Normal message
    console.log(chalk.dim('\nSending message...\n'));
    const response = await getAgentResponse(state, trimmed, conversationHistory);

    conversationHistory.push({ role: 'user', content: trimmed });
    conversationHistory.push({ role: 'assistant', content: response });
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, 2);
    }

    console.log(chalk.green.bold('Agent:'));
    console.log(chalk.white(response) + '\n');
  }
}

/**
 * Chat command handler
 */
export async function chatCommand(agentName?: string) {
  try {
    // Load agents
    const agents = await listAgents({});

    if (agents.length === 0) {
      console.log(chalk.red('\n❌ No agents available. Please create an agent first.\n'));
      process.exit(1);
    }

    // Select agent
    let selectedAgent: Agent | undefined;

    if (agentName) {
      // Agent specified as argument
      selectedAgent = agents.find(a => a.name.toLowerCase() === agentName.toLowerCase());

      if (!selectedAgent) {
        console.log(chalk.red(`\n❌ Agent "${agentName}" not found.\n`));
        console.log(chalk.white('Available agents:'));
        for (const agent of agents) {
          console.log(chalk.dim(`  - ${agent.name} (${agent.title})`));
        }
        console.log('');
        process.exit(1);
      }
    } else {
      // Interactive agent selection
      const { agentId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'agentId',
          message: 'Select an agent to chat with:',
          choices: agents.map(a => ({
            name: `${a.title} (${a.name})`,
            value: a.id,
          })),
        },
      ]);

      selectedAgent = agents.find(a => a.id === agentId);
    }

    if (!selectedAgent) {
      console.log(chalk.red('\n❌ Failed to select agent.\n'));
      process.exit(1);
    }

    // Create chat session
    const userId = 'cli-user'; // Mock user for CLI
    const session = await createSession({
      userId,
      agentId: selectedAgent.id,
    });

    // Initialize chat state
    const state: ChatState = {
      sessionId: session.id,
      agent: selectedAgent,
      userId,
      messageCount: 0,
    };

    // Display welcome
    displayWelcome(selectedAgent);

    // Start chat loop
    await chatLoop(state);

  } catch (error) {
    console.error(chalk.red('\n❌ Chat error:'), error);
    process.exit(1);
  }
}
