/**
 * Chat Threading & Export Tests
 *
 * Tests for [CHAT-002] features: threading, search, export
 */

import { prisma } from '@/lib/database/client';
import {
  getMessageThread,
  exportSessionAsMarkdown,
  searchMessages,
} from '@/lib/services/chat-service';

describe('Chat Threading', () => {
  let sessionId: string;
  let userId: string;
  let agentId: string;
  let rootMessageId: string;
  let replyMessageId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-threading@example.com',
        name: 'Test User',
      },
    });
    userId = user.id;

    // Create test agent
    const agent = await prisma.agent.create({
      data: {
        name: 'test-agent',
        title: 'Test Agent',
        icon: '🤖',
        module: 'test',
        version: '1.0.0',
        persona: { role: 'assistant' },
        menu: [],
        prompts: [],
      },
    });
    agentId = agent.id;

    // Create test session
    const session = await prisma.chatSession.create({
      data: {
        userId,
        agentId,
      },
    });
    sessionId = session.id;

    // Create root message
    const rootMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: 'Root message',
      },
    });
    rootMessageId = rootMessage.id;

    // Create reply message
    const replyMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'agent',
        content: 'Reply to root',
        replyToId: rootMessageId,
      },
    });
    replyMessageId = replyMessage.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.chatMessage.deleteMany({ where: { sessionId } });
    await prisma.chatSession.deleteMany({ where: { id: sessionId } });
    await prisma.agent.deleteMany({ where: { id: agentId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it('should get full thread for a message', async () => {
    const thread = await getMessageThread(rootMessageId);

    expect(thread.length).toBeGreaterThanOrEqual(2);
    expect(thread.some((m) => m.id === rootMessageId)).toBe(true);
    expect(thread.some((m) => m.id === replyMessageId)).toBe(true);
  });

  it('should return empty array for non-existent message', async () => {
    const thread = await getMessageThread('non-existent-id');
    expect(thread).toEqual([]);
  });
});

describe('Chat Export', () => {
  let sessionId: string;
  let userId: string;
  let agentId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-export@example.com',
        name: 'Export Tester',
      },
    });
    userId = user.id;

    // Create test agent
    const agent = await prisma.agent.create({
      data: {
        name: 'export-agent',
        title: 'Export Agent',
        icon: '📝',
        module: 'test',
        version: '1.0.0',
        persona: { role: 'assistant' },
        menu: [],
        prompts: [],
      },
    });
    agentId = agent.id;

    // Create test session
    const session = await prisma.chatSession.create({
      data: {
        userId,
        agentId,
      },
    });
    sessionId = session.id;

    // Create test messages
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId,
          role: 'user',
          content: 'Hello agent!',
        },
        {
          sessionId,
          role: 'agent',
          content: 'Hello! How can I help?',
        },
      ],
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.chatMessage.deleteMany({ where: { sessionId } });
    await prisma.chatSession.deleteMany({ where: { id: sessionId } });
    await prisma.agent.deleteMany({ where: { id: agentId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it('should export session as markdown', async () => {
    const markdown = await exportSessionAsMarkdown(sessionId);

    expect(markdown).toContain('# Chat Session');
    expect(markdown).toContain('Export Agent');
    expect(markdown).toContain('Hello agent!');
    expect(markdown).toContain('Hello! How can I help?');
    expect(markdown).toContain('MADACE v3.0');
  });

  it('should throw error for non-existent session', async () => {
    await expect(exportSessionAsMarkdown('non-existent-id')).rejects.toThrow('not found');
  });
});

describe('Chat Search', () => {
  let sessionId: string;
  let userId: string;
  let agentId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-search@example.com',
        name: 'Search Tester',
      },
    });
    userId = user.id;

    // Create test agent
    const agent = await prisma.agent.create({
      data: {
        name: 'search-agent',
        title: 'Search Agent',
        icon: '🔍',
        module: 'test',
        version: '1.0.0',
        persona: { role: 'assistant' },
        menu: [],
        prompts: [],
      },
    });
    agentId = agent.id;

    // Create test session
    const session = await prisma.chatSession.create({
      data: {
        userId,
        agentId,
      },
    });
    sessionId = session.id;

    // Create searchable messages
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId,
          role: 'user',
          content: 'Tell me about TypeScript',
        },
        {
          sessionId,
          role: 'agent',
          content: 'TypeScript is a superset of JavaScript',
        },
        {
          sessionId,
          role: 'user',
          content: 'What about Python?',
        },
      ],
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.chatMessage.deleteMany({ where: { sessionId } });
    await prisma.chatSession.deleteMany({ where: { id: sessionId } });
    await prisma.agent.deleteMany({ where: { id: agentId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it('should search messages by content', async () => {
    const results = await searchMessages('TypeScript');

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.some((m) => m.content.includes('TypeScript'))).toBe(true);
  });

  it('should return empty array for non-matching query', async () => {
    const results = await searchMessages('NonExistentTerm12345');
    expect(results).toEqual([]);
  });

  it('should filter by userId', async () => {
    const results = await searchMessages('TypeScript', { userId });

    expect(results.length).toBeGreaterThanOrEqual(1);
    results.forEach((m) => {
      expect(m.session.userId).toBe(userId);
    });
  });
});
