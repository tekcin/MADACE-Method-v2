import { NextRequest, NextResponse } from 'next/server';
import { loadAllAgents } from '@/lib/agents';

export async function GET(_request: NextRequest) {
  try {
    const agents = await loadAllAgents();

    return NextResponse.json({
      agents: agents.map((agent) => ({
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
