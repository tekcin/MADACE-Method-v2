import type { LLMConfig } from './types';

export function getLLMConfigFromEnv(): LLMConfig {
  const provider = (process.env.PLANNING_LLM || 'gemini') as LLMConfig['provider'];

  const configs: Record<string, Partial<LLMConfig>> = {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
    local: {
      baseURL: process.env.LOCAL_MODEL_URL || 'http://localhost:11434',
      model: process.env.LOCAL_MODEL_NAME || 'llama2',
    },
  };

  return {
    provider,
    ...configs[provider],
  } as LLMConfig;
}
