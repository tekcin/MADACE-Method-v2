import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMembers() {
  const project = await prisma.project.findFirst({
    where: { name: 'Zodiac App' },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  if (!project) {
    console.log('❌ Zodiac App project not found');
    process.exit(1);
  }

  console.log(`✓ Found Zodiac App project: ${project.id}`);
  console.log(`  Current members: ${project.members.length}`);

  project.members.forEach((m) => {
    console.log(`    - ${m.user.email} (${m.role})`);
  });

  // Check if default-user exists
  const defaultUser = await prisma.user.findUnique({
    where: { id: 'default-user' },
  });

  if (!defaultUser) {
    console.log('\n⚠️  default-user not found, creating...');

    await prisma.user.create({
      data: {
        id: 'default-user',
        email: 'default-user@madace.local',
        name: 'Test User',
      },
    });

    console.log('✓ Created default-user');
  } else {
    console.log(`\n✓ default-user exists: ${defaultUser.email}`);
  }

  // Check if default-user is already a member
  const existingMember = project.members.find((m) => m.userId === 'default-user');

  if (existingMember) {
    console.log('\n✓ default-user is already a member');
  } else {
    console.log('\n🔧 Adding default-user as owner...');

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: 'default-user',
        role: 'owner',
      },
    });

    console.log('✅ Added default-user as owner');
  }

  // Verify final state
  const updatedProject = await prisma.project.findFirst({
    where: { id: project.id },
    include: {
      members: {
        include: { user: true },
      },
      _count: {
        select: {
          stories: true,
          agents: true,
          workflows: true,
        },
      },
    },
  });

  console.log('\n📊 Final state:');
  console.log(`  Project: ${updatedProject?.name}`);
  console.log(`  Members: ${updatedProject?.members.length}`);
  updatedProject?.members.forEach((m) => {
    console.log(`    - ${m.user.email} (${m.role})`);
  });
  console.log(`  Stories: ${updatedProject?._count.stories}`);
  console.log(`  Agents: ${updatedProject?._count.agents}`);
  console.log(`  Workflows: ${updatedProject?._count.workflows}`);

  await prisma.$disconnect();
}

fixMembers().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
