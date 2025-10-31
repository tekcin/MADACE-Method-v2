export type AgentCreateStep = 'basic' | 'persona' | 'menu' | 'prompts' | 'review';

export interface AgentMenuItem {
  id: string;
  label: string;
  description?: string;
  action: string;
}

export interface AgentPrompt {
  id: string;
  label: string;
  prompt: string;
  type?: 'system' | 'user' | 'assistant';
}

export interface CreateAgentData {
  name: string;
  title: string;
  icon: string;
  module: 'mam' | 'mab' | 'cis' | 'core';
  version: string;
  persona: {
    role: string;
    identity?: string;
    communication_style?: string;
    principles?: string[];
  };
  menu: AgentMenuItem[];
  prompts: AgentPrompt[];
  createdBy?: string;
  projectId?: string;
}
