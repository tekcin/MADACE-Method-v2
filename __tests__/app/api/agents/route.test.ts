import { GET } from '@/app/api/agents/route';

// Mock NextResponse first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// Mock the agents loader
jest.mock('@/lib/agents', () => ({
  loadMAMAgents: jest.fn(),
}));

const { loadMAMAgents } = require('@/lib/agents');
const { NextResponse } = require('next/server');

describe('/api/agents', () => {
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      url: 'http://localhost:3000/api/agents',
      headers: new Headers(),
    };
  });

  it('should return list of all agents', async () => {
    const mockAgents = [
      {
        metadata: {
          id: 'madace/mam/agents/pm.md',
          name: 'PM',
          title: 'Product Manager',
          icon: '📋',
          module: 'mam',
          version: '1.0.0',
        },
        persona: {
          role: 'Product Manager',
          identity: 'Test identity',
          communication_style: 'Professional',
          principles: ['test'],
        },
        menu: [],
        prompts: [],
      },
      {
        metadata: {
          id: 'madace/mam/agents/analyst.md',
          name: 'Analyst',
          title: 'Business Analyst',
          icon: '📊',
          module: 'mam',
          version: '1.0.0',
        },
        persona: {
          role: 'Business Analyst',
          identity: 'Test analyst',
          communication_style: 'Analytical',
          principles: ['data-driven'],
        },
        menu: [],
        prompts: [],
      },
    ];

    loadMAMAgents.mockResolvedValue(mockAgents);
    (NextResponse.json as jest.Mock).mockImplementation((data, options) => {
      return {
        status: options?.status || 200,
        json: async () => data,
      } as any;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents).toHaveLength(2);
    expect(data.agents[0]).toEqual({
      id: 'madace/mam/agents/pm.md',
      name: 'PM',
      title: 'Product Manager',
      icon: '📋',
      module: 'mam',
    });
    expect(data.agents[1]).toEqual({
      id: 'madace/mam/agents/analyst.md',
      name: 'Analyst',
      title: 'Business Analyst',
      icon: '📊',
      module: 'mam',
    });
  });

  it('should handle agents loading errors gracefully', async () => {
    const error = new Error('Failed to load agents');
    loadMAMAgents.mockRejectedValue(error);

    (NextResponse.json as jest.Mock).mockImplementation((data, options) => {
      return {
        status: options?.status || 500,
        json: async () => data,
      } as any;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to load agents');
    expect(loadMAMAgents).toHaveBeenCalled();
  });

  it('should handle unknown errors gracefully', async () => {
    loadMAMAgents.mockRejectedValue('String error');

    (NextResponse.json as jest.Mock).mockImplementation((data, options) => {
      return {
        status: options?.status || 500,
        json: async () => data,
      } as any;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Unknown error');
  });

  it('should return only metadata fields in API response', async () => {
    const mockAgent = {
      metadata: {
        id: 'madace/mam/agents/pm.md',
        name: 'PM',
        title: 'Product Manager',
        icon: '📋',
        module: 'mam',
        version: '1.0.0',
      },
      persona: {
        /* Should not be included */
      },
      menu: [
        /* Should not be included */
      ],
      prompts: [
        /* Should not be included */
      ],
      critical_actions: [
        /* Should not be included */
      ],
    };

    loadMAMAgents.mockResolvedValue([mockAgent]);
    (NextResponse.json as jest.Mock).mockImplementation((data, options) => {
      return {
        status: options?.status || 200,
        json: async () => data,
      } as any;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.agents[0]).toHaveProperty('id');
    expect(data.agents[0]).toHaveProperty('name');
    expect(data.agents[0]).toHaveProperty('title');
    expect(data.agents[0]).toHaveProperty('icon');
    expect(data.agents[0]).toHaveProperty('module');
    expect(data.agents[0]).not.toHaveProperty('persona');
    expect(data.agents[0]).not.toHaveProperty('menu');
    expect(data.agents[0]).not.toHaveProperty('prompts');
    expect(data.agents[0]).not.toHaveProperty('critical_actions');
  });
});
