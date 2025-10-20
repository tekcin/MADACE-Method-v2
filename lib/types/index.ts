/**
 * MADACE Type Definitions
 *
 * Central type definitions for the MADACE system.
 * These types are used throughout the application for type safety.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Agent Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type AgentMetadata = {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  version: string;
};

export type AgentPersona = {
  role: string;
  identity: string;
  communication_style?: string;
  principles?: string;
};

export type AgentMenuItem = {
  label: string;
  command: string;
  description?: string;
};

export type Agent = {
  metadata: AgentMetadata;
  persona: AgentPersona;
  critical_actions?: string[];
  menu?: AgentMenuItem[];
  prompts?: Record<string, string>;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Workflow Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type WorkflowActionType =
  | 'elicit'
  | 'reflect'
  | 'guide'
  | 'template'
  | 'validate'
  | 'sub-workflow';

export type WorkflowStep = {
  name: string;
  action: WorkflowActionType;
  prompt?: string;
  template?: string;
  output?: string;
};

export type Workflow = {
  name: string;
  description: string;
  dependencies?: string[];
  steps: WorkflowStep[];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// State Machine Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type StoryStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

export type Story = {
  id: string;
  title: string;
  status: StoryStatus;
  points?: number;
  epic?: string;
  created?: string;
  started?: string;
  completed?: string;
};

export type WorkflowState = {
  phase: string;
  backlog: Story[];
  todo: Story | null;
  inProgress: Story | null;
  done: Story[];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ModuleConfig = {
  enabled: boolean;
};

export type MadaceConfig = {
  project_name: string;
  output_folder: string;
  user_name: string;
  communication_language: string;
  madace_version: string;
  modules: {
    mam: ModuleConfig;
    mab: ModuleConfig;
    cis: ModuleConfig;
  };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LLM Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type LLMProvider = 'gemini' | 'claude' | 'openai' | 'ollama';

export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMResponse = {
  content: string;
  tokens?: number;
  model?: string;
};

export type LLMClientConfig = {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  endpoint?: string;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Template Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type TemplateContext = Record<string, unknown>;

export type TemplateResult = {
  content: string;
  variables: string[];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utility Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
