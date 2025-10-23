/**
 * Agent Context Builder
 *
 * Builds and manages agent execution context.
 */

import fs from 'fs/promises';
import path from 'path';
import type { Agent } from '@/lib/types/agent';
import type { AgentContext } from './types';
import { loadConfig } from '@/lib/config/loader';

/**
 * Build agent context
 */
export async function buildContext(agent: Agent, agentName: string): Promise<AgentContext> {
  const config = await loadConfig();
  const loadedFiles = new Map<string, string>();

  // Load files specified in load_always
  if (agent.load_always) {
    for (const filePath of agent.load_always) {
      try {
        // Resolve template variables in path
        const resolvedPath = filePath.replace('{output_folder}', config.output_folder);
        const absolutePath = path.resolve(resolvedPath);
        const content = await fs.readFile(absolutePath, 'utf-8');
        loadedFiles.set(filePath, content);
      } catch (error) {
        console.warn(`Failed to load file: ${filePath}`, error);
      }
    }
  }

  return {
    agent,
    agentName,
    config,
    conversationHistory: [],
    loadedFiles,
    state: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
