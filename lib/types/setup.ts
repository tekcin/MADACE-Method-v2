export interface ProjectInfo {
  projectName: string;
  outputFolder: string;
  userName: string;
  communicationLanguage: string;
  // Complexity assessment fields (0-5 scale)
  projectSize?: number;
  teamSize?: number;
  codebaseComplexity?: number;
  integrations?: number;
  userBase?: number;
  security?: number;
  duration?: number;
  existingCode?: number;
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

export interface AssessmentResult {
  level: number; // 0-4
  levelName: string;
  totalScore: number;
  scoreRange: string;
  recommendedWorkflow: string;
  breakdown: {
    projectSize: number;
    teamSize: number;
    codebaseComplexity: number;
    integrations: number;
    userBase: number;
    security: number;
    duration: number;
    existingCode: number;
  };
  assessedAt: Date | string;
}

export interface SetupConfig {
  projectInfo: ProjectInfo;
  llmConfig: LLMConfig;
  moduleConfig: ModuleConfig;
  assessment?: {
    autoAssessment: AssessmentResult | null;
    manualOverride: number | null; // If user manually selects a level
  };
}

export type SetupStep = 'project' | 'llm' | 'modules' | 'summary';
