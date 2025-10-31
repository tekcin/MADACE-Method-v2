import { NextRequest, NextResponse } from 'next/server';
import { loadAllAgents } from '@/lib/agents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const agents = await loadAllAgents();

    // Filter by projectId if provided
    let filteredAgents = agents;
    if (projectId) {
      filteredAgents = agents.filter(
        (agent) => agent.metadata.projectId === projectId
      );
    }

    return NextResponse.json({
      agents: filteredAgents.map((agent) => ({
        id: agent.metadata.id,
        name: agent.metadata.name,
        title: agent.metadata.title,
        icon: agent.metadata.icon,
        module: agent.metadata.module || 'core', // Default to 'core' if not specified
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
