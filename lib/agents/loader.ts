import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { AgentFileSchema } from './schema';
import type { Agent } from '@/lib/types/agent';

export class AgentLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AgentLoadError';
  }
}

export class AgentLoader {
  private cache = new Map<string, Agent>();

  /**
   * Load an agent from a YAML file
   */
  async loadAgent(filePath: string): Promise<Agent> {
    // Check cache first
    const cached = this.cache.get(filePath);
    if (cached) {
      return cached;
    }

    try {
      // Read file
      const fileContent = await fs.readFile(filePath, 'utf-8');

      // Parse YAML
      const parsed = yaml.load(fileContent) as unknown;

      // Validate with Zod
      const validated = AgentFileSchema.parse(parsed);

      // Cache and return
      this.cache.set(filePath, validated.agent);
      return validated.agent;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new AgentLoadError(`Agent file not found: ${filePath}`, filePath, error);
      }

      if (error instanceof yaml.YAMLException) {
        throw new AgentLoadError(`Invalid YAML in agent file: ${error.message}`, filePath, error);
      }

      if (error instanceof Error && error.name === 'ZodError') {
        throw new AgentLoadError(`Agent validation failed: ${error.message}`, filePath, error);
      }

      throw new AgentLoadError(`Failed to load agent: ${String(error)}`, filePath, error);
    }
  }

  /**
   * Load all agents from a directory
   */
  async loadAgentsFromDirectory(dirPath: string): Promise<Agent[]> {
    try {
      const files = await fs.readdir(dirPath);
      const agentFiles = files.filter((f) => f.endsWith('.agent.yaml'));

      const agents = await Promise.all(
        agentFiles.map((file) => this.loadAgent(path.join(dirPath, file)))
      );

      return agents;
    } catch (error) {
      throw new AgentLoadError(`Failed to load agents from directory: ${dirPath}`, dirPath, error);
    }
  }

  /**
   * Clear the agent cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get a cached agent
   */
  getCached(filePath: string): Agent | undefined {
    return this.cache.get(filePath);
  }
}

// Singleton instance for convenience
const defaultLoader = new AgentLoader();

/**
 * Load an agent from a file (uses default singleton loader)
 */
export async function loadAgent(filePath: string): Promise<Agent> {
  return defaultLoader.loadAgent(filePath);
}

/**
 * Load all agents from MAM directory
 */
export async function loadMAMAgents(): Promise<Agent[]> {
  const mamAgentsPath = path.join(process.cwd(), 'madace', 'mam', 'agents');
  return defaultLoader.loadAgentsFromDirectory(mamAgentsPath);
}

/**
 * Load all MADACE agents (MAM module only)
 */
export async function loadMADACEAgents(): Promise<Agent[]> {
  return loadMAMAgents();
}

/**
 * Load all agents from all modules (currently just MADACE/MAM)
 */
export async function loadAllAgents(): Promise<Agent[]> {
  return loadMADACEAgents();
}

/**
 * Clear the agent cache
 */
export function clearAgentCache(): void {
  defaultLoader.clearCache();
}
