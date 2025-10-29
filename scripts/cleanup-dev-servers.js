#!/usr/bin/env node

/**
 * Cleanup Dev Servers Script (Cross-platform)
 * Kills all Next.js dev servers and clears ports
 */

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const platform = os.platform();

console.log('🧹 Cleaning up development servers...\n');

function killProcessOnPort(port) {
  try {
    if (platform === 'win32') {
      // Windows
      const findCommand = `netstat -ano | findstr :${port}`;
      const result = execSync(findCommand, { encoding: 'utf8' });

      const lines = result.split('\n');
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }

      if (pids.size > 0) {
        console.log(`📍 Found processes on port ${port}: ${[...pids].join(', ')}`);
        for (const pid of pids) {
          console.log(`   Killing process ${pid}...`);
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } catch (e) {
            // Ignore errors
          }
        }
        console.log(`✅ Port ${port} cleared\n`);
      } else {
        console.log(`✓ Port ${port} is already clear\n`);
      }
    } else {
      // Unix-like (macOS, Linux)
      const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();

      if (pids) {
        console.log(`📍 Found processes on port ${port}: ${pids.replace(/\n/g, ', ')}`);
        const pidList = pids.split('\n').filter((p) => p);

        for (const pid of pidList) {
          console.log(`   Killing process ${pid}...`);
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          } catch (e) {
            // Ignore errors
          }
        }
        console.log(`✅ Port ${port} cleared\n`);
      } else {
        console.log(`✓ Port ${port} is already clear\n`);
      }
    }
  } catch (error) {
    console.log(`✓ Port ${port} is already clear\n`);
  }
}

function killProcessByName(processName) {
  try {
    if (platform === 'win32') {
      // Windows
      console.log(`📍 Searching for ${processName} processes...`);
      try {
        execSync(`taskkill /F /IM "${processName}.exe"`, { stdio: 'ignore' });
        console.log(`✅ ${processName} processes cleared\n`);
      } catch (e) {
        console.log(`✓ No ${processName} processes running\n`);
      }
    } else {
      // Unix-like
      const pids = execSync(`pgrep -f "${processName}"`, { encoding: 'utf8' }).trim();

      if (pids) {
        console.log(`📍 Found ${processName} processes: ${pids.replace(/\n/g, ', ')}`);
        const pidList = pids.split('\n').filter((p) => p);

        for (const pid of pidList) {
          console.log(`   Killing process ${pid}...`);
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          } catch (e) {
            // Ignore errors
          }
        }
        console.log(`✅ ${processName} processes cleared\n`);
      } else {
        console.log(`✓ No ${processName} processes running\n`);
      }
    }
  } catch (error) {
    console.log(`✓ No ${processName} processes running\n`);
  }
}

// Clean up port 3000
killProcessOnPort(3000);

// Clean up Next.js dev processes
killProcessByName('next dev');

// Clear Next.js build cache
const nextDir = path.join(process.cwd(), '.next');

if (fs.existsSync(nextDir)) {
  console.log('📦 Clearing Next.js build cache...');
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Build cache cleared\n');
  } catch (e) {
    console.log('⚠️  Could not clear build cache (may need manual cleanup)\n');
  }
} else {
  console.log('✓ Build cache already clear\n');
}

// Wait for processes to fully terminate
console.log('⏳ Waiting for processes to terminate...');
setTimeout(() => {
  console.log('✨ Cleanup complete!\n');
  process.exit(0);
}, 1000);
