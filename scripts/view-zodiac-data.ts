#!/usr/bin/env tsx
/**
 * View Zodiac App Project Data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌟 ZODIAC APP - DATABASE SNAPSHOT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Project
  console.log('📁 PROJECT:');
  const project = await prisma.project.findFirst({
    where: { name: 'Zodiac App' },
  });

  if (project) {
    console.log(`   ✅ ${project.name}`);
    console.log(`   📝 ${project.description}`);
    console.log(`   🆔 ${project.id}\n`);

    // 2. Team Members
    console.log('👥 TEAM MEMBERS:');
    const members = await prisma.projectMember.findMany({
      where: { projectId: project.id },
      include: { user: true },
    });
    members.forEach((m) => {
      console.log(`   • ${m.user.name} (${m.role}) - ${m.user.email}`);
    });

    // 3. Stories by Status
    console.log('\n📊 STORIES BY STATUS:');
    const stories = await prisma.stateMachine.findMany({
      where: { projectId: project.id },
      orderBy: { storyId: 'asc' },
    });

    const byStatus: Record<string, any[]> = {
      DONE: [],
      IN_PROGRESS: [],
      TODO: [],
      BACKLOG: [],
    };
    stories.forEach((s) => {
      if (byStatus[s.status]) {
        byStatus[s.status].push(s);
      }
    });

    console.log(`   ✅ DONE (${byStatus.DONE.length}):`);
    byStatus.DONE.forEach((s) => {
      console.log(`      • ${s.storyId}: ${s.title.substring(0, 60)}...`);
    });

    console.log(`   🔄 IN_PROGRESS (${byStatus.IN_PROGRESS.length}):`);
    byStatus.IN_PROGRESS.forEach((s) => {
      console.log(`      • ${s.storyId}: ${s.title.substring(0, 60)}...`);
    });

    console.log(`   📋 TODO (${byStatus.TODO.length}):`);
    byStatus.TODO.forEach((s) => {
      console.log(`      • ${s.storyId}: ${s.title.substring(0, 60)}...`);
    });

    console.log(`   📦 BACKLOG (${byStatus.BACKLOG.length}):`);
    byStatus.BACKLOG.forEach((s) => {
      console.log(`      • ${s.storyId}: ${s.title.substring(0, 60)}...`);
    });

    // 4. Workflows
    console.log('\n🔄 WORKFLOWS:');
    const workflows = await prisma.workflow.findMany({
      where: { projectId: project.id },
    });
    workflows.forEach((w) => {
      const state = w.state as any;
      console.log(`   • ${w.name}: ${state.status}`);
    });

    // 5. Chat Sessions
    console.log('\n💬 CHAT SESSIONS:');
    const sessions = await prisma.chatSession.findMany({
      where: { projectId: project.id },
      include: {
        user: true,
        agent: true,
        messages: true,
      },
    });
    sessions.forEach((s) => {
      console.log(`   • ${s.user.name} ↔ ${s.agent.title} (${s.messages.length} messages)`);
    });

    // 6. Configs
    console.log('\n⚙️  PROJECT CONFIGS:');
    const configs = await prisma.config.findMany({
      where: { projectId: project.id },
    });
    configs.forEach((c) => {
      console.log(`   • ${c.key}`);
    });
  } else {
    console.log('   ❌ Zodiac App project not found in database');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 View in Browser:');
  console.log('   • Status Board: http://localhost:3000/status');
  console.log('   • Workflows: http://localhost:3000/workflows');
  console.log('   • Chat: http://localhost:3000/chat');
  console.log('   • Prisma Studio: http://localhost:5555');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
