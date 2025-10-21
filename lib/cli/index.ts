import { Command } from 'commander';

const program = new Command();

program.name('madace-cli').description('CLI for MADACE-Method v2.0').version('0.0.1');

program
  .command('hello')
  .description('A simple hello command')
  .action(() => {
    // eslint-disable-next-line no-console
    console.log('Hello from MADACE CLI!');
  });

export const runCli = (args: string[]) => {
  program.parse(args);
};
