#!/usr/bin/env tsx
/**
 * BMAD-METHOD v3-Alpha Agent Importer
 *
 * Converts BMAD v3-alpha agents (pure YAML) to MADACE format and imports them into the database.
 *
 * Usage:
 *   npm run import-bmad-v3 /path/to/BMAD-METHOD-v3
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BMADv3Agent {
  agent: {
    metadata: {
      id: string;
      name: string;
      title: string;
      icon: string;
      module?: string;
      type?: string;
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
      workflow?: string;
      exec?: string;
      description: string;
    }>;
    prompts?: Array<{
      id: string;
      content: string;
      description?: string;
    }>;
  };
}

function convertBMADv3ToMADACE(bmadAgent: BMADv3Agent, sourceFile: string) {
  const agent = bmadAgent.agent;
  const metadata = agent.metadata;
  const persona = agent.persona;

  // Build MADACE persona structure
  const madacePersona = {
    role: persona.role,
    identity: persona.identity,
    communication_style: persona.communication_style,
    principles: persona.principles,
  };

  // Build MADACE menu from v3-alpha triggers
  const menu =
    agent.menu?.map((item) => ({
      label: item.trigger
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value: item.trigger,
      description: item.description,
      workflow: item.workflow,
      exec: item.exec,
    })) || [];

  // Build MADACE prompts
  const prompts: any[] = [];

  // Add custom prompts from v3
  if (agent.prompts && agent.prompts.length > 0) {
    for (const prompt of agent.prompts) {
      prompts.push({
        name: prompt.id,
        content: prompt.content,
        description: prompt.description,
      });
    }
  }

  // Store v3-specific metadata
  prompts.push({
    name: 'bmad-v3-metadata',
    content: JSON.stringify({
      id: metadata.id,
      module: metadata.module,
      type: metadata.type,
      critical_actions: agent.critical_actions,
      source_file: sourceFile,
    }),
  });

  // Determine agent ID from metadata.id
  // Format: bmad/{module}/agents/{name}.md
  const idParts = metadata.id.split('/');
  const lastPart = idParts[idParts.length - 1];
  const agentId = lastPart ? lastPart.replace('.md', '') : 'unknown';

  return {
    name: agentId,
    title: metadata.title,
    icon: metadata.icon,
    module: `bmad-v3-${metadata.module || 'core'}`, // e.g., "bmad-v3-bmm", "bmad-v3-core"
    version: '6.0.0-alpha',
    persona: madacePersona,
    menu,
    prompts,
    createdBy: 'bmad-v3-importer',
  };
}

async function importBMADv3Agent(agentFile: string): Promise<boolean> {
  try {
    console.log(`\nProcessing: ${path.basename(agentFile)}`);

    const content = await fs.readFile(agentFile, 'utf-8');
    const bmadAgent = yaml.load(content) as BMADv3Agent;

    if (!bmadAgent.agent || !bmadAgent.agent.metadata || !bmadAgent.agent.persona) {
      console.error(`  ❌ Invalid agent structure in ${agentFile}`);
      return false;
    }

    const madaceAgent = convertBMADv3ToMADACE(bmadAgent, agentFile);

    console.log(`  📝 Converting: ${madaceAgent.name} (${madaceAgent.title})`);
    console.log(`  📦 Module: ${madaceAgent.module}`);

    // Check if agent already exists
    const existing = await prisma.agent.findUnique({
      where: { name: madaceAgent.name },
    });

    if (existing) {
      console.log(`  🔄 Updating existing agent: ${madaceAgent.name}`);
      await prisma.agent.update({
        where: { name: madaceAgent.name },
        data: madaceAgent,
      });
    } else {
      console.log(`  ✨ Creating new agent: ${madaceAgent.name}`);
      await prisma.agent.create({
        data: madaceAgent,
      });
    }

    console.log(`  ✅ Successfully imported: ${madaceAgent.name}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error importing ${agentFile}:`, error);
    return false;
  }
}

async function findProductionAgents(bmadPath: string): Promise<string[]> {
  const agentFiles: string[] = [];

  // Production agent locations in v3-alpha
  const locations = [
    'src/core/agents',
    'src/modules/bmm/agents',
    'src/modules/bmb/agents',
    'src/modules/cis/agents',
    'bmd/agents',
  ];

  for (const location of locations) {
    const dir = path.join(bmadPath, location);
    try {
      const files = await fs.readdir(dir);
      const yamlFiles = files
        .filter((f) => f.endsWith('.agent.yaml'))
        .map((f) => path.join(dir, f));
      agentFiles.push(...yamlFiles);
    } catch (error) {
      // Directory might not exist, skip
      continue;
    }
  }

  return agentFiles;
}

async function main() {
  const args = process.argv.slice(2);
  const bmadPath = args[0] || '/tmp/BMAD-METHOD-v3';

  console.log('🚀 BMAD-METHOD v3-Alpha Agent Importer');
  console.log('=====================================\n');
  console.log(`📂 BMAD Path: ${bmadPath}`);

  try {
    const agentFiles = await findProductionAgents(bmadPath);

    if (agentFiles.length === 0) {
      console.error('\n❌ No agent files found in expected locations');
      console.error('Expected locations:');
      console.error('  - src/core/agents/');
      console.error('  - src/modules/bmm/agents/');
      console.error('  - src/modules/bmb/agents/');
      console.error('  - src/modules/cis/agents/');
      console.error('  - bmd/agents/');
      process.exit(1);
    }

    console.log(`\n📋 Found ${agentFiles.length} agent files\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const file of agentFiles) {
      const success = await importBMADv3Agent(file);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log('\n=====================================');
    console.log('📊 Import Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${failureCount}`);
    console.log(`  📈 Total: ${agentFiles.length}`);

    // List all v3 agents in database grouped by module
    const allAgents = await prisma.agent.findMany({
      where: {
        module: {
          startsWith: 'bmad-v3-',
        },
      },
      select: { name: true, title: true, icon: true, module: true },
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
    });

    console.log('\n🎭 BMAD v3-Alpha Agents in Database:');

    // Group by module
    const agentsByModule = allAgents.reduce(
      (acc, agent) => {
        const module = agent.module || 'unknown';
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push(agent);
        return acc;
      },
      {} as Record<string, typeof allAgents>
    );

    for (const [module, agents] of Object.entries(agentsByModule)) {
      console.log(`\n  📦 ${module}:`);
      for (const agent of agents) {
        console.log(`    ${agent.icon} ${agent.name} - ${agent.title}`);
      }
    }

    console.log('\n✨ Import complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
