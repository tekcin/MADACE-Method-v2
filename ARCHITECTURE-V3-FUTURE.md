# MADACE-Method v3.0 - Future Architecture Vision

> **⚠️ IMPORTANT: FUTURE VISION DOCUMENT**
>
> This document describes the **future architecture for MADACE v3.0**, planned for 2026+.
>
> **This is NOT the current architecture.**
>
> - **For v2.0 current architecture:** See [PRD.md](./PRD.md) Section 3 "System Architecture"
> - **For comprehensive v2.0 technical details:** See [CLAUDE.md](./CLAUDE.md)
> - **For v3.0 product vision:** See [ROADMAP-V3-FUTURE-VISION.md](./ROADMAP-V3-FUTURE-VISION.md)
>
> **Current Project:** MADACE-Method v2.0 - Next.js 15 Full-Stack TypeScript (Alpha)
>
> **v3.0 Timeline:** Q3 2026+ (after v2.0 stable release)

**Project:** MADACE-Method v3.0
**Version:** 3.0.0-future-vision
**Document Status:** Future Architecture Proposal
**Last Updated:** 2025-10-21

---

## 1. Overview

This document introduces a set of architectural changes and new features designed to make the MADACE-Method more dynamic, intelligent, and user-friendly. The proposed changes are focused on three key areas: Agents, CLI, and the Web Interface.

---

## 2. Agent Enhancements

To make the agents more dynamic, intelligent, and easier to interact with, we propose the following:

### 2.1. Dynamic Agent Management

- **Problem:** Currently, agents are statically defined in YAML files, which makes it difficult to create or modify them without manual intervention.
- **Proposal:** Implement a system for dynamic agent management, allowing users to create, edit, and delete agents through the web UI or CLI.
- **Implementation:**
  - Store agent definitions in a database (e.g., SQLite, PostgreSQL) instead of YAML files.
  - Create a new set of API routes for managing agents (e.g., `POST /api/agents`, `PUT /api/agents/:id`, `DELETE /api/agents/:id`).
  - Develop a user-friendly interface in the web UI for managing agents.

### 2.2. Agent Sidecar Customization System ✨ _Inspired by BMAD v6_

- **Problem:** Agents get overwritten when MADACE updates, losing user customizations.
- **Proposal:** Implement update-safe agent customization via "sidecar" configuration files.
- **Implementation:**
  - **Sidecar Files:** `madace-data/config/agents/{agent-name}.override.yaml`
  - **Override System:**
    ```yaml
    # pm.override.yaml - customize PM agent
    metadata:
      name: 'Project Manager Pro' # Override display name
    persona:
      communication_style: 'concise' # Override style
      language: 'es' # Spanish communication
    prompts:
      plan_project: 'Custom PRD template...' # Override specific prompt
    ```
  - **Merge Strategy:**
    1. Load base agent from `madace/mam/agents/pm.agent.yaml`
    2. Load sidecar from `madace-data/config/agents/pm.override.yaml`
    3. Deep merge: sidecar values override base values
    4. Runtime composition (never modify base files)
  - **Supported Overrides:**
    - Agent display name, icon, version
    - Communication style, language, technical level
    - Individual prompt templates
    - Menu structure and command labels
  - **UI Features:**
    - Web UI: Agent customization editor with live preview
    - Validation: Zod schema ensures override validity
    - Reset: One-click restore to defaults

### 2.3. Conversational Interaction

- **Problem:** The current interaction with agents is limited to a predefined menu of commands, which can be restrictive.
- **Proposal:** Implement a conversational interface for agents, allowing for more natural and flexible interactions.
- **Implementation:**
  - Integrate a Natural Language Understanding (NLU) service (e.g., Dialogflow, Rasa) to process user input.
  - Implement a chat interface in the web UI for conversational interaction with agents.
  - Develop a more sophisticated dialogue management system for agents to handle conversations.

### 2.4. Persistent Agent Memory

- **Problem:** Agents are currently stateless and do not remember past interactions.
- **Proposal:** Introduce a memory system for agents to enable them to retain context and learn from past interactions.
- **Implementation:**
  - Use a database to store the agent's memory, including information about the user, the project, and past conversations.
  - Enable agents to access and update their memory during conversations to provide more personalized and context-aware responses.

### 2.5. Story-Context Workflow ✨ _Inspired by BMAD v6_

- **Problem:** Agents lack project-specific context when implementing stories, leading to generic solutions.
- **Proposal:** Just-in-time context gathering system that provides agents with precisely relevant information.
- **Implementation:**
  - **Context Workflow:** `workflows/story-context.workflow.yaml`
  - **Trigger:** Automatically runs before story implementation begins
  - **Context Sources:**

    ```yaml
    context_layers:
      - layer: 'story_requirements'
        source: '${PROJECT_OUTPUT}/stories/${STORY_ID}.md'

      - layer: 'related_code'
        source: 'codebase_search'
        queries:
          - 'files modified in epic'
          - 'similar feature implementations'
          - 'API endpoints mentioned in story'

      - layer: 'dependencies'
        source: 'dependency_graph'
        include:
          - 'imported modules'
          - 'shared utilities'
          - 'database models'

      - layer: 'testing_context'
        source: 'test_files'
        patterns:
          - '**/*${FEATURE_NAME}*.test.ts'
          - '**/*${FEATURE_NAME}*.spec.ts'

      - layer: 'architectural_constraints'
        source: '${PROJECT_OUTPUT}/architecture.md'
        sections:
          - 'relevant technology stack'
          - 'coding standards'
          - 'security requirements'
    ```

  - **Output:** `${PROJECT_OUTPUT}/story-context/${STORY_ID}-context.md`
  - **Benefits:**
    - **Precision:** Only relevant files, not entire codebase
    - **Freshness:** Generated on-demand (not stale snapshots)
    - **Efficiency:** Reduces LLM token usage (5-10% of full codebase)
    - **Quality:** Agents produce solutions consistent with existing code
  - **Integration:** Dev Agent automatically receives context file during story implementation

---

## 3. CLI Advancements

To make the CLI a more powerful and user-friendly tool, we suggest the following improvements:

### 3.1. Interactive Mode

- **Problem:** The current CLI is non-interactive and requires users to know the exact commands to execute.
- **Proposal:** Enhance the CLI with an interactive mode that guides users through commands with prompts and suggestions.
- **Implementation:**
  - Use a library like `inquirer.js` to create interactive command-line interfaces.
  - Implement a REPL (Read-Eval-Print Loop) for a more fluid and exploratory interaction with agents and workflows.

### 3.2. Universal Workflow Status Checker ✨ _Inspired by BMAD v6_

- **Problem:** No unified way to check workflow status across different contexts (epic, story, workflow, state machine).
- **Proposal:** Single command to check status of any workflow entity with intelligent context detection.
- **Implementation:**
  - **Command:** `madace status [entity]` or `madace check [entity]`
  - **Context Detection:**

    ```bash
    # Epic status
    madace status epic-001
    # Output: Epic status, tech specs, story breakdown, completion %

    # Story status
    madace status story-F11-SUB-WORKFLOWS
    # Output: Story state (TODO/IN_PROGRESS/DONE), assigned agent, blockers

    # Workflow status
    madace status plan-project
    # Output: Current step, completed steps, pending steps, last execution

    # State machine overview
    madace status
    # Output: Kanban view (BACKLOG/TODO/IN_PROGRESS/DONE counts)
    ```

  - **Status Providers:**
    - **Epic Provider:** Reads `docs/epics/${epic-id}.md`, tech specs, stories
    - **Story Provider:** Reads `docs/mam-workflow-status.md` for current state
    - **Workflow Provider:** Reads `.${workflow}.state.json` files
    - **State Machine Provider:** Aggregates all story states
  - **Output Formats:**
    - `--format=table` (default): ASCII table
    - `--format=json`: Machine-readable JSON
    - `--format=markdown`: Documentation-ready format
  - **Real-time Updates:**
    - Watch mode: `madace status --watch` (polls every 2s)
    - WebSocket integration: Live updates from workflow engine
  - **Benefits:**
    - **Unified Interface:** One command for all status checks
    - **Context-Aware:** Automatically detects entity type
    - **Developer-Friendly:** Works in CI/CD, scripts, dashboards
    - **Cross-Platform:** Works in CLI, Web UI, IDE extensions

### 3.3. Terminal Dashboard

- **Problem:** There is no easy way to monitor the system's state from the CLI.
- **Proposal:** Create a text-based dashboard within the CLI to provide a real-time overview of agents, workflows, and the state machine.
- **Implementation:**
  - Use a library like `blessed` or `neo-blessed` to create a text-based user interface (TUI) in the terminal.
  - The dashboard would display key information in a compact and terminal-friendly format.
  - **Integration:** Universal Status Checker powers the dashboard with real-time data.

### 3.4. Feature Parity with Web UI

- **Problem:** The CLI currently has limited functionality compared to the web UI.
- **Proposal:** Elevate the CLI to be a first-class interface with the same capabilities as the web UI.
- **Implementation:**
  - Implement all the features of the web UI in the CLI to provide a consistent user experience across both interfaces.

---

## 4. Web Interface and Configuration Overhaul

To improve the web interface and simplify configuration management, we recommend the following:

### 4.1. Unified Configuration

- **Problem:** The configuration is currently fragmented across YAML files, `.env` files, and browser localStorage.
- **Proposal:** Consolidate all configuration into a single, unified source of truth, such as a database.
- **Implementation:**
  - Use a database to store all configuration settings.
  - The web UI and the CLI would both read and write the configuration from the database, simplifying management and improving robustness.

### 4.2. Enhanced Setup Wizard ✨ _Inspired by BMAD v6_

- **Problem:** Initial setup is complex and doesn't capture important user preferences.
- **Proposal:** Comprehensive multi-step wizard that configures system for optimal user experience.
- **Implementation:**
  - **Wizard Steps:**
    1. **User Profile:**
       - Your name (for agent personalization)
       - Technical expertise level (beginner/intermediate/advanced)
       - Preferred programming languages
       - Team size (solo/small team/enterprise)
    2. **Communication Preferences:**
       - Communication language (English, Spanish, French, German, etc.)
       - Agent communication style (formal/casual/concise/detailed)
       - Documentation language (can differ from communication language)
       - Explanation depth (high-level summaries vs detailed technical)
    3. **Project Configuration:**
       - Project name and output folder
       - Project type (web, mobile, embedded, game, etc.)
       - Project scale (Level 0-4 for Scale-Adaptive Router)
       - Existing codebase or greenfield
    4. **LLM Configuration:**
       - Provider selection (Gemini, Claude, OpenAI, Local)
       - API key configuration (with test validation)
       - Model selection per use case (planning vs implementation)
    5. **Module Selection:**
       - MAM (MADACE Agile Method)
       - MAB (MADACE Builder)
       - CIS (Creative Intelligence Suite)
    6. **IDE Integration:** _(Optional)_
       - Claude CLI integration
       - Gemini CLI integration
       - VSCode extension setup
  - **Persistence:**
    - Saves to `madace-data/config/config.yaml`
    - Generates `.env` file with API keys
    - Creates agent sidecar overrides based on preferences
  - **Smart Defaults:**
    - Pre-fill common configurations
    - Detect IDE from environment
    - Auto-detect project type from existing files
  - **Validation:**
    - Test LLM connection before proceeding
    - Verify write permissions to output folder
    - Check for conflicting configurations
  - **Migration:**
    - Import settings from BMAD installations
    - Upgrade from v2.0 configurations
    - Preserve custom agent overrides

### 4.3. Integrated Web IDE

- **Problem:** The web interface is currently limited to configuration and monitoring.
- **Proposal:** Extend the web interface into a full-fledged, web-based IDE for MADACE.
- **Implementation:**
  - Integrate a web-based code editor like Monaco Editor.
  - Provide a file explorer to navigate the project files.
  - Integrate a terminal in the web UI.

### 4.4. Real-time Collaboration

- **Problem:** The current system is single-user and does not support collaboration.
- **Proposal:** Enable multiple users to collaborate on the same project in real-time.
- **Implementation:**
  - Use WebSockets to enable real-time communication between clients.
  - Implement collaborative features like shared cursors, live editing, and in-app chat.
  - **Foundation:** v2.0 already has WebSocket sync (port 3001) for CLI-Web UI communication.

---

## 5. Workflow Intelligence System ✨ _Inspired by BMAD v6_

Advanced workflow capabilities that adapt to project complexity and automate documentation.

### 5.1. Scale-Adaptive Workflow Router

- **Problem:** One-size-fits-all workflows don't work for projects of different scales (simple scripts vs enterprise systems).
- **Proposal:** Dynamic workflow routing based on project complexity assessment.
- **Implementation:**
  - **Complexity Levels:**
    - **Level 0:** Simple scripts, utility tools, quick experiments
      - Skip: Architecture, Tech Specs, Epic breakdown
      - Output: Direct story creation
    - **Level 1:** Small applications, internal tools, prototypes
      - Skip: Architecture
      - Output: Lightweight PRD + Stories
    - **Level 2:** Production applications, team projects
      - Output: Standard PRD + Stories + Basic Architecture
    - **Level 3:** Complex systems, multiple integrations
      - Output: Detailed PRD + Epics + Tech Specs + Architecture
    - **Level 4:** Enterprise-scale, distributed systems
      - Output: Comprehensive PRD + Epics + Detailed Tech Specs + Architecture + Security/DevOps Specs
  - **Assessment Criteria:**
    ```typescript
    interface ComplexityAssessment {
      projectSize: 'small' | 'medium' | 'large' | 'enterprise';
      teamSize: number;
      existingCodebase: boolean;
      codebaseSize?: number; // lines of code
      integrationCount: number; // external APIs, services
      userBase: 'internal' | 'small' | 'medium' | 'large';
      securityRequirements: 'basic' | 'standard' | 'high' | 'critical';
      estimatedDuration: number; // weeks
    }
    ```
  - **Router Logic:**

    ```yaml
    # workflows/route-workflow.yaml
    steps:
      - name: 'Assess Project Complexity'
        action: elicit
        prompt: |
          Based on project details, determine complexity level (0-4).
          Consider: team size, codebase size, integrations, timeline, security needs.

      - name: 'Select Workflow Path'
        action: route
        routing:
          level_0:
            workflows: ['create-stories']
          level_1:
            workflows: ['plan-project-light', 'create-stories']
          level_2:
            workflows:
              ['plan-project', 'create-architecture-basic', 'create-epics', 'create-stories']
          level_3:
            workflows:
              [
                'plan-project',
                'create-tech-specs',
                'create-architecture',
                'create-epics',
                'create-stories',
              ]
          level_4:
            workflows:
              [
                'plan-project',
                'create-tech-specs',
                'create-architecture',
                'create-security-spec',
                'create-devops-spec',
                'create-epics',
                'create-stories',
              ]
    ```

  - **Benefits:**
    - **Efficiency:** Don't over-engineer simple projects
    - **Thoroughness:** Don't under-plan complex systems
    - **Flexibility:** User can override auto-detected level
    - **Speed:** Level 0 projects can start coding in minutes

### 5.2. Just-In-Time (JIT) Technical Specifications

- **Problem:** Creating tech specs for all epics upfront wastes time if requirements change.
- **Proposal:** Generate tech specs on-demand when epic implementation begins.
- **Implementation:**
  - **Trigger:** When epic transitions from BACKLOG to TODO
  - **Workflow:** `workflows/generate-tech-spec.workflow.yaml`
  - **Process:**

    ```yaml
    steps:
      - name: 'Load Epic Details'
        action: load_state_machine
        entity: 'epic'
        entity_id: '${EPIC_ID}'

      - name: 'Gather Technical Context'
        action: sub-workflow
        workflow_path: 'workflows/tech-context.workflow.yaml'
        context_vars:
          epic_file: '${PROJECT_OUTPUT}/epics/${EPIC_ID}.md'
          architecture_file: '${PROJECT_OUTPUT}/architecture.md'

      - name: 'Web Research' # If needed
        action: elicit
        prompt: |
          Are there external technologies, APIs, or standards we need to research?
          Examples: Payment gateways, auth protocols, cloud services

      - name: 'Generate Tech Spec'
        action: template
        template: 'tech-spec.hbs'
        output: '${PROJECT_OUTPUT}/tech-specs/${EPIC_ID}-spec.md'
        vars:
          epic_id: '${EPIC_ID}'
          epic_title: '${EPIC_TITLE}'
          context: '${TECH_CONTEXT}'
          research: '${RESEARCH_RESULTS}'
    ```

  - **Tech Spec Contents:**
    - Technical approach and architecture decisions
    - Data models and schemas
    - API contracts and interfaces
    - Technology stack choices for this epic
    - Integration points with existing code
    - Testing strategy
    - Performance considerations
    - Security implications
  - **Benefits:**
    - **Freshness:** Specs based on latest requirements
    - **Efficiency:** Only create specs for epics that get implemented
    - **Depth:** More time per spec = higher quality
    - **Relevance:** Includes recent web research (APIs may have updated)

### 5.3. Brownfield Analysis Workflow

- **Problem:** Starting MADACE on existing codebases is difficult without understanding current architecture.
- **Proposal:** Automated codebase documentation generation for existing projects.
- **Implementation:**
  - **Trigger:** User selects "Existing codebase" in setup wizard
  - **Workflow:** `workflows/brownfield-analysis.workflow.yaml`
  - **Process:**

    ```yaml
    steps:
      - name: 'Codebase Scan'
        action: analyze_codebase
        scan_types:
          - 'file_structure' # Directory tree, file counts
          - 'technology_stack' # Languages, frameworks, libraries
          - 'entry_points' # Main files, server.ts, index.ts
          - 'api_routes' # REST endpoints, GraphQL schemas
          - 'data_models' # Database schemas, TypeScript interfaces
          - 'dependencies' # package.json, requirements.txt
          - 'test_coverage' # Test files, coverage reports

      - name: 'Dependency Graph'
        action: build_dependency_graph
        output: '${PROJECT_OUTPUT}/brownfield/dependency-graph.json'

      - name: 'Architecture Inference'
        action: elicit
        prompt: |
          Based on the codebase scan, infer the current architecture:
          - Architectural pattern (MVC, microservices, layered, etc.)
          - Technology stack
          - Key modules and their responsibilities
          - External integrations

      - name: 'Generate Brownfield Report'
        action: template
        template: 'brownfield-report.hbs'
        output: '${PROJECT_OUTPUT}/brownfield/analysis-report.md'
        sections:
          - 'Executive Summary'
          - 'Technology Stack Analysis'
          - 'Architecture Overview'
          - 'Code Quality Metrics'
          - 'Technical Debt Assessment'
          - 'Recommended Refactoring Priorities'
          - 'Integration Points for New Features'

      - name: 'Create MADACE-Compatible Docs'
        action: template
        template: 'brownfield-architecture.hbs'
        output: '${PROJECT_OUTPUT}/architecture.md'
        format: 'madace_standard'
    ```

  - **Analysis Tools:**
    - **Static Analysis:** AST parsing for code structure
    - **Dependency Analysis:** npm/pip/cargo dependency trees
    - **Git History Analysis:** Change frequency, hot spots, contributors
    - **Test Coverage:** Existing test files and coverage reports
  - **Output Documents:**
    - `brownfield/analysis-report.md` - Detailed findings
    - `architecture.md` - MADACE-compatible architecture doc
    - `brownfield/dependency-graph.json` - Machine-readable graph
    - `brownfield/tech-debt.md` - Prioritized improvement list
  - **Benefits:**
    - **Fast Onboarding:** Understand legacy code in minutes
    - **MADACE Integration:** Auto-generates required MADACE docs
    - **Planning Input:** Architecture report feeds into PRD workflow
    - **Refactoring Roadmap:** Identifies technical debt upfront

### 5.4. Story Lifecycle Enhancements

- **Problem:** Current state machine (BACKLOG → TODO → IN_PROGRESS → DONE) lacks intermediate states.
- **Proposal:** Richer story lifecycle with review, testing, and blocking states.
- **Implementation:**
  - **Enhanced State Machine:**
    ```
    BACKLOG → TODO → IN_PROGRESS → REVIEW → TESTING → DONE
                ↓                    ↓          ↓
              BLOCKED            BLOCKED    BLOCKED
    ```
  - **State Definitions:**
    - **BACKLOG:** Story created, not yet prioritized
    - **TODO:** Ready for implementation (only 1 story allowed)
    - **IN_PROGRESS:** Developer actively working (only 1 story allowed)
    - **REVIEW:** Code review in progress (QA or peer review)
    - **TESTING:** Manual or automated testing
    - **BLOCKED:** Waiting on external dependency, decision, or fix
    - **DONE:** Completed and deployed
  - **State Metadata:**
    ```yaml
    - id: STORY-F11
      state: IN_PROGRESS
      assigned_to: 'DEV Agent'
      started_at: '2025-10-22T10:00:00Z'
      blocked_reason: null
      blocker_details: null
      reviewer: null
      test_results: null
    ```
  - **Workflow Integration:**
    - `transitionToReview()` - Triggered when dev work completes
    - `transitionToTesting()` - After code review passes
    - `transitionToBlocked()` - Can happen from any active state
    - `transitionToDone()` - After tests pass
  - **Blocking Management:**
    ```typescript
    interface StoryBlocker {
      story_id: string;
      blocked_at: string;
      reason: 'dependency' | 'decision' | 'bug' | 'external' | 'other';
      description: string;
      blocking_entity?: string; // e.g., "STORY-F10", "EPIC-003"
      unblock_actions: string[]; // What needs to happen to unblock
    }
    ```
  - **Benefits:**
    - **Visibility:** Clear status of each story
    - **Quality Gates:** Review and testing checkpoints
    - **Dependency Tracking:** Explicit blocking reasons
    - **Metrics:** Time in each state for velocity tracking

---

## 6. Implementation Roadmap

### Priority 0 (Critical - Q2 2026):

- **Scale-Adaptive Workflow Router** (5.1)
- **Universal Workflow Status Checker** (3.2)

### Priority 1 (High - Q2-Q3 2026):

- **Just-In-Time Tech Specs** (5.2)
- **Story-Context Workflow** (2.5)
- **Brownfield Analysis** (5.3)
- **Agent Sidecar Customization** (2.2)
- **Enhanced Setup Wizard** (4.2)

### Priority 2 (Medium - Q4 2026):

- **Story Lifecycle Enhancements** (5.4)

### Deferred to v3.1+ (2027):

- **Dynamic Agent Management** (2.1)
- **Conversational Interaction** (2.3)
- **Persistent Agent Memory** (2.4)
- **Interactive CLI Mode** (3.1)
- **Terminal Dashboard** (3.3)
- **CLI Feature Parity** (3.4)
- **Unified Configuration Database** (4.1)
- **Integrated Web IDE** (4.3)
- **Real-time Collaboration** (4.4)

---

## 7. Success Metrics

### Scale-Adaptive Router:

- Level 0 projects: <5 min from start to first story
- Level 4 projects: Complete documentation suite in <2 hours
- User satisfaction: 90%+ feel workflows match project needs

### Story-Context Workflow:

- Token reduction: 80-95% vs full codebase (measured)
- Implementation quality: 40% fewer revision requests
- Time savings: 30% faster story completion

### Brownfield Analysis:

- Analysis time: <10 minutes for 50k LOC codebase
- Documentation accuracy: 85%+ match manual assessment
- Adoption: 60%+ of brownfield projects use this workflow

### Universal Status Checker:

- Command usage: 50+ invocations per project
- Coverage: 100% of workflow entities supported
- Response time: <100ms for status queries

### JIT Tech Specs:

- Spec freshness: 100% based on current requirements
- Time savings: 50% reduction in spec creation time
- Relevance: 90%+ of generated specs used during implementation

---

## 8. Risk Mitigation

### Complexity Risk:

- **Issue:** Scale-Adaptive Router adds complexity
- **Mitigation:** Extensive testing at each level (0-4), user override option, clear documentation

### Performance Risk:

- **Issue:** Brownfield Analysis may be slow for large codebases
- **Mitigation:** Incremental analysis, caching, parallel processing, timeout limits

### Adoption Risk:

- **Issue:** Users may not understand new workflows
- **Mitigation:** Interactive tutorials, default presets, gradual rollout, migration guides

### Maintenance Risk:

- **Issue:** More features = more maintenance burden
- **Mitigation:** Comprehensive test coverage, modular architecture, automated CI/CD

---

## 9. Conclusion

This enhanced v3.0 architecture integrates proven innovations from BMAD v6 while maintaining MADACE's unique vision. The focus is on **intelligent automation** (Scale-Adaptive Router, JIT Tech Specs), **contextual awareness** (Story-Context, Brownfield Analysis), and **user empowerment** (Agent Sidecars, Enhanced Setup).

By combining MADACE's strengths (scale-adaptive planning, visual Kanban, multi-provider LLM) with BMAD's innovations (workflow intelligence, customization system, universal status), v3.0 will deliver a world-class AI-driven development methodology.

**Key Differentiators:**

- **MADACE:** Web-first, multi-provider LLM, visual Kanban, Docker-native
- **BMAD:** CLI-first, extensive customization, game development focus
- **v3.0:** Best of both worlds, production-ready, enterprise-scale
