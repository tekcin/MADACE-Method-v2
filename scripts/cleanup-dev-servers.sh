#!/bin/bash

# Cleanup Dev Servers Script
# Kills all Next.js dev servers and clears port 3000

echo "🧹 Cleaning up development servers..."

# Find and kill processes on port 3000
PORT_3000_PIDS=$(lsof -ti:3000 2>/dev/null)

if [ -n "$PORT_3000_PIDS" ]; then
  echo "📍 Found processes on port 3000: $PORT_3000_PIDS"
  for pid in $PORT_3000_PIDS; do
    echo "   Killing process $pid..."
    kill -9 $pid 2>/dev/null || true
  done
  echo "✅ Port 3000 cleared"
else
  echo "✓ Port 3000 is already clear"
fi

# Find and kill all Next.js dev processes
NEXT_PIDS=$(pgrep -f "next dev" 2>/dev/null)

if [ -n "$NEXT_PIDS" ]; then
  echo "📍 Found Next.js dev processes: $NEXT_PIDS"
  for pid in $NEXT_PIDS; do
    echo "   Killing Next.js process $pid..."
    kill -9 $pid 2>/dev/null || true
  done
  echo "✅ Next.js dev processes cleared"
else
  echo "✓ No Next.js dev processes running"
fi

# Find and kill all npm processes related to dev server
NPM_DEV_PIDS=$(pgrep -f "npm.*run.*dev" 2>/dev/null)

if [ -n "$NPM_DEV_PIDS" ]; then
  echo "📍 Found npm dev processes: $NPM_DEV_PIDS"
  for pid in $NPM_DEV_PIDS; do
    echo "   Killing npm process $pid..."
    kill -9 $pid 2>/dev/null || true
  done
  echo "✅ npm dev processes cleared"
else
  echo "✓ No npm dev processes running"
fi

# Wait a moment for processes to fully terminate
sleep 1

# Final verification
REMAINING=$(lsof -ti:3000 2>/dev/null)
if [ -n "$REMAINING" ]; then
  echo "⚠️  Warning: Some processes still on port 3000: $REMAINING"
  echo "   Attempting force kill..."
  kill -9 $REMAINING 2>/dev/null || true
  sleep 1
fi

echo ""
echo "✨ Cleanup complete!"
echo ""
