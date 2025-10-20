export interface ProjectInfo {
  projectName: string;
  outputFolder: string;
  userName: string;
  communicationLanguage: string;
}

export interface LLMConfig {
  provider: 'gemini' | 'claude' | 'openai' | 'local';
  apiKey: string;
  model: string;
}

export interface ModuleConfig {
  mamEnabled: boolean;
  mabEnabled: boolean;
  cisEnabled: boolean;
}

export interface SetupConfig {
  projectInfo: ProjectInfo;
  llmConfig: LLMConfig;
  moduleConfig: ModuleConfig;
}

export type SetupStep = 'project' | 'llm' | 'modules' | 'summary';
