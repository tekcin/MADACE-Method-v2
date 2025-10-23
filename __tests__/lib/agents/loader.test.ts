import { loadAgent, loadMAMAgents, AgentLoadError, clearAgentCache } from '@/lib/agents/loader';
import fs from 'fs/promises';
import path from 'path';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('AgentLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAgentCache(); // Clear the singleton cache before each test
  });

  const testAgentPath = path.join(process.cwd(), 'madace/mam/agents/pm.agent.yaml');
  const validAgentContent = `
agent:
  metadata:
    id: madace/mam/agents/pm.md
    name: PM
    title: Product Manager
    icon: 📋
    module: mam
    version: 1.0.0
  persona:
    role: Product Manager
    identity: Test identity
    communication_style: Professional
    principles: [test-principle]
  menu: []
  prompts: []
`;

  describe('loadAgent', () => {
    it('should load a valid agent YAML file', async () => {
      mockFs.readFile.mockResolvedValue(validAgentContent);

      const agent = await loadAgent(testAgentPath);

      expect(agent.metadata.id).toBe('madace/mam/agents/pm.md');
      expect(agent.metadata.name).toBe('PM');
      expect(agent.metadata.title).toBe('Product Manager');
      expect(agent.metadata.icon).toBe('📋');
      expect(agent.metadata.module).toBe('mam');
      expect(agent.metadata.version).toBe('1.0.0');
      expect(agent.persona.role).toBe('Product Manager');
      expect(agent.persona.principles).toContain('test-principle');
      expect(agent.menu).toEqual([]);
      expect(agent.prompts).toEqual([]);
    });

    it('should throw AgentLoadError for non-existent file', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file') as any);

      await expect(loadAgent('/non/existent/agent.yaml')).rejects.toThrow(AgentLoadError);
    });

    it('should cache loaded agents', async () => {
      mockFs.readFile.mockResolvedValue(validAgentContent);

      const agent1 = await loadAgent(testAgentPath);
      const agent2 = await loadAgent(testAgentPath);

      expect(agent1).toBe(agent2); // Same reference from cache
      expect(mockFs.readFile).toHaveBeenCalledTimes(1); // Only read once
    });

    it('should throw AgentLoadError for malformed YAML', async () => {
      // Use truly malformed YAML that js-yaml will reject
      mockFs.readFile.mockResolvedValue('agent:\n  metadata:\n    invalid\n  unbalanced: [bracket');

      await expect(loadAgent(testAgentPath)).rejects.toThrow(AgentLoadError);
    });

    it('should throw AgentLoadError for invalid schema', async () => {
      const invalidSchemaContent = `
agent:
  metadata:
    id: test-only
    name: Test
    # Missing required fields: title, icon, module, version
  persona:
    role: Test
  menu: []
  prompts: []
`;

      mockFs.readFile.mockResolvedValue(invalidSchemaContent);

      await expect(loadAgent(testAgentPath)).rejects.toThrow(AgentLoadError);
    });
  });

  describe('loadMAMAgents', () => {
    it('should load all MAM agents from directory', async () => {
      const agentFiles = [
        'pm.agent.yaml',
        'analyst.agent.yaml',
        'architect.agent.yaml',
        'sm.agent.yaml',
        'dev.agent.yaml',
      ];
      mockFs.readdir.mockResolvedValue(agentFiles as any);

      // Mock each agent file - need to setup individual mocks
      const mockContents = agentFiles.map((file) =>
        validAgentContent.replace('name: PM', `name: ${file.replace('.agent.yaml', '').toUpperCase()}`)
      );

      mockFs.readFile
        .mockResolvedValueOnce(mockContents[0])
        .mockResolvedValueOnce(mockContents[1])
        .mockResolvedValueOnce(mockContents[2])
        .mockResolvedValueOnce(mockContents[3])
        .mockResolvedValueOnce(mockContents[4]);

      const agents = await loadMAMAgents();

      expect(agents).toHaveLength(5);
      expect(agents.map((a) => a.metadata.name)).toEqual([
        'PM',
        'ANALYST',
        'ARCHITECT',
        'SM',
        'DEV',
      ]);
      expect(mockFs.readdir).toHaveBeenCalledWith(
        path.join(process.cwd(), 'madace', 'mam', 'agents')
      );
    });

    it('should filter to only .agent.yaml files', async () => {
      mockFs.readdir.mockResolvedValue([
        'pm.agent.yaml',
        'readme.md',
        'config.json',
        'test.txt',
      ] as any);

      const agentContent = validAgentContent.replace('name: PM', 'name: FILTERED');
      mockFs.readFile.mockResolvedValue(agentContent);

      const agents = await loadMAMAgents();

      expect(agents).toHaveLength(1);
      expect(agents[0]?.metadata.name).toBe('FILTERED');
    });

    it('should throw error if directory read fails', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Permission denied') as any);

      await expect(loadMAMAgents()).rejects.toThrow(AgentLoadError);
    });
  });
});
