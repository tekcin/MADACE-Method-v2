#!/usr/bin/env node

/**
 * Route Verification Script
 * Verifies that there are no conflicting route parameters
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying route structure...\n');

// Check for nested MADACE directories (should not exist)
const nestedDir = path.join(process.cwd(), 'MADACE-Method-v2');
if (fs.existsSync(nestedDir)) {
  console.log('❌ Found nested MADACE-Method-v2 directory');
  console.log('   This directory contains old routes that conflict with current routes');
  console.log('   Run: rm -rf MADACE-Method-v2');
  process.exit(1);
}

// Verify app directory exists
const appDir = path.join(process.cwd(), 'app');
if (!fs.existsSync(appDir)) {
  console.log('❌ app/ directory not found');
  console.log('   Are you in the correct project directory?');
  process.exit(1);
}

// Check for [name] directories (should use [id] instead)
function findNameParams(dir, results = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item === '[name]') {
        results.push(fullPath);
      }
      // Recurse into subdirectories (but skip node_modules, .next, etc.)
      if (!item.startsWith('.') && item !== 'node_modules') {
        findNameParams(fullPath, results);
      }
    }
  }

  return results;
}

const nameParams = findNameParams(appDir);

if (nameParams.length > 0) {
  console.log('❌ Found conflicting [name] route parameters:');
  nameParams.forEach((p) => {
    console.log(`   ${p.replace(process.cwd(), '.')}`);
  });
  console.log('\n   All dynamic routes should use [id] instead of [name]');
  console.log(
    '   This will cause: "You cannot use different slug names for the same dynamic path"'
  );
  process.exit(1);
}

// Verify current route structure
const workflowsDir = path.join(appDir, 'api', 'workflows', '[id]');
const agentsApiDir = path.join(appDir, 'api', 'agents', '[id]');

console.log('✅ No nested MADACE-Method-v2 directory');
console.log('✅ No conflicting [name] parameters found');

if (fs.existsSync(workflowsDir)) {
  console.log('✅ app/api/workflows/[id]/ exists');
} else {
  console.log('⚠️  app/api/workflows/[id]/ not found');
}

if (fs.existsSync(agentsApiDir)) {
  console.log('✅ app/api/agents/[id]/ exists');
} else {
  console.log('⚠️  app/api/agents/[id]/ not found');
}

console.log('\n📋 Current route structure:');
console.log('app/api/workflows/');
console.log('├── [id]/');
console.log('│   ├── execute/route.ts');
console.log('│   ├── route.ts');
console.log('│   └── state/route.ts');
console.log('└── route.ts');
console.log('');
console.log('✨ Route verification complete!\n');
