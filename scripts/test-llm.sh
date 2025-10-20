#!/bin/bash

# MADACE_RUST_PY - Test LLM Connection Script
# This script verifies that your LLM configuration is working correctly

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

# Load .env file
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo ""
    echo "Run ./scripts/select-llm.sh first to configure your LLM."
    echo ""
    exit 1
fi

# Source the .env file
set -a
source "$ENV_FILE"
set +a

# Check configuration
if [ -z "$PLANNING_LLM" ]; then
    echo -e "${RED}❌ Error: PLANNING_LLM not set in .env${NC}"
    echo ""
    echo "Run ./scripts/select-llm.sh to configure your LLM."
    echo ""
    exit 1
fi

echo ""
echo -e "${CYAN}🧪 Testing LLM Connection${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Provider: $PLANNING_LLM"

# Test based on provider
case $PLANNING_LLM in
    gemini)
        echo "Model: ${GEMINI_MODEL:-Not set}"
        echo ""

        if [ -z "$GEMINI_API_KEY" ]; then
            echo -e "${RED}❌ Error: GEMINI_API_KEY not set${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Testing Gemini API connection...${NC}"

        # Simple test using curl
        RESPONSE=$(curl -s -X POST \
            "https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL:-gemini-2.0-flash-exp}:generateContent?key=${GEMINI_API_KEY}" \
            -H 'Content-Type: application/json' \
            -d '{
                "contents": [{
                    "parts": [{
                        "text": "Say hello in exactly 3 words."
                    }]
                }]
            }')

        # Check for errors
        if echo "$RESPONSE" | grep -q "error"; then
            echo -e "${RED}❌ API Error:${NC}"
            echo "$RESPONSE" | grep -o '"message":"[^"]*"' || echo "$RESPONSE"
            echo ""
            echo "Common issues:"
            echo "  • Invalid API key"
            echo "  • API key not enabled for Gemini API"
            echo "  • Network connectivity issues"
            echo ""
            echo "Get a new API key: https://aistudio.google.com/app/apikey"
            exit 1
        fi

        # Extract response text
        if echo "$RESPONSE" | grep -q "text"; then
            RESPONSE_TEXT=$(echo "$RESPONSE" | grep -o '"text":"[^"]*"' | head -1 | sed 's/"text":"//;s/"$//')
            echo -e "${GREEN}✅ Connected successfully!${NC}"
            echo ""
            echo "Test response: \"$RESPONSE_TEXT\""
        else
            echo -e "${RED}❌ Unexpected response format${NC}"
            echo "$RESPONSE"
            exit 1
        fi
        ;;

    claude)
        echo "Model: ${CLAUDE_MODEL:-Not set}"
        echo ""

        if [ -z "$ANTHROPIC_API_KEY" ]; then
            echo -e "${RED}❌ Error: ANTHROPIC_API_KEY not set${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Testing Claude API connection...${NC}"

        RESPONSE=$(curl -s -X POST \
            https://api.anthropic.com/v1/messages \
            -H "x-api-key: ${ANTHROPIC_API_KEY}" \
            -H "anthropic-version: 2023-06-01" \
            -H "content-type: application/json" \
            -d '{
                "model": "'"${CLAUDE_MODEL:-claude-sonnet-4.5}"'",
                "max_tokens": 20,
                "messages": [{
                    "role": "user",
                    "content": "Say hello in exactly 3 words."
                }]
            }')

        if echo "$RESPONSE" | grep -q "error"; then
            echo -e "${RED}❌ API Error:${NC}"
            echo "$RESPONSE" | grep -o '"message":"[^"]*"' || echo "$RESPONSE"
            echo ""
            echo "Common issues:"
            echo "  • Invalid API key"
            echo "  • Insufficient account credits"
            echo "  • Model not available on your tier"
            echo ""
            echo "Check account: https://console.anthropic.com/"
            exit 1
        fi

        if echo "$RESPONSE" | grep -q "text"; then
            RESPONSE_TEXT=$(echo "$RESPONSE" | grep -o '"text":"[^"]*"' | head -1 | sed 's/"text":"//;s/"$//')
            echo -e "${GREEN}✅ Connected successfully!${NC}"
            echo ""
            echo "Test response: \"$RESPONSE_TEXT\""
        else
            echo -e "${RED}❌ Unexpected response format${NC}"
            echo "$RESPONSE"
            exit 1
        fi
        ;;

    openai)
        echo "Model: ${OPENAI_MODEL:-Not set}"
        echo ""

        if [ -z "$OPENAI_API_KEY" ]; then
            echo -e "${RED}❌ Error: OPENAI_API_KEY not set${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Testing OpenAI API connection...${NC}"

        RESPONSE=$(curl -s -X POST \
            https://api.openai.com/v1/chat/completions \
            -H "Authorization: Bearer ${OPENAI_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{
                "model": "'"${OPENAI_MODEL:-gpt-4-turbo}"'",
                "messages": [{
                    "role": "user",
                    "content": "Say hello in exactly 3 words."
                }],
                "max_tokens": 20
            }')

        if echo "$RESPONSE" | grep -q "error"; then
            echo -e "${RED}❌ API Error:${NC}"
            echo "$RESPONSE" | grep -o '"message":"[^"]*"' || echo "$RESPONSE"
            echo ""
            echo "Common issues:"
            echo "  • Invalid API key"
            echo "  • Insufficient account credits"
            echo "  • Model not available"
            echo ""
            echo "Check account: https://platform.openai.com/account"
            exit 1
        fi

        if echo "$RESPONSE" | grep -q "content"; then
            RESPONSE_TEXT=$(echo "$RESPONSE" | grep -o '"content":"[^"]*"' | head -1 | sed 's/"content":"//;s/"$//')
            echo -e "${GREEN}✅ Connected successfully!${NC}"
            echo ""
            echo "Test response: \"$RESPONSE_TEXT\""
        else
            echo -e "${RED}❌ Unexpected response format${NC}"
            echo "$RESPONSE"
            exit 1
        fi
        ;;

    local)
        echo "Model: ${OLLAMA_MODEL:-Not set}"
        echo ""

        echo -e "${YELLOW}Testing Ollama connection...${NC}"

        # Check if Ollama is running
        if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo -e "${RED}❌ Error: Ollama is not running${NC}"
            echo ""
            echo "Start Ollama with: ollama serve"
            echo ""
            exit 1
        fi

        # Test generation
        RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
            -H "Content-Type: application/json" \
            -d '{
                "model": "'"${OLLAMA_MODEL:-llama3.1:8b}"'",
                "prompt": "Say hello in exactly 3 words.",
                "stream": false
            }')

        if echo "$RESPONSE" | grep -q "error"; then
            echo -e "${RED}❌ Error:${NC}"
            echo "$RESPONSE"
            echo ""
            echo "Make sure you've pulled the model:"
            echo "  ollama pull ${OLLAMA_MODEL:-llama3.1:8b}"
            exit 1
        fi

        if echo "$RESPONSE" | grep -q "response"; then
            RESPONSE_TEXT=$(echo "$RESPONSE" | grep -o '"response":"[^"]*"' | head -1 | sed 's/"response":"//;s/"$//')
            echo -e "${GREEN}✅ Connected successfully!${NC}"
            echo ""
            echo "Test response: \"$RESPONSE_TEXT\""
        else
            echo -e "${RED}❌ Unexpected response format${NC}"
            echo "$RESPONSE"
            exit 1
        fi
        ;;

    *)
        echo -e "${RED}❌ Error: Unknown provider '$PLANNING_LLM'${NC}"
        echo ""
        echo "Valid providers: gemini, claude, openai, local"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuration Valid${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Your LLM is ready for planning/architecture work!"
echo ""
echo "Next steps:"
echo "  • Start planning: npm run madace -- pm *plan-project"
echo "  • Create stories: npm run madace -- sm *create-story"
echo ""
