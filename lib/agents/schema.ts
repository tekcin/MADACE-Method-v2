import { z } from 'zod';

export const AgentMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  icon: z.string(),
  module: z.string(),
  version: z.string(),
});

export const AgentPersonaSchema = z.object({
  role: z.string(),
  identity: z.string(),
  communication_style: z.string(),
  principles: z.array(z.string()),
});

export const AgentMenuItemSchema = z.object({
  trigger: z.string(),
  action: z.string(),
  description: z.string(),
});

export const AgentPromptSchema = z.object({
  name: z.string(),
  trigger: z.string(),
  content: z.string(),
});

export const AgentSchema = z.object({
  metadata: AgentMetadataSchema,
  persona: AgentPersonaSchema,
  critical_actions: z.array(z.string()).optional(),
  menu: z.array(AgentMenuItemSchema),
  load_always: z.array(z.string()).optional(),
  prompts: z.array(AgentPromptSchema),
});

export const AgentFileSchema = z.object({
  agent: AgentSchema,
});

// Infer TypeScript types from Zod schemas
export type AgentMetadata = z.infer<typeof AgentMetadataSchema>;
export type AgentPersona = z.infer<typeof AgentPersonaSchema>;
export type AgentMenuItem = z.infer<typeof AgentMenuItemSchema>;
export type AgentPrompt = z.infer<typeof AgentPromptSchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type AgentFile = z.infer<typeof AgentFileSchema>;
