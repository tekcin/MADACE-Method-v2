import { NextResponse } from 'next/server';
import { loadAgent } from '@/lib/agents';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentPath = path.join(process.cwd(), 'madace', 'mam', 'agents', `${id}.agent.yaml`);

    const agent = await loadAgent(agentPath);
    return NextResponse.json({ agent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
