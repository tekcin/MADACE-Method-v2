#!/usr/bin/env node

/**
 * Version Validation Script
 *
 * MADACE-Method v2.0 - STRICT VERSION ENFORCEMENT
 *
 * This script enforces EXACT versions for the core tech stack:
 * - Next.js: 15.5.6 (LOCKED)
 * - React: 19.2.0 (LOCKED)
 * - React DOM: 19.2.0 (LOCKED)
 * - TypeScript: 5.9.3 (LOCKED)
 * - Node.js: 24.10.0 (RECOMMENDED)
 *
 * Usage:
 *   node scripts/validate-versions.js
 *   npm run validate-versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// HARDCODED VERSION REQUIREMENTS - DO NOT CHANGE WITHOUT TEAM APPROVAL
const REQUIRED_VERSIONS = {
  next: '15.5.6',
  react: '19.2.0',
  'react-dom': '19.2.0',
  typescript: '5.9.3',
};

// Node.js version (recommended, not enforced)
const RECOMMENDED_NODE_VERSION = '24.10.0';
const MINIMUM_NODE_VERSION = '20.0.0';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  try {
    const content = fs.readFileSync(packagePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    log('❌ ERROR: Could not read package.json', 'red');
    process.exit(1);
  }
}

function checkNodeVersion() {
  const currentVersion = process.version.replace('v', '');
  const [major] = currentVersion.split('.').map(Number);
  const [minMajor] = MINIMUM_NODE_VERSION.split('.').map(Number);

  log('\n📦 Node.js Version Check:', 'cyan');
  log(`   Current: ${currentVersion}`, 'blue');
  log(`   Minimum: ${MINIMUM_NODE_VERSION}`, 'blue');
  log(`   Recommended: ${RECOMMENDED_NODE_VERSION}`, 'blue');

  if (major < minMajor) {
    log(`   ❌ FAIL: Node.js version too old (${currentVersion})`, 'red');
    log(`   Please upgrade to Node.js ${MINIMUM_NODE_VERSION} or higher`, 'yellow');
    return false;
  }

  if (currentVersion !== RECOMMENDED_NODE_VERSION) {
    log(`   ⚠️  WARNING: Not using recommended version (${RECOMMENDED_NODE_VERSION})`, 'yellow');
    log(`   Current version (${currentVersion}) should work, but may have differences`, 'yellow');
    return true;
  }

  log(`   ✅ PASS: Using recommended Node.js version`, 'green');
  return true;
}

function checkPackageVersions(pkg) {
  log('\n🔒 Core Package Version Check:', 'cyan');
  log('   Checking LOCKED versions (NO changes allowed):', 'bold');

  let hasErrors = false;
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const [packageName, requiredVersion] of Object.entries(REQUIRED_VERSIONS)) {
    const installedVersion = allDeps[packageName];

    log(`\n   📌 ${packageName}:`, 'blue');
    log(`      Required: ${requiredVersion} (LOCKED)`, 'blue');
    log(`      package.json: ${installedVersion || 'NOT FOUND'}`, 'blue');

    // Check if package is defined
    if (!installedVersion) {
      log(`      ❌ FAIL: Package not found in package.json`, 'red');
      hasErrors = true;
      continue;
    }

    // Check for version range operators (^, ~, >, <, etc.)
    if (/[\^~><]/.test(installedVersion)) {
      log(`      ❌ FAIL: Version range detected: "${installedVersion}"`, 'red');
      log(`      Must use EXACT version: "${requiredVersion}"`, 'red');
      hasErrors = true;
      continue;
    }

    // Check exact version match
    if (installedVersion !== requiredVersion) {
      log(`      ❌ FAIL: Version mismatch!`, 'red');
      log(`      Expected: ${requiredVersion}`, 'red');
      log(`      Found: ${installedVersion}`, 'red');
      hasErrors = true;
      continue;
    }

    log(`      ✅ PASS: Exact version match`, 'green');
  }

  return !hasErrors;
}

function checkInstalledVersions() {
  log('\n📂 Installed Package Check (node_modules):', 'cyan');
  log('   Verifying actual installed versions...', 'blue');

  let hasErrors = false;

  for (const [packageName, requiredVersion] of Object.entries(REQUIRED_VERSIONS)) {
    try {
      const packageJsonPath = path.join(process.cwd(), 'node_modules', packageName, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        log(`\n   ⚠️  ${packageName}: Not installed in node_modules`, 'yellow');
        log(`      Run: npm install`, 'yellow');
        continue;
      }

      const installedPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const installedVersion = installedPkg.version;

      log(`\n   📦 ${packageName}:`, 'blue');
      log(`      Required: ${requiredVersion}`, 'blue');
      log(`      Installed: ${installedVersion}`, 'blue');

      if (installedVersion !== requiredVersion) {
        log(`      ❌ FAIL: Installed version does not match!`, 'red');
        log(`      Action: Run "npm ci" to install exact versions`, 'yellow');
        hasErrors = true;
      } else {
        log(`      ✅ PASS: Correct version installed`, 'green');
      }
    } catch (error) {
      log(`\n   ⚠️  ${packageName}: Could not verify installed version`, 'yellow');
    }
  }

  return !hasErrors;
}

function checkForVersionRanges(pkg) {
  log('\n🔍 Checking for version ranges in package.json:', 'cyan');
  log('   All dependencies should use EXACT versions (no ^, ~, >, <)', 'blue');

  const allDeps = {
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {},
  };

  let foundRanges = false;

  for (const [depType, deps] of Object.entries(allDeps)) {
    for (const [name, version] of Object.entries(deps)) {
      if (/[\^~><]/.test(version)) {
        if (!foundRanges) {
          log('\n   ⚠️  Found version ranges:', 'yellow');
          foundRanges = true;
        }
        log(`      ${depType}: ${name} = "${version}"`, 'yellow');
      }
    }
  }

  if (foundRanges) {
    log('\n   ⚠️  WARNING: Version ranges found', 'yellow');
    log('   Recommendation: Lock all versions to exact versions', 'yellow');
    log('   This ensures consistent builds across all environments', 'yellow');
    return false;
  }

  log('   ✅ PASS: All versions are exact (no ranges)', 'green');
  return true;
}

function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 VALIDATION SUMMARY', 'bold');
  log('='.repeat(60), 'cyan');

  const allPassed = Object.values(results).every((r) => r);

  for (const [check, passed] of Object.entries(results)) {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`   ${icon} ${check}: ${passed ? 'PASSED' : 'FAILED'}`, color);
  }

  log('\n' + '='.repeat(60), 'cyan');

  if (allPassed) {
    log('✅ ALL CHECKS PASSED - Tech stack is locked and consistent!', 'green');
    log('', 'reset');
    return true;
  } else {
    log('❌ VALIDATION FAILED - Please fix the issues above', 'red');
    log('\nQuick fixes:', 'yellow');
    log('  1. Run: npm ci              (Install exact versions)', 'yellow');
    log('  2. Remove node_modules/     (Clean install)', 'yellow');
    log('  3. Check package.json       (Fix version mismatches)', 'yellow');
    log('', 'reset');
    return false;
  }
}

function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   MADACE-Method v2.0 - VERSION VALIDATION                 ║', 'bold');
  log('║   Enforcing EXACT versions for core tech stack            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  const pkg = readPackageJson();

  const results = {
    'Node.js Version': checkNodeVersion(),
    'package.json Versions': checkPackageVersions(pkg),
    'Installed Versions': checkInstalledVersions(),
    'No Version Ranges': checkForVersionRanges(pkg),
  };

  const success = printSummary(results);

  if (!success) {
    process.exit(1);
  }

  process.exit(0);
}

// Run validation
main();
