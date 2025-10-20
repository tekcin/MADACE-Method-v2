import { NextResponse } from 'next/server';
import { loadMAMAgents } from '@/lib/agents';

export async function GET() {
  try {
    const agents = await loadMAMAgents();
    return NextResponse.json({
      agents: agents.map((agent) => ({
        id: agent.metadata.id,
        name: agent.metadata.name,
        title: agent.metadata.title,
        icon: agent.metadata.icon,
        module: agent.metadata.module,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
