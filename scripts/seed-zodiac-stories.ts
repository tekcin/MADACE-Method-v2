/**
 * Seed Zodiac App Stories
 *
 * Creates dummy stories for the Zodiac App project across all kanban states
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Story {
  storyId: string;
  title: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  points: number;
  assignee?: string;
}

const zodiacStories: Story[] = [
  // ============================================================================
  // BACKLOG (Milestone 1: Core Features)
  // ============================================================================
  {
    storyId: 'ZODIAC-001',
    title: 'User Authentication - Social Login Integration',
    status: 'BACKLOG',
    points: 5,
  },
  {
    storyId: 'ZODIAC-002',
    title: 'Zodiac Sign Selection During Onboarding',
    status: 'BACKLOG',
    points: 3,
  },
  {
    storyId: 'ZODIAC-003',
    title: 'Birth Chart Calculator Integration',
    status: 'BACKLOG',
    points: 8,
  },
  {
    storyId: 'ZODIAC-004',
    title: 'Compatibility Algorithm - Sun Sign Matching',
    status: 'BACKLOG',
    points: 8,
  },
  {
    storyId: 'ZODIAC-005',
    title: 'Profile Creation with Astrological Data',
    status: 'BACKLOG',
    points: 5,
  },

  // ============================================================================
  // BACKLOG (Milestone 2: Matching & Discovery)
  // ============================================================================
  {
    storyId: 'ZODIAC-006',
    title: 'Swipe Interface for Profile Discovery',
    status: 'BACKLOG',
    points: 5,
  },
  {
    storyId: 'ZODIAC-007',
    title: 'Match Notification System',
    status: 'BACKLOG',
    points: 3,
  },
  {
    storyId: 'ZODIAC-008',
    title: 'Compatibility Score Display',
    status: 'BACKLOG',
    points: 3,
  },
  {
    storyId: 'ZODIAC-009',
    title: 'Filter Preferences - Zodiac Elements',
    status: 'BACKLOG',
    points: 3,
  },

  // ============================================================================
  // BACKLOG (Milestone 3: Communication)
  // ============================================================================
  {
    storyId: 'ZODIAC-010',
    title: 'Real-time Chat Messaging',
    status: 'BACKLOG',
    points: 8,
  },
  {
    storyId: 'ZODIAC-011',
    title: 'Astrological Ice Breakers Generator',
    status: 'BACKLOG',
    points: 3,
  },
  {
    storyId: 'ZODIAC-012',
    title: 'Daily Horoscope Feed',
    status: 'BACKLOG',
    points: 5,
  },

  // ============================================================================
  // TODO (Next Sprint)
  // ============================================================================
  {
    storyId: 'ZODIAC-013',
    title: 'Database Schema Design and Migration',
    status: 'TODO',
    points: 5,
    assignee: 'Architect',
  },

  // ============================================================================
  // IN_PROGRESS (Current Sprint)
  // ============================================================================
  {
    storyId: 'ZODIAC-014',
    title: 'Project Setup - Next.js with TypeScript',
    status: 'IN_PROGRESS',
    points: 3,
    assignee: 'DEV',
  },

  // ============================================================================
  // DONE (Completed)
  // ============================================================================
  {
    storyId: 'ZODIAC-015',
    title: 'Initial Product Requirements Document',
    status: 'DONE',
    points: 5,
    assignee: 'PM',
  },
  {
    storyId: 'ZODIAC-016',
    title: 'Market Research - Competitor Analysis',
    status: 'DONE',
    points: 3,
    assignee: 'Analyst',
  },
  {
    storyId: 'ZODIAC-017',
    title: 'Complexity Assessment',
    status: 'DONE',
    points: 2,
    assignee: 'PM',
  },
  {
    storyId: 'ZODIAC-018',
    title: 'Technical Architecture Document',
    status: 'DONE',
    points: 5,
    assignee: 'Architect',
  },
  {
    storyId: 'ZODIAC-019',
    title: 'Wireframes - Main User Flows',
    status: 'DONE',
    points: 5,
    assignee: 'UX',
  },
  {
    storyId: 'ZODIAC-020',
    title: 'Database Technology Selection',
    status: 'DONE',
    points: 2,
    assignee: 'Architect',
  },
  {
    storyId: 'ZODIAC-021',
    title: 'API Design Specification',
    status: 'DONE',
    points: 3,
    assignee: 'Architect',
  },
  {
    storyId: 'ZODIAC-022',
    title: 'Development Environment Setup',
    status: 'DONE',
    points: 2,
    assignee: 'DEV',
  },
];

async function main() {
  console.log('🌟 Seeding Zodiac App stories...\n');

  // Get the Zodiac App project
  const project = await prisma.project.findFirst({
    where: { name: 'Zodiac App' },
  });

  if (!project) {
    console.error('❌ Error: Zodiac App project not found');
    console.log('Please create the project first by calling:');
    console.log(
      'curl -X POST http://localhost:3000/api/v3/projects -H "Content-Type: application/json" -d \'{"name":"Zodiac App","description":"AI-powered zodiac compatibility dating app"}\''
    );
    process.exit(1);
  }

  console.log(`✓ Found project: ${project.name} (${project.id})\n`);

  // Create stories
  let created = 0;
  let skipped = 0;

  for (const story of zodiacStories) {
    const existing = await prisma.stateMachine.findUnique({
      where: { storyId: story.storyId },
    });

    if (existing) {
      console.log(`⊘ Skipped ${story.storyId} (already exists)`);
      skipped++;
      continue;
    }

    await prisma.stateMachine.create({
      data: {
        ...story,
        projectId: project.id,
      },
    });

    console.log(`✓ Created ${story.storyId}: ${story.title}`);
    created++;
  }

  // Summary by status
  const counts = await prisma.stateMachine.groupBy({
    by: ['status'],
    where: { projectId: project.id },
    _count: { status: true },
  });

  console.log('\n📊 Story Distribution:');
  counts.forEach((count) => {
    console.log(`   ${count.status}: ${count._count.status} stories`);
  });

  console.log(`\n✅ Done! Created ${created} stories, skipped ${skipped} existing stories.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
