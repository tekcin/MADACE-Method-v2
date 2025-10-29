# Development Plan

**MADACE-Method v2.0 - Development Roadmap and Best Practices**

**Version:** 2.0.0-alpha
**Last Updated:** 2025-10-28
**Status:** Active Development

---

## Table of Contents

- [Timeline](#timeline)
- [Development Workflow](#development-workflow)
- [Version Locking Practices](#version-locking-practices)
- [Quality Assurance](#quality-assurance)
- [Code Review Process](#code-review-process)
- [Deployment Process](#deployment-process)
- [Sprint Planning](#sprint-planning)

---

## Timeline

### Phase 1: Alpha (Q4 2025) - **CURRENT**

**Goal:** Validate architecture and build foundation

**Duration:** 4 weeks (Oct 20 - Nov 20, 2025)

**Milestones:**

-  **Week 1: Foundation** (Oct 20-26)
  -  Architecture review and simplification (ADR-003)
  -  Next.js 15 project initialization
  -  Base layout and navigation
  -  Setup wizard UI
  -  Version locking enforcement (ADR-004)
  -  Docker deployment (production + development)

- � **Week 2: Core Systems** (Oct 27 - Nov 2)
  -  Configuration persistence
  -  Settings page
  -  Workflow engine implementation
  -  State machine implementation

- � **Week 3: Integration** (Nov 3-9)
  -  Template engine
  -  LLM integration completion
  -  API routes completion
  -  End-to-end testing

- � **Week 4: Polish** (Nov 10-16)
  -  Documentation completion
  -  Bug fixes
  -  Performance optimization
  -  Alpha release preparation

**Success Criteria:**

- 10+ alpha testers
- 3+ complete MVP builds
- Core architecture validated
- Zero version drift incidents

### Phase 2: Beta (Q1-Q2 2026)

**Goal:** Feature completeness and production readiness

**Deliverables:**

- All MAM agents and workflows
- MAB and CIS modules
- Sub-workflow support
- Progress dashboard
- Comprehensive testing

### Phase 3: v1.0 Stable (Q3 2026)

**Goal:** Production release and ecosystem launch

**Deliverables:**

- Multi-user collaboration
- External integrations (GitHub, Jira)
- Module marketplace
- Commercial support tier

---

## Development Workflow

### 1. Environment Setup

**First-Time Setup:**

```bash
# 1. Clone repository
git clone <repo-url>
cd MADACE-Method-v2.0

# 2. Use correct Node.js version
nvm use          # Uses .nvmrc (24.10.0)
# OR
fnm use          # Uses .nvmrc (24.10.0)

# 3. Install dependencies with exact versions
npm ci           # Uses package-lock.json (EXACT versions)
# NOT npm install (unless adding new packages)

# 4. Verify environment
node --version   # Should be v24.10.0
npm run validate-versions  # Should pass 

# 5. Start development server
npm run dev      # http://localhost:3000
```

**Daily Workflow:**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm ci           # Always use ci, not install

# 3. Verify versions haven't drifted
npm run validate-versions

# 4. Start development
npm run dev
```

### 2. Making Changes

**Feature Development:**

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Run quality checks
npm run check-all
#  validate-versions - Version enforcement
#  type-check        - TypeScript validation
#  lint              - ESLint validation
#  format:check      - Prettier validation

# 4. Build and test
npm run build
npm test

# 5. Commit changes
git add .
git commit -m "feat: descriptive commit message"

# 6. Push and create PR
git push origin feature/my-feature
```

**Commit Message Convention:**

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update build config
deps: Update dependencies (exact versions only)
security: Security fix (CVE-XXXX-YYYY)
```

### 3. Dependency Management

**� CRITICAL: Version Locking Policy**

ALL dependencies MUST use exact versions. NO version ranges allowed.

**Adding New Packages:**

```bash
# Add new package with EXACT version
npm install package-name@X.Y.Z

# .npmrc automatically enforces exact versions
# Saves as: "package-name": "1.2.3"  
# NOT:      "package-name": "^1.2.3" L

# Validate after install
npm run validate-versions

# Commit both package.json and package-lock.json
git add package.json package-lock.json
git commit -m "deps: add package-name X.Y.Z - reason"
```

**Updating Core Packages (Next.js, React, TypeScript):**

```bash
# � REQUIRES TEAM APPROVAL

# 1. Security check
npm audit

# 2. Create GitHub issue for discussion
# Get team consensus

# 3. Create upgrade branch
git checkout -b upgrade/next-15.6.0

# 4. Update with EXACT version
npm install next@15.6.0 --save-exact
npm install eslint-config-next@15.6.0 --save-exact

# 5. Validate
npm run validate-versions
npm run check-all
npm run build
npm test

# 6. Test thoroughly
# - All major features
# - Check deprecation warnings
# - Review release notes
# - Test in staging

# 7. Update documentation
# - VERSION-LOCK.md
# - CLAUDE.md
# - ADR-004 (if needed)

# 8. Create PR with detailed description
# - Why upgrade?
# - What changed?
# - What was tested?
# - Migration guide (if needed)

# 9. Get code review and approval
# 10. Merge to main
```

**Updating Non-Core Packages:**

```bash
# Any developer can upgrade after testing

# 1. Check current version
npm list package-name

# 2. Update to EXACT version
npm install package-name@X.Y.Z

# 3. Validate
npm run validate-versions
npm run check-all

# 4. Test
npm run build
npm test

# 5. Commit
git add package.json package-lock.json
git commit -m "deps: update package-name to X.Y.Z - reason"

# 6. Create PR
```

**Security Vulnerabilities:**

```bash
# Check for vulnerabilities
npm audit

# If CRITICAL or HIGH severity:
# 1. Upgrade immediately
npm install vulnerable-package@safe-version

# 2. Validate
npm run validate-versions
npm run check-all

# 3. Commit with CVE reference
git commit -m "security: update package-name to X.Y.Z - CVE-XXXX-YYYY"

# 4. Skip approval process for CRITICAL/HIGH
# 5. Create PR and merge quickly

# If MODERATE or LOW severity:
# - Schedule for next sprint
# - Follow normal upgrade process
```

---

## Version Locking Practices

### Philosophy

**Goal:** 100% reproducible builds across all environments

**Principle:** Every developer, CI/CD pipeline, and production deployment uses IDENTICAL dependency versions.

**Benefit:** Eliminates "works on my machine" problems and version-related bugs.

### 4-Layer Enforcement Architecture

```
Layer 1: Pre-Install Prevention
  �
Layer 2: Post-Install Validation
  �
Layer 3: Pre-Commit Quality Gates
  �
Layer 4: CI/CD Validation
  �
Production Deployment (100% reproducible)
```

### Layer Details

**Layer 1: Pre-Install Prevention**

- `.npmrc` with `save-exact=true` - Forces exact versions
- `.nvmrc` with `24.10.0` - Locks Node.js version
- Automatic enforcement by npm

**Layer 2: Post-Install Validation**

- `scripts/validate-versions.js` - Validates all versions
- Checks core packages: Next.js, React, TypeScript
- Detects version ranges in package.json
- Verifies installed vs declared versions

**Layer 3: Pre-Commit Quality Gates**

- `npm run check-all` - Includes version validation
- Blocks commits with wrong versions
- Developer discipline enforced

**Layer 4: CI/CD Validation**

- GitHub Actions runs validation
- Uses `npm ci` (lockfile-based)
- Blocks merge on failure

### Key Files

```
.npmrc                         � Pre-install enforcement
.nvmrc                         � Node.js version lock
package.json                   � Source of truth (EXACT versions)
package-lock.json              � Lockfile (used by npm ci)
scripts/validate-versions.js   � Post-install validation
.github/workflows/ci.yml       � CI/CD validation
```

### Validation Commands

```bash
# Validate versions
npm run validate-versions

# Full quality check (includes validation)
npm run check-all

# Before every commit
npm run check-all && npm run build && npm test
```

### Documentation

- [VERSION-LOCK.md](./VERSION-LOCK.md) - Comprehensive guide
- [ADR-004](./docs/adrs/ADR-004-version-locking-enforcement.md) - Decision record
- [VERSION-ENFORCEMENT-ARCHITECTURE.md](./docs/VERSION-ENFORCEMENT-ARCHITECTURE.md) - Architecture diagrams
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

## Quality Assurance

### Code Quality Standards

**TypeScript:**

- Strict mode enabled (`tsconfig.json`)
- No `any` types without justification
- Zod schemas for runtime validation
- Type inference with `z.infer<typeof Schema>`

**ESLint:**

- Next.js recommended config
- Prettier integration
- No console.log in production code (use proper logging)

**Prettier:**

- Consistent code formatting
- Tailwind CSS plugin for class sorting
- Enforce before commits

### Quality Checks

**Before Every Commit:**

```bash
npm run check-all
```

This runs:

1. `validate-versions` - Version enforcement
2. `type-check` - TypeScript validation (no emit)
3. `lint` - ESLint validation
4. `format:check` - Prettier validation

**Before Creating PR:**

```bash
npm run check-all
npm run build
npm test
```

All must pass 

### Testing Strategy

> **⛔ CRITICAL: IMMUTABLE TEST POLICY**
>
> Tests define the contract. Implementation must conform to tests, NOT the other way around.
>
> **When tests fail:**
>
> - ✅ Write detailed failure report
> - ✅ Create todo list for fixes
> - ✅ Fix IMPLEMENTATION code
>
> **NEVER:**
>
> - ❌ Modify test scripts to make them pass
> - ❌ Alter test procedures or assertions
> - ❌ Comment out or skip failing tests
>
> See [TESTING-POLICY.md](./TESTING-POLICY.md) for complete policy.

**Unit Tests:**

- Location: `__tests__/lib/**/*.test.ts`
- Framework: Jest with ts-jest
- Coverage target: 80%+
- **Policy:** Tests are IMMUTABLE - only add new tests, never modify existing ones

**Integration Tests:**

- Location: `__tests__/app/api/**/*.test.ts`
- Test API routes end-to-end
- Mock external dependencies (LLM, fs)
- **Policy:** Tests define API contract - implementation must conform

**E2E Tests:**

- Framework: Playwright (planned)
- Test critical user flows
- Run before major releases
- **Policy:** E2E tests define user requirements - UI must conform

**Test Failure Protocol:**

```bash
# Test fails?
npm test
# ❌ FAIL: AgentLoader › should load agent from YAML file

# 1. Write failure report
# Create: reports/test-failures/failure-{timestamp}.md

# 2. Create todo list
# Add to project todos: Fix AgentLoader.loadAgent()

# 3. Fix IMPLEMENTATION (NOT test)
# Edit: lib/agents/loader.ts

# 4. Verify fix
npm test
# ✅ PASS: All tests passing

# 5. Update report status to RESOLVED
```

**Test Commands:**

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

**Test Modification (Exceptions Only):**

Tests can ONLY be modified if:

1. Requirements officially changed (documented in ADR)
2. Test was objectively wrong (documented in ADR)
3. Adding NEW tests (not modifying existing ones)

All test modifications require ADR justification.

---

## Code Review Process

### PR Requirements

**Before Creating PR:**

-  All quality checks pass (`npm run check-all`)
-  Build succeeds (`npm run build`)
-  Tests pass (`npm test`)
-  Version validation passes (`npm run validate-versions`)
-  Commit messages follow convention
-  Documentation updated (if needed)

**PR Description Template:**

```markdown
## Summary

Brief description of changes

## Changes

- Bullet point list of changes
- Link to related issues

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All quality checks pass

## Version Validation

- [ ] `npm run validate-versions` passes
- [ ] No version ranges in package.json
- [ ] Core packages unchanged (or approved)

## Documentation

- [ ] CLAUDE.md updated (if needed)
- [ ] README.md updated (if needed)
- [ ] ADR created (if architectural change)

## Screenshots/Videos

(if UI changes)
```

### Review Checklist

**Reviewer Responsibilities:**

-  Code follows project conventions
-  TypeScript types are correct
-  No security vulnerabilities
-  No hardcoded secrets
-  Error handling is appropriate
-  Tests are comprehensive
-  Documentation is updated
-  Version locking is maintained
-  No version ranges in dependencies

### Approval Process

**Small Changes** (bug fixes, docs):

- 1 approval required
- Can merge after CI passes

**Medium Changes** (features, refactors):

- 1-2 approvals required
- Must pass all quality checks
- Version validation must pass

**Large Changes** (architecture, core packages):

- 2+ approvals required
- Team discussion required
- ADR created and approved
- Comprehensive testing required
- Version locking documentation updated

---

## Deployment Process

### Local Development

```bash
# Start development server
npm run dev              # http://localhost:3000

# Build for production (test)
npm run build
npm start
```

### Docker Deployment

**Production Deployment:**

```bash
# Create data folder
mkdir madace-data

# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:3000

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Development Container (with IDEs):**

```bash
# Create data folder
mkdir madace-data

# Start development container
docker-compose -f docker-compose.dev.yml up -d

# Access:
# - VSCode Server: http://localhost:8080
# - Next.js Dev: http://localhost:3000

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml

name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc' # 24.10.0

      - name: Install dependencies
        run: npm ci # Uses package-lock.json

      - name: Validate versions
        run: npm run validate-versions # CRITICAL

      - name: Quality checks
        run: npm run check-all

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
```

**Deployment Checklist:**

-  All tests pass
-  Version validation passes
-  Build succeeds
-  No console errors
-  Documentation updated
-  CHANGELOG.md updated
-  Version bumped (if release)

---

## Sprint Planning

### Sprint Structure

**Duration:** 1 week sprints

**Ceremonies:**

- **Monday:** Sprint planning
- **Daily:** Standup (async)
- **Friday:** Sprint review + retrospective

### Sprint Goals

**Week 1 (Oct 20-26):**  **COMPLETED**

- Architecture simplification
- Next.js initialization
- Setup wizard
- Version locking enforcement
- Docker deployment

**Week 2 (Oct 27 - Nov 2):** **CURRENT**

- Configuration persistence
- Settings page
- Workflow engine
- State machine

**Week 3 (Nov 3-9):**

- Template engine
- LLM integration completion
- API routes completion
- E2E testing

**Week 4 (Nov 10-16):**

- Documentation
- Bug fixes
- Performance optimization
- Alpha release

### Story Workflow

**States:**

- **BACKLOG** - Ordered list of stories
- **TODO** - Single story ready for drafting
- **IN PROGRESS** - Single story being implemented
- **DONE** - Completed stories

**Rules:**

- Only ONE story in TODO at a time
- Only ONE story in IN PROGRESS at a time
- State machine enforces rules automatically

**Story File:** `docs/mam-workflow-status.md`

---

## Best Practices Summary

### DO:

 **Use exact versions** in package.json
 **Run `npm run check-all`** before commits
 **Use `npm ci`** in CI/CD and after pull
 **Commit package-lock.json** always
 **Follow upgrade process** for dependencies
 **Test thoroughly** after upgrades
 **Update documentation** when needed
 **Create ADRs** for architectural decisions
 **Write tests** for new features
 **Follow commit conventions**

### DON'T:

L **Use version ranges** (^, ~, >=, <=, >, <)
L **Skip version validation** (`npm run validate-versions`)
L **Upgrade core packages** without approval
L **Run `npm audit fix`** (may use ranges)
L **Use different Node.js versions** across team
L **Skip quality checks** before commits
L **Hardcode secrets** in code
L **Use `any` type** without justification

### Quick Commands Reference

```bash
# Environment
nvm use                          # Switch to Node.js 24.10.0
npm ci                           # Install exact versions

# Validation
npm run validate-versions        # Validate version locking
npm run check-all                # Full quality check

# Development
npm run dev                      # Start dev server
npm run build                    # Build for production
npm test                         # Run tests

# Docker
docker-compose up -d             # Start production
docker-compose -f docker-compose.dev.yml up -d  # Start dev container

# Quality
npm run type-check               # TypeScript validation
npm run lint                     # ESLint validation
npm run format                   # Format with Prettier
npm run format:check             # Check formatting
```

---

## References

- [README.md](./README.md) - Project overview
- [PRD.md](./PRD.md) - Product requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [VERSION-LOCK.md](./VERSION-LOCK.md) - Version locking guide
- [TESTING-POLICY.md](./TESTING-POLICY.md) - **⛔ Immutable testing policy (CRITICAL)**
- [ADR-004](./docs/adrs/ADR-004-version-locking-enforcement.md) - Version locking decision
- [CLAUDE.md](./CLAUDE.md) - Developer guidance for AI assistants
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development container guide

---

**Document Version:** 2.0.0
**Last Updated:** 2025-10-28
**Status:** Active Development
**Next Review:** Weekly during Alpha phase
