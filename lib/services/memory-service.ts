/**
 * Memory Service
 *
 * Handles persistent agent memory storage, retrieval, and management
 */

import { prisma } from '@/lib/database/client';
import type { AgentMemory } from '@prisma/client';

/**
 * Memory context structure
 */
export interface MemoryContext {
  type: 'short-term' | 'long-term';
  category: 'user_preference' | 'project_context' | 'conversation_summary' | 'user_fact';
  key: string;
  value: string;
  importance: number; // 1-10 scale
  source?: string; // 'inferred_from_chat' | 'user_input' | 'system'
  expiresAt?: Date;
}

/**
 * Memory filter options
 */
export interface MemoryFilterOptions {
  type?: 'short-term' | 'long-term';
  category?: string;
  minImportance?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'lastAccessedAt' | 'importance';
  order?: 'asc' | 'desc';
}

/**
 * Save a new memory
 */
export async function saveMemory(
  agentId: string,
  userId: string,
  memory: MemoryContext
): Promise<AgentMemory> {
  return await prisma.agentMemory.create({
    data: {
      agentId,
      userId,
      context: memory as any,
      type: memory.type,
      category: memory.category,
      key: memory.key,
      value: memory.value,
      importance: memory.importance,
      source: memory.source || 'inferred_from_chat',
      expiresAt: memory.expiresAt,
    },
  });
}

/**
 * Get memories for an agent and user
 */
export async function getMemories(
  agentId: string,
  userId: string,
  options: MemoryFilterOptions = {}
): Promise<AgentMemory[]> {
  const {
    type,
    category,
    minImportance = 0,
    limit = 50,
    orderBy = 'lastAccessedAt',
    order = 'desc',
  } = options;

  return await prisma.agentMemory.findMany({
    where: {
      agentId,
      userId,
      ...(type && { type }),
      ...(category && { category }),
      importance: { gte: minImportance },
      // Only get non-expired memories
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      ],
    },
    orderBy: {
      [orderBy]: order,
    },
    take: limit,
  });
}

/**
 * Get a single memory by ID
 */
export async function getMemory(memoryId: string): Promise<AgentMemory | null> {
  return await prisma.agentMemory.findUnique({
    where: { id: memoryId },
  });
}

/**
 * Update a memory
 */
export async function updateMemory(
  memoryId: string,
  updates: Partial<MemoryContext>
): Promise<AgentMemory> {
  const data: any = {};

  if (updates.importance !== undefined) data.importance = updates.importance;
  if (updates.value !== undefined) data.value = updates.value;
  if (updates.expiresAt !== undefined) data.expiresAt = updates.expiresAt;
  if (updates.type !== undefined) data.type = updates.type;
  if (updates.category !== undefined) data.category = updates.category;

  // Update context JSON if any fields changed
  if (Object.keys(updates).length > 0) {
    const existing = await getMemory(memoryId);
    if (existing) {
      data.context = {
        ...(existing.context as any),
        ...updates,
      };
    }
  }

  return await prisma.agentMemory.update({
    where: { id: memoryId },
    data,
  });
}

/**
 * Delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  await prisma.agentMemory.delete({
    where: { id: memoryId },
  });
}

/**
 * Clear all memories for an agent and user
 */
export async function clearMemories(
  agentId: string,
  userId: string,
  type?: 'short-term' | 'long-term'
): Promise<number> {
  const result = await prisma.agentMemory.deleteMany({
    where: {
      agentId,
      userId,
      ...(type && { type }),
    },
  });

  return result.count;
}

/**
 * Track memory access (updates lastAccessedAt and accessCount)
 */
export async function trackMemoryAccess(memoryId: string): Promise<void> {
  await prisma.agentMemory.update({
    where: { id: memoryId },
    data: {
      lastAccessedAt: new Date(),
      accessCount: {
        increment: 1,
      },
    },
  });
}

/**
 * Track multiple memory accesses at once
 */
export async function trackMemoryAccesses(memoryIds: string[]): Promise<void> {
  await Promise.all(memoryIds.map((id) => trackMemoryAccess(id)));
}

/**
 * Get memory count for an agent and user
 */
export async function getMemoryCount(
  agentId: string,
  userId: string,
  type?: 'short-term' | 'long-term'
): Promise<number> {
  return await prisma.agentMemory.count({
    where: {
      agentId,
      userId,
      ...(type && { type }),
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      ],
    },
  });
}

/**
 * Search memories by keyword
 */
export async function searchMemories(
  agentId: string,
  userId: string,
  query: string,
  limit = 20
): Promise<AgentMemory[]> {
  const memories = await prisma.agentMemory.findMany({
    where: {
      agentId,
      userId,
      AND: [
        {
          OR: [{ key: { contains: query } }, { value: { contains: query } }],
        },
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      ],
    },
    orderBy: {
      importance: 'desc',
    },
    take: limit,
  });

  return memories;
}

/**
 * Get memory statistics for an agent and user
 */
export async function getMemoryStats(
  agentId: string,
  userId: string
): Promise<{
  total: number;
  shortTerm: number;
  longTerm: number;
  byCategory: Record<string, number>;
  avgImportance: number;
}> {
  const memories = await prisma.agentMemory.findMany({
    where: {
      agentId,
      userId,
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      ],
    },
    select: {
      type: true,
      category: true,
      importance: true,
    },
  });

  const stats = {
    total: memories.length,
    shortTerm: memories.filter((m) => m.type === 'short-term').length,
    longTerm: memories.filter((m) => m.type === 'long-term').length,
    byCategory: {} as Record<string, number>,
    avgImportance: 0,
  };

  // Count by category
  for (const memory of memories) {
    stats.byCategory[memory.category] = (stats.byCategory[memory.category] || 0) + 1;
  }

  // Calculate average importance
  if (memories.length > 0) {
    stats.avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
  }

  return stats;
}

/**
 * Format memories as natural language context for LLM prompts
 */
export function formatMemoriesForPrompt(memories: AgentMemory[]): string {
  if (memories.length === 0) {
    return 'No previous memories about this user.';
  }

  const sections: string[] = [];

  // Group by category
  const byCategory: Record<string, AgentMemory[]> = {};
  for (const memory of memories) {
    if (!byCategory[memory.category]) {
      byCategory[memory.category] = [];
    }
    byCategory[memory.category]!.push(memory);
  }

  // Format each category
  const categoryLabels: Record<string, string> = {
    user_preference: 'User Preferences',
    project_context: 'Project Context',
    conversation_summary: 'Previous Conversations',
    user_fact: 'User Facts',
  };

  for (const [category, categoryMemories] of Object.entries(byCategory)) {
    const label = categoryLabels[category] || category;
    const items = categoryMemories
      .sort((a, b) => b.importance - a.importance) // Sort by importance
      .slice(0, 5) // Limit to top 5 per category
      .map((m) => `- ${m.key}: ${m.value}`)
      .join('\n');

    sections.push(`${label}:\n${items}`);
  }

  return sections.join('\n\n');
}
