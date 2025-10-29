#!/usr/bin/env node
/**
 * MADACE CLI Entry Point
 * Provides command-line interface for MADACE Method v2.0
 */

import { Command } from 'commander';
import { createAssessScaleCommand } from '../lib/cli/commands/assess-scale';

const program = new Command();

program
  .name('madace')
  .description('MADACE - Methodology for AI-Driven Agile Collaboration Engine')
  .version('2.0.0-alpha');

// Register commands
program.addCommand(createAssessScaleCommand());

// Parse command line arguments
program.parse(process.argv);
