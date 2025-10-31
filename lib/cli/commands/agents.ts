/* eslint-disable no-console */
/**
 * Agent Management CLI Commands
 *
 * Commands for managing agents via CLI
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';
import {
  listAgents,
  getAgentByName,
  createAgent,
  updateAgent,
  deleteAgent,
  exportAgent,
  importAgent,
  type CreateAgentInput,
  type UpdateAgentInput,
} from '@/lib/services/agent-service';
import { formatTable, formatKeyValue, formatJSON } from '@/lib/cli/formatters';
import inquirer from 'inquirer';

/**
 * Create agents command group
 */
export function createAgentsCommand(): Command {
  const agents = new Command('agents');
  agents.description('Manage agents');

  // agents list
  agents
    .command('list')
    .description('List all agents')
    .option('--module <module>', 'Filter by module (mam, mab, cis, core)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const agentsList = await listAgents({
          module: options.module,
        });

        if (options.json) {
          console.log(formatJSON(agentsList));
          return;
        }

        const tableData = agentsList.map((agent) => ({
          name: agent.name,
          title: agent.title,
          icon: agent.icon,
          module: agent.module,
          version: agent.version,
        }));

        console.log(
          formatTable({
            columns: [
              { key: 'icon', label: 'Icon', width: 6 },
              { key: 'name', label: 'Name', width: 15 },
              { key: 'title', label: 'Title', width: 30 },
              { key: 'module', label: 'Module', width: 10 },
              { key: 'version', label: 'Version', width: 10 },
            ],
            data: tableData,
            title: 'Agents',
          })
        );
      } catch (error) {
        console.error('Error listing agents:', error);
        process.exit(1);
      }
    });

  // agents show <name>
  agents
    .command('show <name>')
    .description('Show agent details')
    .option('--json', 'Output as JSON')
    .action(async (name, options) => {
      try {
        const agent = await getAgentByName(name);

        if (!agent) {
          console.error(`Agent '${name}' not found`);
          process.exit(1);
        }

        if (options.json) {
          console.log(formatJSON(agent));
          return;
        }

        const persona =
          typeof agent.persona === 'string'
            ? JSON.parse(agent.persona)
            : (agent.persona as Record<string, unknown>);

        console.log(
          formatKeyValue(
            {
              ID: agent.id,
              Name: agent.name,
              Title: agent.title,
              Icon: agent.icon,
              Module: agent.module,
              Version: agent.version,
              Role: persona.role || 'N/A',
              'Created At': agent.createdAt.toISOString(),
              'Updated At': agent.updatedAt.toISOString(),
            },
            `Agent: ${agent.name}`
          )
        );
      } catch (error) {
        console.error('Error showing agent:', error);
        process.exit(1);
      }
    });

  // agents create <file>
  agents
    .command('create <file>')
    .description('Create agent from YAML file')
    .option('--json', 'Output as JSON')
    .action(async (file, options) => {
      try {
        const filePath = resolve(process.cwd(), file);
        const fileContent = readFileSync(filePath, 'utf-8');
        const agentData = yaml.load(fileContent) as { agent: CreateAgentInput };

        if (!agentData.agent) {
          console.error('Invalid agent YAML: missing "agent" key');
          process.exit(1);
        }

        const created = await createAgent(agentData.agent);

        if (options.json) {
          console.log(formatJSON(created));
          return;
        }

        console.log(`\n✅ Agent '${created.name}' created successfully!`);
        console.log(`   ID: ${created.id}`);
        console.log(`   Title: ${created.title}\n`);
      } catch (error) {
        console.error('Error creating agent:', error);
        process.exit(1);
      }
    });

  // agents update <name> <file>
  agents
    .command('update <name> <file>')
    .description('Update agent from YAML file')
    .option('--json', 'Output as JSON')
    .action(async (name, file, options) => {
      try {
        // Get existing agent
        const existing = await getAgentByName(name);
        if (!existing) {
          console.error(`Agent '${name}' not found`);
          process.exit(1);
        }

        // Read update file
        const filePath = resolve(process.cwd(), file);
        const fileContent = readFileSync(filePath, 'utf-8');
        const agentData = yaml.load(fileContent) as { agent: UpdateAgentInput };

        if (!agentData.agent) {
          console.error('Invalid agent YAML: missing "agent" key');
          process.exit(1);
        }

        // Update agent
        const updated = await updateAgent(existing.id, agentData.agent);

        if (options.json) {
          console.log(formatJSON(updated));
          return;
        }

        console.log(`\n✅ Agent '${updated.name}' updated successfully!`);
        console.log(`   Title: ${updated.title}`);
        console.log(`   Version: ${updated.version}\n`);
      } catch (error) {
        console.error('Error updating agent:', error);
        process.exit(1);
      }
    });

  // agents delete <name>
  agents
    .command('delete <name>')
    .description('Delete agent')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Output as JSON')
    .action(async (name, options) => {
      try {
        // Get agent to confirm it exists
        const agent = await getAgentByName(name);
        if (!agent) {
          console.error(`Agent '${name}' not found`);
          process.exit(1);
        }

        // Confirm deletion unless --yes flag
        if (!options.yes) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete agent '${name}'?`,
              default: false,
            },
          ]);

          if (!answers.confirm) {
            console.log('Deletion cancelled');
            return;
          }
        }

        // Delete agent
        await deleteAgent(agent.id);

        if (options.json) {
          console.log(formatJSON({ success: true, message: `Agent '${name}' deleted` }));
          return;
        }

        console.log(`\n✅ Agent '${name}' deleted successfully!\n`);
      } catch (error) {
        console.error('Error deleting agent:', error);
        process.exit(1);
      }
    });

  // agents export <name>
  agents
    .command('export <name>')
    .description('Export agent to JSON')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .action(async (name, options) => {
      try {
        // Get agent
        const agent = await getAgentByName(name);
        if (!agent) {
          console.error(`Agent '${name}' not found`);
          process.exit(1);
        }

        // Export agent
        const exported = await exportAgent(agent.id);
        const json = formatJSON(exported);

        if (options.output) {
          const { writeFileSync } = await import('fs');
          writeFileSync(resolve(process.cwd(), options.output), json);
          console.log(`\n✅ Agent '${name}' exported to ${options.output}\n`);
        } else {
          console.log(json);
        }
      } catch (error) {
        console.error('Error exporting agent:', error);
        process.exit(1);
      }
    });

  // agents import <file>
  agents
    .command('import <file>')
    .description('Import agent from JSON file')
    .option('--json', 'Output as JSON')
    .action(async (file, options) => {
      try {
        const filePath = resolve(process.cwd(), file);
        const fileContent = readFileSync(filePath, 'utf-8');
        const agentData = JSON.parse(fileContent);

        const imported = await importAgent(agentData);

        if (options.json) {
          console.log(formatJSON(imported));
          return;
        }

        console.log(`\n✅ Agent '${imported.name}' imported successfully!`);
        console.log(`   ID: ${imported.id}`);
        console.log(`   Title: ${imported.title}\n`);
      } catch (error) {
        console.error('Error importing agent:', error);
        process.exit(1);
      }
    });

  return agents;
}
