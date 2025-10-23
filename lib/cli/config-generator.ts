/**
 * CLI Configuration Generator
 *
 * Automatically generates .claude.json and .gemini.json files
 * based on MADACE configuration
 */

import fs from 'fs/promises';
import path from 'path';
import type { CLIConfigFile } from './types';

/**
 * Generate Claude CLI configuration file
 */
export async function generateClaudeConfig(config: {
  projectName: string;
  agentsPath?: string;
  workflowsPath?: string;
  statusFile?: string;
  claudeModel?: string;
  claudeApiKey?: string;
}): Promise<void> {
  const claudeConfig: CLIConfigFile = {
    project: config.projectName,
    context: {
      agents_path: config.agentsPath || 'madace/mam/agents',
      workflows_path: config.workflowsPath || 'madace/mam/workflows',
      status_file: config.statusFile || 'docs/mam-workflow-status.md',
    },
    llm: {
      provider: 'anthropic',
      model: config.claudeModel || 'claude-3-5-sonnet-20241022',
      apiKey: config.claudeApiKey || '${CLAUDE_API_KEY}',
    },
  };

  const configPath = path.join(process.cwd(), '.claude.json');
  await fs.writeFile(configPath, JSON.stringify(claudeConfig, null, 2), 'utf-8');
}

/**
 * Generate Gemini CLI configuration file
 */
export async function generateGeminiConfig(config: {
  projectName: string;
  agentsPath?: string;
  workflowsPath?: string;
  statusFile?: string;
  geminiModel?: string;
  geminiApiKey?: string;
}): Promise<void> {
  const geminiConfig: CLIConfigFile = {
    project: config.projectName,
    context: {
      agents_path: config.agentsPath || 'madace/mam/agents',
      workflows_path: config.workflowsPath || 'madace/mam/workflows',
      status_file: config.statusFile || 'docs/mam-workflow-status.md',
    },
    llm: {
      provider: 'google',
      model: config.geminiModel || 'gemini-2.0-flash-exp',
      apiKey: config.geminiApiKey || '${GEMINI_API_KEY}',
    },
  };

  const configPath = path.join(process.cwd(), '.gemini.json');
  await fs.writeFile(configPath, JSON.stringify(geminiConfig, null, 2), 'utf-8');
}

/**
 * Generate all CLI configuration files
 */
export async function generateAllCLIConfigs(config: {
  projectName: string;
  agentsPath?: string;
  workflowsPath?: string;
  statusFile?: string;
  claudeModel?: string;
  claudeApiKey?: string;
  geminiModel?: string;
  geminiApiKey?: string;
}): Promise<void> {
  await Promise.all([generateClaudeConfig(config), generateGeminiConfig(config)]);
}

/**
 * Update .gitignore to exclude CLI config files (they may contain API keys)
 */
export async function updateGitIgnoreForCLI(): Promise<void> {
  const gitignorePath = path.join(process.cwd(), '.gitignore');

  try {
    let gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');

    const cliConfigEntries = ['.claude.json', '.gemini.json'];

    for (const entry of cliConfigEntries) {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += `\n# CLI configuration files (may contain API keys)\n${entry}\n`;
      }
    }

    await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
  } catch {
    // .gitignore doesn't exist, create it
    const gitignoreContent = `# CLI configuration files (may contain API keys)\n.claude.json\n.gemini.json\n`;
    await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
  }
}

/**
 * Check if CLI tool is installed
 */
export async function checkCLIToolInstalled(tool: 'claude' | 'gemini'): Promise<boolean> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execPromise = promisify(exec);

  try {
    await execPromise(`which ${tool}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get installation instructions for CLI tool
 */
export function getCLIInstallInstructions(tool: 'claude' | 'gemini'): string {
  switch (tool) {
    case 'claude':
      return `
Claude CLI is not installed. To install:

npm install -g @anthropic-ai/claude-cli

Or with yarn:
yarn global add @anthropic-ai/claude-cli

After installation, verify with:
claude --version
`;
    case 'gemini':
      return `
Gemini CLI is not installed. To install:

npm install -g @google/generative-ai-cli

Or with yarn:
yarn global add @google/generative-ai-cli

After installation, verify with:
gemini --version
`;
    default:
      return 'Unknown CLI tool';
  }
}
