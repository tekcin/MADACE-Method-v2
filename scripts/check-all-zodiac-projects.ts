import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  // Find ALL projects with "Zodiac App" in the name
  const projects = await prisma.project.findMany({
    where: {
      name: {
        contains: 'Zodiac',
      },
    },
    include: {
      _count: {
        select: {
          stories: true,
          agents: true,
          workflows: true,
          chatSessions: true,
        },
      },
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  console.log(`Found ${projects.length} project(s) with "Zodiac" in name:\n`);

  for (const project of projects) {
    console.log(`\n📁 Project: ${project.name}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   Created: ${project.createdAt}`);
    console.log(`   Stories: ${project._count.stories}`);
    console.log(`   Agents: ${project._count.agents}`);
    console.log(`   Workflows: ${project._count.workflows}`);
    console.log(`   Members: ${project.members.length}`);

    if (project._count.stories > 0) {
      const stories = await prisma.stateMachine.findMany({
        where: { projectId: project.id },
        orderBy: { storyId: 'asc' },
      });

      console.log(`\n   Story IDs:`);
      stories.forEach((s) => {
        console.log(`     - ${s.storyId}: ${s.title.substring(0, 50)}... [${s.status}]`);
      });
    }
  }

  // Count all Zodiac stories regardless of project
  const allZodiacStories = await prisma.stateMachine.findMany({
    where: {
      storyId: {
        startsWith: 'ZODIAC-',
      },
    },
    select: {
      storyId: true,
      title: true,
      projectId: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`\n\n📊 All ZODIAC-* stories (${allZodiacStories.length} total):`);
  allZodiacStories.forEach((s) => {
    console.log(`  ${s.storyId} → Project: ${s.project.name} (${s.projectId})`);
  });

  await prisma.$disconnect();
}

check().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
