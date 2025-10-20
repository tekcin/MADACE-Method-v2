#!/bin/bash

# MADACE_RUST_PY - Interactive LLM Selection Script
# This script helps you choose and configure the LLM for planning/architecture work

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE="$PROJECT_ROOT/.env.example"

echo ""
echo -e "${CYAN}🤖 MADACE_RUST_PY - LLM Selection for Planning & Architecture${NC}"
echo "================================================================"
echo ""
echo "This LLM will be used for:"
echo "  • PRD creation and updates"
echo "  • Architecture design and ADRs"
echo "  • Epic breakdown and story creation"
echo "  • Technical specifications"
echo ""
echo -e "${YELLOW}Implementation (coding) will use a local Docker agent automatically.${NC}"
echo ""

# Function to display detailed option
show_option_details() {
    local option=$1
    case $option in
        1)
            echo ""
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}Option 1: Google Gemini${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "${CYAN}Models Available:${NC}"
            echo "  • gemini-2.0-flash-exp (Latest experimental - recommended)"
            echo "  • gemini-1.5-pro (Production-ready, excellent reasoning)"
            echo "  • gemini-1.5-flash (Faster, good for iteration)"
            echo ""
            echo -e "${CYAN}Strengths:${NC}"
            echo "  ✅ Free tier: 60 requests/minute"
            echo "  ✅ Large context: 1M+ tokens (entire codebase)"
            echo "  ✅ Multimodal: Can analyze images/diagrams"
            echo "  ✅ Fast response times"
            echo "  ✅ Excellent at TypeScript, Rust, Python"
            echo "  ✅ Great for comprehensive planning documents"
            echo ""
            echo -e "${CYAN}Limitations:${NC}"
            echo "  ❌ Rate limits on free tier"
            echo "  ❌ Requires Google Cloud account"
            echo ""
            echo -e "${CYAN}Cost (if you exceed free tier):${NC}"
            echo "  • Input: \$0.075 per 1M tokens"
            echo "  • Output: \$0.30 per 1M tokens"
            echo "  • Typical PRD: ~\$0.05-0.20"
            echo ""
            echo -e "${CYAN}Setup Requirements:${NC}"
            echo "  1. Visit https://aistudio.google.com/app/apikey"
            echo "  2. Create or sign in to Google account"
            echo "  3. Generate API key"
            echo ""
            echo -e "${CYAN}Best For:${NC}"
            echo "  • Free tier users"
            echo "  • Fast iteration during planning"
            echo "  • Multi-language codebases"
            echo "  • Projects needing large context windows"
            echo ""
            ;;
        2)
            echo ""
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}Option 2: Anthropic Claude${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "${CYAN}Models Available:${NC}"
            echo "  • claude-sonnet-4.5 (Best reasoning - recommended)"
            echo "  • claude-sonnet-3.5 (Excellent balance)"
            echo "  • claude-opus-4 (Most powerful - coming soon)"
            echo ""
            echo -e "${CYAN}Strengths:${NC}"
            echo "  ✅ Best reasoning: Superior architectural decisions"
            echo "  ✅ Large context: 200K tokens"
            echo "  ✅ Excellent writing: Polished PRDs and ADRs"
            echo "  ✅ Safety-focused: Identifies architectural risks"
            echo "  ✅ Strong TypeScript/Next.js expertise"
            echo "  ✅ Thoughtful, well-structured ADRs"
            echo ""
            echo -e "${CYAN}Limitations:${NC}"
            echo "  ❌ No free tier (paid only)"
            echo "  ❌ Higher cost than Gemini"
            echo "  ❌ API rate limits (depends on tier)"
            echo ""
            echo -e "${CYAN}Cost:${NC}"
            echo "  • Sonnet 4.5 Input: \$3 per 1M tokens"
            echo "  • Sonnet 4.5 Output: \$15 per 1M tokens"
            echo "  • Typical PRD: ~\$0.50-2.00"
            echo ""
            echo -e "${CYAN}Setup Requirements:${NC}"
            echo "  1. Visit https://console.anthropic.com/"
            echo "  2. Create account and add payment method"
            echo "  3. Generate API key"
            echo ""
            echo -e "${CYAN}Best For:${NC}"
            echo "  • Complex architectural decisions"
            echo "  • Writing comprehensive ADRs"
            echo "  • Projects requiring deep reasoning"
            echo "  • Teams prioritizing quality over cost"
            echo ""
            echo -e "${YELLOW}Note: ADR-003 (architecture simplification) was created by Claude!${NC}"
            echo ""
            ;;
        3)
            echo ""
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}Option 3: OpenAI GPT${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "${CYAN}Models Available:${NC}"
            echo "  • gpt-4-turbo (Fast, capable - recommended)"
            echo "  • gpt-4o (Best multimodal)"
            echo "  • gpt-4o-mini (Cheaper, faster, good enough)"
            echo ""
            echo -e "${CYAN}Strengths:${NC}"
            echo "  ✅ Widely used: Most popular, well-documented"
            echo "  ✅ Fast: Especially turbo and mini models"
            echo "  ✅ Multimodal: GPT-4o handles images well"
            echo "  ✅ Good code generation: Excellent TypeScript/React"
            echo "  ✅ Reliable: Production-grade stability"
            echo "  ✅ Function calling: Great for structured outputs"
            echo ""
            echo -e "${CYAN}Limitations:${NC}"
            echo "  ❌ No free tier (paid only)"
            echo "  ❌ Smaller context: 128K tokens max"
            echo "  ❌ Sometimes verbose (less concise)"
            echo ""
            echo -e "${CYAN}Cost:${NC}"
            echo "  • GPT-4 Turbo Input: \$10 per 1M tokens"
            echo "  • GPT-4 Turbo Output: \$30 per 1M tokens"
            echo "  • GPT-4o Mini Input: \$0.15 per 1M tokens"
            echo "  • GPT-4o Mini Output: \$0.60 per 1M tokens"
            echo "  • Typical PRD: \$0.30-1.50 (turbo), \$0.05-0.20 (mini)"
            echo ""
            echo -e "${CYAN}Setup Requirements:${NC}"
            echo "  1. Visit https://platform.openai.com/api-keys"
            echo "  2. Create account and add payment method"
            echo "  3. Generate API key"
            echo ""
            echo -e "${CYAN}Best For:${NC}"
            echo "  • Teams already using OpenAI"
            echo "  • Multimodal analysis needs"
            echo "  • Fast iteration during planning"
            echo "  • Structured data generation (JSON)"
            echo ""
            ;;
        4)
            echo ""
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}Option 4: Local Models${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "${CYAN}Models Available:${NC}"
            echo "  • llama-3.1-70b (Strong reasoning - recommended)"
            echo "  • codellama-34b (Specialized for code)"
            echo "  • mixtral-8x7b (Excellent open model)"
            echo ""
            echo -e "${CYAN}Strengths:${NC}"
            echo "  ✅ Free: No API costs"
            echo "  ✅ Privacy: Data never leaves your machine"
            echo "  ✅ No rate limits: Use as much as you want"
            echo "  ✅ Offline: Works without internet"
            echo "  ✅ Customizable: Fine-tune for your needs"
            echo ""
            echo -e "${CYAN}Limitations:${NC}"
            echo "  ❌ Hardware required: GPU with 16GB+ VRAM"
            echo "  ❌ Slower than cloud APIs"
            echo "  ❌ Smaller context: 8K-32K tokens typically"
            echo "  ❌ Quality varies by model"
            echo "  ❌ Setup complexity"
            echo ""
            echo -e "${CYAN}Cost:${NC}"
            echo "  • Free (only electricity and hardware)"
            echo ""
            echo -e "${CYAN}Setup Requirements:${NC}"
            echo "  1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh"
            echo "  2. Pull model: ollama pull llama3.1:70b"
            echo "  3. Verify: ollama run llama3.1:70b"
            echo ""
            echo -e "${CYAN}Hardware Requirements:${NC}"
            echo "  • Minimum: 16GB RAM, 8GB VRAM (for 7B models)"
            echo "  • Recommended: 32GB RAM, 24GB VRAM (for 70B models)"
            echo "  • Apple Silicon: Works great on M1/M2/M3 Max/Ultra"
            echo ""
            echo -e "${CYAN}Best For:${NC}"
            echo "  • Privacy-sensitive projects"
            echo "  • Powerful local hardware available"
            echo "  • Learning and experimentation"
            echo "  • Offline development"
            echo ""
            ;;
    esac
}

# Display options
echo -e "${BLUE}Please select your LLM provider:${NC}"
echo ""
echo "  ${GREEN}1)${NC} Google Gemini ${YELLOW}(Recommended - Free tier available)${NC}"
echo "  ${GREEN}2)${NC} Anthropic Claude ${CYAN}(Best reasoning, paid)${NC}"
echo "  ${GREEN}3)${NC} OpenAI GPT ${CYAN}(Popular choice, paid)${NC}"
echo "  ${GREEN}4)${NC} Local Model ${CYAN}(Privacy-focused, requires hardware)${NC}"
echo ""
echo "  ${GREEN}5)${NC} Show detailed comparison"
echo "  ${GREEN}6)${NC} Exit"
echo ""

while true; do
    read -p "$(echo -e ${BLUE}Enter choice [1-6]: ${NC})" choice

    case $choice in
        1|2|3|4)
            show_option_details $choice
            read -p "$(echo -e ${BLUE}Confirm this choice? [y/n]: ${NC})" confirm
            if [[ $confirm == "y" || $confirm == "Y" ]]; then
                SELECTED_OPTION=$choice
                break
            fi
            ;;
        5)
            echo ""
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${CYAN}LLM Comparison Matrix${NC}"
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Criteria" "Gemini" "Claude" "OpenAI" "Local"
            echo "─────────────────────────────────────────────────────────────────────────────"
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Cost" "🟢 Free tier" "🔴 Paid only" "🔴 Paid only" "🟢 Free"
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Architecture Quality" "🟡 Very Good" "🟢 Excellent" "🟢 Excellent" "🟡 Good"
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Speed" "🟢 Very Fast" "🟡 Medium" "🟢 Fast" "🔴 Slow"
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Context Window" "🟢 1M+" "🟢 200K" "🟡 128K" "🔴 8-32K"
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Privacy" "🔴 Cloud" "🔴 Cloud" "🔴 Cloud" "🟢 Local"
            printf "%-25s %-15s %-15s %-15s %-15s\n" "Setup Difficulty" "🟢 Easy" "🟢 Easy" "🟢 Easy" "🔴 Complex"
            echo ""
            echo -e "${YELLOW}For MADACE_RUST_PY: Gemini recommended (free tier + excellent TypeScript)${NC}"
            echo ""
            ;;
        6)
            echo ""
            echo -e "${YELLOW}Selection cancelled. You can run this script again anytime.${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please enter 1-6.${NC}"
            ;;
    esac
done

# Configure based on selection
case $SELECTED_OPTION in
    1)
        PROVIDER="gemini"
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}Configuring Google Gemini${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Select model:"
        echo "  1) gemini-2.0-flash-exp (Latest experimental - recommended)"
        echo "  2) gemini-1.5-pro (Production-ready)"
        echo "  3) gemini-1.5-flash (Faster)"
        echo ""
        read -p "$(echo -e ${BLUE}Enter choice [1-3]: ${NC})" model_choice
        case $model_choice in
            1) MODEL="gemini-2.0-flash-exp" ;;
            2) MODEL="gemini-1.5-pro" ;;
            3) MODEL="gemini-1.5-flash" ;;
            *) MODEL="gemini-2.0-flash-exp" ;;
        esac
        echo ""
        echo -e "${YELLOW}You need a Gemini API key.${NC}"
        echo "Get it from: ${CYAN}https://aistudio.google.com/app/apikey${NC}"
        echo ""
        read -p "$(echo -e ${BLUE}Enter your Gemini API key: ${NC})" API_KEY
        API_KEY_VAR="GEMINI_API_KEY"
        MODEL_VAR="GEMINI_MODEL"
        ;;
    2)
        PROVIDER="claude"
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}Configuring Anthropic Claude${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Select model:"
        echo "  1) claude-sonnet-4.5 (Best reasoning - recommended)"
        echo "  2) claude-sonnet-3.5 (Excellent balance)"
        echo ""
        read -p "$(echo -e ${BLUE}Enter choice [1-2]: ${NC})" model_choice
        case $model_choice in
            1) MODEL="claude-sonnet-4.5" ;;
            2) MODEL="claude-sonnet-3.5" ;;
            *) MODEL="claude-sonnet-4.5" ;;
        esac
        echo ""
        echo -e "${YELLOW}You need an Anthropic API key (requires paid account).${NC}"
        echo "Get it from: ${CYAN}https://console.anthropic.com/${NC}"
        echo ""
        read -p "$(echo -e ${BLUE}Enter your Anthropic API key: ${NC})" API_KEY
        API_KEY_VAR="ANTHROPIC_API_KEY"
        MODEL_VAR="CLAUDE_MODEL"
        ;;
    3)
        PROVIDER="openai"
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}Configuring OpenAI GPT${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Select model:"
        echo "  1) gpt-4-turbo (Fast, capable - recommended)"
        echo "  2) gpt-4o (Best multimodal)"
        echo "  3) gpt-4o-mini (Cheaper, faster)"
        echo ""
        read -p "$(echo -e ${BLUE}Enter choice [1-3]: ${NC})" model_choice
        case $model_choice in
            1) MODEL="gpt-4-turbo" ;;
            2) MODEL="gpt-4o" ;;
            3) MODEL="gpt-4o-mini" ;;
            *) MODEL="gpt-4-turbo" ;;
        esac
        echo ""
        echo -e "${YELLOW}You need an OpenAI API key (requires paid account).${NC}"
        echo "Get it from: ${CYAN}https://platform.openai.com/api-keys${NC}"
        echo ""
        read -p "$(echo -e ${BLUE}Enter your OpenAI API key: ${NC})" API_KEY
        API_KEY_VAR="OPENAI_API_KEY"
        MODEL_VAR="OPENAI_MODEL"
        ;;
    4)
        PROVIDER="local"
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}Configuring Local Model (Ollama)${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Checking Ollama installation..."
        if ! command -v ollama &> /dev/null; then
            echo -e "${YELLOW}Ollama not found. Installing...${NC}"
            echo ""
            echo "Run this command:"
            echo -e "${CYAN}curl -fsSL https://ollama.ai/install.sh | sh${NC}"
            echo ""
            read -p "$(echo -e ${BLUE}Press Enter after installing Ollama...${NC})"
        else
            echo -e "${GREEN}✅ Ollama is installed${NC}"
        fi
        echo ""
        echo "Select model:"
        echo "  1) llama3.1:70b (Best reasoning - requires 48GB+ RAM)"
        echo "  2) llama3.1:8b (Fast, efficient - requires 8GB+ RAM)"
        echo "  3) codellama:34b (Code-specialized - requires 24GB+ RAM)"
        echo ""
        read -p "$(echo -e ${BLUE}Enter choice [1-3]: ${NC})" model_choice
        case $model_choice in
            1) MODEL="llama3.1:70b" ;;
            2) MODEL="llama3.1:8b" ;;
            3) MODEL="codellama:34b" ;;
            *) MODEL="llama3.1:8b" ;;
        esac
        echo ""
        echo -e "${YELLOW}Pulling model (this may take a while)...${NC}"
        ollama pull $MODEL
        API_KEY=""
        API_KEY_VAR=""
        MODEL_VAR="OLLAMA_MODEL"
        ;;
esac

# Create or update .env file
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Saving Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Remove old LLM configuration
sed -i.bak '/^PLANNING_LLM=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^PLANNING_LLM_MODEL=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^GEMINI_API_KEY=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^ANTHROPIC_API_KEY=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^OPENAI_API_KEY=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^GEMINI_MODEL=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^CLAUDE_MODEL=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^OPENAI_MODEL=/d' "$ENV_FILE" 2>/dev/null || true
sed -i.bak '/^OLLAMA_MODEL=/d' "$ENV_FILE" 2>/dev/null || true
rm -f "$ENV_FILE.bak"

# Add new configuration
{
    echo ""
    echo "# Planning/Architecture LLM Configuration"
    echo "# Generated by select-llm.sh on $(date)"
    echo "PLANNING_LLM=$PROVIDER"
    if [ -n "$API_KEY" ]; then
        echo "$API_KEY_VAR=$API_KEY"
    fi
    echo "$MODEL_VAR=$MODEL"
    echo ""
    echo "# Implementation uses local Docker agent (no configuration needed)"
    echo "IMPLEMENTATION_AGENT=docker"
} >> "$ENV_FILE"

echo -e "${GREEN}✅ Configuration saved to .env${NC}"
echo ""
echo "Your configuration:"
echo "  Provider: $PROVIDER"
echo "  Model: $MODEL"
if [ -n "$API_KEY" ]; then
    echo "  API Key: ${API_KEY:0:8}...${API_KEY: -4}"
fi
echo ""

# Test connection
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Testing Connection${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Testing LLM connection...${NC}"

# Run test script if it exists
if [ -f "$PROJECT_ROOT/scripts/test-llm.sh" ]; then
    bash "$PROJECT_ROOT/scripts/test-llm.sh"
else
    echo -e "${YELLOW}⚠️  Test script not found. Skipping connection test.${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ LLM Configuration Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "  1. Review configuration in .env file"
echo "  2. Start planning with PM agent:"
echo "     ${CYAN}npm run madace -- pm *plan-project${NC}"
echo ""
echo "  3. Create stories with SM agent:"
echo "     ${CYAN}npm run madace -- sm *create-story${NC}"
echo ""
echo "  4. Implementation will automatically use local Docker agent"
echo ""
echo -e "${YELLOW}Documentation: See docs/LLM-SELECTION.md for detailed information${NC}"
echo ""
