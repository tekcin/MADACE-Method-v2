#!/usr/bin/env tsx
/**
 * Seed Zodiac App Project
 *
 * Creates a complete dummy project with realistic data:
 * - Project: Zodiac App (horoscope mobile app)
 * - Users: 3 team members
 * - Stories: 12 stories across all states
 * - Workflows: Project planning workflows
 * - Chat sessions: Conversations with agents
 * - Configs: Project configuration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Seeding Zodiac App Project...\n');

  // 1. Create Project
  console.log('📁 Creating project...');
  const project = await prisma.project.create({
    data: {
      name: 'Zodiac App',
      description: 'A mobile horoscope app with daily predictions, compatibility checks, and personalized readings based on astrological signs.',
    },
  });
  console.log(`   ✅ Created project: ${project.name} (${project.id})`);

  // 2. Create Users
  console.log('\n👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@zodiacapp.com',
        name: 'Alice Johnson',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@zodiacapp.com',
        name: 'Bob Chen',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@zodiacapp.com',
        name: 'Carol Martinez',
      },
    }),
  ]);
  console.log(`   ✅ Created ${users.length} users`);
  users.forEach(u => console.log(`      • ${u.name} (${u.email})`));

  // 3. Add users to project
  console.log('\n🔗 Adding users to project...');
  await Promise.all([
    prisma.projectMember.create({
      data: {
        userId: users[0].id,
        projectId: project.id,
        role: 'owner',
      },
    }),
    prisma.projectMember.create({
      data: {
        userId: users[1].id,
        projectId: project.id,
        role: 'admin',
      },
    }),
    prisma.projectMember.create({
      data: {
        userId: users[2].id,
        projectId: project.id,
        role: 'member',
      },
    }),
  ]);
  console.log('   ✅ Added all users to project');

  // 4. Create Stories across all states
  console.log('\n📊 Creating stories...');

  const stories = [
    // DONE stories (5)
    {
      storyId: 'ZODIAC-001',
      title: '[SETUP-001] Initialize React Native project with TypeScript',
      status: 'DONE',
      points: 3,
      assignee: 'Bob Chen',
    },
    {
      storyId: 'ZODIAC-002',
      title: '[SETUP-002] Set up navigation structure (tabs + stack)',
      status: 'DONE',
      points: 5,
      assignee: 'Bob Chen',
    },
    {
      storyId: 'ZODIAC-003',
      title: '[UI-001] Design and implement home screen with zodiac wheel',
      status: 'DONE',
      points: 8,
      assignee: 'Carol Martinez',
    },
    {
      storyId: 'ZODIAC-004',
      title: '[DATA-001] Create zodiac sign data model and seed data',
      status: 'DONE',
      points: 5,
      assignee: 'Alice Johnson',
    },
    {
      storyId: 'ZODIAC-005',
      title: '[API-001] Integrate horoscope API (aztro or similar)',
      status: 'DONE',
      points: 8,
      assignee: 'Alice Johnson',
    },

    // IN_PROGRESS story (1)
    {
      storyId: 'ZODIAC-006',
      title: '[UI-002] Build daily horoscope detail screen with animations',
      status: 'IN_PROGRESS',
      points: 13,
      assignee: 'Carol Martinez',
    },

    // TODO story (1)
    {
      storyId: 'ZODIAC-007',
      title: '[FEAT-001] Implement compatibility checker feature',
      status: 'TODO',
      points: 8,
      assignee: 'Alice Johnson',
    },

    // BACKLOG stories (5)
    {
      storyId: 'ZODIAC-008',
      title: '[FEAT-002] Add personalized birth chart calculator',
      status: 'BACKLOG',
      points: 13,
      assignee: null,
    },
    {
      storyId: 'ZODIAC-009',
      title: '[FEAT-003] Implement push notifications for daily horoscopes',
      status: 'BACKLOG',
      points: 8,
      assignee: null,
    },
    {
      storyId: 'ZODIAC-010',
      title: '[UI-003] Create settings screen with theme switching',
      status: 'BACKLOG',
      points: 5,
      assignee: null,
    },
    {
      storyId: 'ZODIAC-011',
      title: '[TEST-001] Write E2E tests for core user flows',
      status: 'BACKLOG',
      points: 8,
      assignee: null,
    },
    {
      storyId: 'ZODIAC-012',
      title: '[DEPLOY-001] Set up CI/CD pipeline and app store deployment',
      status: 'BACKLOG',
      points: 13,
      assignee: null,
    },
  ];

  for (const story of stories) {
    await prisma.stateMachine.create({
      data: {
        ...story,
        projectId: project.id,
      },
    });
    console.log(`   ✅ ${story.status.padEnd(12)} ${story.storyId} - ${story.title}`);
  }

  // 5. Create Workflows
  console.log('\n🔄 Creating workflows...');
  const workflows = [
    {
      name: 'project-planning',
      description: 'Initial project planning and requirements gathering',
      steps: [
        { name: 'assess-complexity', action: 'workflow:assess-scale', agent: 'pm' },
        { name: 'create-prd', action: 'workflow:create-prd', agent: 'analyst' },
        { name: 'tech-spec', action: 'workflow:tech-spec', agent: 'architect' },
        { name: 'epic-breakdown', action: 'workflow:epic-breakdown', agent: 'pm' },
      ],
      state: {
        currentStep: 4,
        completedSteps: ['assess-complexity', 'create-prd', 'tech-spec', 'epic-breakdown'],
        status: 'completed',
      },
    },
    {
      name: 'sprint-1',
      description: 'Sprint 1: Project setup and basic UI',
      steps: [
        { name: 'sprint-planning', action: 'workflow:sprint-planning', agent: 'sm' },
        { name: 'implementation', action: 'workflow:implementation', agent: 'dev' },
        { name: 'code-review', action: 'workflow:code-review', agent: 'architect' },
        { name: 'sprint-review', action: 'workflow:sprint-review', agent: 'sm' },
      ],
      state: {
        currentStep: 4,
        completedSteps: ['sprint-planning', 'implementation', 'code-review', 'sprint-review'],
        status: 'completed',
      },
    },
    {
      name: 'sprint-2',
      description: 'Sprint 2: API integration and horoscope features',
      steps: [
        { name: 'sprint-planning', action: 'workflow:sprint-planning', agent: 'sm' },
        { name: 'implementation', action: 'workflow:implementation', agent: 'dev' },
        { name: 'code-review', action: 'workflow:code-review', agent: 'architect' },
        { name: 'sprint-review', action: 'workflow:sprint-review', agent: 'sm' },
      ],
      state: {
        currentStep: 2,
        completedSteps: ['sprint-planning', 'implementation'],
        status: 'in-progress',
      },
    },
  ];

  for (const workflow of workflows) {
    await prisma.workflow.create({
      data: {
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps,
        state: workflow.state,
        projectId: project.id,
      },
    });
    console.log(`   ✅ ${workflow.name} - ${workflow.state.status}`);
  }

  // 6. Create Project Configs
  console.log('\n⚙️  Creating project configs...');
  const configs = [
    {
      key: 'project.name',
      value: { name: 'Zodiac App' },
    },
    {
      key: 'project.type',
      value: { type: 'mobile', platform: 'react-native' },
    },
    {
      key: 'project.complexity',
      value: { level: 2, description: 'Medium complexity mobile app' },
    },
    {
      key: 'project.tech_stack',
      value: {
        frontend: 'React Native',
        language: 'TypeScript',
        state_management: 'Redux Toolkit',
        navigation: 'React Navigation',
        api: 'Axios',
      },
    },
    {
      key: 'project.team',
      value: {
        owner: 'Alice Johnson',
        team_size: 3,
        roles: ['Product Manager', 'Developer', 'Designer'],
      },
    },
  ];

  for (const config of configs) {
    await prisma.config.create({
      data: {
        ...config,
        projectId: project.id,
      },
    });
    console.log(`   ✅ ${config.key}`);
  }

  // 7. Ensure agents exist for chat sessions
  console.log('\n🤖 Checking for agents...');
  let pmAgent = await prisma.agent.findFirst({ where: { name: 'pm' } });
  let devAgent = await prisma.agent.findFirst({ where: { name: 'dev' } });
  let chatAgent = await prisma.agent.findFirst({ where: { name: 'chat-assistant' } });

  const agentCount = await prisma.agent.count();

  if (!pmAgent || !devAgent || !chatAgent || agentCount < 6) {
    console.log('   ⚠️  Missing agents detected, importing now...');
    console.log('   📥 Running: npm run import-local');

    // Import agents using Node's child_process
    const { execSync } = require('child_process');
    try {
      execSync('npm run import-local', { stdio: 'inherit' });
      console.log('   ✅ Agents imported successfully');

      // Re-fetch agents after import
      pmAgent = await prisma.agent.findFirst({ where: { name: 'pm' } });
      devAgent = await prisma.agent.findFirst({ where: { name: 'dev' } });
      chatAgent = await prisma.agent.findFirst({ where: { name: 'chat-assistant' } });
    } catch (error) {
      console.error('   ❌ Failed to import agents:', error);
      console.log('   ⚠️  Continuing without chat sessions');
    }
  } else {
    console.log(`   ✅ Found ${agentCount} agents in database`);
  }

  if (!pmAgent || !devAgent || !chatAgent) {
    console.log('   ⚠️  Some agents still not found, skipping chat sessions');
  } else {
    // 8. Create Chat Sessions with messages
    console.log('\n💬 Creating chat sessions...');

    // Session 1: Planning conversation with PM
    const session1 = await prisma.chatSession.create({
      data: {
        userId: users[0].id,
        agentId: pmAgent.id,
        projectId: project.id,
        messages: {
          create: [
            {
              role: 'user',
              content: 'I want to build a horoscope app with daily predictions and compatibility checks.',
            },
            {
              role: 'agent',
              content: 'Great idea! A horoscope app has strong user engagement potential. Let me help you plan this project. Based on your description, this sounds like a **Level 2 complexity** project (medium). Here\'s what we should focus on:\n\n**Core Features:**\n1. Daily horoscope readings for all 12 zodiac signs\n2. Compatibility checker between signs\n3. Clean, intuitive UI with zodiac visuals\n4. Push notifications for daily updates\n\n**Tech Stack Recommendation:**\n- React Native (cross-platform iOS/Android)\n- TypeScript for type safety\n- REST API integration for horoscope data\n\n**Timeline Estimate:**\n- Sprint 1 (2 weeks): Setup + Basic UI\n- Sprint 2 (2 weeks): API integration + Core features\n- Sprint 3 (2 weeks): Polish + Testing\n\nShall we proceed with creating a detailed PRD?',
            },
            {
              role: 'user',
              content: 'Yes, let\'s create the PRD and break it down into stories.',
            },
            {
              role: 'agent',
              content: 'Perfect! I\'ve created the project structure and broken it down into 12 stories:\n\n**Setup (DONE):** ✅ Project initialization, navigation\n**Sprint 1 (DONE):** ✅ Home screen, data models, API integration\n**Sprint 2 (IN PROGRESS):** 🔄 Daily horoscope detail screen\n**Sprint 3 (TODO):** 📋 Compatibility checker\n**Backlog:** Birth chart, notifications, settings, tests, deployment\n\nWe\'re currently 40% through the project with solid momentum. The team is doing great!',
            },
          ],
        },
      },
    });
    console.log(`   ✅ Created chat session with PM agent (${session1.id})`);

    // Session 2: Technical discussion with Dev
    const session2 = await prisma.chatSession.create({
      data: {
        userId: users[1].id,
        agentId: devAgent.id,
        projectId: project.id,
        messages: {
          create: [
            {
              role: 'user',
              content: 'What\'s the best way to structure the zodiac data in our app?',
            },
            {
              role: 'agent',
              content: 'Great question! For the Zodiac App, I recommend a **normalized data structure** with TypeScript interfaces:\n\n```typescript\ninterface ZodiacSign {\n  id: string;\n  name: string; // "Aries", "Taurus", etc.\n  symbol: string; // "♈", "♉", etc.\n  element: "fire" | "earth" | "air" | "water";\n  dates: { start: string; end: string };\n  traits: string[];\n  icon: string; // emoji or image URL\n}\n\ninterface DailyHoroscope {\n  signId: string;\n  date: string;\n  prediction: string;\n  luckyNumber: number;\n  luckyColor: string;\n  mood: "excellent" | "good" | "neutral" | "challenging";\n}\n```\n\n**Storage Strategy:**\n- Static sign data: Store in JSON/constants file\n- Daily horoscopes: Fetch from API + cache in AsyncStorage\n- User preferences: AsyncStorage with Redux Toolkit\n\nThis keeps it simple, performant, and type-safe!',
            },
            {
              role: 'user',
              content: 'Perfect! Should we use Redux Toolkit for state management?',
            },
            {
              role: 'agent',
              content: 'Yes, **Redux Toolkit (RTK) is ideal** for this project! Here\'s why:\n\n**Pros:**\n- Built-in async handling with createAsyncThunk\n- RTK Query for API caching (perfect for horoscope data)\n- DevTools for debugging\n- Scales well if you add more features\n\n**Structure:**\n```\nsrc/\n  store/\n    slices/\n      horoscopeSlice.ts    # Daily horoscope state\n      userSlice.ts         # User preferences, saved signs\n      compatibilitySlice.ts # Compatibility results\n    api/\n      horoscopeApi.ts      # RTK Query API\n```\n\n**Alternative:** If you want something lighter, Zustand or React Context would also work. But for a production app with API caching needs, RTK is the sweet spot.\n\nShall I draft the initial Redux setup?',
            },
          ],
        },
      },
    });
    console.log(`   ✅ Created chat session with Dev agent (${session2.id})`);

    // Session 3: General chat with assistant
    const session3 = await prisma.chatSession.create({
      data: {
        userId: users[2].id,
        agentId: chatAgent.id,
        messages: {
          create: [
            {
              role: 'user',
              content: 'How do I check the project status?',
            },
            {
              role: 'agent',
              content: 'You can check the project status in several ways:\n\n1. **Status Board**: Visit `/status` to see the Kanban board with all stories\n2. **Project Dashboard**: Visit `/` for an overview of all projects\n3. **Workflows**: Visit `/workflows` to see active workflows\n4. **CLI**: Run `npm run madace status` for terminal view\n\nFor the Zodiac App specifically, you have:\n- 5 stories DONE ✅\n- 1 story IN_PROGRESS 🔄\n- 1 story TODO 📋\n- 5 stories in BACKLOG 📦\n\nThat\'s 40% complete! Great progress!',
            },
          ],
        },
      },
    });
    console.log(`   ✅ Created chat session with Chat Assistant (${session3.id})`);
  }

  // 9. Create some agent memories for context
  if (pmAgent && chatAgent) {
    console.log('\n🧠 Creating agent memories...');

    await prisma.agentMemory.create({
      data: {
        agentId: pmAgent.id,
        userId: users[0].id,
        context: {
          project: 'Zodiac App',
          userRole: 'Product Owner',
          preferences: ['detailed planning', 'regular updates'],
        },
        type: 'long-term',
        category: 'user_preference',
        key: 'communication_style',
        value: 'prefers detailed planning and regular status updates',
        importance: 8,
        source: 'inferred_from_chat',
      },
    });

    await prisma.agentMemory.create({
      data: {
        agentId: chatAgent.id,
        userId: users[2].id,
        context: {
          project: 'Zodiac App',
          recentQuestion: 'project status',
        },
        type: 'short-term',
        category: 'conversation_summary',
        key: 'last_interaction',
        value: 'asked about project status checking methods',
        importance: 5,
        source: 'inferred_from_chat',
      },
    });

    console.log('   ✅ Created 2 agent memories');
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Zodiac App Project Created Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📊 Project Summary:');
  console.log(`   • Project: ${project.name}`);
  console.log(`   • Users: ${users.length} team members`);
  console.log(`   • Stories: ${stories.length} total`);
  console.log(`     - ✅ DONE: 5 stories (42%)`);
  console.log(`     - 🔄 IN_PROGRESS: 1 story (8%)`);
  console.log(`     - 📋 TODO: 1 story (8%)`);
  console.log(`     - 📦 BACKLOG: 5 stories (42%)`);
  console.log(`   • Workflows: 3 workflows (2 completed, 1 in-progress)`);
  console.log(`   • Configs: 5 project configurations`);
  console.log(`   • Chat Sessions: 3 sessions with conversation history`);
  console.log(`   • Agent Memories: 2 contextual memories`);

  console.log('\n🌐 View the project:');
  console.log('   • Status Board: http://localhost:3000/status');
  console.log('   • Workflows: http://localhost:3000/workflows');
  console.log('   • Chat: http://localhost:3000/chat');
  console.log('   • Home: http://localhost:3000/');

  console.log('\n🎯 Project State:');
  console.log('   • Phase: Sprint 2 (Development)');
  console.log('   • Progress: 40% complete');
  console.log('   • Current Work: Building daily horoscope detail screen');
  console.log('   • Next Up: Implement compatibility checker');
  console.log('   • Team: Alice (PM), Bob (Dev), Carol (Designer)');

  console.log('\n✅ Database seeding complete!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
