/**
 * Workflow CLI Commands
 *
 * Commands for managing workflows via CLI
 */

import { Command } from 'commander';
import { loadWorkflow, createWorkflowExecutor, WorkflowLoadError } from '@/lib/workflows';
import { formatKeyValue, formatTable, formatJSON, formatList } from '@/lib/cli/formatters';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { resolve, join, basename } from 'path';
import inquirer from 'inquirer';

/**
 * Create workflows command group
 */
export function createWorkflowsCommand(): Command {
  const workflows = new Command('workflows');
  workflows.description('Manage workflows');

  // workflows list
  workflows
    .command('list')
    .description('List all available workflows')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        // Search for workflow YAML files in madace directory
        const workflowDirs = [
          resolve(process.cwd(), 'madace/mam/workflows'),
          resolve(process.cwd(), 'madace/mab/workflows'),
          resolve(process.cwd(), 'madace/cis/workflows'),
          resolve(process.cwd(), 'madace/core/workflows'),
          resolve(process.cwd(), 'madace-data/workflows/custom'),
        ];

        const foundWorkflows: Array<{
          name: string;
          file: string;
          module: string;
          description: string;
        }> = [];

        for (const dir of workflowDirs) {
          if (!existsSync(dir)) continue;

          const files = readdirSync(dir).filter(
            (f) => f.endsWith('.workflow.yaml') || f.endsWith('.yaml')
          );

          for (const file of files) {
            const filePath = join(dir, file);
            try {
              const workflow = await loadWorkflow(filePath);
              const module = dir.includes('/mam/')
                ? 'MAM'
                : dir.includes('/mab/')
                  ? 'MAB'
                  : dir.includes('/cis/')
                    ? 'CIS'
                    : dir.includes('/core/')
                      ? 'CORE'
                      : 'Custom';

              foundWorkflows.push({
                name: workflow.name || basename(file, '.yaml'),
                file: filePath,
                module,
                description: workflow.description || 'No description',
              });
            } catch (error) {
              // Skip invalid workflow files
              console.warn(`Warning: Failed to load ${file}: ${error}`);
            }
          }
        }

        if (foundWorkflows.length === 0) {
          console.log('No workflows found');
          return;
        }

        if (options.json) {
          console.log(formatJSON(foundWorkflows));
          return;
        }

        console.log(
          formatTable({
            columns: [
              { key: 'name', label: 'Name', width: 25 },
              { key: 'module', label: 'Module', width: 10 },
              { key: 'description', label: 'Description', width: 45 },
            ],
            data: foundWorkflows,
            title: 'Available Workflows',
          })
        );
      } catch (error) {
        console.error('Error listing workflows:', error);
        process.exit(1);
      }
    });

  // workflows show <name>
  workflows
    .command('show <name>')
    .description('Show workflow details')
    .option('--json', 'Output as JSON')
    .action(async (name, options) => {
      try {
        // Find workflow file
        const workflowFile = findWorkflowFile(name);
        if (!workflowFile) {
          console.error(`Workflow '${name}' not found`);
          process.exit(1);
        }

        const workflow = await loadWorkflow(workflowFile);

        if (options.json) {
          console.log(formatJSON(workflow));
          return;
        }

        console.log(
          formatKeyValue(
            {
              Name: workflow.name,
              Description: workflow.description || 'N/A',
              'Total Steps': workflow.steps?.length || 0,
              File: workflowFile,
            },
            `Workflow: ${workflow.name}`
          )
        );

        if (workflow.steps && workflow.steps.length > 0) {
          console.log('\nSteps:');
          console.log(
            formatTable({
              columns: [
                { key: 'index', label: '#', width: 5 },
                { key: 'name', label: 'Name', width: 25 },
                { key: 'action', label: 'Action', width: 15 },
                { key: 'description', label: 'Description', width: 35 },
              ],
              data: workflow.steps.map((step, index) => ({
                index: index + 1,
                name: step.name,
                action: step.action,
                description: step.prompt || step.message || '-',
              })),
            })
          );
        }
      } catch (error) {
        if (error instanceof WorkflowLoadError) {
          console.error(`Error loading workflow: ${error.message}`);
        } else {
          console.error('Error showing workflow:', error);
        }
        process.exit(1);
      }
    });

  // workflows run <file>
  workflows
    .command('run <file>')
    .description('Run a workflow')
    .option('--json', 'Output as JSON')
    .option('--state-dir <dir>', 'State directory', 'madace-data/workflow-states')
    .action(async (file, options) => {
      try {
        const workflowFile = resolve(process.cwd(), file);
        if (!existsSync(workflowFile)) {
          console.error(`Workflow file not found: ${file}`);
          process.exit(1);
        }

        const workflow = await loadWorkflow(workflowFile);
        const stateDir = resolve(process.cwd(), options.stateDir);

        console.log(`\n🚀 Running workflow: ${workflow.name}`);
        console.log(`   State directory: ${stateDir}\n`);

        const executor = createWorkflowExecutor(workflow, stateDir);
        await executor.initialize();

        // Execute all steps
        let result = await executor.executeNextStep();
        while (!result.state?.completed && result.success) {
          result = await executor.executeNextStep();
        }

        if (options.json) {
          console.log(formatJSON(result));
          return;
        }

        if (result.success) {
          console.log('\n✅ Workflow completed successfully!\n');
        } else {
          console.log('\n❌ Workflow failed!\n');
          console.log(`   Error: ${result.message}\n`);
          process.exit(1);
        }
      } catch (error) {
        console.error('Error running workflow:', error);
        process.exit(1);
      }
    });

  // workflows status <name>
  workflows
    .command('status <name>')
    .description('Get workflow execution status')
    .option('--json', 'Output as JSON')
    .option('--state-dir <dir>', 'State directory', 'madace-data/workflow-states')
    .action(async (name, options) => {
      try {
        const stateDir = resolve(process.cwd(), options.stateDir);
        const stateFile = join(stateDir, `.${name}.state.json`);

        if (!existsSync(stateFile)) {
          console.error(`No state found for workflow '${name}'`);
          console.log(`   State file: ${stateFile}`);
          console.log('\n   Workflow has not been started yet.');
          process.exit(1);
        }

        const stateContent = readFileSync(stateFile, 'utf-8');
        const state = JSON.parse(stateContent);

        if (options.json) {
          console.log(formatJSON(state));
          return;
        }

        const status: Record<string, unknown> = {
          'Workflow Name': state.workflowName,
          'Current Step': state.currentStep + 1,
          Completed: state.completed ? 'Yes' : 'No',
          'Started At': state.startedAt,
          'Updated At': state.updatedAt,
        };

        if (state.parentWorkflow) {
          status['Parent Workflow'] = state.parentWorkflow;
        }

        console.log(formatKeyValue(status, `Workflow Status: ${name}`));

        // Show child workflows if any
        if (state.childWorkflows && state.childWorkflows.length > 0) {
          console.log('\nChild Workflows:');
          console.log(
            formatTable({
              columns: [
                { key: 'workflowPath', label: 'Workflow', width: 40 },
                { key: 'status', label: 'Status', width: 15 },
                { key: 'startedAt', label: 'Started At', width: 25 },
              ],
              data: state.childWorkflows,
            })
          );
        }

        // Show variables
        if (state.variables && Object.keys(state.variables).length > 0) {
          console.log('\nVariables:');
          const filteredVars = Object.fromEntries(
            Object.entries(state.variables).filter(([key]) => !key.startsWith('_'))
          );
          console.log(formatKeyValue(filteredVars));
        }
      } catch (error) {
        console.error('Error getting workflow status:', error);
        process.exit(1);
      }
    });

  // workflows pause <name> (placeholder - pausing not yet implemented)
  workflows
    .command('pause <name>')
    .description('Pause workflow execution (not yet implemented)')
    .option('--json', 'Output as JSON')
    .action(async (name, options) => {
      if (options.json) {
        console.log(
          formatJSON({
            success: false,
            message: 'Workflow pausing not yet implemented',
            feature: 'Coming in future release',
          })
        );
      } else {
        console.log('\n⚠️  Workflow pausing not yet implemented');
        console.log('   This feature is planned for a future release.\n');
      }
    });

  // workflows resume <name>
  workflows
    .command('resume <name>')
    .description('Resume paused workflow')
    .option('--json', 'Output as JSON')
    .option('--state-dir <dir>', 'State directory', 'madace-data/workflow-states')
    .action(async (name, options) => {
      try {
        // Find workflow file
        const workflowFile = findWorkflowFile(name);
        if (!workflowFile) {
          console.error(`Workflow '${name}' not found`);
          process.exit(1);
        }

        const stateDir = resolve(process.cwd(), options.stateDir);
        const stateFile = join(stateDir, `.${name}.state.json`);

        if (!existsSync(stateFile)) {
          console.error(`No state found for workflow '${name}'`);
          console.log('\n   Workflow has not been started yet. Use "workflows run" instead.');
          process.exit(1);
        }

        const workflow = await loadWorkflow(workflowFile);

        console.log(`\n🔄 Resuming workflow: ${workflow.name}\n`);

        const executor = createWorkflowExecutor(workflow, stateDir);
        await executor.initialize();

        // Resume execution
        let result = await executor.resume();
        while (!result.state?.completed && result.success) {
          result = await executor.resume();
        }

        if (options.json) {
          console.log(formatJSON(result));
          return;
        }

        if (result.success) {
          console.log('\n✅ Workflow resumed and completed successfully!\n');
        } else {
          console.log('\n❌ Workflow failed during resume!\n');
          console.log(`   Error: ${result.message}\n`);
          process.exit(1);
        }
      } catch (error) {
        console.error('Error resuming workflow:', error);
        process.exit(1);
      }
    });

  // workflows reset <name>
  workflows
    .command('reset <name>')
    .description('Reset workflow state')
    .option('--yes', 'Skip confirmation')
    .option('--json', 'Output as JSON')
    .option('--state-dir <dir>', 'State directory', 'madace-data/workflow-states')
    .action(async (name, options) => {
      try {
        const stateDir = resolve(process.cwd(), options.stateDir);
        const stateFile = join(stateDir, `.${name}.state.json`);

        if (!existsSync(stateFile)) {
          console.log(`\nNo state found for workflow '${name}' - nothing to reset.\n`);
          return;
        }

        // Confirm reset unless --yes flag
        if (!options.yes) {
          const answers = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to reset workflow '${name}'? This will delete all progress.`,
              default: false,
            },
          ]);

          if (!answers.confirm) {
            console.log('Reset cancelled');
            return;
          }
        }

        // Find workflow file to create executor
        const workflowFile = findWorkflowFile(name);
        if (!workflowFile) {
          console.error(`Workflow '${name}' not found`);
          process.exit(1);
        }

        const workflow = await loadWorkflow(workflowFile);
        const executor = createWorkflowExecutor(workflow, stateDir);
        await executor.initialize(); // Load state
        await executor.reset(); // Delete state

        if (options.json) {
          console.log(
            formatJSON({
              success: true,
              message: `Workflow '${name}' state reset`,
            })
          );
          return;
        }

        console.log(`\n✅ Workflow '${name}' state reset successfully!\n`);
      } catch (error) {
        console.error('Error resetting workflow:', error);
        process.exit(1);
      }
    });

  return workflows;
}

/**
 * Find workflow file by name in standard directories
 */
function findWorkflowFile(name: string): string | null {
  const searchDirs = [
    resolve(process.cwd(), 'madace/mam/workflows'),
    resolve(process.cwd(), 'madace/mab/workflows'),
    resolve(process.cwd(), 'madace/cis/workflows'),
    resolve(process.cwd(), 'madace/core/workflows'),
    resolve(process.cwd(), 'madace-data/workflows/custom'),
  ];

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;

    // Try exact match
    const exactFile = join(dir, `${name}.workflow.yaml`);
    if (existsSync(exactFile) && statSync(exactFile).isFile()) {
      return exactFile;
    }

    // Try without .workflow suffix
    const simpleFile = join(dir, `${name}.yaml`);
    if (existsSync(simpleFile) && statSync(simpleFile).isFile()) {
      return simpleFile;
    }

    // Try case-insensitive search
    const files = readdirSync(dir);
    const match = files.find(
      (f) =>
        (f.toLowerCase() === `${name.toLowerCase()}.workflow.yaml` ||
          f.toLowerCase() === `${name.toLowerCase()}.yaml`) &&
        statSync(join(dir, f)).isFile()
    );

    if (match) {
      return join(dir, match);
    }
  }

  return null;
}
