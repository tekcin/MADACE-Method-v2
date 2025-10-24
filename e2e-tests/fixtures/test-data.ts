/**
 * Test Data Fixtures
 *
 * Centralized test data for E2E tests
 */

export const testUsers = {
  default: {
    userName: 'Test User',
    projectName: 'E2E Test Project',
    outputFolder: 'test-docs',
    language: 'English',
  },
  admin: {
    userName: 'Admin User',
    projectName: 'Admin Test Project',
    outputFolder: 'admin-docs',
    language: 'English',
  },
};

export const testLLMConfigs = {
  gemini: {
    provider: 'gemini' as const,
    apiKey: process.env.GEMINI_API_KEY || 'test-gemini-key',
    model: 'gemini-2.0-flash-exp',
  },
  claude: {
    provider: 'claude' as const,
    apiKey: process.env.CLAUDE_API_KEY || 'test-claude-key',
    model: 'claude-sonnet-4',
  },
  openai: {
    provider: 'openai' as const,
    apiKey: process.env.OPENAI_API_KEY || 'test-openai-key',
    model: 'gpt-4o',
  },
  local: {
    provider: 'local' as const,
    apiKey: 'not-required',
    model: 'llama3',
  },
};

export const testModuleConfigs = {
  allEnabled: {
    mam: true,
    mab: true,
    cis: true,
  },
  mamOnly: {
    mam: true,
    mab: false,
    cis: false,
  },
  creative: {
    mam: false,
    mab: false,
    cis: true,
  },
};

export const testAgents = {
  mam: ['pm', 'analyst', 'architect', 'sm', 'dev'],
  madace: [
    'analyst',
    'architect',
    'madace-master',
    'madace-orchestrator',
    'dev',
    'pm',
    'po',
    'qa',
    'sm',
    'ux-expert',
  ],
  madacev6bmm: [
    'analyst',
    'architect',
    'dev-impl',
    'game-architect',
    'game-designer',
    'game-dev',
    'pm',
    'sm',
    'tea',
    'ux-expert',
  ],
};

export const testWorkflowStates = {
  empty: {
    backlog: [],
    todo: [],
    inProgress: [],
    done: [],
  },
  singleStory: {
    backlog: [],
    todo: ['CORE-001'],
    inProgress: [],
    done: [],
  },
  activeProject: {
    backlog: ['CORE-003', 'CORE-004'],
    todo: ['CORE-002'],
    inProgress: ['CORE-001'],
    done: ['SETUP-001', 'SETUP-002'],
  },
};
