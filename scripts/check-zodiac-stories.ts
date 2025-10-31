import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const project = await prisma.project.findFirst({
    where: { name: 'Zodiac App' },
  });

  if (!project) {
    console.log('❌ Zodiac App project not found');
    process.exit(1);
  }

  console.log('✓ Project ID:', project.id);
  console.log('✓ Project Name:', project.name);

  const stories = await prisma.stateMachine.findMany({
    where: { storyId: { startsWith: 'ZODIAC-' } },
    orderBy: { storyId: 'asc' },
  });

  console.log('\n📊 Total Zodiac Stories:', stories.length);

  if (stories.length === 0) {
    console.log('\n⚠️  No stories found! The seeding script may have failed.');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log('\nBy Status:');
  const byStatus: Record<string, number> = {};
  stories.forEach((s) => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  Object.entries(byStatus)
    .sort()
    .forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

  console.log('\n📋 Story Details:');
  stories.forEach((s) => {
    const matchesProject = s.projectId === project.id ? '✓' : '✗';
    console.log(`  ${matchesProject} ${s.storyId} - ${s.title.substring(0, 40)}... [${s.status}]`);
  });

  const wrongProject = stories.filter((s) => s.projectId !== project.id);
  if (wrongProject.length > 0) {
    console.log('\n⚠️  Stories with WRONG project ID:');
    wrongProject.forEach((s) => {
      console.log(`  ${s.storyId}: ${s.projectId} (expected: ${project.id})`);
    });
  } else {
    console.log('\n✅ All stories are correctly linked to the Zodiac App project!');
  }

  await prisma.$disconnect();
}

check().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
