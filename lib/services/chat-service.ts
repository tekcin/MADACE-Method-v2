/**
 * Chat Service
 *
 * Provides CRUD operations for chat sessions and messages
 */

import { prisma } from '@/lib/database/client';
import type { ChatSession, ChatMessage } from '@prisma/client';
import { z } from 'zod';

// ==============================================================================
// TYPES & SCHEMAS
// ==============================================================================

/**
 * Chat session with messages
 */
export type ChatSessionWithMessages = ChatSession & {
  messages: ChatMessage[];
  user?: { id: string; name: string | null; email: string };
  agent?: { id: string; name: string; title: string };
};

/**
 * Chat message with optional reply chain
 */
export type ChatMessageWithReplies = ChatMessage & {
  replyTo?: ChatMessage | null;
  replies?: ChatMessage[];
};

/**
 * Create session schema
 */
export const CreateSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  agentId: z.string().min(1, 'Agent ID is required'),
  projectId: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

/**
 * Create message schema
 */
export const CreateMessageSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  role: z.enum(['user', 'agent', 'system']),
  content: z.string().min(1, 'Content is required'),
  replyToId: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  before?: Date; // Load messages before this timestamp (for infinite scroll)
}

// ==============================================================================
// SESSION OPERATIONS
// ==============================================================================

/**
 * Create new chat session
 */
export async function createSession(input: CreateSessionInput): Promise<ChatSession> {
  const validated = CreateSessionSchema.parse(input);

  const session = await prisma.chatSession.create({
    data: {
      userId: validated.userId,
      agentId: validated.agentId,
      projectId: validated.projectId,
    },
  });

  return session;
}

/**
 * Get session by ID with messages
 */
export async function getSession(
  sessionId: string,
  pagination?: PaginationOptions
): Promise<ChatSessionWithMessages | null> {
  const limit = pagination?.limit ?? 50;
  const offset = pagination?.offset ?? 0;

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        ...(pagination?.before && {
          where: {
            timestamp: {
              lt: pagination.before,
            },
          },
        }),
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
          title: true,
        },
      },
    },
  });

  return session;
}

/**
 * List sessions for a user
 */
export async function listSessionsByUser(
  userId: string,
  options?: {
    agentId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ChatSessionWithMessages[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const sessions = await prisma.chatSession.findMany({
    where: {
      userId,
      ...(options?.agentId && { agentId: options.agentId }),
    },
    include: {
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 5, // Only include last 5 messages for preview
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
          title: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return sessions;
}

/**
 * List sessions for an agent
 */
export async function listSessionsByAgent(
  agentId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<ChatSessionWithMessages[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const sessions = await prisma.chatSession.findMany({
    where: { agentId },
    include: {
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 5,
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      agent: {
        select: {
          id: true,
          name: true,
          title: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return sessions;
}

/**
 * End a chat session
 */
export async function endSession(sessionId: string): Promise<ChatSession> {
  const session = await prisma.chatSession.update({
    where: { id: sessionId },
    data: { endedAt: new Date() },
  });

  return session;
}

/**
 * Delete a chat session (and all messages cascade)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.chatSession.delete({
    where: { id: sessionId },
  });
}

// ==============================================================================
// MESSAGE OPERATIONS
// ==============================================================================

/**
 * Create new chat message
 */
export async function createMessage(input: CreateMessageInput): Promise<ChatMessage> {
  const validated = CreateMessageSchema.parse(input);

  const message = await prisma.chatMessage.create({
    data: {
      sessionId: validated.sessionId,
      role: validated.role,
      content: validated.content,
      replyToId: validated.replyToId,
    },
  });

  return message;
}

/**
 * Get message by ID with replies
 */
export async function getMessage(messageId: string): Promise<ChatMessageWithReplies | null> {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      replyTo: true,
      replies: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  return message;
}

/**
 * List messages for a session
 */
export async function listMessages(
  sessionId: string,
  pagination?: PaginationOptions
): Promise<ChatMessage[]> {
  const limit = pagination?.limit ?? 50;
  const offset = pagination?.offset ?? 0;

  const messages = await prisma.chatMessage.findMany({
    where: {
      sessionId,
      ...(pagination?.before && {
        timestamp: {
          lt: pagination.before,
        },
      }),
    },
    orderBy: { timestamp: 'asc' },
    take: limit,
    skip: offset,
  });

  return messages;
}

/**
 * Count messages in a session
 */
export async function countMessages(sessionId: string): Promise<number> {
  const count = await prisma.chatMessage.count({
    where: { sessionId },
  });

  return count;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  await prisma.chatMessage.delete({
    where: { id: messageId },
  });
}

// ==============================================================================
// SEARCH & ANALYTICS
// ==============================================================================

/**
 * Search messages by content
 */
export async function searchMessages(
  query: string,
  options?: {
    userId?: string;
    agentId?: string;
    limit?: number;
  }
): Promise<ChatMessage[]> {
  const limit = options?.limit ?? 50;

  const messages = await prisma.chatMessage.findMany({
    where: {
      content: {
        contains: query,
      },
      ...(options?.userId && {
        session: {
          userId: options.userId,
        },
      }),
      ...(options?.agentId && {
        session: {
          agentId: options.agentId,
        },
      }),
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      session: {
        include: {
          agent: {
            select: {
              name: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return messages;
}

/**
 * Get session statistics
 */
export async function getSessionStats(sessionId: string) {
  const [messageCount, userMessageCount, agentMessageCount] = await Promise.all([
    prisma.chatMessage.count({
      where: { sessionId },
    }),
    prisma.chatMessage.count({
      where: { sessionId, role: 'user' },
    }),
    prisma.chatMessage.count({
      where: { sessionId, role: 'agent' },
    }),
  ]);

  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: {
      startedAt: true,
      endedAt: true,
    },
  });

  const duration = session?.endedAt
    ? session.endedAt.getTime() - session.startedAt.getTime()
    : session?.startedAt
      ? Date.now() - session.startedAt.getTime()
      : 0;

  return {
    messageCount,
    userMessageCount,
    agentMessageCount,
    duration,
    isActive: !session?.endedAt,
  };
}

/**
 * Get user chat statistics
 */
export async function getUserChatStats(userId: string) {
  const [sessionCount, activeSessionCount, totalMessages] = await Promise.all([
    prisma.chatSession.count({
      where: { userId },
    }),
    prisma.chatSession.count({
      where: { userId, endedAt: null },
    }),
    prisma.chatMessage.count({
      where: { session: { userId } },
    }),
  ]);

  return {
    sessionCount,
    activeSessionCount,
    totalMessages,
  };
}

// ==============================================================================
// THREADING & EXPORT
// ==============================================================================

/**
 * Get full thread for a message (parent + replies recursively)
 */
export async function getMessageThread(messageId: string): Promise<ChatMessageWithReplies[]> {
  // Get the root message (traverse up to find the root)
  let currentMessage: ChatMessageWithReplies | null = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: { replyTo: true, replies: true },
  });

  if (!currentMessage) {
    return [];
  }

  // Find the root message by traversing up
  while (currentMessage?.replyToId) {
    const parentMessage: ChatMessageWithReplies | null = await prisma.chatMessage.findUnique({
      where: { id: currentMessage.replyToId },
      include: { replyTo: true, replies: true },
    });
    if (!parentMessage) break;
    currentMessage = parentMessage;
  }

  const rootId = currentMessage?.id;
  if (!rootId) {
    return [];
  }

  // Get all messages in the thread (root + all descendants)
  const allMessages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { id: rootId },
        { replyToId: rootId },
        // For nested replies, we'll need to fetch recursively
      ],
    },
    include: {
      replyTo: true,
      replies: {
        orderBy: { timestamp: 'asc' },
      },
    },
    orderBy: { timestamp: 'asc' },
  });

  // Build the full thread tree recursively
  const messageMap = new Map(allMessages.map((m) => [m.id, m]));
  const fetchDescendants = async (parentId: string): Promise<void> => {
    const children = await prisma.chatMessage.findMany({
      where: { replyToId: parentId },
      include: {
        replyTo: true,
        replies: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    for (const child of children) {
      messageMap.set(child.id, child);
      await fetchDescendants(child.id);
    }
  };

  await fetchDescendants(rootId);

  return Array.from(messageMap.values());
}

/**
 * Export session as Markdown
 */
export async function exportSessionAsMarkdown(sessionId: string): Promise<string> {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' },
        include: {
          replyTo: {
            select: {
              id: true,
              content: true,
              timestamp: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      agent: {
        select: {
          name: true,
          title: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  // Build Markdown content
  const lines: string[] = [];

  // Header
  lines.push(`# Chat Session: ${session.agent?.title || 'Unknown Agent'}`);
  lines.push('');
  lines.push(`**User**: ${session.user?.name || session.user?.email || 'Unknown'}`);
  lines.push(`**Agent**: ${session.agent?.name || 'Unknown'} - ${session.agent?.title || ''}`);
  lines.push(`**Started**: ${session.startedAt.toISOString()}`);
  if (session.endedAt) {
    lines.push(`**Ended**: ${session.endedAt.toISOString()}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Messages
  for (const message of session.messages) {
    const timestamp = message.timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Show reply context if this is a reply
    if (message.replyTo && message.replyTo.content) {
      const replyTime = message.replyTo.timestamp.toLocaleTimeString();
      const replyPreview = (message.replyTo.content.split('\n')[0] || '').substring(0, 80);
      lines.push(`> **In reply to** (${replyTime}):`);
      lines.push(`> ${replyPreview}...`);
      lines.push('');
    }

    // Message header
    const roleEmoji = message.role === 'user' ? '👤' : message.role === 'agent' ? '🤖' : '⚙️';
    const roleName =
      message.role === 'user' ? 'User' : message.role === 'agent' ? 'Agent' : 'System';
    lines.push(`### ${roleEmoji} ${roleName} - ${timestamp}`);
    lines.push('');

    // Message content
    lines.push(message.content);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Footer
  lines.push('');
  lines.push(`*Exported from MADACE v3.0 - ${new Date().toISOString()}*`);

  return lines.join('\n');
}
