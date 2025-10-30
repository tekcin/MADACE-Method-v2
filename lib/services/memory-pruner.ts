/**
 * Memory Pruner Service
 *
 * Handles automatic pruning of old and low-importance memories
 */

import { prisma } from '@/lib/database/client';

/**
 * Pruning strategy:
 * - Delete memories with importance < 5 after 30 days
 * - Delete memories with importance < 7 after 90 days
 * - Keep importance >= 7 indefinitely (or until user clears)
 * - Always delete expired short-term memories
 */

export interface PruningResult {
  pruned: number;
  details: {
    expired: number;
    lowImportance30Days: number;
    mediumImportance90Days: number;
  };
}

/**
 * Prune old and low-importance memories
 */
export async function pruneMemories(): Promise<PruningResult> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const result: PruningResult = {
    pruned: 0,
    details: {
      expired: 0,
      lowImportance30Days: 0,
      mediumImportance90Days: 0,
    },
  };

  // 1. Delete expired memories (expiresAt <= now)
  const expiredResult = await prisma.agentMemory.deleteMany({
    where: {
      expiresAt: {
        lte: now,
      },
    },
  });
  result.details.expired = expiredResult.count;

  // 2. Delete low importance (< 5) memories older than 30 days
  const lowImportanceResult = await prisma.agentMemory.deleteMany({
    where: {
      importance: {
        lt: 5,
      },
      createdAt: {
        lte: thirtyDaysAgo,
      },
      // Only if not explicitly set to never expire
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  result.details.lowImportance30Days = lowImportanceResult.count;

  // 3. Delete medium importance (5-6) memories older than 90 days
  const mediumImportanceResult = await prisma.agentMemory.deleteMany({
    where: {
      importance: {
        gte: 5,
        lt: 7,
      },
      createdAt: {
        lte: ninetyDaysAgo,
      },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  result.details.mediumImportance90Days = mediumImportanceResult.count;

  result.pruned =
    result.details.expired +
    result.details.lowImportance30Days +
    result.details.mediumImportance90Days;

  return result;
}

/**
 * Adjust memory importance based on usage
 *
 * Decay algorithm: newImportance = oldImportance * (accessCount / daysSinceCreation)
 * - Frequently accessed memories get higher importance
 * - Unused memories get lower importance over time
 */
export async function adjustMemoryImportance(): Promise<number> {
  const memories = await prisma.agentMemory.findMany({
    select: {
      id: true,
      importance: true,
      accessCount: true,
      createdAt: true,
    },
  });

  const now = new Date();
  let adjusted = 0;

  for (const memory of memories) {
    const daysSinceCreation = Math.max(
      1,
      Math.floor((now.getTime() - memory.createdAt.getTime()) / (24 * 60 * 60 * 1000))
    );

    // Decay factor based on access frequency
    const accessFrequency = memory.accessCount / daysSinceCreation;

    // Calculate new importance (capped at 10)
    const newImportance = Math.min(
      10,
      Math.max(1, Math.round(memory.importance * (0.5 + accessFrequency)))
    );

    // Only update if importance changed
    if (newImportance !== memory.importance) {
      await prisma.agentMemory.update({
        where: { id: memory.id },
        data: { importance: newImportance },
      });
      adjusted++;
    }
  }

  return adjusted;
}

/**
 * Prune memories for a specific agent and user
 */
export async function pruneMemoriesForAgent(
  agentId: string,
  userId: string
): Promise<PruningResult> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const result: PruningResult = {
    pruned: 0,
    details: {
      expired: 0,
      lowImportance30Days: 0,
      mediumImportance90Days: 0,
    },
  };

  // 1. Delete expired memories
  const expiredResult = await prisma.agentMemory.deleteMany({
    where: {
      agentId,
      userId,
      expiresAt: {
        lte: now,
      },
    },
  });
  result.details.expired = expiredResult.count;

  // 2. Delete low importance memories
  const lowImportanceResult = await prisma.agentMemory.deleteMany({
    where: {
      agentId,
      userId,
      importance: {
        lt: 5,
      },
      createdAt: {
        lte: thirtyDaysAgo,
      },
    },
  });
  result.details.lowImportance30Days = lowImportanceResult.count;

  // 3. Delete medium importance memories
  const mediumImportanceResult = await prisma.agentMemory.deleteMany({
    where: {
      agentId,
      userId,
      importance: {
        gte: 5,
        lt: 7,
      },
      createdAt: {
        lte: ninetyDaysAgo,
      },
    },
  });
  result.details.mediumImportance90Days = mediumImportanceResult.count;

  result.pruned =
    result.details.expired +
    result.details.lowImportance30Days +
    result.details.mediumImportance90Days;

  return result;
}

/**
 * Get pruning statistics (dry run without actually pruning)
 */
export async function getPruningStats(): Promise<{
  willPrune: number;
  expired: number;
  lowImportance: number;
  mediumImportance: number;
}> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [expired, lowImportance, mediumImportance] = await Promise.all([
    prisma.agentMemory.count({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    }),
    prisma.agentMemory.count({
      where: {
        importance: {
          lt: 5,
        },
        createdAt: {
          lte: thirtyDaysAgo,
        },
      },
    }),
    prisma.agentMemory.count({
      where: {
        importance: {
          gte: 5,
          lt: 7,
        },
        createdAt: {
          lte: ninetyDaysAgo,
        },
      },
    }),
  ]);

  return {
    willPrune: expired + lowImportance + mediumImportance,
    expired,
    lowImportance,
    mediumImportance,
  };
}
