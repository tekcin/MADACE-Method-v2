#!/usr/bin/env tsx
/**
 * BMAD-METHOD Agent Importer
 *
 * Converts BMAD agents (Markdown + YAML) to MADACE format and imports them into the database.
 *
 * Usage:
 *   npm run import-bmad-agents /path/to/BMAD-METHOD
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BMADAgent {
  agent: {
    name: string;
    id: string;
    title: string;
    icon: string;
    whenToUse?: string | null;
    customization?: string | null;
  };
  persona: {
    role: string;
    style: string;
    identity: string;
    focus: string;
    core_principles: string[];
  };
  commands: Array<string | Record<string, string>>;
  dependencies?: {
    checklists?: string[];
    data?: string[];
    tasks?: string[];
    templates?: string[];
    utils?: string[];
  };
  'activation-instructions'?: string[];
  'IDE-FILE-RESOLUTION'?: string[];
  'REQUEST-RESOLUTION'?: string;
  'help-display-template'?: string;
  'fuzzy-matching'?: any;
  transformation?: any;
  loading?: any;
  'kb-mode-behavior'?: any;
  'workflow-guidance'?: any;
}

function extractYAMLFromMarkdown(content: string): string | null {
  const yamlBlockMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
  if (!yamlBlockMatch || !yamlBlockMatch[1]) {
    return null;
  }
  return yamlBlockMatch[1];
}

function parseCommands(commands: any): any[] {
  const parsedCommands: any[] = [];

  // Handle object format (bmad-orchestrator style)
  if (typeof commands === 'object' && !Array.isArray(commands)) {
    for (const [name, description] of Object.entries(commands)) {
      parsedCommands.push({
        name,
        description: description as string,
      });
    }
    return parsedCommands;
  }

  // Handle array format
  if (!Array.isArray(commands)) {
    return [];
  }

  for (const cmd of commands) {
    if (typeof cmd === 'string') {
      // Format: "help: Description"
      const parts = cmd.split(':');
      if (parts.length >= 2 && parts[0]) {
        parsedCommands.push({
          name: parts[0].trim(),
          description: parts.slice(1).join(':').trim(),
        });
      }
    } else if (typeof cmd === 'object') {
      // Format: { name: description }
      for (const [name, description] of Object.entries(cmd)) {
        parsedCommands.push({
          name,
          description,
        });
      }
    }
  }

  return parsedCommands;
}

function convertBMADToMADACE(bmadAgent: BMADAgent) {
  // Convert commands format
  const commands = parseCommands(bmadAgent.commands);

  // Build MADACE persona structure
  const persona = {
    role: bmadAgent.persona.role,
    identity: bmadAgent.persona.identity,
    communication_style: bmadAgent.persona.style,
    principles: bmadAgent.persona.core_principles,
    focus: bmadAgent.persona.focus,
  };

  // Build MADACE menu (from commands)
  const menu = commands.map((cmd) => ({
    label: cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1),
    value: cmd.name,
    description: cmd.description,
  }));

  // Build MADACE prompts (from dependencies)
  const prompts: any[] = [];

  if (bmadAgent.dependencies?.tasks) {
    prompts.push({
      name: 'system',
      content: `You are ${bmadAgent.agent.name}, a ${bmadAgent.agent.title}. ${bmadAgent.agent.whenToUse || ''}`,
    });
  }

  if (bmadAgent['activation-instructions'] && Array.isArray(bmadAgent['activation-instructions'])) {
    prompts.push({
      name: 'activation',
      content: bmadAgent['activation-instructions'].join('\n'),
    });
  }

  // Store additional BMAD-specific metadata in prompts
  prompts.push({
    name: 'bmad-metadata',
    content: JSON.stringify({
      dependencies: bmadAgent.dependencies,
      whenToUse: bmadAgent.agent.whenToUse,
      customization: bmadAgent.agent.customization,
      'IDE-FILE-RESOLUTION': bmadAgent['IDE-FILE-RESOLUTION'],
      'REQUEST-RESOLUTION': bmadAgent['REQUEST-RESOLUTION'],
    }),
  });

  return {
    name: bmadAgent.agent.id,
    title: bmadAgent.agent.title,
    icon: bmadAgent.agent.icon,
    module: 'bmad', // BMAD module
    version: '1.0.0',
    persona,
    menu,
    prompts,
    createdBy: 'bmad-importer',
  };
}

async function importBMADAgent(agentFile: string): Promise<boolean> {
  try {
    console.log(`\nProcessing: ${path.basename(agentFile)}`);

    const content = await fs.readFile(agentFile, 'utf-8');
    const yamlContent = extractYAMLFromMarkdown(content);

    if (!yamlContent) {
      console.error(`  ❌ No YAML block found in ${agentFile}`);
      return false;
    }

    const bmadAgent = yaml.load(yamlContent) as BMADAgent;

    if (!bmadAgent.agent || !bmadAgent.persona) {
      console.error(`  ❌ Invalid agent structure in ${agentFile}`);
      return false;
    }

    const madaceAgent = convertBMADToMADACE(bmadAgent);

    console.log(`  📝 Converting: ${madaceAgent.name} (${madaceAgent.title})`);

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

async function main() {
  const args = process.argv.slice(2);
  const bmadPath = args[0] || '/tmp/BMAD-METHOD';

  console.log('🚀 BMAD-METHOD Agent Importer');
  console.log('============================\n');
  console.log(`📂 BMAD Path: ${bmadPath}`);

  const agentsDir = path.join(bmadPath, 'bmad-core', 'agents');

  try {
    const files = await fs.readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    console.log(`\n📋 Found ${mdFiles.length} agent files\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const file of mdFiles) {
      const filePath = path.join(agentsDir, file);
      const success = await importBMADAgent(filePath);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log('\n============================');
    console.log('📊 Import Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Failed: ${failureCount}`);
    console.log(`  📈 Total: ${mdFiles.length}`);

    // List all agents in database
    const allAgents = await prisma.agent.findMany({
      where: { module: 'bmad' },
      select: { name: true, title: true, icon: true },
    });

    console.log('\n🎭 BMAD Agents in Database:');
    for (const agent of allAgents) {
      console.log(`  ${agent.icon} ${agent.name} - ${agent.title}`);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
