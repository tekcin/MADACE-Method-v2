import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDuplicate() {
  // Find the empty Zodiac App project (the newer one with 0 stories)
  const projects = await prisma.project.findMany({
    where: {
      name: 'Zodiac App',
    },
    include: {
      _count: {
        select: {
          stories: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${projects.length} "Zodiac App" project(s)\n`);

  if (projects.length <= 1) {
    console.log('✓ No duplicate projects to delete');
    await prisma.$disconnect();
    return;
  }

  // Find the empty project (should be the newer one)
  const emptyProject = projects.find((p) => p._count.stories === 0);

  if (!emptyProject) {
    console.log('✓ No empty duplicate project found');
    await prisma.$disconnect();
    return;
  }

  console.log(`⚠️  Found empty duplicate project:`);
  console.log(`   Name: ${emptyProject.name}`);
  console.log(`   ID: ${emptyProject.id}`);
  console.log(`   Created: ${emptyProject.createdAt}`);
  console.log(`   Stories: ${emptyProject._count.stories}`);

  console.log(`\n🗑️  Deleting duplicate project...`);

  await prisma.project.delete({
    where: {
      id: emptyProject.id,
    },
  });

  console.log(`✅ Successfully deleted duplicate project!`);

  // Verify only one remains
  const remaining = await prisma.project.findMany({
    where: {
      name: 'Zodiac App',
    },
    include: {
      _count: {
        select: {
          stories: true,
          agents: true,
          workflows: true,
        },
      },
    },
  });

  console.log(`\n📊 Remaining Zodiac App project:`);
  console.log(`   ID: ${remaining[0]?.id}`);
  console.log(`   Stories: ${remaining[0]?._count.stories}`);
  console.log(`   Agents: ${remaining[0]?._count.agents}`);
  console.log(`   Workflows: ${remaining[0]?._count.workflows}`);

  await prisma.$disconnect();
}

deleteDuplicate().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
