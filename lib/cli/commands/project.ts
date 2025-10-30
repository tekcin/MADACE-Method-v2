/**
 * Project CLI Commands
 *
 * Commands for managing MADACE projects via CLI
 */

import { Command } from 'commander';
import { loadConfig, configExists } from '@/lib/config';
import { formatKeyValue, formatTable, formatJSON } from '@/lib/cli/formatters';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import * as yaml from 'js-yaml';
import inquirer from 'inquirer';

/**
 * Create project command group
 */
export function createProjectCommand(): Command {
  const project = new Command('project');
  project.description('Manage MADACE projects');

  // project init
  project
    .command('init')
    .description('Initialize new MADACE project')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Check if already initialized
        const exists = await configExists();
        if (exists) {
          console.error('Project already initialized. Use web UI or CLI to modify configuration.');
          process.exit(1);
        }

        // Interactive prompts
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'project_name',
            message: 'Project name:',
            validate: (input: string) => (input.length > 0 ? true : 'Project name is required'),
          },
          {
            type: 'input',
            name: 'output_folder',
            message: 'Output folder:',
            default: 'docs',
          },
          {
            type: 'input',
            name: 'user_name',
            message: 'Your name:',
            validate: (input: string) => (input.length > 0 ? true : 'User name is required'),
          },
          {
            type: 'input',
            name: 'communication_language',
            message: 'Communication language:',
            default: 'English',
          },
          {
            type: 'confirm',
            name: 'enable_mam',
            message: 'Enable MAM (MADACE Agile Method)?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'enable_mab',
            message: 'Enable MAB (MADACE Builder)?',
            default: false,
          },
          {
            type: 'confirm',
            name: 'enable_cis',
            message: 'Enable CIS (Creative Intelligence Suite)?',
            default: false,
          },
        ]);

        // Create config structure
        const configuration = {
          project_name: answers.project_name,
          output_folder: answers.output_folder,
          user_name: answers.user_name,
          communication_language: answers.communication_language,
          modules: {
            mam: { enabled: answers.enable_mam },
            mab: { enabled: answers.enable_mab },
            cis: { enabled: answers.enable_cis },
          },
        };

        // Create config directory
        const configDir = resolve(process.cwd(), 'madace-data/config');
        if (!existsSync(configDir)) {
          mkdirSync(configDir, { recursive: true });
        }

        // Save config.yaml
        const configPath = join(configDir, 'config.yaml');
        const yamlContent = yaml.dump(configuration);
        writeFileSync(configPath, yamlContent, 'utf-8');

        // Create output directories
        const outputDir = resolve(process.cwd(), 'madace-data', answers.output_folder);
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true });
        }

        if (options.json) {
          console.log(
            formatJSON({
              success: true,
              message: 'Project initialized successfully',
              config: configuration,
            })
          );
          return;
        }

        console.log('\n✅ Project initialized successfully!\n');
        console.log(`   Project: ${answers.project_name}`);
        console.log(`   Output folder: ${answers.output_folder}`);
        console.log(`   User: ${answers.user_name}\n`);
        console.log('Next steps:');
        console.log('   1. Configure LLM provider (if not using local)');
        console.log('   2. Run: madace project status');
        console.log('   3. Start development!\n');
      } catch (error) {
        console.error('Error initializing project:', error);
        process.exit(1);
      }
    });

  // project status
  project
    .command('status')
    .description('Show project status')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Check if project exists
        const exists = await configExists();
        if (!exists) {
          console.error('Project not initialized. Run: madace project init');
          process.exit(1);
        }

        // Load config
        const configuration = await loadConfig();

        // Check state machine status
        const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
        let workflowStatus = 'Not found';
        let totalStories = 0;
        let completedStories = 0;
        let inProgressStories = 0;
        let todoStories = 0;

        if (existsSync(statusFile)) {
          const content = readFileSync(statusFile, 'utf-8');

          // Parse workflow status
          const storyPattern = /^- [📋🔄✅] \[([A-Z]+-\d+)\]/gm;
          const stories = [...content.matchAll(storyPattern)];
          totalStories = stories.length;

          // Count by status
          completedStories = (content.match(/^- ✅/gm) || []).length;
          inProgressStories = (content.match(/^- 🔄/gm) || []).length;
          todoStories = (content.match(/^- 📋/gm) || []).length;

          workflowStatus = 'Active';
        }

        // Get enabled modules
        const modules = configuration.modules as Record<string, { enabled: boolean }>;
        const enabledModules = Object.entries(modules)
          .filter(([_, mod]) => mod.enabled)
          .map(([name]) => name.toUpperCase())
          .join(', ');

        // Check LLM config
        let llmStatus = 'Not configured';
        const config = configuration as Record<string, unknown>;
        if (config.llm) {
          const llm = config.llm as { provider?: string; model?: string };
          llmStatus = llm.provider
            ? `${llm.provider} (${llm.model || 'default'})`
            : 'Not configured';
        }

        // Build status object
        const status = {
          'Project Name': configuration.project_name,
          'Output Folder': configuration.output_folder,
          User: configuration.user_name,
          Language: configuration.communication_language,
          'Enabled Modules': enabledModules || 'None',
          'LLM Provider': llmStatus,
          'Workflow Status': workflowStatus,
          'Total Stories': totalStories,
          Completed: completedStories,
          'In Progress': inProgressStories,
          'To Do': todoStories,
          Backlog: totalStories - completedStories - inProgressStories - todoStories,
        };

        if (options.json) {
          console.log(formatJSON(status));
          return;
        }

        console.log(formatKeyValue(status, 'MADACE Project Status'));
      } catch (error) {
        console.error('Error getting project status:', error);
        process.exit(1);
      }
    });

  // project stats
  project
    .command('stats')
    .description('Show project statistics')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Check if project exists
        const exists = await configExists();
        if (!exists) {
          console.error('Project not initialized. Run: madace project init');
          process.exit(1);
        }

        // Load config
        const configuration = await loadConfig();

        // Parse workflow status file
        const statusFile = resolve(process.cwd(), 'docs/workflow-status.md');
        if (!existsSync(statusFile)) {
          console.error('Workflow status file not found');
          process.exit(1);
        }

        const content = readFileSync(statusFile, 'utf-8');

        // Extract story data
        const storyPattern = /^- ([📋🔄✅]) \[([A-Z]+-\d+)\] (.+?) \((\d+) points?\)/gm;
        const stories = [];
        let match;

        while ((match = storyPattern.exec(content)) !== null) {
          const [, emoji, id, title, points] = match;
          const status = emoji === '✅' ? 'DONE' : emoji === '🔄' ? 'IN PROGRESS' : 'BACKLOG/TODO';

          stories.push({
            id,
            title: (title || '').trim(),
            points: parseInt(points || '0', 10),
            status,
          });
        }

        // Calculate statistics
        const totalStories = stories.length;
        const completedStories = stories.filter((s) => s.status === 'DONE').length;
        const inProgressStories = stories.filter((s) => s.status === 'IN PROGRESS').length;
        const backlogStories = stories.filter((s) => s.status === 'BACKLOG/TODO').length;

        const totalPoints = stories.reduce((sum, s) => sum + s.points, 0);
        const completedPoints = stories
          .filter((s) => s.status === 'DONE')
          .reduce((sum, s) => sum + s.points, 0);

        const completionRate =
          totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(1) : '0.0';

        // Build statistics object
        const stats = {
          'Project Name': configuration.project_name,
          'Total Stories': totalStories,
          'Completed Stories': completedStories,
          'In Progress': inProgressStories,
          'Backlog/To Do': backlogStories,
          'Total Points': totalPoints,
          'Completed Points': completedPoints,
          'Remaining Points': totalPoints - completedPoints,
          'Completion Rate': `${completionRate}%`,
        };

        if (options.json) {
          console.log(
            formatJSON({
              ...stats,
              stories,
            })
          );
          return;
        }

        console.log(formatKeyValue(stats, 'MADACE Project Statistics'));

        // Show top stories by points
        if (stories.length > 0) {
          const topStories = stories
            .filter((s) => s.status !== 'DONE')
            .sort((a, b) => b.points - a.points)
            .slice(0, 5);

          if (topStories.length > 0) {
            console.log('\nTop Stories by Points:');
            console.log(
              formatTable({
                columns: [
                  { key: 'id', label: 'ID', width: 12 },
                  { key: 'title', label: 'Title', width: 40 },
                  { key: 'points', label: 'Points', width: 8, align: 'right' },
                  { key: 'status', label: 'Status', width: 15 },
                ],
                data: topStories,
              })
            );
          }
        }
      } catch (error) {
        console.error('Error getting project statistics:', error);
        process.exit(1);
      }
    });

  return project;
}
