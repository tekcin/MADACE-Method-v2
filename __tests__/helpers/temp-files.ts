/**
 * Temporary Files Helper
 *
 * Provides utilities for creating and managing temporary files/directories in tests.
 */

import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export interface TempProject {
  dir: string;
  configPath: string;
  docsPath: string;
  agentsPath: string;
  workflowsPath: string;
  cleanup: () => void;
}

/**
 * Create a temporary project directory with MADACE structure
 *
 * @returns TempProject instance
 */
export function createTempProject(): TempProject {
  const dir = mkdtempSync(join(tmpdir(), 'madace-test-'));

  const configPath = join(dir, 'madace', 'core', 'config.yaml');
  const docsPath = join(dir, 'docs');
  const agentsPath = join(dir, 'madace', 'mam', 'agents');
  const workflowsPath = join(dir, 'madace', 'mam', 'workflows');

  // Create directory structure
  mkdirSync(join(dir, 'madace', 'core'), { recursive: true });
  mkdirSync(docsPath, { recursive: true });
  mkdirSync(agentsPath, { recursive: true });
  mkdirSync(workflowsPath, { recursive: true });

  // Create default config
  const defaultConfig = `project_name: Test Project
output_folder: docs
user_name: Test User
communication_language: English
modules:
  mam:
    enabled: true
  mab:
    enabled: false
  cis:
    enabled: false
llm:
  provider: gemini
  gemini:
    api_key: test-key
    model: gemini-2.0-flash-exp
`;
  writeFileSync(configPath, defaultConfig);

  return {
    dir,
    configPath,
    docsPath,
    agentsPath,
    workflowsPath,
    cleanup: () => {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    },
  };
}

/**
 * Create a temporary file with content
 *
 * @param filename - File name
 * @param content - File content
 * @returns File path
 */
export function createTempFile(filename: string, content: string): string {
  const tmpDir = mkdtempSync(join(tmpdir(), 'madace-file-'));
  const filePath = join(tmpDir, filename);
  writeFileSync(filePath, content);
  return filePath;
}

/**
 * Create a temporary agent YAML file
 *
 * @param name - Agent name
 * @param customFields - Custom agent fields
 * @returns File path
 */
export function createTempAgent(name: string, customFields?: Record<string, any>): string {
  const content = `agent:
  metadata:
    name: ${name}
    version: 1.0.0
    module: MAM
    icon: 🤖
    title: Test ${name} Agent
    role: Testing
  persona:
    role_description: Test agent for unit tests
    expertise:
      - Testing
    working_style: Automated
  menu:
    - label: Test
      value: test
      icon: ✅
  prompts:
    system: Test system prompt
    ${customFields ? JSON.stringify(customFields, null, 2) : ''}
`;
  return createTempFile(`${name}.agent.yaml`, content);
}

/**
 * Create a temporary workflow YAML file
 *
 * @param name - Workflow name
 * @param steps - Workflow steps
 * @returns File path
 */
export function createTempWorkflow(
  name: string,
  steps: Array<{ action: string; [key: string]: any }>
): string {
  const content = `workflow:
  metadata:
    name: ${name}
    version: 1.0.0
    description: Test workflow
  steps:
${steps
  .map(
    (step) =>
      `    - action: ${step.action}\n      ${Object.entries(step)
        .filter(([k]) => k !== 'action')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n      ')}`
  )
  .join('\n')}
`;
  return createTempFile(`${name}.workflow.yaml`, content);
}
