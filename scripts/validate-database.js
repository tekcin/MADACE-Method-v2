#!/usr/bin/env node

/**
 * Database Schema Validation Script
 *
 * Validates the database setup for MADACE-Method v3.0:
 * - Checks DATABASE_URL is set
 * - Verifies database connection
 * - Validates Prisma schema
 * - Checks migrations are up to date
 * - Verifies required tables exist
 *
 * Usage:
 *   node scripts/validate-database.js
 *   npm run db:validate
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Validation failed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Configuration
const PRISMA_SCHEMA_PATH = path.join(process.cwd(), 'prisma/schema.prisma');
const ENV_FILE_PATH = path.join(process.cwd(), '.env');
const REQUIRED_TABLES = ['Agent', 'Workflow', 'WorkflowState', 'Story', 'Epic', 'User'];

let hasErrors = false;
let hasWarnings = false;

/**
 * Print formatted header
 */
function printHeader() {
  console.log(colors.cyan);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(colors.bright + '║   MADACE-Method v3.0 - DATABASE VALIDATION                ║');
  console.log(colors.cyan + '║   Checking database setup and schema integrity            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
}

/**
 * Print section header
 */
function printSection(title) {
  console.log(colors.cyan + '\n' + title + colors.reset);
}

/**
 * Print success message
 */
function printSuccess(message) {
  console.log(colors.green + '   ✅ ' + message + colors.reset);
}

/**
 * Print error message
 */
function printError(message) {
  console.log(colors.red + '   ❌ ' + message + colors.reset);
  hasErrors = true;
}

/**
 * Print warning message
 */
function printWarning(message) {
  console.log(colors.yellow + '   ⚠️  ' + message + colors.reset);
  hasWarnings = true;
}

/**
 * Print info message
 */
function printInfo(message) {
  console.log(colors.blue + '   ' + message + colors.reset);
}

/**
 * Execute command and return output
 */
function execCommand(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
  } catch (error) {
    if (options.throwOnError !== false) {
      throw error;
    }
    return null;
  }
}

/**
 * Check if DATABASE_URL environment variable is set
 */
function checkDatabaseUrl() {
  printSection('📦 DATABASE_URL Check:');

  // Check .env file exists
  if (!fs.existsSync(ENV_FILE_PATH)) {
    printError('.env file not found');
    printInfo('   Create .env from .env.example: cp .env.example .env');
    return false;
  }

  // Read .env file
  const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
  const databaseUrlMatch = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/m);

  if (!databaseUrlMatch) {
    printError('DATABASE_URL not found in .env');
    printInfo('   Add: DATABASE_URL="postgresql://user:pass@host:5432/db"');
    return false;
  }

  const databaseUrl = databaseUrlMatch[1];

  // Check if it's a placeholder
  if (
    databaseUrl.includes('your-') ||
    databaseUrl.includes('placeholder') ||
    databaseUrl.includes('example')
  ) {
    printError('DATABASE_URL appears to be a placeholder');
    printInfo('   Set a real database connection string in .env');
    return false;
  }

  // Parse database URL
  try {
    const url = new URL(databaseUrl);
    printSuccess('DATABASE_URL is set');
    printInfo(`   Protocol: ${url.protocol.replace(':', '')}`);
    printInfo(`   Host: ${url.hostname}:${url.port || '5432'}`);
    printInfo(`   Database: ${url.pathname.slice(1).split('?')[0]}`);
    return true;
  } catch (error) {
    printError('DATABASE_URL has invalid format');
    printInfo('   Expected: postgresql://user:pass@host:5432/dbname');
    return false;
  }
}

/**
 * Check Prisma schema file exists and is valid
 */
function checkPrismaSchema() {
  printSection('\n📄 Prisma Schema Check:');

  // Check schema file exists
  if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
    printError('prisma/schema.prisma not found');
    printInfo('   Initialize Prisma: npx prisma init');
    return false;
  }

  printSuccess('Schema file exists: prisma/schema.prisma');

  // Validate schema syntax
  try {
    printInfo('   Validating schema syntax...');
    execCommand('npx prisma validate', { silent: true });
    printSuccess('Schema syntax is valid');
  } catch (error) {
    printError('Schema validation failed');
    console.log(error.stdout || error.message);
    return false;
  }

  // Check for required models
  const schemaContent = fs.readFileSync(PRISMA_SCHEMA_PATH, 'utf-8');
  const missingModels = [];

  REQUIRED_TABLES.forEach((table) => {
    const modelRegex = new RegExp(`model\\s+${table}\\s+\\{`, 'm');
    if (!modelRegex.test(schemaContent)) {
      missingModels.push(table);
    }
  });

  if (missingModels.length > 0) {
    printWarning(`Schema missing models: ${missingModels.join(', ')}`);
    printInfo('   These models are recommended for full MADACE functionality');
  } else {
    printSuccess('All required models are defined');
  }

  return true;
}

/**
 * Check database connection
 */
function checkDatabaseConnection() {
  printSection('\n🔌 Database Connection Check:');

  try {
    printInfo('   Testing connection...');
    execCommand('npx prisma db execute --stdin', {
      silent: true,
      input: 'SELECT 1;',
      throwOnError: false,
    });
    printSuccess('Database connection successful');
    return true;
  } catch (error) {
    printError('Cannot connect to database');
    printInfo('   Check that PostgreSQL is running');
    printInfo('   Verify DATABASE_URL credentials');
    printInfo('   Test connection: psql $DATABASE_URL');
    return false;
  }
}

/**
 * Check database migrations
 */
function checkMigrations() {
  printSection('\n🔄 Database Migrations Check:');

  // Check migrations directory exists
  const migrationsDir = path.join(process.cwd(), 'prisma/migrations');
  if (!fs.existsSync(migrationsDir)) {
    printWarning('No migrations found');
    printInfo('   Initialize migrations: npm run db:migrate');
    return false;
  }

  // List migrations
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((file) => !file.startsWith('.') && !file.startsWith('_'));

  if (migrations.length === 0) {
    printWarning('Migrations directory is empty');
    printInfo('   Run: npm run db:migrate');
    return false;
  }

  printSuccess(`Found ${migrations.length} migration(s)`);

  // Check migration status
  try {
    printInfo('   Checking migration status...');
    const status = execCommand('npx prisma migrate status', {
      silent: true,
      throwOnError: false,
    });

    if (status && status.includes('Database schema is up to date')) {
      printSuccess('All migrations are applied');
      return true;
    } else if (status && status.includes('pending migration')) {
      printWarning('Pending migrations detected');
      printInfo('   Run: npm run db:migrate');
      return false;
    } else {
      printWarning('Unable to determine migration status');
      return false;
    }
  } catch (error) {
    printError('Failed to check migration status');
    return false;
  }
}

/**
 * Check database tables
 */
function checkDatabaseTables() {
  printSection('\n📊 Database Tables Check:');

  try {
    printInfo('   Querying database tables...');

    // Use Prisma introspect to get database schema
    const output = execCommand('npx prisma db pull --print', {
      silent: true,
      throwOnError: false,
    });

    if (!output) {
      printWarning('Unable to introspect database');
      printInfo('   Run migrations to create tables: npm run db:migrate');
      return false;
    }

    // Count models in introspected schema
    const modelMatches = output.match(/model\s+\w+\s+\{/g);
    const tableCount = modelMatches ? modelMatches.length : 0;

    if (tableCount === 0) {
      printWarning('No tables found in database');
      printInfo('   Run: npm run db:migrate');
      return false;
    }

    printSuccess(`Found ${tableCount} table(s) in database`);

    // Check for required tables
    const missingTables = REQUIRED_TABLES.filter(
      (table) => !output.includes(`model ${table} {`) && !output.includes(`model ${table}\n{`)
    );

    if (missingTables.length > 0) {
      printWarning(`Missing tables: ${missingTables.join(', ')}`);
      printInfo('   Run: npm run db:migrate');
    } else {
      printSuccess('All required tables exist');
    }

    return missingTables.length === 0;
  } catch (error) {
    printError('Failed to check database tables');
    return false;
  }
}

/**
 * Check Prisma Client is generated
 */
function checkPrismaClient() {
  printSection('\n⚙️  Prisma Client Check:');

  const prismaClientPath = path.join(process.cwd(), 'node_modules/.prisma/client');

  if (!fs.existsSync(prismaClientPath)) {
    printWarning('Prisma Client not generated');
    printInfo('   Run: npm run db:generate');
    return false;
  }

  printSuccess('Prisma Client is generated');

  // Check if it's up to date
  try {
    printInfo('   Checking if client is up to date...');
    execCommand('npx prisma generate --dry-run', { silent: true });
    printSuccess('Prisma Client is up to date');
    return true;
  } catch (error) {
    printWarning('Prisma Client may be out of date');
    printInfo('   Regenerate: npm run db:generate');
    return false;
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log(colors.cyan);
  console.log('\n============================================================');
  console.log(colors.bright + '📊 VALIDATION SUMMARY');
  console.log(colors.cyan + '============================================================');
  console.log(colors.reset);

  if (hasErrors) {
    console.log(colors.red + '   ❌ FAILED - Critical errors found' + colors.reset);
    console.log();
    console.log('   Fix the errors above and run validation again.');
    console.log('   For help, see: MIGRATION-V2-TO-V3.md');
  } else if (hasWarnings) {
    console.log(colors.yellow + '   ⚠️  PASSED WITH WARNINGS' + colors.reset);
    console.log();
    console.log('   Database setup is functional but has warnings.');
    console.log('   Address warnings for optimal operation.');
  } else {
    console.log(colors.green + '   ✅ ALL CHECKS PASSED' + colors.reset);
    console.log();
    console.log('   Database is properly configured and ready!');
  }

  console.log(colors.cyan);
  console.log('============================================================');
  console.log(colors.reset);
}

/**
 * Main validation function
 */
async function main() {
  printHeader();

  // Run all checks
  const checks = [
    checkDatabaseUrl,
    checkPrismaSchema,
    checkDatabaseConnection,
    checkMigrations,
    checkDatabaseTables,
    checkPrismaClient,
  ];

  for (const check of checks) {
    check();
  }

  // Print summary
  printSummary();

  // Exit with appropriate code
  process.exit(hasErrors ? 1 : 0);
}

// Run validation
main().catch((error) => {
  console.error(colors.red + '\n❌ Validation failed with error:' + colors.reset);
  console.error(error);
  process.exit(1);
});
