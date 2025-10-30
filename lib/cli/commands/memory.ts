/**
 * Memory CLI Commands
 *
 * Manage agent memories from command line
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import { prisma } from '@/lib/database/client';
import { formatJSON } from '@/lib/cli/formatters/json';
import { formatTable } from '@/lib/cli/formatters/table';

const DEFAULT_USER_ID = 'default-user'; // TODO: Get from auth/session

/**
 * Register memory commands
 */
export function registerMemoryCommands(program: Command): void {
  const memory = program.command('memory').description('Manage agent memories');

  // List memories
  memory
    .command('list')
    .description('List memories for an agent')
    .option('--agent <name>', 'Agent name or ID')
    .option('--type <type>', 'Filter by type (short-term, long-term)')
    .option('--category <category>', 'Filter by category')
    .option('--limit <number>', 'Limit number of results', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Get agent
        let agentId: string;
        if (options.agent) {
          const agent = await prisma.agent.findFirst({
            where: {
              OR: [{ id: options.agent }, { name: options.agent }],
            },
          });

          if (!agent) {
            console.error(`Error: Agent '${options.agent}' not found`);
            process.exit(1);
          }

          agentId = agent.id;
        } else {
          // Interactive agent selection
          const agents = await prisma.agent.findMany({
            select: { id: true, name: true, title: true },
          });

          if (agents.length === 0) {
            console.error('Error: No agents found');
            process.exit(1);
          }

          const { selectedAgent } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedAgent',
              message: 'Select an agent:',
              choices: agents.map((a) => ({
                name: `${a.title} (${a.name})`,
                value: a.id,
              })),
            },
          ]);

          agentId = selectedAgent;
        }

        // Build query
        const where: any = {
          agentId,
          userId: DEFAULT_USER_ID,
        };

        if (options.type) {
          where.type = options.type;
        }

        if (options.category) {
          where.category = options.category;
        }

        // Fetch memories
        const memories = await prisma.agentMemory.findMany({
          where,
          orderBy: { lastAccessedAt: 'desc' },
          take: parseInt(options.limit),
        });

        if (memories.length === 0) {
          console.log('No memories found');
          return;
        }

        // Output
        if (options.json) {
          console.log(formatJSON(memories));
        } else {
          const tableData = memories.map((m) => ({
            key: m.key,
            value: m.value.length > 37 ? m.value.substring(0, 37) + '...' : m.value,
            type: m.type,
            category: m.category,
            importance: m.importance.toString(),
            accessCount: m.accessCount.toString(),
          }));

          console.log(
            formatTable({
              columns: [
                { key: 'key', label: 'Key', width: 20 },
                { key: 'value', label: 'Value', width: 40 },
                { key: 'type', label: 'Type', width: 12 },
                { key: 'category', label: 'Category', width: 20 },
                { key: 'importance', label: 'Importance', width: 12 },
                { key: 'accessCount', label: 'Access Count', width: 14 },
              ],
              data: tableData,
            })
          );
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Show memory details
  memory
    .command('show <memory-id>')
    .description('Show detailed information about a memory')
    .option('--json', 'Output as JSON')
    .action(async (memoryId, options) => {
      try {
        const memory = await prisma.agentMemory.findUnique({
          where: { id: memoryId },
        });

        if (!memory) {
          console.error(`Error: Memory '${memoryId}' not found`);
          process.exit(1);
        }

        if (options.json) {
          console.log(formatJSON(memory));
        } else {
          console.log('\n=== Memory Details ===\n');
          console.log(`ID: ${memory.id}`);
          console.log(`Key: ${memory.key}`);
          console.log(`Value: ${memory.value}`);
          console.log(`Type: ${memory.type}`);
          console.log(`Category: ${memory.category}`);
          console.log(`Importance: ${memory.importance}/10`);
          console.log(`Source: ${memory.source}`);
          console.log(`Access Count: ${memory.accessCount}`);
          console.log(`Created: ${memory.createdAt.toLocaleString()}`);
          console.log(`Last Accessed: ${memory.lastAccessedAt.toLocaleString()}`);
          if (memory.expiresAt) {
            console.log(`Expires: ${memory.expiresAt.toLocaleString()}`);
          }
          console.log('');
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Delete memory
  memory
    .command('delete <memory-id>')
    .description('Delete a memory')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (memoryId, options) => {
      try {
        const memory = await prisma.agentMemory.findUnique({
          where: { id: memoryId },
          select: { key: true, value: true },
        });

        if (!memory) {
          console.error(`Error: Memory '${memoryId}' not found`);
          process.exit(1);
        }

        // Confirmation
        if (!options.yes) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Delete memory "${memory.key}: ${memory.value}"?`,
              default: false,
            },
          ]);

          if (!confirm) {
            console.log('Cancelled');
            return;
          }
        }

        await prisma.agentMemory.delete({
          where: { id: memoryId },
        });

        console.log(`Memory deleted: ${memory.key}`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Clear all memories
  memory
    .command('clear')
    .description('Clear all memories for an agent')
    .option('--agent <name>', 'Agent name or ID (required)')
    .option('--type <type>', 'Only clear specific type (short-term, long-term)')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (options) => {
      try {
        if (!options.agent) {
          console.error('Error: --agent is required');
          process.exit(1);
        }

        // Get agent
        const agent = await prisma.agent.findFirst({
          where: {
            OR: [{ id: options.agent }, { name: options.agent }],
          },
        });

        if (!agent) {
          console.error(`Error: Agent '${options.agent}' not found`);
          process.exit(1);
        }

        // Count memories to delete
        const where: any = {
          agentId: agent.id,
          userId: DEFAULT_USER_ID,
        };

        if (options.type) {
          where.type = options.type;
        }

        const count = await prisma.agentMemory.count({ where });

        if (count === 0) {
          console.log('No memories to delete');
          return;
        }

        // Confirmation
        if (!options.yes) {
          const typeStr = options.type ? ` (${options.type})` : '';
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Delete ${count} memory(ies)${typeStr} for ${agent.title}?`,
              default: false,
            },
          ]);

          if (!confirm) {
            console.log('Cancelled');
            return;
          }
        }

        // Delete
        const result = await prisma.agentMemory.deleteMany({ where });

        console.log(`Deleted ${result.count} memory(ies)`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // Stats
  memory
    .command('stats')
    .description('Show memory statistics for an agent')
    .option('--agent <name>', 'Agent name or ID')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Get agent
        let agentId: string;
        if (options.agent) {
          const agent = await prisma.agent.findFirst({
            where: {
              OR: [{ id: options.agent }, { name: options.agent }],
            },
          });

          if (!agent) {
            console.error(`Error: Agent '${options.agent}' not found`);
            process.exit(1);
          }

          agentId = agent.id;
        } else {
          // Interactive agent selection
          const agents = await prisma.agent.findMany({
            select: { id: true, name: true, title: true },
          });

          if (agents.length === 0) {
            console.error('Error: No agents found');
            process.exit(1);
          }

          const { selectedAgent } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedAgent',
              message: 'Select an agent:',
              choices: agents.map((a) => ({
                name: `${a.title} (${a.name})`,
                value: a.id,
              })),
            },
          ]);

          agentId = selectedAgent;
        }

        // Fetch stats
        const memories = await prisma.agentMemory.findMany({
          where: {
            agentId,
            userId: DEFAULT_USER_ID,
          },
          select: {
            type: true,
            category: true,
            importance: true,
          },
        });

        if (memories.length === 0) {
          console.log('No memories found');
          return;
        }

        const stats = {
          total: memories.length,
          shortTerm: memories.filter((m) => m.type === 'short-term').length,
          longTerm: memories.filter((m) => m.type === 'long-term').length,
          avgImportance: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length,
          byCategory: {} as Record<string, number>,
        };

        // Count by category
        for (const memory of memories) {
          stats.byCategory[memory.category] = (stats.byCategory[memory.category] || 0) + 1;
        }

        if (options.json) {
          console.log(formatJSON(stats));
        } else {
          console.log('\n=== Memory Statistics ===\n');
          console.log(`Total Memories: ${stats.total}`);
          console.log(`Short-term: ${stats.shortTerm}`);
          console.log(`Long-term: ${stats.longTerm}`);
          console.log(`Average Importance: ${stats.avgImportance.toFixed(1)}/10`);
          console.log('\nBy Category:');
          for (const [category, count] of Object.entries(stats.byCategory)) {
            console.log(`  ${category}: ${count}`);
          }
          console.log('');
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}
