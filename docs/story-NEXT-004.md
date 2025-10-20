# [NEXT-004] Configure Environment Variables

**Status:** DONE ✅
**Points:** 2
**Epic:** Milestone 1.1 - Next.js Project Foundation
**Created:** 2025-10-20
**Completed:** 2025-10-20
**Assigned:** DEV Agent
**Actual Time:** 30 minutes

---

## Description

Create a comprehensive `.env.example` file that documents all required environment variables for the MADACE-Method v2.0 project, including LLM API keys, configuration paths, and runtime settings.

**Context:**

- [NEXT-001] completed - Next.js 15 is initialized
- [NEXT-002] completed - Project structure is organized
- [NEXT-003] completed - ESLint and Prettier configured
- We need environment variables for LLM providers, configuration, and development
- `.env.example` serves as documentation for required configuration

**Why This Story:**
Environment variables are critical for security (keeping API keys out of git) and configuration flexibility. A well-documented `.env.example` helps developers set up the project quickly and understand all configuration options.

---

## Acceptance Criteria

- [ ] `.env.example` created with all environment variables documented
- [ ] LLM configuration variables for all 4 providers (Gemini, Claude, OpenAI, Local)
- [ ] Application configuration variables (paths, settings)
- [ ] Development/production mode variables
- [ ] Each variable has clear comments explaining purpose
- [ ] Sensitive values use placeholder text
- [ ] `.gitignore` updated to exclude `.env` and `.env.local`
- [ ] README.md updated with environment setup instructions
- [ ] No actual API keys committed to repository
- [ ] Documentation explains how to copy and configure

---

## Implementation Plan

### Step 1: Create .env.example

Create comprehensive environment variable template:

```bash
# .env.example
# MADACE-Method v2.0 Environment Configuration
# Copy this file to .env and fill in your actual values
# DO NOT commit .env to git (it's in .gitignore)

#==============================================================================
# LLM CONFIGURATION - Planning & Architecture Phase
#==============================================================================
# Choose ONE of the following LLM providers for planning/architecture:
# - gemini (Recommended - Free tier available)
# - claude (Best reasoning, paid API)
# - openai (Popular choice, paid API)
# - local (Privacy-focused, requires local model server)

PLANNING_LLM=gemini

#------------------------------------------------------------------------------
# Google Gemini Configuration
#------------------------------------------------------------------------------
# Get your API key: https://makersuite.google.com/app/apikey
# Free tier: 60 requests/minute, 1500 requests/day
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

#------------------------------------------------------------------------------
# Anthropic Claude Configuration
#------------------------------------------------------------------------------
# Get your API key: https://console.anthropic.com/account/keys
# Paid API - Best for complex reasoning
CLAUDE_API_KEY=your-claude-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022

#------------------------------------------------------------------------------
# OpenAI Configuration
#------------------------------------------------------------------------------
# Get your API key: https://platform.openai.com/api-keys
# Paid API - Popular choice
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

#------------------------------------------------------------------------------
# Local Model Configuration (Ollama)
#------------------------------------------------------------------------------
# Requires Ollama running locally: https://ollama.ai/
# Free and private - runs on your hardware
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=llama2

#==============================================================================
# APPLICATION CONFIGURATION
#==============================================================================

#------------------------------------------------------------------------------
# Project Settings
#------------------------------------------------------------------------------
PROJECT_NAME=MADACE-Method v2.0
OUTPUT_FOLDER=docs
USER_NAME=Your Name
COMMUNICATION_LANGUAGE=en

#------------------------------------------------------------------------------
# Data Paths (for Docker deployment)
#------------------------------------------------------------------------------
MADACE_DATA_DIR=/app/data
MADACE_CONFIG_FILE=/app/data/config/config.yaml
MADACE_ENV_FILE=/app/data/config/.env

#------------------------------------------------------------------------------
# MADACE Directories
#------------------------------------------------------------------------------
AGENTS_PATH=madace/mam/agents
WORKFLOWS_PATH=madace/mam/workflows
STATUS_FILE=docs/mam-workflow-status.md

#==============================================================================
# RUNTIME CONFIGURATION
#==============================================================================

#------------------------------------------------------------------------------
# Next.js Configuration
#------------------------------------------------------------------------------
# Development: http://localhost:3000
# Production: Set to your domain
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

#------------------------------------------------------------------------------
# Development Server
#------------------------------------------------------------------------------
PORT=3000
HOSTNAME=0.0.0.0

#------------------------------------------------------------------------------
# CLI Integration
#------------------------------------------------------------------------------
# Enable Claude CLI integration
CLAUDE_CLI_ENABLED=true

# Enable Gemini CLI integration
GEMINI_CLI_ENABLED=true

#------------------------------------------------------------------------------
# WebSocket Configuration (for CLI/Web UI sync)
#------------------------------------------------------------------------------
WEBSOCKET_ENABLED=true
WEBSOCKET_PORT=3001

#==============================================================================
# OPTIONAL CONFIGURATION
#==============================================================================

#------------------------------------------------------------------------------
# Logging
#------------------------------------------------------------------------------
LOG_LEVEL=info
# Options: error, warn, info, debug, trace

#------------------------------------------------------------------------------
# Module Configuration
#------------------------------------------------------------------------------
# Enable/disable MADACE modules
MAM_ENABLED=true
MAB_ENABLED=false
CIS_ENABLED=false

#------------------------------------------------------------------------------
# Development Tools
#------------------------------------------------------------------------------
# Enable development container IDEs
VSCODE_SERVER_PASSWORD=madace123
CODE_SERVER_PASSWORD=madace123

#==============================================================================
# NOTES
#==============================================================================
# 1. Copy this file: cp .env.example .env
# 2. Fill in your actual API keys and configuration
# 3. Never commit .env to git (already in .gitignore)
# 4. For Docker: Environment variables are passed via docker-compose.yml
# 5. For production: Use environment variables from your hosting provider
# 6. See docs/LLM-SELECTION.md for detailed LLM setup guide
```

### Step 2: Update .gitignore

Ensure sensitive files are excluded:

```bash
# Add to .gitignore if not already present
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### Step 3: Create .env for Development

```bash
# Create actual .env from example (developer does this locally)
cp .env.example .env

# Edit .env with actual values
# This file is NOT committed to git
```

### Step 4: Update README.md

Add environment setup section:

````markdown
## Environment Configuration

### Quick Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```
````

2. **Configure your LLM provider:**
   - Open `.env` in your editor
   - Choose your LLM provider (`gemini`, `claude`, `openai`, or `local`)
   - Add your API key
   - Update `PLANNING_LLM` to match your choice

3. **Update project settings:**
   - Set `PROJECT_NAME` (optional)
   - Set `USER_NAME` (optional)
   - Keep other defaults unless needed

### LLM Provider Setup

See [`docs/LLM-SELECTION.md`](./docs/LLM-SELECTION.md) for:

- Detailed comparison of all 4 LLM providers
- How to get API keys
- Cost comparison
- Configuration examples

### Environment Variables Reference

All available environment variables are documented in `.env.example` with comments.

**Required variables:**

- `PLANNING_LLM` - Your chosen LLM provider
- `{PROVIDER}_API_KEY` - API key for your chosen provider
- `{PROVIDER}_MODEL` - Model name for your chosen provider

**Optional variables:**

- `PROJECT_NAME` - Customize project name
- `OUTPUT_FOLDER` - Where documents are generated
- `USER_NAME` - Your name for document headers
- All others have sensible defaults

````

### Step 5: Verify .gitignore

```bash
# Ensure .env files are ignored
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
grep -q "^\.env\.local$" .gitignore || echo ".env.local" >> .gitignore
````

### Step 6: Test Configuration

```bash
# Verify .env is NOT tracked by git
git status | grep -q ".env" && echo "ERROR: .env is tracked!" || echo "✓ .env is ignored"

# Verify .env.example IS tracked
git ls-files --error-unmatch .env.example && echo "✓ .env.example is tracked"
```

---

## Technical Notes

### Environment Variable Naming Conventions

**LLM Providers:**

- Pattern: `{PROVIDER}_API_KEY`, `{PROVIDER}_MODEL`
- Providers: `GEMINI`, `CLAUDE`, `OPENAI`, `LOCAL`

**Paths:**

- Absolute paths for Docker: `/app/data/...`
- Relative paths for local dev: `docs/...`, `madace/...`

**Runtime:**

- Next.js convention: `NEXT_PUBLIC_*` for client-side variables
- Server-only variables have no prefix

### Security Best Practices

1. **Never commit actual API keys**
   - `.env` is in `.gitignore`
   - Only `.env.example` with placeholders is committed

2. **Use environment-specific files**
   - `.env.local` for local overrides (also git-ignored)
   - `.env.production.local` for production secrets

3. **Docker secrets management**
   - Pass secrets via `docker-compose.yml` environment section
   - Or use Docker secrets feature for production

### Next.js Environment Variables

Next.js has special handling:

- Variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- All other variables are server-side only
- Variables are embedded at **build time**, not runtime

**For runtime configuration:**

- Use API routes to access server-side env vars
- Don't use `NEXT_PUBLIC_` for secrets

---

## Testing Checklist

**File Creation:**

- [ ] `.env.example` exists with all variables documented
- [ ] All 4 LLM providers documented
- [ ] Application settings documented
- [ ] Runtime configuration documented
- [ ] Clear comments for each section

**Git Configuration:**

- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] `.env.example` is tracked by git
- [ ] `.env` (if created) is NOT tracked by git

**Documentation:**

- [ ] README.md updated with environment setup section
- [ ] Links to LLM-SELECTION.md included
- [ ] Copy commands documented
- [ ] Required vs optional variables explained

**Verification:**

```bash
# All of these should pass:
ls -la .env.example  # File exists
cat .env.example | grep -q "GEMINI_API_KEY"  # Has Gemini config
cat .env.example | grep -q "CLAUDE_API_KEY"  # Has Claude config
cat .env.example | grep -q "OPENAI_API_KEY"  # Has OpenAI config
cat .env.example | grep -q "LOCAL_MODEL_URL"  # Has local config
git check-ignore .env  # Returns 0 (ignored)
git ls-files .env.example  # Shows file (tracked)
```

---

## Dependencies

**Depends On:**

- [NEXT-001] Initialize Next.js 15 project (DONE) ✅
- [NEXT-002] Configure project structure (DONE) ✅
- [NEXT-003] Setup ESLint and Prettier (DONE) ✅

**Blocks:**

- [SETUP-002] Setup wizard UI (needs env vars reference)
- [LLM-013] Multi-provider LLM client (needs env vars)
- All future features requiring configuration

---

## Risks & Mitigations

**Risk 1: Developers Commit API Keys**

- **Risk:** Accidentally committing `.env` with real keys
- **Mitigation:** `.env` in `.gitignore`, clear documentation, git hooks (future)
- **Likelihood:** Medium (common mistake)

**Risk 2: Missing Environment Variables**

- **Risk:** Application breaks if required vars not set
- **Mitigation:** Validation at startup, clear error messages
- **Likelihood:** Low (good documentation)

**Risk 3: Confusion About Which Provider to Use**

- **Risk:** Developers don't know which LLM to choose
- **Mitigation:** Link to LLM-SELECTION.md, clear comments in .env.example
- **Likelihood:** Low (comprehensive docs)

---

## Definition of Done

This story is considered DONE when:

1. ✅ `.env.example` created with all environment variables
2. ✅ All 4 LLM providers documented (Gemini, Claude, OpenAI, Local)
3. ✅ Application configuration variables documented
4. ✅ Runtime variables documented
5. ✅ Each variable has explanatory comments
6. ✅ `.gitignore` updated to exclude `.env` files
7. ✅ README.md updated with environment setup section
8. ✅ No actual API keys in repository
9. ✅ Verification tests pass
10. ✅ Git committed with clear message
11. ✅ Story moved to DONE in workflow status
12. ✅ Next story [NEXT-005] moved to TODO

---

## Time Estimate

**Estimated Time:** 30-45 minutes

**Breakdown:**

- Create .env.example: 15 minutes
- Update .gitignore: 5 minutes
- Update README.md: 10 minutes
- Testing and verification: 10 minutes
- Documentation review: 5 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Review existing `.gitignore`
- Check if `.env.example` already exists (it might from Next.js init)
- Review docs/LLM-SELECTION.md for LLM provider details

### During Implementation

- Be thorough with comments in `.env.example`
- Include examples for all providers
- Keep placeholders obvious (e.g., `your-api-key-here`)
- Test that `.env` is properly git-ignored

### After Completion

- Verify `.env` is ignored: `git status` should not show it
- Verify `.env.example` is tracked: `git ls-files` should show it
- Create your own `.env` for testing
- Commit with descriptive message

---

## Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [docs/LLM-SELECTION.md](./docs/LLM-SELECTION.md) - LLM provider comparison
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Configuration management section

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Pending review with *story-ready workflow]_
**Implemented By:** _[DEV Agent will guide implementation]_
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20
