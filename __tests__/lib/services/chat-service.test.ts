/**
 * Chat Service Tests
 *
 * Tests for chat session and message operations
 */

import {
  createSession,
  getSession,
  listSessionsByUser,
  endSession,
  deleteSession,
  createMessage,
  getMessage,
  listMessages,
  countMessages,
  deleteMessage,
  searchMessages,
  getSessionStats,
  getUserChatStats,
} from '@/lib/services/chat-service';
import { prisma } from '@/lib/database/client';
import type { ChatSession, ChatMessage } from '@prisma/client';

describe('Chat Service - Sessions', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
  const mockAgent = { id: 'agent-1', name: 'PM', title: 'Project Manager' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new chat session', async () => {
      const input = {
        userId: 'user-1',
        agentId: 'agent-1',
      };

      const mockSession: ChatSession = {
        id: 'session-1',
        userId: input.userId,
        agentId: input.agentId,
        startedAt: new Date(),
        endedAt: null,
        projectId: null,
      };

      prismaMock.chatSession.create.mockResolvedValue(mockSession);

      const result = await createSession(input);

      expect(result).toEqual(mockSession);
      expect(prismaMock.chatSession.create).toHaveBeenCalledWith({
        data: {
          userId: input.userId,
          agentId: input.agentId,
          projectId: undefined,
        },
      });
    });

    it('should create session with projectId', async () => {
      const input = {
        userId: 'user-1',
        agentId: 'agent-1',
        projectId: 'project-1',
      };

      const mockSession: ChatSession = {
        id: 'session-1',
        userId: input.userId,
        agentId: input.agentId,
        startedAt: new Date(),
        endedAt: null,
        projectId: input.projectId,
      };

      prismaMock.chatSession.create.mockResolvedValue(mockSession);

      const result = await createSession(input);

      expect(result.projectId).toBe('project-1');
    });
  });

  describe('getSession', () => {
    it('should get session with messages', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        agentId: 'agent-1',
        startedAt: new Date(),
        endedAt: null,
        projectId: null,
        messages: [
          {
            id: 'msg-1',
            sessionId: 'session-1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date(),
            replyToId: null,
          },
        ],
        user: mockUser,
        agent: mockAgent,
      };

      prismaMock.chatSession.findUnique.mockResolvedValue(mockSession as any);

      const result = await getSession('session-1');

      expect(result).toEqual(mockSession);
      expect(prismaMock.chatSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: expect.objectContaining({
          messages: expect.any(Object),
          user: expect.any(Object),
          agent: expect.any(Object),
        }),
      });
    });

    it('should return null for non-existent session', async () => {
      prismaMock.chatSession.findUnique.mockResolvedValue(null);

      const result = await getSession('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listSessionsByUser', () => {
    it('should list sessions for a user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          agentId: 'agent-1',
          startedAt: new Date(),
          endedAt: null,
          projectId: null,
          messages: [],
          user: mockUser,
          agent: mockAgent,
        },
      ];

      prismaMock.chatSession.findMany.mockResolvedValue(mockSessions as any);

      const result = await listSessionsByUser('user-1');

      expect(result).toEqual(mockSessions);
      expect(prismaMock.chatSession.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
        orderBy: { startedAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should filter by agentId', async () => {
      prismaMock.chatSession.findMany.mockResolvedValue([]);

      await listSessionsByUser('user-1', { agentId: 'agent-1' });

      expect(prismaMock.chatSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            agentId: 'agent-1',
          }),
        })
      );
    });
  });

  describe('endSession', () => {
    it('should end a session', async () => {
      const mockSession: ChatSession = {
        id: 'session-1',
        userId: 'user-1',
        agentId: 'agent-1',
        startedAt: new Date(),
        endedAt: new Date(),
        projectId: null,
      };

      prismaMock.chatSession.update.mockResolvedValue(mockSession);

      const result = await endSession('session-1');

      expect(result.endedAt).toBeTruthy();
      expect(prismaMock.chatSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { endedAt: expect.any(Date) },
      });
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      prismaMock.chatSession.delete.mockResolvedValue({} as ChatSession);

      await deleteSession('session-1');

      expect(prismaMock.chatSession.delete).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });
  });
});

describe('Chat Service - Messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const input = {
        sessionId: 'session-1',
        role: 'user' as const,
        content: 'Hello, agent!',
      };

      const mockMessage: ChatMessage = {
        id: 'msg-1',
        sessionId: input.sessionId,
        role: input.role,
        content: input.content,
        timestamp: new Date(),
        replyToId: null,
      };

      prismaMock.chatMessage.create.mockResolvedValue(mockMessage);

      const result = await createMessage(input);

      expect(result).toEqual(mockMessage);
      expect(prismaMock.chatMessage.create).toHaveBeenCalledWith({
        data: {
          sessionId: input.sessionId,
          role: input.role,
          content: input.content,
          replyToId: undefined,
        },
      });
    });

    it('should create message with replyToId', async () => {
      const input = {
        sessionId: 'session-1',
        role: 'agent' as const,
        content: 'Response',
        replyToId: 'msg-1',
      };

      const mockMessage: ChatMessage = {
        id: 'msg-2',
        sessionId: input.sessionId,
        role: input.role,
        content: input.content,
        timestamp: new Date(),
        replyToId: input.replyToId,
      };

      prismaMock.chatMessage.create.mockResolvedValue(mockMessage);

      const result = await createMessage(input);

      expect(result.replyToId).toBe('msg-1');
    });
  });

  describe('getMessage', () => {
    it('should get message with replies', async () => {
      const mockMessage = {
        id: 'msg-1',
        sessionId: 'session-1',
        role: 'user',
        content: 'Question?',
        timestamp: new Date(),
        replyToId: null,
        replyTo: null,
        replies: [
          {
            id: 'msg-2',
            sessionId: 'session-1',
            role: 'agent',
            content: 'Answer',
            timestamp: new Date(),
            replyToId: 'msg-1',
          },
        ],
      };

      prismaMock.chatMessage.findUnique.mockResolvedValue(mockMessage as any);

      const result = await getMessage('msg-1');

      expect(result).toEqual(mockMessage);
      expect(result?.replies).toHaveLength(1);
    });
  });

  describe('listMessages', () => {
    it('should list messages for a session', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
          replyToId: null,
        },
        {
          id: 'msg-2',
          sessionId: 'session-1',
          role: 'agent',
          content: 'Hi there!',
          timestamp: new Date(),
          replyToId: null,
        },
      ];

      prismaMock.chatMessage.findMany.mockResolvedValue(mockMessages);

      const result = await listMessages('session-1');

      expect(result).toEqual(mockMessages);
      expect(prismaMock.chatMessage.findMany).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
        orderBy: { timestamp: 'asc' },
        take: 50,
        skip: 0,
      });
    });

    it('should support pagination', async () => {
      prismaMock.chatMessage.findMany.mockResolvedValue([]);

      await listMessages('session-1', { limit: 20, offset: 10 });

      expect(prismaMock.chatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 10,
        })
      );
    });
  });

  describe('countMessages', () => {
    it('should count messages in a session', async () => {
      prismaMock.chatMessage.count.mockResolvedValue(42);

      const result = await countMessages('session-1');

      expect(result).toBe(42);
      expect(prismaMock.chatMessage.count).toHaveBeenCalledWith({
        where: { sessionId: 'session-1' },
      });
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      prismaMock.chatMessage.delete.mockResolvedValue({} as ChatMessage);

      await deleteMessage('msg-1');

      expect(prismaMock.chatMessage.delete).toHaveBeenCalledWith({
        where: { id: 'msg-1' },
      });
    });
  });
});

describe('Chat Service - Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchMessages', () => {
    it('should search messages by content', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          sessionId: 'session-1',
          role: 'user',
          content: 'How do I create an agent?',
          timestamp: new Date(),
          replyToId: null,
          session: {
            agent: { name: 'PM', title: 'Project Manager' },
          },
        },
      ];

      prismaMock.chatMessage.findMany.mockResolvedValue(mockMessages as any);

      const result = await searchMessages('create agent');

      expect(result).toEqual(mockMessages);
      expect(prismaMock.chatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            content: expect.objectContaining({
              contains: 'create agent',
            }),
          }),
        })
      );
    });
  });

  describe('getSessionStats', () => {
    it('should get session statistics', async () => {
      prismaMock.chatMessage.count
        .mockResolvedValueOnce(10) // Total messages
        .mockResolvedValueOnce(5) // User messages
        .mockResolvedValueOnce(5); // Agent messages

      prismaMock.chatSession.findUnique.mockResolvedValue({
        id: 'session-1',
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
        endedAt: new Date(),
      } as any);

      const result = await getSessionStats('session-1');

      expect(result.messageCount).toBe(10);
      expect(result.userMessageCount).toBe(5);
      expect(result.agentMessageCount).toBe(5);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.isActive).toBe(false);
    });
  });

  describe('getUserChatStats', () => {
    it('should get user chat statistics', async () => {
      prismaMock.chatSession.count
        .mockResolvedValueOnce(5) // Total sessions
        .mockResolvedValueOnce(2); // Active sessions

      prismaMock.chatMessage.count.mockResolvedValue(100); // Total messages

      const result = await getUserChatStats('user-1');

      expect(result.sessionCount).toBe(5);
      expect(result.activeSessionCount).toBe(2);
      expect(result.totalMessages).toBe(100);
    });
  });
});
