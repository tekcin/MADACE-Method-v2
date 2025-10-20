export interface AgentMetadata {
  id: string;
  name: string;
  title: string;
  icon: string;
  module: string;
  version: string;
}

export interface AgentPersona {
  role: string;
  identity: string;
  communication_style: string;
  principles: string[];
}

export interface AgentMenuItem {
  trigger: string;
  action: string;
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
  menu: AgentMenuItem[];
  load_always?: string[];
  prompts: AgentPrompt[];
}

export interface AgentFile {
  agent: Agent;
}
