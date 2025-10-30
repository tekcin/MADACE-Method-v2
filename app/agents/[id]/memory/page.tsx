import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/database/client';
import { MemoryDashboard } from '@/components/features/memory/MemoryDashboard';

interface MemoryPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: MemoryPageProps): Promise<Metadata> {
  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  if (!agent) {
    return {
      title: 'Agent Not Found',
    };
  }

  return {
    title: `Memory - ${agent.title} | MADACE v3.0`,
    description: `Manage persistent memories for ${agent.title} agent`,
  };
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      title: true,
      icon: true,
      module: true,
    },
  });

  if (!agent) {
    notFound();
  }

  // TODO: Get actual user ID from session/auth
  // For now, use a default user ID
  const userId = 'default-user';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Back button */}
            <a
              href={`/agents/${agent.id}`}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </a>

            {/* Agent info */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">{agent.icon || '🤖'}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {agent.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Memory Management • {agent.module} module
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <MemoryDashboard agentId={agent.id} userId={userId} />
      </div>
    </div>
  );
}
