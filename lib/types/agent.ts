export interface AgentMetadata {
  id: string;
  name: string;
  title: string;
  icon: string;
  module?: string; // Optional for core agents
  version?: string; // Optional field
}

export interface AgentPersona {
  role: string;
  identity: string;
  communication_style: string;
  principles: string[];
}

export interface AgentMenuItem {
  trigger: string;
  action?: string; // Optional - MAM format
  workflow?: string; // Optional - workflow reference
  exec?: string; // Optional - execution command
  description: string;
}

export interface AgentPrompt {
  name: string;
  trigger: string;
  content: string;
}

export interface Agent {
  metadata: AgentMetadata;
  persona: AgentPersona;
  critical_actions?: string[];
  menu?: AgentMenuItem[]; // Optional for agents without menu
  load_always?: string[];
  prompts?: AgentPrompt[]; // Optional field
}

export interface AgentFile {
  agent: Agent;
}
