#!/bin/bash
#
# CLI Integration Demo Script
#
# Demonstrates the real-time synchronization between Web UI and CLI tools
#

set -e

echo "=================================================="
echo "  MADACE CLI Integration Demo"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Next.js dev server is running
echo -e "${BLUE}[1/5] Checking if Next.js dev server is running...${NC}"
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Next.js dev server not running. Please start it with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Next.js dev server is running${NC}"
echo ""

# Start sync service via API
echo -e "${BLUE}[2/5] Starting WebSocket sync service...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/sync \
    -H "Content-Type: application/json" \
    -d '{"action": "start"}')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Sync service started successfully${NC}"
    echo "  WebSocket server: ws://localhost:3001"
else
    echo -e "${YELLOW}⚠️  Sync service may already be running${NC}"
fi
echo ""

# Show current status
echo -e "${BLUE}[3/5] Checking sync service status...${NC}"
STATUS=$(curl -s http://localhost:3000/api/sync)
RUNNING=$(echo "$STATUS" | grep -o '"running":[^,}]*' | cut -d':' -f2)
CLIENT_COUNT=$(echo "$STATUS" | grep -o '"clientCount":[0-9]*' | cut -d':' -f2)

if [ "$RUNNING" = "true" ]; then
    echo -e "${GREEN}✓ Sync service is running${NC}"
    echo "  Connected clients: $CLIENT_COUNT"
else
    echo -e "${YELLOW}⚠️  Sync service is not running${NC}"
fi
echo ""

# Display connection info
echo -e "${BLUE}[4/5] CLI Integration Information${NC}"
echo ""
echo "Web UI Sync Status Page:"
echo "  → http://localhost:3000/sync-status"
echo ""
echo "WebSocket Server:"
echo "  → ws://localhost:3001"
echo ""
echo "Claude CLI Configuration (.claude.json):"
echo "  {"
echo "    \"project\": \"MADACE-Method-v2.0\","
echo "    \"context\": {"
echo "      \"agents_path\": \"madace/mam/agents\","
echo "      \"workflows_path\": \"madace/mam/workflows\","
echo "      \"status_file\": \"docs/mam-workflow-status.md\""
echo "    },"
echo "    \"llm\": {"
echo "      \"provider\": \"anthropic\","
echo "      \"model\": \"claude-3-5-sonnet-20241022\","
echo "      \"apiKey\": \"\${CLAUDE_API_KEY}\""
echo "    }"
echo "  }"
echo ""
echo "Gemini CLI Configuration (.gemini.json):"
echo "  {"
echo "    \"project\": \"MADACE-Method-v2.0\","
echo "    \"context\": {"
echo "      \"agents_path\": \"madace/mam/agents\","
echo "      \"workflows_path\": \"madace/mam/workflows\","
echo "      \"status_file\": \"docs/mam-workflow-status.md\""
echo "    },"
echo "    \"llm\": {"
echo "      \"provider\": \"google\","
echo "      \"model\": \"gemini-2.0-flash-exp\","
echo "      \"apiKey\": \"\${GEMINI_API_KEY}\""
echo "    }"
echo "  }"
echo ""

# Instructions
echo -e "${BLUE}[5/5] How to Test Real-Time Sync${NC}"
echo ""
echo "1. Open Web UI in your browser:"
echo "   → http://localhost:3000/sync-status"
echo ""
echo "2. Simulate a state file change:"
echo "   echo '{\"currentStep\": 1, \"totalSteps\": 5, \"status\": \"running\"}' > madace-data/workflow-states/.test-workflow.state.json"
echo ""
echo "3. Watch the Sync Status page - you should see:"
echo "   - File watcher detecting the change"
echo "   - WebSocket broadcast to all connected clients"
echo "   - Real-time update in the UI"
echo ""
echo "4. Connect a CLI tool (if available):"
echo "   - Claude CLI: claude --config .claude.json"
echo "   - Gemini CLI: gemini --config .gemini.json"
echo ""
echo "5. Make changes from CLI and see them reflected in Web UI instantly!"
echo ""
echo -e "${GREEN}✓ Demo setup complete!${NC}"
echo ""
echo "=================================================="
