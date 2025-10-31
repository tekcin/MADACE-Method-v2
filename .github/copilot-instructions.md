# Copilot / AI Agent Instructions — MADACE-Method v3.0

This file gives concise, actionable context so AI coding agents can be productive immediately in this repository.

Keep answers and code changes focused, small, and safe. When in doubt, run the project's quality checks (`npm run check-all`) before proposing commits.

Summary (big picture)
- Full-stack Next.js 15 TypeScript app with a single Node runtime. Business logic lives in `lib/` and is exposed via the App Router API under `app/api/v3/`.
- Database-backed (Prisma + PostgreSQL / SQLite). Agents and workflows are persisted in the database; legacy YAML imports live under `madace/*` and are importable.
- Dual interface: Web UI (Next.js) + CLI (bin/madace.ts). Real-time sync uses a custom WebSocket server initialized in `server.ts` (see `dev:collab` scripts).

Quick surgical checklist
- Start dev: `npm run dev` (web only) or `npm run dev:collab` (web + socket server).
- Build: `npm run build` (or `npm run build:collab` for custom server).
- Quality gate: `npm run check-all` (validates versions, types, lint, format). Run before commits.
- DB: `npm run db:migrate`, `npm run db:push`, `npm run db:studio`.
- Import agents: `npm run import-madace-v3` and seed example project: `npm run seed:zodiac`.

Important repo conventions & safety rules (strict)
- Version locking: Core deps are pinned — run `npm run validate-versions` before changing dependency versions.
- Type safety: TypeScript strict mode + Zod runtime validation for all external inputs (YAML / API). Prefer Zod for new validators.
- Prisma JSON fields: `persona`, `menu`, `prompts` are stored as Json in the DB. Do not introduce flattened DB fields that diverge from Prisma types.
- File-safety: Never assume files exist in production. Check existence (`existsSync`) and return safe fallbacks instead of throwing.
- API routes: Always catch errors in API route handlers and return structured JSON responses (status 200/500 with { success, data/error }).

Critical patterns & where to find them
- Agents: `madace/mam/agents/*.agent.yaml` (YAML definitions) and `lib/agents/` (loader, runtime, services). Use `lib/services/agent-service.ts` for DB CRUD.
- Workflows: YAML workflow files live under `lib/workflows/` and the engine is in `lib/workflows/`. Example: `lib/workflows/complexity-assessment.ts`.
- State machine: `lib/state/` enforces BACKLOG → TODO → IN_PROGRESS → DONE and single-active-story rules. Do not bypass the state provider; use `lib/status/providers/state-machine-provider.ts`.
- LLM clients: `lib/llm/` implements multi-provider clients with streaming. Use `createLLMClient(...)` for provider-agnostic calls.
- Templates: `lib/templates/` (Handlebars with legacy pattern support). Use `renderTemplate` helper.

Runtime / infra notes agents must know
- Custom WebSocket server lives in the repo root `server.ts`. Dev/production variations are driven by scripts `dev:collab`, `start:collab`.
- Next.js config and optimizations are in `next.config.ts` (monaco/xterm chunking). Do not remove these chunk settings without testing bundle size.

Small contract for API changes
- Input: NextRequest or typed DTO validated with Zod.
- Output: NextResponse JSON with shape { success: boolean, data?: any, error?: string } and appropriate HTTP status.
- Error modes: Return structured 500 responses; do not throw unhandled exceptions from API routes.

Examples (copy-or-adapt)
- Add a safe GET handler (place in `app/api/v3/example/route.ts`):
  - Try/catch, use `prisma` via `lib/database/client` and return { success, data }.
- Add an LLM call (use `lib/llm/client.ts`):
  - Use `createLLMClient({ provider, apiKey, model })` and prefer streaming for large outputs.

Tests & CI expectations
- Unit tests: Jest (`npm test`) under `__tests__/**`.
- E2E: Playwright (`npm run test:e2e`). The repo includes `playwright.config.ts` and `e2e-tests/`.
- Before proposing a patch: run `npm run check-all`, `npm test`, and optionally `npm run test:e2e` if touching UI or API routes.

Where to read more (high-value files)
- `README.md` and `CLAUDE.md` (top-level) — architecture and operating procedures.
- `package.json` — canonical scripts and the `dev:collab` custom server flows.
- `server.ts` — WebSocket/server integration (important for real-time features).
- `prisma/schema.prisma` — DB model contract; changes must be migrated via Prisma.
- `lib/agents/`, `lib/workflows/`, `lib/state/`, `lib/llm/`, `lib/templates/` — core business logic to edit.

If unsure
- Ask for the smallest reproducible change and the intended behavior (input/output). Prefer minimal PRs and include the exact `npm` script you used to validate.

----
If any section is unclear or you'd like more examples (e.g., full API route template or a Zod schema pattern used here), tell me which part and I'll expand with concrete, ready-to-apply snippets.
