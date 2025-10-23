# MADACE-Method v3.0 - Project Plan

> This document outlines the project plan for implementing the MADACE-Method v3.0 architecture.

---

## ⚠️ MANDATORY DEVELOPMENT CHECKLIST

Before implementing ANY feature in v3.0, developers MUST review and follow these rules:

### Pre-Implementation Checklist

- [ ] Read **ARCHITECTURE-V3.md** "CRITICAL DEVELOPMENT RULES" section
- [ ] Verify file access uses `existsSync()` checks before reading
- [ ] Confirm API routes return graceful fallbacks for missing files
- [ ] Ensure UI components match Prisma schema types exactly
- [ ] Verify all JSON fields (persona, menu, prompts) are handled as `JsonValue`
- [ ] Confirm all API routes have try-catch error handling
- [ ] Test both development AND production Docker builds
- [ ] Verify health checks pass with missing optional files

### Common Mistakes to Avoid

❌ **NEVER** assume development files exist in production
❌ **NEVER** flatten Prisma JSON fields into component props
❌ **NEVER** throw unhandled errors in API routes
❌ **NEVER** use `fs.readFile()` without existence checks
❌ **NEVER** create custom types that don't match Prisma schema

✅ **ALWAYS** check file existence with `existsSync()`
✅ **ALWAYS** return graceful fallbacks for missing files
✅ **ALWAYS** use Prisma-generated types from `@prisma/client`
✅ **ALWAYS** wrap async operations in try-catch blocks
✅ **ALWAYS** test in production Docker container before committing

### Testing Requirements

Every PR for v3.0 features MUST include:

1. **Development Testing**: Feature works in `npm run dev`
2. **Production Build**: `npm run build` succeeds with no errors
3. **Docker Testing**: Feature works in production Docker container
4. **Error Scenarios**: Tested with missing files and invalid data
5. **Type Safety**: `npm run type-check` passes with zero errors

### Code Review Checklist

Reviewers must verify:

- [ ] No direct file access without existence checks
- [ ] All API routes have proper error handling
- [ ] UI components use correct Prisma types
- [ ] No flattened JSON fields in components
- [ ] Production Docker build tested and working
- [ ] Health checks pass in all scenarios

---

## 1. Introduction

The goal of this project is to implement the new architecture for MADACE-Method v3.0, which will make the system more dynamic, intelligent, and user-friendly. This plan breaks down the project into phases and milestones to ensure a smooth and successful implementation.

---

## 2. Phases and Milestones

The project will be divided into three phases:

### Phase 1: Core Infrastructure (Estimated Time: 2-3 weeks)

This phase will focus on implementing the core infrastructure for the new architecture.

- **Milestone 1.1: Database and Unified Configuration**
  - Set up a database (SQLite for development, PostgreSQL for production).
  - Implement the Database Module with Prisma ORM.
  - Implement the Unified Configuration system, storing all configuration in the database.
  - Migrate the existing configuration to the new system.

- **Milestone 1.2: API Module**
  - Implement the API Module with endpoints for managing agents, workflows, and configuration.
  - Use Zod for API validation.

### Phase 2: Agent and CLI Enhancements (Estimated Time: 3-4 weeks)

This phase will focus on implementing the new features for agents and the CLI.

- **Milestone 2.1: Dynamic Agent Management**
  - Implement the Agent Manager module.
  - Create the web UI and CLI interfaces for managing agents.

- **Milestone 2.2: Interactive CLI**
  - Implement the Interactive CLI module with `inquirer.js`.
  - Implement the REPL for interactive sessions.

- **Milestone 2.3: Terminal Dashboard**
  - Implement the Terminal Dashboard module with `blessed` or `neo-blessed`.

- **Milestone 2.4: Persistent Agent Memory**
  - Implement the Persistent Agent Memory module.
  - Integrate it with the Conversational Engine.

### Phase 3: Web UI and Collaboration (Estimated Time: 4-6 weeks)

This phase will focus on implementing the new features for the web UI.

- **Milestone 3.1: Conversational Interaction**
  - Integrate an NLU service (e.g., Rasa).
  - Implement the Conversational Engine.
  - Implement the chat interface in the web UI.

- **Milestone 3.2: Integrated Web IDE**
  - Integrate Monaco Editor into the web UI.
  - Implement the file explorer and integrated terminal.

- **Milestone 3.3: Real-time Collaboration**
  - Implement the WebSocket server for real-time communication.
  - Implement a collaborative editing with Y.js.
  - Implement the chat component for real-time communication.

---

## 3. Timeline

This is a high-level timeline for the project. The actual timeline may vary depending on the resources and the complexity of the implementation.

- **Phase 1:** 2-3 weeks
- **Phase 2:** 3-4 weeks
- **Phase 3:** 4-6 weeks
- **Total Estimated Time:** 9-13 weeks

---

## 4. Resources

- **Development Team:** 2-3 developers with experience in TypeScript, React, Node.js, and database management.
- **NLU Service:** A subscription to an NLU service like Dialogflow or a self-hosted Rasa instance.
- **Infrastructure:** A server for hosting the database and the application.

---

## 5. Risks and Mitigation

- **Risk:** The implementation of the conversational interaction, integrated web IDE, and real-time collaboration features is complex and may take longer than expected.
- **Mitigation:** We will implement these features incrementally and prioritize the most important features first. We will also conduct thorough testing to ensure that they are reliable and performant.

- **Risk:** Dependency on external services like NLU providers may introduce costs and limitations.
- **Mitigation:** We will carefully evaluate different NLU providers and choose the one that best fits our needs and budget. We will also design the system in a way that it is easy to switch to a different provider if needed.
