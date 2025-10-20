# LLM Selection Guide for MADACE_RUST_PY

**Purpose:** This guide explains how to select and configure the LLM (Large Language Model) used for planning and architecture work in this project.

**Important Distinction:**
- **Planning/Architecture Phase**: Uses user-selected LLM (this guide)
- **Implementation Phase**: Uses local Docker agent (configured separately)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           MADACE_RUST_PY Development Flow               │
└─────────────────────────────────────────────────────────┘

Phase 1: Planning & Architecture (User-Selected LLM)
┌────────────────────────────────────────────────────┐
│ • PRD Creation                                      │
│ • Architecture Design (ADRs)                        │
│ • Epic Breakdown                                    │
│ • Technical Specifications                          │
│ • Story Creation                                    │
│                                                      │
│ LLM Choice: Gemini, Claude, OpenAI, or Local       │
└────────────────────────────────────────────────────┘
                        ↓
Phase 2: Implementation (Local Docker Agent)
┌────────────────────────────────────────────────────┐
│ • Code Generation                                   │
│ • Component Implementation                          │
│ • Testing                                           │
│ • Bug Fixes                                         │
│                                                      │
│ LLM: Local Agent (ollama/llamafile in Docker)      │
└────────────────────────────────────────────────────┘
```

---

## Available LLM Options for Planning/Architecture

### Option 1: Google Gemini (Default)

**Models:**
- `gemini-2.0-flash-exp` - Latest experimental model (best performance)
- `gemini-1.5-pro` - Production-ready, excellent reasoning
- `gemini-1.5-flash` - Faster, good for iteration

**Strengths:**
- ✅ **Free Tier Available**: 60 requests/minute on free tier
- ✅ **Large Context Window**: 1M+ tokens (can process entire codebase)
- ✅ **Multimodal**: Can analyze images, diagrams, screenshots
- ✅ **Fast Response**: Especially flash models
- ✅ **Strong Code Generation**: Excellent at TypeScript, Rust, Python
- ✅ **Long-Form Planning**: Great at creating comprehensive PRDs and architecture docs

**Limitations:**
- ❌ Rate limits on free tier (60/min)
- ❌ Experimental models may change behavior
- ❌ Requires Google Cloud account

**Best For:**
- Projects needing comprehensive architecture design
- Multi-language codebases (Rust + TypeScript)
- Teams wanting free tier option
- Fast iteration during planning

**Setup:**
```bash
# 1. Get API key from https://aistudio.google.com/app/apikey
# 2. Set environment variable
export GEMINI_API_KEY="your-key-here"

# 3. Update .env file
echo "PLANNING_LLM=gemini" >> .env
echo "GEMINI_API_KEY=your-key-here" >> .env
echo "GEMINI_MODEL=gemini-2.0-flash-exp" >> .env
```

**Cost (Paid Tier):**
- Input: $0.075 per 1M tokens (cheap)
- Output: $0.30 per 1M tokens
- Typical PRD generation: ~$0.05-0.20

---

### Option 2: Anthropic Claude (Recommended for Complex Architecture)

**Models:**
- `claude-sonnet-4.5` - Best reasoning, architecture design
- `claude-opus-4` - Most powerful (coming soon)
- `claude-sonnet-3.5` - Excellent balance

**Strengths:**
- ✅ **Best Reasoning**: Superior at complex architectural decisions
- ✅ **Large Context**: 200K tokens (entire projects)
- ✅ **Excellent Writing**: PRDs and ADRs are very polished
- ✅ **Safety Focused**: Good at identifying architectural risks
- ✅ **Strong TypeScript**: Excellent Next.js and React expertise
- ✅ **Thoughtful ADRs**: Creates well-structured decision records

**Limitations:**
- ❌ **No Free Tier**: Requires paid account
- ❌ Higher cost than Gemini
- ❌ API rate limits (depends on tier)

**Best For:**
- Complex architectural decisions
- Writing comprehensive ADRs
- Projects requiring deep technical reasoning
- Teams prioritizing quality over cost

**Setup:**
```bash
# 1. Get API key from https://console.anthropic.com/
# 2. Set environment variable
export ANTHROPIC_API_KEY="your-key-here"

# 3. Update .env file
echo "PLANNING_LLM=claude" >> .env
echo "ANTHROPIC_API_KEY=your-key-here" >> .env
echo "CLAUDE_MODEL=claude-sonnet-4.5" >> .env
```

**Cost:**
- Sonnet 4.5 Input: $3 per 1M tokens
- Sonnet 4.5 Output: $15 per 1M tokens
- Typical PRD generation: ~$0.50-2.00

---

### Option 3: OpenAI GPT (Popular Choice)

**Models:**
- `gpt-4-turbo` - Fast, capable, good value
- `gpt-4o` - Best multimodal capabilities
- `gpt-4o-mini` - Cheaper, faster, good enough

**Strengths:**
- ✅ **Widely Used**: Most popular, well-documented
- ✅ **Fast**: Especially turbo and mini models
- ✅ **Multimodal**: GPT-4o handles images well
- ✅ **Good Code Generation**: Excellent at TypeScript/React
- ✅ **Reliable**: Production-grade stability
- ✅ **Function Calling**: Great for structured outputs

**Limitations:**
- ❌ **No Free Tier**: Requires paid account
- ❌ Smaller context window (128K max)
- ❌ Sometimes verbose (less concise than Claude)

**Best For:**
- Teams already using OpenAI
- Projects needing multimodal analysis
- Fast iteration during planning
- Structured data generation (JSON schemas)

**Setup:**
```bash
# 1. Get API key from https://platform.openai.com/api-keys
# 2. Set environment variable
export OPENAI_API_KEY="your-key-here"

# 3. Update .env file
echo "PLANNING_LLM=openai" >> .env
echo "OPENAI_API_KEY=your-key-here" >> .env
echo "OPENAI_MODEL=gpt-4-turbo" >> .env
```

**Cost:**
- GPT-4 Turbo Input: $10 per 1M tokens
- GPT-4 Turbo Output: $30 per 1M tokens
- GPT-4o Mini Input: $0.15 per 1M tokens (cheaper option)
- GPT-4o Mini Output: $0.60 per 1M tokens
- Typical PRD generation: $0.30-1.50 (turbo), $0.05-0.20 (mini)

---

### Option 4: Local Models (Privacy & Cost-Conscious)

**Options:**
- `llama-3.1-70b` via Ollama - Strong reasoning
- `codellama-34b` - Specialized for code
- `mixtral-8x7b` - Excellent open model

**Strengths:**
- ✅ **Free**: No API costs
- ✅ **Privacy**: Data never leaves your machine
- ✅ **No Rate Limits**: Use as much as you want
- ✅ **Offline**: Works without internet
- ✅ **Customizable**: Fine-tune for your needs

**Limitations:**
- ❌ **Hardware Required**: Need GPU (16GB+ VRAM recommended)
- ❌ Slower than cloud APIs
- ❌ Smaller context windows (8K-32K typically)
- ❌ Quality varies by model
- ❌ Setup complexity

**Best For:**
- Privacy-sensitive projects
- Teams with powerful local hardware
- Learning/experimentation
- Offline development environments

**Setup (Ollama):**
```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull model
ollama pull llama3.1:70b

# 3. Update .env file
echo "PLANNING_LLM=local" >> .env
echo "OLLAMA_MODEL=llama3.1:70b" >> .env
echo "OLLAMA_HOST=http://localhost:11434" >> .env
```

**Cost:**
- Free (only electricity and hardware)

---

## Implementation Agent (Automatic)

Once planning/architecture is complete and work is broken into stories, implementation uses a **local Docker agent** automatically.

**Why Local Agent for Implementation:**
- Consistency across environments
- No API costs during coding
- Faster iteration (no network latency)
- Privacy for proprietary code
- Always available (no rate limits)

**Setup:**
```bash
# Docker agent will be configured automatically
# Uses ollama/llamafile in Docker container
# No user configuration needed for implementation phase
```

---

## Decision Matrix

| Criteria | Gemini | Claude | OpenAI | Local |
|----------|--------|--------|--------|-------|
| **Cost** | 🟢 Free tier available | 🔴 Paid only | 🔴 Paid only | 🟢 Free |
| **Quality (Architecture)** | 🟡 Very Good | 🟢 Excellent | 🟢 Excellent | 🟡 Good |
| **Speed** | 🟢 Very Fast | 🟡 Medium | 🟢 Fast | 🔴 Slow |
| **Context Window** | 🟢 1M+ tokens | 🟢 200K tokens | 🟡 128K tokens | 🔴 8-32K tokens |
| **Privacy** | 🔴 Cloud | 🔴 Cloud | 🔴 Cloud | 🟢 Local |
| **Setup Difficulty** | 🟢 Easy | 🟢 Easy | 🟢 Easy | 🔴 Complex |
| **Best For** | Free tier, speed | Complex reasoning | General use | Privacy |

---

## Recommended Choice by Project Type

### For This Project (MADACE_RUST_PY Simplification):

**Recommendation: Google Gemini (gemini-2.0-flash-exp)**

**Rationale:**
1. **Free Tier**: Sufficient for architecture planning
2. **Large Context**: Can analyze entire Next.js codebase at once
3. **Fast Iteration**: Need to quickly generate ADRs, tech specs
4. **Code Generation**: Excellent at TypeScript/React (our new stack)
5. **Multimodal**: Helpful if analyzing architecture diagrams

**Alternative: Anthropic Claude (if budget allows)**
- Better at creating thoughtful ADRs (like ADR-003)
- Superior architectural reasoning
- More polished documentation

---

## Interactive Selection Script

When you're ready to start planning, run:

```bash
./scripts/select-llm.sh
```

This will interactively ask:
1. Which LLM provider you want to use
2. Which specific model (with explanations)
3. Guide you through API key setup
4. Test the connection
5. Save configuration to `.env`

**Script Output Example:**
```
🤖 MADACE_RUST_PY - LLM Selection for Planning & Architecture
================================================================

This LLM will be used for:
  • PRD creation and updates
  • Architecture design and ADRs
  • Epic breakdown and story creation
  • Technical specifications

Implementation (coding) will use a local Docker agent automatically.

Please select your LLM provider:

1) Google Gemini (Recommended - Free tier available)
2) Anthropic Claude (Best reasoning, paid)
3) OpenAI GPT (Popular choice, paid)
4) Local Model (Privacy-focused, requires hardware)

Enter choice (1-4):
```

---

## Configuration Files

### .env (Git-ignored)
```bash
# Planning/Architecture LLM Configuration
PLANNING_LLM=gemini                    # Options: gemini, claude, openai, local
PLANNING_LLM_MODEL=gemini-2.0-flash-exp

# API Keys (keep secret!)
GEMINI_API_KEY=your-key-here
# ANTHROPIC_API_KEY=your-key-here      # Uncomment if using Claude
# OPENAI_API_KEY=your-key-here         # Uncomment if using OpenAI

# Implementation Agent Configuration (automatic)
IMPLEMENTATION_AGENT=docker            # Always uses Docker agent
IMPLEMENTATION_MODEL=auto              # Auto-selected based on hardware
```

### .env.example (Git-tracked)
```bash
# Copy this to .env and fill in your values

# Planning/Architecture LLM
PLANNING_LLM=gemini
PLANNING_LLM_MODEL=gemini-2.0-flash-exp

# API Keys (get from provider dashboard)
GEMINI_API_KEY=
# ANTHROPIC_API_KEY=
# OPENAI_API_KEY=

# Implementation uses Docker agent (no configuration needed)
```

---

## Testing Your LLM Configuration

After setup, test with:

```bash
# Test connection
./scripts/test-llm.sh

# Expected output:
# ✅ Connected to Gemini (gemini-2.0-flash-exp)
# ✅ Generated sample response (took 1.2s)
# ✅ Configuration valid
```

---

## Switching LLMs Mid-Project

You can switch LLMs at any time:

```bash
# Option 1: Re-run selection script
./scripts/select-llm.sh

# Option 2: Manually edit .env
nano .env  # Change PLANNING_LLM and API key

# Option 3: Use environment variable override
PLANNING_LLM=claude npm run plan-project
```

**Note**: Different LLMs may have different "personalities" in their architecture decisions. We recommend sticking with one LLM throughout the planning phase for consistency.

---

## Cost Estimation

For typical MADACE_RUST_PY planning/architecture work:

**Phase 1: Initial Planning (PRD, Architecture, ADRs)**
- Gemini Free Tier: $0 (within limits)
- Gemini Paid: ~$0.50-1.00
- Claude Sonnet: ~$2.00-5.00
- OpenAI GPT-4 Turbo: ~$1.50-3.00
- Local: $0

**Phase 2: Epic Breakdown & Story Creation (27 stories)**
- Gemini Free Tier: $0 (within limits)
- Gemini Paid: ~$1.00-2.00
- Claude Sonnet: ~$5.00-10.00
- OpenAI GPT-4 Turbo: ~$3.00-6.00
- Local: $0

**Total Planning Phase Cost Estimate:**
- Gemini: $0-3.00
- Claude: $7.00-15.00
- OpenAI: $4.50-9.00
- Local: $0

**Implementation Phase:** $0 (uses free local Docker agent)

---

## Privacy Considerations

### Cloud LLMs (Gemini, Claude, OpenAI):
- Your prompts and code are sent to provider's servers
- Providers may use data for model improvement (check TOS)
- Use API terms that prohibit training on your data if concerned
- Consider local models for proprietary/sensitive projects

### Local LLMs:
- Data never leaves your machine
- Complete privacy and control
- Suitable for confidential projects

**Recommendation for MADACE_RUST_PY:**
This is an open-source experimental project, so cloud LLMs are fine. If forking for proprietary use, consider local models.

---

## Next Steps

1. **Run Selection Script**: `./scripts/select-llm.sh`
2. **Test Configuration**: `./scripts/test-llm.sh`
3. **Start Planning**: Load PM agent and run `*plan-project`
4. **Implementation**: Local Docker agent takes over automatically

---

## FAQ

**Q: Can I use different LLMs for different tasks?**
A: Yes, but we recommend consistency during planning phase. You could use:
- Claude for ADRs (best reasoning)
- Gemini for rapid iteration
- Local for privacy-sensitive specs

**Q: What if I run out of free tier quota?**
A: Switch to local model or upgrade to paid tier. Free tier resets daily.

**Q: Can the implementation agent use cloud LLMs too?**
A: Not by default (to save costs), but you can configure it if needed.

**Q: Which LLM created ADR-003 (the simplification proposal)?**
A: That was created by an Anthropic Claude Sonnet model (excellent architectural reasoning).

**Q: Can I fine-tune models for MADACE-specific work?**
A: Yes, but only local models. Cloud providers offer fine-tuning (at extra cost).

---

## Support

If you have issues with LLM configuration:
1. Check `.env` file syntax
2. Verify API keys are valid
3. Test network connectivity
4. Review provider status pages
5. Try local model as fallback

---

**Ready to select your LLM?** Run `./scripts/select-llm.sh` to begin!
