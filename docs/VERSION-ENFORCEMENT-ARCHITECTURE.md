# Version Enforcement Architecture

**MADACE-Method v2.0 - Version Locking Validation System**

This document visualizes the 4-layer architecture that enforces exact version locking across all development environments and deployments.

---

## Overview

The version enforcement system uses a **defense-in-depth** approach with 4 validation layers:

1. **Pre-Install Prevention** - Prevent version ranges before they're saved
2. **Post-Install Validation** - Validate after installation
3. **Pre-Commit Quality Gates** - Block commits with wrong versions
4. **CI/CD Validation** - Final enforcement in automated pipelines

---

## Layer Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     VERSION ENFORCEMENT ARCHITECTURE                     │
│                     (4-Layer Defense-in-Depth)                          │
└─────────────────────────────────────────────────────────────────────────┘

                            Developer Workflow
                                    │
                                    ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  LAYER 1: PRE-INSTALL PREVENTION                              │
    │  ════════════════════════════════════════════════════════════ │
    │                                                               │
    │  Files:                                                       │
    │    • .npmrc (save-exact=true, engine-strict=true)            │
    │    • .nvmrc (24.10.0)                                        │
    │                                                               │
    │  Action:                                                      │
    │    npm install package-name                                   │
    │         ↓                                                     │
    │    Saves: "package-name": "1.2.3"  ✅                        │
    │    NOT:   "package-name": "^1.2.3" ❌                        │
    │                                                               │
    │  Enforcement Point: AUTOMATIC (npm configuration)             │
    └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  LAYER 2: POST-INSTALL VALIDATION                             │
    │  ════════════════════════════════════════════════════════════ │
    │                                                               │
    │  Script: scripts/validate-versions.js                         │
    │                                                               │
    │  Checks:                                                      │
    │    ✅ Core packages match LOCKED versions                    │
    │       • next: 15.5.6                                         │
    │       • react: 19.2.0                                        │
    │       • react-dom: 19.2.0                                    │
    │       • typescript: 5.9.3                                    │
    │                                                               │
    │    ✅ No version ranges in package.json                      │
    │       • Detects: ^, ~, >=, <=, >, <                         │
    │                                                               │
    │    ✅ Installed versions match package.json                  │
    │       • Compares node_modules to package.json                │
    │                                                               │
    │    ✅ Node.js version check                                  │
    │       • Required: >= 20.0.0                                  │
    │       • Recommended: 24.10.0                                 │
    │                                                               │
    │  Command: npm run validate-versions                           │
    │  Exit Code: 0 (pass) | 1 (fail)                              │
    │                                                               │
    │  Enforcement Point: MANUAL (developer runs before commit)     │
    └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  LAYER 3: PRE-COMMIT QUALITY GATES                            │
    │  ════════════════════════════════════════════════════════════ │
    │                                                               │
    │  Command: npm run check-all                                   │
    │                                                               │
    │  Validation Pipeline:                                         │
    │    1. npm run validate-versions  ← Version enforcement       │
    │    2. npm run type-check         ← TypeScript validation     │
    │    3. npm run lint               ← ESLint validation         │
    │    4. npm run format:check       ← Prettier validation       │
    │                                                               │
    │  Developer Flow:                                              │
    │    git add .                                                  │
    │    npm run check-all  ← MUST PASS                            │
    │    git commit -m "..."                                        │
    │                                                               │
    │  Outcome:                                                     │
    │    ✅ All checks pass → Commit allowed                       │
    │    ❌ Any check fails → Fix before commit                    │
    │                                                               │
    │  Enforcement Point: DEVELOPER DISCIPLINE                      │
    └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  LAYER 4: CI/CD VALIDATION                                    │
    │  ════════════════════════════════════════════════════════════ │
    │                                                               │
    │  Platform: GitHub Actions (or GitLab CI, CircleCI, etc.)     │
    │                                                               │
    │  Workflow Steps:                                              │
    │    1. Checkout code                                          │
    │                                                               │
    │    2. Setup Node.js                                          │
    │       uses: actions/setup-node@v3                            │
    │       with:                                                   │
    │         node-version-file: '.nvmrc'  ← Exact 24.10.0        │
    │                                                               │
    │    3. Install exact versions                                 │
    │       run: npm ci  ← Uses package-lock.json                 │
    │       (NOT npm install - ci uses lockfile)                   │
    │                                                               │
    │    4. Validate versions                                      │
    │       run: npm run validate-versions                         │
    │       (Blocks merge if fails)                                │
    │                                                               │
    │    5. Run all quality checks                                 │
    │       run: npm run check-all                                 │
    │                                                               │
    │    6. Build production                                       │
    │       run: npm run build                                     │
    │                                                               │
    │    7. Run tests                                              │
    │       run: npm test                                          │
    │                                                               │
    │  Enforcement Point: AUTOMATED (blocks merge on failure)       │
    └───────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  RESULT: PRODUCTION DEPLOYMENT                                │
    │  ════════════════════════════════════════════════════════════ │
    │                                                               │
    │  ✅ 100% Reproducible Build                                  │
    │  ✅ Identical versions across all environments               │
    │  ✅ No "works on my machine" issues                          │
    │  ✅ Same foundation for debugging                            │
    │                                                               │
    └───────────────────────────────────────────────────────────────┘
```

---

## Developer Journey Flow

```
┌─────────────┐
│  Developer  │
│   Machine   │
└──────┬──────┘
       │
       │ Step 1: Clone repository
       ▼
┌─────────────────────┐
│  nvm use            │  ← .nvmrc (24.10.0)
│  (or fnm use)       │
└──────┬──────────────┘
       │
       │ Step 2: Install dependencies
       ▼
┌─────────────────────┐
│  npm ci             │  ← Uses package-lock.json (exact versions)
│                     │  ← .npmrc enforces exact versions
└──────┬──────────────┘
       │
       │ Step 3: Make changes
       ▼
┌─────────────────────┐
│  git add .          │
│  npm run check-all  │  ← Validates versions + types + lint + format
└──────┬──────────────┘
       │
       │ ✅ All checks pass
       ▼
┌─────────────────────┐
│  git commit         │
│  git push           │
└──────┬──────────────┘
       │
       │ Step 4: Create PR
       ▼
┌─────────────────────┐
│  GitHub Actions     │  ← CI/CD validation
│  • npm ci           │
│  • validate-versions│
│  • check-all        │
│  • build            │
│  • test             │
└──────┬──────────────┘
       │
       │ ✅ All CI checks pass
       ▼
┌─────────────────────┐
│  Merge to main      │
└──────┬──────────────┘
       │
       │ Step 5: Deploy
       ▼
┌─────────────────────┐
│  Production         │  ← Same versions as local dev ✅
│  Deployment         │
└─────────────────────┘
```

---

## Version Range Detection

The validation script checks for these forbidden patterns:

```
❌ FORBIDDEN:
  "next": "^15.5.6"    → Can install 15.6.0, 15.7.0, etc.
  "react": "~19.2.0"   → Can install 19.2.1, 19.2.2, etc.
  "zod": ">=4.0.0"     → Can install any 4.x.x or higher
  "ws": ">8.0.0"       → Can install any version above 8.0.0
  "joi": "<=17.0.0"    → Can install any version up to 17.0.0

✅ REQUIRED:
  "next": "15.5.6"     → ONLY 15.5.6
  "react": "19.2.0"    → ONLY 19.2.0
  "zod": "4.1.12"      → ONLY 4.1.12
  "ws": "8.18.3"       → ONLY 8.18.3
  "joi": "17.13.3"     → ONLY 17.13.3
```

**Detection Regex:** `/[\^~><]/`

---

## Upgrade Process Flow

### Core Packages (Next.js, React, TypeScript)

```
┌──────────────────────┐
│  Security Check      │
│  npm audit           │
└──────┬───────────────┘
       │
       │ Is it CRITICAL/HIGH?
       ▼
┌──────────────────────┐     YES   ┌──────────────────────┐
│  Severity Check      │───────────>│  Emergency Upgrade   │
│                      │            │  (Skip approval)     │
└──────┬───────────────┘            └──────────────────────┘
       │ NO
       ▼
┌──────────────────────┐
│  Create Issue        │  ← Discuss with team
│  Get Team Approval   │
└──────┬───────────────┘
       │ ✅ Approved
       ▼
┌──────────────────────┐
│  Create Branch       │
│  upgrade/next-15.6.0 │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Update Package      │
│  npm install         │
│  next@15.6.0         │
│  --save-exact        │  ← EXACT version
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Validate            │
│  npm run             │
│  validate-versions   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Full Test Suite     │
│  • npm run check-all │
│  • npm run build     │
│  • npm test          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Update Docs         │
│  • VERSION-LOCK.md   │
│  • CLAUDE.md         │
│  • ADR-004           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Create PR           │
│  Detailed changelog  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Code Review         │
│  Team approval       │
└──────┬───────────────┘
       │ ✅ Approved
       ▼
┌──────────────────────┐
│  Merge to Main       │
└──────────────────────┘
```

### Non-Core Packages

```
┌──────────────────────┐
│  Update Package      │
│  npm install         │
│  package@X.Y.Z       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Validate            │
│  npm run             │
│  validate-versions   │
│  npm run check-all   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Test                │
│  npm run build       │
│  npm test            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Commit              │
│  "deps: update       │
│   package to X.Y.Z"  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Push & Create PR    │
└──────────────────────┘
```

---

## Environment Consistency Matrix

This table shows how version locking ensures consistency:

| Environment        | Without Locking                  | With Locking (MADACE)          |
| ------------------ | -------------------------------- | ------------------------------ |
| Developer A Mac    | Next.js 15.5.6 (installed today) | Next.js 15.5.6 ✅             |
| Developer B Linux  | Next.js 15.6.0 (installed later) | Next.js 15.5.6 ✅             |
| Developer C Windows| Next.js 15.7.0 (latest)          | Next.js 15.5.6 ✅             |
| CI/CD Pipeline     | Next.js 15.7.1 (cache cleared)   | Next.js 15.5.6 ✅             |
| Staging Deploy     | Next.js 15.5.6 (old cache)       | Next.js 15.5.6 ✅             |
| Production Deploy  | Next.js 15.6.0 (????)            | Next.js 15.5.6 ✅             |
| **Result**         | **6 different versions ❌**      | **1 version everywhere ✅**    |
| **Debugging**      | **Nightmare 🔥**                 | **Straightforward ✨**         |

---

## Validation Script Output Example

```bash
$ npm run validate-versions

╔════════════════════════════════════════════════════════════╗
║   MADACE-Method v2.0 - VERSION VALIDATION                 ║
║   Enforcing EXACT versions for core tech stack            ║
╚════════════════════════════════════════════════════════════╝

📦 Node.js Version Check:
   Current: 24.10.0
   Minimum: 20.0.0
   Recommended: 24.10.0
   ✅ PASS: Using recommended Node.js version

🔒 Core Package Version Check:
   Checking LOCKED versions (NO changes allowed):

   📌 next:
      Required: 15.5.6 (LOCKED)
      package.json: 15.5.6
      Installed: 15.5.6
      ✅ PASS: Exact version match

   📌 react:
      Required: 19.2.0 (LOCKED)
      package.json: 19.2.0
      Installed: 19.2.0
      ✅ PASS: Exact version match

   📌 react-dom:
      Required: 19.2.0 (LOCKED)
      package.json: 19.2.0
      Installed: 19.2.0
      ✅ PASS: Exact version match

   📌 typescript:
      Required: 5.9.3 (LOCKED)
      package.json: 5.9.3
      Installed: 5.9.3
      ✅ PASS: Exact version match

🔍 Checking for version ranges in package.json:
   All dependencies should use EXACT versions (no ^, ~, >, <)
   Checked 24 packages (dependencies + devDependencies)
   ✅ PASS: All versions are exact (no ranges)

============================================================
📊 VALIDATION SUMMARY
============================================================
   ✅ Node.js Version: PASSED
   ✅ package.json Versions: PASSED
   ✅ Installed Versions: PASSED
   ✅ No Version Ranges: PASSED

============================================================
✅ ALL CHECKS PASSED - Tech stack is locked and consistent!
============================================================
```

---

## Files in the Version Enforcement System

```
MADACE-Method-v2.0/
├── .npmrc                              ← Layer 1: Pre-install prevention
├── .nvmrc                              ← Layer 1: Node.js version lock
├── package.json                        ← Source of truth (EXACT versions)
├── package-lock.json                   ← Lockfile (used by npm ci)
├── scripts/
│   └── validate-versions.js            ← Layer 2: Post-install validation
├── .github/
│   └── workflows/
│       └── ci.yml                      ← Layer 4: CI/CD validation
└── docs/
    ├── VERSION-LOCK.md                 ← Comprehensive guide
    ├── VERSION-ENFORCEMENT-ARCHITECTURE.md  ← This file
    └── adrs/
        └── ADR-004-version-locking-enforcement.md  ← Decision record
```

---

## Key Design Decisions

### Why 4 Layers?

**Defense-in-Depth Philosophy:**
- Layer 1 fails? Layer 2 catches it
- Layer 2 skipped? Layer 3 catches it
- Layer 3 ignored? Layer 4 catches it
- **Multiple safety nets = Zero version drift**

### Why Exact Versions Only?

**Semantic Versioning Risks:**
```bash
# Semantic versioning promises:
"^1.2.3" = "Compatible updates (1.2.4, 1.3.0, etc.)"

# Reality:
1.2.3 → 1.2.4: Patch (supposedly safe) → Breaks your app
1.2.3 → 1.3.0: Minor (supposedly safe) → Breaks your app
1.2.3 → 2.0.0: Major (expected breaking) → You know it's risky

# Problem: "Safe" isn't guaranteed. Only way to be 100% safe:
# Use EXACT versions. Update intentionally.
```

### Why npm ci in CI/CD?

**npm install vs npm ci:**

| Command       | Behavior                                  | Use Case          |
| ------------- | ----------------------------------------- | ----------------- |
| `npm install` | Installs from package.json (with ranges) | Development       |
| `npm ci`      | Installs from package-lock.json (exact)   | CI/CD, Production |

`npm ci` guarantees **byte-for-byte identical** node_modules across all environments.

---

## Success Metrics

**Quantitative:**
- ✅ **Zero version drift incidents** - No "works on my machine" bugs
- ✅ **100% validation pass rate** - All environments validated
- ✅ **Reproducible builds** - Same input → same output every time

**Qualitative:**
- ✅ **Developer confidence** - "If it works locally, it works everywhere"
- ✅ **Easy onboarding** - New devs get correct versions immediately
- ✅ **No wasted debugging time** - No hunting for version differences

---

## References

- [VERSION-LOCK.md](../VERSION-LOCK.md) - User guide for version locking
- [ADR-004](./adrs/ADR-004-version-locking-enforcement.md) - Architecture decision record
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system architecture
- [PRD.md](../PRD.md) - Product requirements (Section 3.3, 7.7)
- [CLAUDE.md](../CLAUDE.md) - Developer guidance

---

**Document Version:** 1.0.0
**Created:** 2025-10-28
**Status:** ✅ Active - Enforced in v2.0-alpha
**Next Review:** 2026-01-28 (Quarterly)
