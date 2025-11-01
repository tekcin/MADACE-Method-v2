#!/usr/bin/env tsx
/**
 * Import local MADACE agents from madace/mam/agents/
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MADACEAgent {
  agent: {
    metadata: {
      id: string;
      name: string;
      title: string;
      icon: string;
      module: string;
      version: string;
    };
    persona: {
      role: string;
      identity: string;
      communication_style: string;
      principles: string[];
    };
    critical_actions?: string[];
    menu?: Array<{
      trigger: string;
      action: string;
      description: string;
    }>;
    load_always?: string[];
    prompts?: any[];
  };
}

async function importAgent(filePath: string) {
  console.log(`\n📄 Importing: ${path.basename(filePath)}`);

  const content = await fs.readFile(filePath, 'utf-8');
  const data = yaml.load(content) as MADACEAgent;

  if (!data.agent || !data.agent.metadata) {
    throw new Error('Invalid agent structure');
  }

  const { metadata, persona, menu, critical_actions, load_always, prompts } = data.agent;

  // Create database record
  const agentData = {
    name: metadata.name.toLowerCase(),
    title: metadata.title,
    icon: metadata.icon,
    module: metadata.module,
    version: metadata.version,
    persona: {
      role: persona.role,
      identity: persona.identity,
      communication_style: persona.communication_style,
      principles: persona.principles,
    },
    menu: menu || [],
    prompts: {
      ...(prompts || {}),
      load_always: load_always || [],
      critical_actions: critical_actions || [],
    },
  };

  // Check if agent exists
  const existing = await prisma.agent.findUnique({
    where: { name: agentData.name },
  });

  if (existing) {
    console.log(`  🔄 Updating: ${agentData.name}`);
    await prisma.agent.update({
      where: { name: agentData.name },
      data: agentData as any,
    });
  } else {
    console.log(`  ✨ Creating: ${agentData.name}`);
    await prisma.agent.create({
      data: agentData as any,
    });
  }

  console.log(`  ✅ ${metadata.icon} ${metadata.title}`);
}

async function main() {
  console.log('🚀 MADACE Local Agent Importer');
  console.log('================================\n');

  const agentsDir = path.join(process.cwd(), 'madace/mam/agents');

  try {
    const files = await fs.readdir(agentsDir);
    const agentFiles = files
      .filter((f) => f.endsWith('.agent.yaml'))
      .map((f) => path.join(agentsDir, f));

    console.log(`📂 Found ${agentFiles.length} agents in ${agentsDir}`);

    for (const file of agentFiles) {
      await importAgent(file);
    }

    // Also create AI Chat Assistant for the chat UI
    console.log('\n📄 Creating AI Chat Assistant...');
    const chatAssistant = {
      name: 'chat-assistant',
      title: 'AI Chat Assistant',
      icon: '🤖',
      module: 'core',
      version: '1.0.0',
      persona: {
        role: 'AI Chat Assistant',
        identity: 'A helpful AI assistant for general conversations and questions',
        communication_style: 'professional yet approachable',
        principles: ['helpful', 'friendly', 'knowledgeable', 'patient'],
      },
      menu: [
        { label: 'Help', value: 'help', description: 'Show available commands' },
        { label: 'About', value: 'about', description: 'Learn about this assistant' },
      ],
      prompts: {
        system: 'You are a helpful AI assistant. Be friendly, concise, and accurate.',
        greeting: 'Hello! I am your AI Chat Assistant. How can I help you today?',
      },
    };

    const existingChat = await prisma.agent.findUnique({
      where: { name: 'chat-assistant' },
    });

    if (existingChat) {
      await prisma.agent.update({
        where: { name: 'chat-assistant' },
        data: chatAssistant,
      });
    } else {
      await prisma.agent.create({
        data: chatAssistant,
      });
    }

    console.log('  ✅ 🤖 AI Chat Assistant');

    // Also create module agents to ensure all modules are represented
    console.log('\n📄 Creating module agents for all 5 modules...');
    const { execSync } = require('child_process');
    try {
      execSync('npx tsx scripts/create-module-agents.ts', { stdio: 'pipe' });
      console.log('  ✅ Module agents created');
    } catch (error) {
      console.log('  ⚠️  Module agents script not found or failed');
    }

    // Show summary
    const allAgents = await prisma.agent.findMany({
      orderBy: { name: 'asc' },
    });

    console.log('\n================================');
    console.log('📊 Import Complete!');
    console.log(`✅ Total agents in database: ${allAgents.length}`);
    console.log('\n🎭 Available Agents:');

    for (const agent of allAgents) {
      console.log(`  ${agent.icon} ${agent.name} - ${agent.title}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
