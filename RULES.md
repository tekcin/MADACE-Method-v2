# MADACE Development Rules

**Based on**: "Inside Claude Code From the Engineers Who Built It" podcast
**Purpose**: Codify best practices from the Claude Code team for building AI-powered development tools
**Version**: 1.1 (Added provider resilience and error recovery patterns)

---

## Quick Reference

**Core Principles**: Build for yourself • Latent demand • Demos over docs • Hackability • Ant-fooding
**Development**: Prototype/rebuild • Unship aggressively • Compounding engineering • Bottoms-up
**AI Architecture**: Dual-use tools • Agentic search • Sub-agents • Plan mode • Stop hooks • **Provider resilience**
**Team**: 70%+ dogfooding • Code review with Claude • Ship to self first
**UX**: Progressive disclosure • Intuitive interactions • Good defaults • Forgiving errors • **Error recovery**
**Anti-Patterns**: AVOID vector embeddings, over-automation, feature bloat, settings explosion

---

## 1. Core Philosophy & Principles

### RULE 1.1: Build for Yourself First

**Statement**: Build tools you will use daily. Internal dogfooding precedes external release.

**Rationale**:

- 70-80% of Anthropic engineers use Claude Code daily ("ant-fooding")
- Real pain points emerge when builders are users
- Quality bar naturally rises when you live with your decisions
- Fastest feedback loop possible

**Implementation**:

```
✅ DO: Use MADACE daily for MADACE development
✅ DO: Track your own friction points in a log
✅ DO: Build features you personally need
❌ DON'T: Build for hypothetical users without dogfooding
❌ DON'T: Ship features you wouldn't use yourself
```

**Success Metric**: Team members choose MADACE over alternatives for their daily work.

---

### RULE 1.2: Latent Demand Strategy

**Statement**: Build hackable products, watch abuse patterns, then build for that demand.

**Rationale**:

- Users show you what they need by how they "abuse" your product
- Hackability reveals unmet needs faster than user research
- Latent demand often bigger than explicit feature requests

**Real Example from Claude Code**:

- Provided bare-bones Bash tool
- Users piped output to Claude for analysis
- Team built first-class code search (most-used feature)

**Implementation**:

```
✅ DO: Make MADACE extensible (slash commands, hooks, MCP)
✅ DO: Monitor how power users push boundaries
✅ DO: Build features when you see repeated workarounds
❌ DON'T: Lock down flexibility to "protect" users
❌ DON'T: Ignore creative misuse patterns
```

---

### RULE 1.3: Demos Over Docs

**Statement**: Show, don't tell. Live demos beat documentation every time.

**Rationale**:

- Seeing Claude Code in action = instant understanding
- Documentation becomes outdated; demos show current reality
- Users learn workflows faster by watching

**Implementation**:

```
✅ DO: Record video demos of key workflows
✅ DO: Show MADACE in action during onboarding
✅ DO: Use demos to communicate with stakeholders
✅ DO: Keep a library of "wow moment" recordings
❌ DON'T: Write docs instead of showing how it works
❌ DON'T: Hide the product behind walls of text
```

---

### RULE 1.4: Hackability as a Feature

**Statement**: Extensibility is not optional. Power users drive innovation.

**Rationale**:

- VS Code succeeded because of extensions
- Claude Code's hooks/slash commands enable customization
- Community will build what you haven't imagined

**Implementation**:

```
✅ DO: Support slash commands for custom workflows
✅ DO: Expose hooks for user scripts
✅ DO: Document extension points
✅ DO: Make settings live in codebase (CLAUDE.md)
❌ DON'T: Hard-code behavior that should be configurable
❌ DON'T: Hide extension APIs
```

---

## 2. Product Development Rules

### RULE 2.1: Prototype Rapidly, Rebuild Often

**Statement**: First version is a prototype. Plan to rebuild 2-3x before shipping.

**Rationale**:

- Claude Code rebuilt agentic search 3-4 times before shipping
- Each rebuild incorporates real learnings
- "Prototype, rebuild, rebuild, ship" is the pattern

**Implementation**:

```
✅ DO: Expect to throw away first implementation
✅ DO: Time-box prototypes (2-4 weeks max)
✅ DO: Test with real users before rebuilding
✅ DO: Document what you learned between versions
❌ DON'T: Over-engineer the first attempt
❌ DON'T: Ship the prototype as final
```

**Example Timeline**:

- Week 1-2: Rough prototype, test internally
- Week 3-4: Rebuild with learnings, test with 5 power users
- Week 5-6: Final rebuild, polish, ship

---

### RULE 2.2: Unship Aggressively

**Statement**: Removal is a feature. Delete underused functionality without hesitation.

**Rationale**:

- Cognitive overhead compounds with every feature
- Maintenance burden grows quadratically
- Users prefer simple tools that do one thing well

**Implementation**:

```
✅ DO: Track feature usage metrics
✅ DO: Remove features with <5% monthly active usage
✅ DO: Deprecate before removing (30-day warning)
✅ DO: Archive removed code for potential revival
❌ DON'T: Keep features "just in case"
❌ DON'T: Let features linger without users
```

**Unship Checklist**:

- [ ] Usage <5% for 3+ months?
- [ ] Adds cognitive load?
- [ ] Maintenance burden high?
- [ ] Can be replaced by extension/hook?
- [ ] Announce deprecation, wait 30 days, remove

---

### RULE 2.3: Compounding Engineering

**Statement**: Each feature should make the next feature easier to build, not harder.

**Rationale**:

- Most products accumulate complexity (features make future features harder)
- Great products compound capability (features enable new features)
- Test: "Does this make the next thing easier or harder?"

**Implementation**:

```
✅ DO: Build reusable primitives (tools, schemas, patterns)
✅ DO: Extract common patterns into libraries
✅ DO: Design APIs that compose naturally
✅ DO: Ask: "What does this unlock next?"
❌ DON'T: Build one-off solutions
❌ DON'T: Hard-code what should be configurable
```

**Example from Claude Code**:

- Bash tool → enabled code search → enabled git operations → enabled testing workflows
- Each tool compounded on previous tools

---

### RULE 2.4: Bottoms-Up Development

**Statement**: Features emerge from team members using the product, not top-down planning.

**Rationale**:

- Best features come from scratching your own itch
- Engineers know what engineers need
- Ownership drives quality

**Implementation**:

```
✅ DO: Let any team member propose features they'll use
✅ DO: Build features you personally need
✅ DO: Ship to yourself first, then team, then users
✅ DO: Celebrate features that solve real pain
❌ DON'T: Build from a product manager's spec alone
❌ DON'T: Implement features no one asked for
```

---

## 3. AI Agent Architecture

### RULE 3.1: Dual-Use Tool Design

**Statement**: Every tool must work for both human users and AI models.

**Rationale**:

- Reduces cognitive overhead (one mental model)
- AI and humans compose naturally
- Forces clear, intuitive APIs

**Implementation**:

```typescript
// ✅ GOOD: Tool works for both human and AI
export async function searchCode(query: string, options?: SearchOptions) {
  // Same API whether called by CLI, UI, or AI agent
  return grep(query, { glob: options?.glob, path: options?.path });
}

// ❌ BAD: Separate human and AI interfaces
export async function searchCodeForHuman(query: string) {
  /* ... */
}
export async function searchCodeForAI(query: string, context: AIContext) {
  /* ... */
}
```

**Test**: Can a human replicate what the AI does using the same tools?

---

### RULE 3.2: Agentic Search Over Vector Embeddings

**Statement**: Use grep/ripgrep with AI agents instead of vector embeddings for code search.

**Rationale**:

- More deterministic results
- Easier to understand what went wrong
- Works with existing tools (grep, git grep)
- AI models excel at generating search queries

**Real Results from Claude Code**:

- Agentic search outperforms embeddings in user studies
- Faster, more explainable, less infrastructure

**Implementation**:

```typescript
// ✅ PREFERRED: Agentic search
async function findImplementation(description: string) {
  // Let AI generate search query
  const query = await ai.generateSearchQuery(description);

  // Use grep/ripgrep
  const results = await grep(query, { type: 'ts', glob: 'lib/**' });

  // AI refines results
  return ai.rankAndFilter(results, description);
}

// ❌ AVOID: Vector embeddings (unless proven necessary)
async function findImplementationWithEmbeddings(description: string) {
  const embedding = await generateEmbedding(description);
  return vectorDB.search(embedding);
}
```

**When to use embeddings**: Natural language search over large docs (>100k files), semantic similarity tasks

---

### RULE 3.3: Sub-Agent Pattern

**Statement**: Use specialized sub-agents with uncorrelated context windows for complex tasks.

**Rationale**:

- Prevents context pollution across subtasks
- Allows parallel execution
- Each agent stays focused on one goal

**Implementation**:

```typescript
// ✅ GOOD: Sub-agents with isolated contexts
async function complexTask(request: string) {
  // Main agent delegates to sub-agents
  const [codeAnalysis, testGeneration, docUpdate] = await Promise.all([
    Task({
      subagent_type: 'code-analyzer',
      prompt: 'Analyze codebase structure...',
    }),
    Task({
      subagent_type: 'test-generator',
      prompt: 'Generate tests for...',
    }),
    Task({
      subagent_type: 'doc-writer',
      prompt: 'Update documentation for...',
    }),
  ]);

  // Main agent synthesizes results
  return synthesize([codeAnalysis, testGeneration, docUpdate]);
}
```

**Key Insight**: Uncorrelated context windows = better results than one giant context

---

### RULE 3.4: Plan Mode (Shift+Tab)

**Statement**: Always align on a plan before coding for complex tasks.

**Rationale**:

- 2-3x higher success rate when starting with a plan
- Catches misunderstandings early
- Allows course-correction before wasting time

**Implementation in MADACE**:

```
User: "Refactor the agent system to use dependency injection"

MADACE (Plan Mode):
I'll refactor the agent system with these steps:
1. Create IAgentLoader interface
2. Implement DatabaseAgentLoader and YAMLAgentLoader
3. Update AgentService to accept IAgentLoader via constructor
4. Add dependency injection container (tsyringe)
5. Update all call sites

Estimated: 8 files changed, ~400 lines
Proceed? (y/n)

User: "y"

MADACE: [starts coding]
```

**When to use Plan Mode**:

- Tasks spanning 3+ files
- Architectural changes
- Unclear requirements
- User said "not sure how to approach this"

---

### RULE 3.5: Stop Hooks (Deterministic Outcomes from Stochastic Processes)

**Statement**: Use hooks to enforce deterministic outcomes from AI-generated code.

**Rationale**:

- AI is stochastic; tests/linters are deterministic
- Stop hooks catch errors before they propagate
- Prevents "looks good but doesn't work" commits

**Implementation**:

```json
// .claude/hooks.json
{
  "user-prompt-submit-hook": "npm run check-all",
  "before-commit-hook": "npm run build && npm test",
  "after-edit-hook": "npm run type-check"
}
```

**Effect**: AI learns from hook failures, self-corrects, tries again until passing

---

### RULE 3.6: LLM Provider Resilience

**Statement**: Always implement automatic fallback and retry logic between LLM providers to handle API failures gracefully.

**Rationale**:

- API providers experience downtime, rate limits, and overload conditions
- Users shouldn't be blocked by single provider issues
- Graceful degradation = better UX and higher success rates
- Exponential backoff prevents hammering overloaded APIs

**Real-World Scenario**:

```
Claude API → "Overloaded" error (503)
  ↓
Wait 1s, retry → Still overloaded
  ↓
Wait 2s, retry → Still overloaded
  ↓
Fallback to Gemini → Success!
```

**Implementation**:

```typescript
// lib/llm/resilient-client.ts
import { createResilientLLMClient } from '@/lib/llm/resilient-client';

const client = await createResilientLLMClient({
  preferredProvider: 'claude',
  maxRetries: 2, // Retry each provider 2x
  initialBackoffMs: 1000, // Start with 1s delay
  maxBackoffMs: 5000, // Cap at 5s delay
  enableFallback: true, // Auto-switch providers
  fallbackProviders: ['gemini', 'local'], // Override default fallback chain
});

// Use just like regular client - resilience is automatic!
const response = await client.chat({ messages });
```

**Fallback Chain (Default)**:

```
claude   → gemini → local
gemini   → claude → local
openai   → gemini → local
local    → (no fallback)
```

**Retryable Errors**:

- Overloaded (503)
- Rate limit (429)
- Timeout errors
- Network errors (502, 504, ECONNRESET)

**Non-Retryable Errors**:

- Invalid API key (401) - switch provider
- Invalid request (400) - fail fast
- Content policy violation - fail fast

**Success Metrics**:

- <1% of requests fail after retry + fallback
- Average fallback time <10 seconds
- Users notified of provider switches

---

## 4. Team Practices

### RULE 4.1: Ant-Fooding (Extreme Dogfooding)

**Statement**: 70%+ of team must use MADACE daily for their real work.

**Rationale**:

- Anthropic: 70-80% of engineers use Claude Code daily
- Real usage drives quality and catches bugs
- Team becomes best source of feature ideas

**Implementation**:

```
✅ DO: Track daily active users on team
✅ DO: Use MADACE to develop MADACE
✅ DO: Fix your own friction points immediately
✅ DO: Share workflows and tips in team chat
❌ DON'T: Use alternative tools for "real work"
❌ DON'T: Ignore bugs because "it's for external users"
```

**Success Metric**: >70% of team uses MADACE 4+ days/week for their primary work.

---

### RULE 4.2: Code Review with AI

**Statement**: Use Claude/AI to review code before human review.

**Rationale**:

- Catches style issues, typos, obvious bugs
- Frees humans to focus on architecture and logic
- Faster feedback loop

**Implementation**:

```bash
# Before creating PR
git diff main | pbcopy
# Paste into Claude: "Review this diff for bugs, style issues, and improvements"

# Or use Claude Code directly
claude-code review-pr --branch feature/new-api
```

**What AI catches well**:

- Inconsistent naming
- Missing error handling
- Type safety issues
- Documentation gaps
- Test coverage holes

**What humans should focus on**:

- Architectural decisions
- Product direction
- UX implications
- Performance concerns

---

### RULE 4.3: Ship to Self → Team → Users

**Statement**: Progressive rollout: dogfood first, then team, then selected users, then GA.

**Rationale**:

- Catches critical bugs before users see them
- Builds confidence in stability
- Allows iteration based on feedback

**Rollout Stages**:

```
1. Developer (you) - 1-3 days
   ↓
2. Team (5-10 people) - 1 week
   ↓
3. Alpha users (50-100 people) - 2 weeks
   ↓
4. Beta users (500-1000 people) - 1 month
   ↓
5. General Availability (all users)
```

**Gate Criteria**:

- No P0 bugs in current stage
- Usage metrics meet targets
- Positive feedback from majority
- Docs/support ready for next stage

---

## 5. UX/UI Design for AI Tools

### RULE 5.1: Progressive Disclosure

**Statement**: Show complexity only when relevant. Default to simple, reveal depth on demand.

**Rationale**:

- Overwhelming users with options = paralysis
- Power users can find advanced features
- Good defaults cover 80% of cases

**Examples**:

```typescript
// ✅ GOOD: Simple default, advanced options hidden
<SearchBox
  placeholder="Search code..."
  onSearch={handleSearch}
  // Advanced options in collapsible panel
  advancedOptions={<SearchFilters />}
/>

// ❌ BAD: All options exposed always
<SearchBox>
  <Input placeholder="Query" />
  <Input placeholder="File glob" />
  <Input placeholder="Case sensitive" />
  <Input placeholder="Max results" />
  <Input placeholder="Timeout (ms)" />
  <Input placeholder="Context lines" />
  {/* 20 more options... */}
</SearchBox>
```

**Rule of Thumb**: If a feature is used by <20% of users, hide it in "Advanced" or "More options".

---

### RULE 5.2: Intuitive Interactions

**Statement**: Users should be able to guess how to use features without reading docs.

**Rationale**:

- Docs are last resort, not first stop
- Intuitive = faster adoption, less support burden
- Leverage existing mental models (CLI, VS Code, etc.)

**Examples from Claude Code**:

- `/` = slash commands (like Slack)
- `Shift+Tab` = plan mode (like Tab but "reverse" = slower, more thoughtful)
- `Ctrl+C` = stop execution (universal CLI pattern)
- `?` at end of command = help (CLI convention)

**For MADACE**:

```bash
# ✅ Intuitive CLI patterns
madace chat           # Start chat (obvious)
madace agents list    # List agents (standard verb-noun)
madace help agents    # Help for agents command

# ❌ Non-intuitive
madace -c             # What does -c mean?
madace fetch agents   # "fetch" is not standard
```

---

### RULE 5.3: Good Defaults, Few Settings

**Statement**: Optimize for 80% use case with defaults. Minimize settings that require decisions.

**Rationale**:

- Every setting is a decision users must make
- Good defaults = works out of the box
- Settings burden compounds over time

**Implementation**:

```typescript
// ✅ GOOD: Sensible defaults, few settings
const DEFAULT_CONFIG = {
  llmProvider: 'gemini', // Free, fast, good quality
  maxTokens: 2048, // Works for 90% of tasks
  temperature: 0.7, // Balanced creativity/determinism
  autoSave: true, // Always want this
  theme: 'system', // Respect OS preference
};

// ❌ BAD: Everything is a setting
const CONFIG = {
  llmProvider: 'openai', // But requires API key setup
  maxTokens: 4096, // Too expensive for most tasks
  temperature: 1.0, // Too creative, fails often
  autoSave: false, // Users will lose work
  theme: 'light', // Ignores OS dark mode
  requestTimeout: 30000, // Why is this configurable?
  retryAttempts: 3, // Why is this configurable?
  cacheEnabled: true, // Why is this configurable?
  // 50 more settings...
};
```

**Settings Audit**:

- Does >50% of users change this setting? → Keep it
- Does <10% of users change this setting? → Remove or make advanced
- Can we pick a good default? → Remove the setting

---

### RULE 5.4: Forgiving Errors, Clear Recovery

**Statement**: When things go wrong, show what happened and how to fix it.

**Rationale**:

- AI is fallible; errors will happen
- Users shouldn't feel stuck or blame themselves
- Clear error messages = learning opportunities

**Examples**:

```typescript
// ✅ GOOD: Clear error with recovery steps
throw new Error(
  'Failed to load agent "pm".\n\n' +
    'Possible causes:\n' +
    '1. Agent not found in database\n' +
    '2. Invalid agent YAML syntax\n\n' +
    'To fix:\n' +
    '- Run: npm run import-madace-v3\n' +
    '- Or check: prisma/dev.db for agent records\n\n' +
    'Need help? See docs/TROUBLESHOOTING.md'
);

// ❌ BAD: Cryptic error
throw new Error('Agent load failed');

// ❌ BAD: Blaming user
throw new Error('You provided an invalid agent name');
```

**Error Message Checklist**:

- [ ] What went wrong? (clear description)
- [ ] Why did it go wrong? (root cause if known)
- [ ] How to fix it? (actionable steps)
- [ ] Where to get help? (docs, support, logs)

---

## 6. Code Quality & Maintenance

### RULE 6.1: Settings in Codebase (CLAUDE.md)

**Statement**: Project-specific settings live in repo as CLAUDE.md, not in central config.

**Rationale**:

- Settings are code (version controlled, reviewed, documented)
- Each project can customize without global pollution
- Onboarding = clone repo, start using (no setup)

**Implementation**:

```markdown
<!-- CLAUDE.md (or MADACE.md) -->

# Project Configuration

**LLM Provider**: gemini-2.0-flash-exp (free, fast)
**Context Budget**: 200k tokens (enough for large refactors)
**Auto-approved commands**:

- npm run dev
- npm run build
- npm test
- git commit -m "..."

**Custom Slash Commands**:

- /review-pr [number] - Review PR and suggest improvements
- /add-tests [file] - Generate tests for file
- /refactor [pattern] - Apply refactoring pattern
```

**Benefits**:

- New team members get project-specific setup automatically
- Settings evolve with project (reviewed in PRs)
- No central "god config" that breaks projects

---

### RULE 6.2: Memory Management & Deletion Strategy

**Statement**: Be aggressive about pruning context and deleting unnecessary data.

**Rationale**:

- Context windows are expensive
- More context ≠ better results (often worse)
- Only keep what's actively relevant

**Implementation in MADACE**:

```typescript
// Agent memory pruning
async function pruneAgentMemory(sessionId: string) {
  // Delete expired memory (>7 days old, low importance)
  await prisma.agentMemory.deleteMany({
    where: {
      sessionId,
      OR: [
        { expiresAt: { lt: new Date() } },
        {
          importance: { lte: 3 },
          createdAt: { lt: subDays(new Date(), 7) },
        },
      ],
    },
  });

  // Keep only recent high-importance memory
  const keepThreshold = subDays(new Date(), 30);
  await prisma.agentMemory.deleteMany({
    where: {
      sessionId,
      importance: { lte: 5 },
      createdAt: { lt: keepThreshold },
    },
  });
}
```

**Deletion Triggers**:

- Memory >30 days old + importance <5 → DELETE
- Message history >100 messages → Summarize + delete originals
- Chat sessions with no activity >90 days → Archive or delete
- Unused agents (0 invocations in 180 days) → Archive

---

### RULE 6.3: Prefer Deletion Over Deactivation

**Statement**: When removing functionality, delete the code. Don't just hide it behind flags.

**Rationale**:

- Dead code increases cognitive load
- Flags compound (2^n combinations to test)
- Git history preserves deleted code if needed

**Implementation**:

```typescript
// ✅ GOOD: Delete unused code
// Before:
// - Complex feature flag system
// - 500 lines of unused code paths
// - 10 if/else branches checking flags
// After:
// - Feature removed entirely
// - Code deleted
// - Git tag created for rollback if needed

// ❌ BAD: Hide behind flags
if (featureFlags.oldWorkflowEngine) {
  // 500 lines of old code
} else {
  // 500 lines of new code
}
// Now you have 1000 lines to maintain!
```

**Process**:

1. Announce deprecation (30 days)
2. Track usage (should drop to near-zero)
3. Create git tag: `before-removal-of-feature-x`
4. Delete code entirely
5. Update docs
6. Monitor for issues (can revert from tag if needed)

---

### RULE 6.4: Console.log Cleanup

**Statement**: Production code should have ZERO console.log statements (except intentional logging).

**Rationale**:

- Console spam = noise that hides real issues
- Security risk (leaking sensitive data)
- Unprofessional in production

**Implementation**:

```typescript
// ✅ GOOD: Use proper logging
import { logger } from '@/lib/logging';

logger.info('Agent loaded', { agentId: agent.id });
logger.error('Failed to connect to LLM', { error, provider });

// ✅ GOOD: Intentional output in CLI
console.log(chalk.green('✓ Build successful'));

// ❌ BAD: Debug console.logs
console.log('here');
console.log('agent:', agent);
console.log('testing this function');
```

**Enforcement**:

```json
// eslint.config.js
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

**Pre-commit Hook**:

```bash
#!/bin/bash
# Fail if console.log found (except in allowed files)
if git diff --cached | grep -E "console\.(log|debug|info)" | grep -v "bin/madace.ts"; then
  echo "❌ console.log found in staged files"
  exit 1
fi
```

---

### RULE 6.5: Error Recovery UX

**Statement**: When LLM APIs fail, show clear status, explain what happened, and offer actionable recovery options.

**Rationale**:

- API failures are inevitable (overload, rate limits, network issues)
- Users shouldn't feel stuck or frustrated
- Clear guidance → faster recovery → better experience
- Empowers users to self-solve problems

**Error Types & Recovery**:

| Error Type               | User Sees                            | Recovery Options                                           |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| **Overloaded (503)**     | "Claude API is currently overloaded" | Retry (30s), Switch to Gemini, Switch to Local             |
| **Rate Limit (429)**     | "Rate limit reached"                 | Wait 60s, Switch provider                                  |
| **Auth Failed (401)**    | "API key invalid or missing"         | Check .env file, Add API key, Use different provider       |
| **Network Error**        | "Failed to connect to API"           | Check internet, Retry, Use local                           |
| **All Providers Failed** | "All LLM providers unavailable"      | Check API keys, Check status pages, Try again in 5 minutes |

**Implementation**:

```typescript
// components/features/chat/ErrorRecovery.tsx
import { ErrorRecovery } from '@/components/features/chat/ErrorRecovery';

function ChatInterface() {
  const [error, setError] = useState<Error | null>(null);

  return (
    <div>
      {error && (
        <ErrorRecovery
          error={error}
          currentProvider={provider}
          onRetry={() => retryLastRequest()}
          onSwitchProvider={(newProvider) => {
            setProvider(newProvider);
            retryLastRequest();
          }}
          onDismiss={() => setError(null)}
        />
      )}
      {/* Chat interface */}
    </div>
  );
}
```

**Error Recovery Component Features**:

```typescript
✅ DO:
- Show error severity (warning/error color coding)
- Explain what went wrong in plain language
- Offer 2-3 specific recovery actions
- Link to provider status pages
- Show technical details in collapsible section
- Auto-dismiss after successful retry

❌ DON'T:
- Show raw stack traces to users
- Use technical jargon ("503", "ECONNRESET")
- Blame the user ("You entered an invalid...")
- Hide the error without explanation
- Force users to restart the app
```

**User Flow Example**:

```
1. User sends message
   ↓
2. Claude API returns "Overloaded"
   ↓
3. Show error banner:
   "⚠️ Claude API is currently overloaded
    This usually resolves in 30-60 seconds.

    [Retry with Claude]  [Switch to Gemini]  [Use Local Ollama]

    Status: https://status.anthropic.com"
   ↓
4. User clicks "Switch to Gemini"
   ↓
5. Request succeeds, error banner auto-dismisses
   ↓
6. Show subtle notification: "✓ Now using Gemini"
```

**Success Metrics**:

- > 90% of users resolve errors without support
- Average time to recovery <30 seconds
- <5% of users abandon after error

**Provider Status Links**:

- Claude: https://status.anthropic.com
- Google Cloud (Gemini): https://status.cloud.google.com
- OpenAI: https://status.openai.com

---

## 7. Power User Patterns

### RULE 7.1: Slash Commands for Workflows

**Statement**: Common workflows should have slash commands for one-step execution.

**Rationale**:

- Faster than typing full instructions
- Encodes best practices
- Shareable across team

**Examples from Claude Code**:

```
/add-tests [file]          # Generate tests for file
/fix-types                 # Fix TypeScript errors
/review-pr [number]        # Review GitHub PR
/migrate-db                # Run database migrations
```

**For MADACE**:

```
/agent-create [name]       # Create new agent interactively
/workflow-run [name]       # Execute workflow
/status-sync               # Sync workflow-status.md with DB
/review-code [file]        # Review code for issues
/add-docs [file]           # Generate documentation
```

**Implementation**:

```markdown
<!-- .claude/commands/agent-create.md -->

Create a new MADACE agent with the following steps:

1. Ask user for agent name, title, module
2. Generate agent YAML from template
3. Import to database
4. Verify in Prisma Studio
5. Show usage example
```

---

### RULE 7.2: Hooks for Automation

**Statement**: Use hooks to automate quality checks and common tasks.

**Rationale**:

- Deterministic outcomes from stochastic processes
- Catches errors before they propagate
- Encodes team standards

**Hook Types**:

```json
{
  "user-prompt-submit-hook": "npm run format",
  "before-commit-hook": "npm run check-all",
  "after-edit-hook": "npm run type-check",
  "before-push-hook": "npm run test:e2e"
}
```

**Advanced Patterns**:

```bash
# Context-aware hooks
before-commit-hook: |
  if [[ $(git diff --cached | grep -c "prisma/schema.prisma") -gt 0 ]]; then
    npm run db:generate
  fi
  npm run check-all

# Conditional hooks
after-edit-hook: |
  # Only type-check if .ts files changed
  if [[ $CHANGED_FILE == *.ts ]]; then
    npm run type-check
  fi
```

---

### RULE 7.3: Keyboard Shortcuts & Efficiency

**Statement**: Critical workflows should have muscle-memory shortcuts.

**Rationale**:

- Speed = more iterations = better results
- Reduces cognitive load
- Professional tools optimize for experts

**Essential Shortcuts**:

```
Shift+Tab           # Plan mode (before complex tasks)
Ctrl+C              # Stop execution
Ctrl+D              # Exit REPL/chat
Tab                 # Autocomplete (CLI)
↑/↓                 # History navigation
/                   # Slash commands
?                   # Help for current context
```

**For MADACE CLI**:

```typescript
// Autocomplete for agent names
readline.on('tab', async () => {
  const agents = await getAllAgents();
  const matches = agents.filter((a) => a.name.startsWith(currentInput));
  showCompletions(matches);
});

// History with Ctrl+R search
readline.on('ctrl+r', () => {
  showHistorySearch();
});
```

---

## 8. Anti-Patterns (What NOT to Do)

### ANTI-PATTERN 8.1: Vector Embeddings as Default

**Problem**: Using vector embeddings for all search/retrieval tasks.

**Why it's bad**:

- Less deterministic than grep
- Adds infrastructure complexity
- Often worse than agentic search
- Harder to debug

**When it's justified**:

- Natural language search over >100k files
- Semantic similarity tasks (not exact match)
- No other way to find relevant content

**Better Alternative**: Agentic search with grep/ripgrep

---

### ANTI-PATTERN 8.2: Over-Automation

**Problem**: Automating steps that need human judgment.

**Why it's bad**:

- Removes user control
- Increases error blast radius
- Creates distrust in AI

**Examples**:

```
❌ BAD: Auto-commit all changes without review
❌ BAD: Auto-merge PRs based on AI approval
❌ BAD: Auto-deploy to production without tests
```

**Better Approach**: Automate preparation, let human approve execution

```
✅ GOOD: AI generates commit message, user reviews/edits
✅ GOOD: AI suggests PR changes, user approves merge
✅ GOOD: AI runs all tests, user clicks deploy
```

---

### ANTI-PATTERN 8.3: Feature Bloat

**Problem**: Adding features without removing old ones.

**Why it's bad**:

- Cognitive overhead compounds
- Maintenance burden grows quadratically
- Obscures core value proposition

**Symptoms**:

- Users ask "which way should I do X?"
- Multiple ways to accomplish same task
- Feature usage <10% but not removed

**Solution**: Aggressive unshipping (see RULE 2.2)

---

### ANTI-PATTERN 8.4: Settings Explosion

**Problem**: Every preference becomes a setting.

**Why it's bad**:

- Decision fatigue
- Combinatorial testing nightmare
- Obscures good defaults

**Example from Real Projects**:

```
❌ BAD: 50+ settings in config file
- LLM provider (8 options)
- Temperature (0.0-2.0, 0.1 increments = 20 options)
- Max tokens (100-100000, user must know what's reasonable)
- Timeout (1-300 seconds)
- Retry attempts (0-10)
- Cache TTL (0-86400 seconds)
- ... 44 more settings
```

**Better**:

```
✅ GOOD: 5-8 settings, all with great defaults
- LLM provider: gemini (free, fast, good quality)
- Temperature: 0.7 (balanced, rarely needs tuning)
- Max tokens: 2048 (works for 90% of tasks)
- Theme: system (respects OS)
- Auto-save: true (prevents data loss)
```

**Rule**: If <20% of users change a setting, remove it and pick best default.

---

### ANTI-PATTERN 8.5: Ignoring Dogfooding Signals

**Problem**: Building features the team doesn't use themselves.

**Why it's bad**:

- Blind to quality issues
- Misaligned priorities
- Wasted effort on wrong problems

**Symptoms**:

- "I don't actually use this feature"
- "It works for users but not for me"
- "I have a workaround for this bug"

**Solution**: If you wouldn't use it daily, don't ship it. (See RULE 1.1 and RULE 4.1)

---

### ANTI-PATTERN 8.6: Documentation Instead of Intuitive Design

**Problem**: Relying on docs to explain non-intuitive features.

**Why it's bad**:

- Users don't read docs
- Docs become outdated
- Band-aid for bad UX

**Example**:

```
❌ BAD:
Feature: "Use --x-flag-mode-advanced to enable fast processing"
Docs: "The --x-flag-mode-advanced flag activates the optimized code path..."

✅ GOOD:
Feature: "madace process --fast"
No docs needed: --fast is self-explanatory
```

**Rule**: If you're writing docs to explain how to use a feature, redesign the feature.

---

## 9. Implementation Checklist

Use this checklist when building new features:

### Before Starting

- [ ] Will I personally use this feature daily?
- [ ] Have I validated demand (latent or explicit)?
- [ ] Can I demo it in <5 minutes?
- [ ] Does it compound with existing features?

### During Development

- [ ] Plan mode used for complex tasks (Shift+Tab)
- [ ] Hooks enforce quality (type-check, lint, format)
- [ ] Tools work for both humans and AI
- [ ] Defaults are optimized for 80% use case
- [ ] Progressive disclosure hides complexity

### Before Shipping

- [ ] Dogfooded for 3+ days
- [ ] Team tested for 1+ week
- [ ] No console.log in production code
- [ ] Tests pass (unit + E2E)
- [ ] Docs updated (or feature is intuitive enough)
- [ ] Usage metrics instrumented
- [ ] Unship plan documented (if usage <5% after 3 months)

### After Shipping

- [ ] Monitor usage metrics
- [ ] Watch for abuse patterns (latent demand)
- [ ] Prune old features if usage drops
- [ ] Iterate based on dogfooding feedback

---

## 10. Philosophy & Culture

### Compounding Quality

- Each feature should make the product better AND make future features easier
- Test: "Does this unlock new capabilities or just add surface area?"

### Demos Over Docs

- Show, don't tell
- Video > screenshot > text
- Live demo = instant understanding

### Unshipping is Shipping

- Removal improves product
- Celebrate deletions as much as additions
- Simple > feature-rich

### Build for Yourself

- Use MADACE to build MADACE
- Scratch your own itch
- If you wouldn't use it, don't ship it

### Latent Demand

- Watch how users "abuse" your product
- Hackability reveals unmet needs
- Build for the workarounds you see

---

## Quick Reference Card

**Core Principles**: Build for yourself • Latent demand • Demos over docs • Hackability • Ant-fooding

**Development Rules**:

- Prototype → Rebuild → Rebuild → Ship
- Unship aggressively (<5% usage = remove)
- Compounding engineering (each feature enables next)
- Bottoms-up (team builds what they need)

**AI Architecture**:

- Dual-use tools (human + AI)
- Agentic search > embeddings
- Sub-agents for complex tasks
- Plan mode for alignment
- Stop hooks for determinism
- **Provider resilience (retry + fallback)**

**Team Practices**:

- 70%+ dogfooding
- Code review with AI
- Ship to self → team → users
- Celebrate deletions

**UX Design**:

- Progressive disclosure
- Intuitive interactions
- Good defaults, few settings
- Forgiving errors

**Quality**:

- Settings in codebase (CLAUDE.md)
- Aggressive memory pruning
- Delete > deactivate
- Zero console.log in production
- **Error recovery UX (clear guidance)**

**Anti-Patterns to AVOID**:

- Vector embeddings as default
- Over-automation
- Feature bloat
- Settings explosion
- Ignoring dogfooding signals
- Docs instead of intuitive design

---

**Last Updated**: 2025-10-31
**Version**: 1.1 (Added RULE 3.6: Provider Resilience, RULE 6.5: Error Recovery UX)
**Source**: "Inside Claude Code From the Engineers Who Built It" podcast + MADACE production experience
**Maintained by**: MADACE Team
