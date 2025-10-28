# ADR-004: Version Locking and Enforcement Strategy

**Status:** ✅ Approved
**Date:** 2025-10-28
**Deciders:** Architect Agent, Development Team
**Related:** ADR-003 (Next.js Full-Stack Architecture)

---

## Context and Problem Statement

MADACE-Method v2.0 is built on a specific tech stack (Next.js 15.5.6, React 19.2.0, TypeScript 5.9.3). Without strict version control, the project risks:

1. **Version Drift** - Different developers using different versions
2. **"Works on My Machine"** - Bugs that only appear in some environments
3. **Unpredictable Builds** - CI/CD producing different results than local dev
4. **Breaking Changes** - Version ranges introducing silent breaking changes
5. **Difficult Debugging** - Inconsistent foundation makes bugs harder to track

**Key Question:** How do we ensure 100% consistency across all development environments and deployments?

---

## Decision Drivers

### Must-Have Requirements:
- ✅ **Consistency** - Same versions everywhere (dev, CI/CD, prod)
- ✅ **Reproducibility** - Builds must be identical
- ✅ **No Surprises** - Version updates must be intentional
- ✅ **Easy to Enforce** - Automated validation
- ✅ **Clear Rules** - Developers know what's allowed

### Nice-to-Have:
- Documentation of why certain versions are locked
- Upgrade path when needed
- Security vulnerability handling process

---

## Considered Options

### Option 1: Version Ranges (^, ~) ❌ REJECTED

```json
{
  "next": "^15.5.6",      // Can install 15.6.0, 15.7.0, etc.
  "react": "~19.2.0",     // Can install 19.2.1, 19.2.2, etc.
  "typescript": ">=5.9.0" // Can install any 5.9.x or higher
}
```

**Pros:**
- Get bug fixes automatically
- Stay "up to date"
- Common npm practice

**Cons:**
- ❌ Unpredictable builds - Different versions across team
- ❌ Breaking changes can sneak in
- ❌ Hard to debug version-specific issues
- ❌ CI/CD might use different versions than dev

**Verdict:** ❌ **REJECTED** - Too risky for a production-grade project

### Option 2: Loose Exact Versions ❌ REJECTED

```json
{
  "next": "15.5.6",       // Exact version
  "react": "^19.2.0",     // But ranges for other packages
  "some-lib": "~2.1.0"    // Mixed approach
}
```

**Pros:**
- Core packages locked
- Flexibility for less critical packages

**Cons:**
- ❌ Still has version drift problem
- ❌ Inconsistent strategy - confusing
- ❌ Hard to validate

**Verdict:** ❌ **REJECTED** - Inconsistent and confusing

### Option 3: Strict Exact Versions ✅ SELECTED

```json
{
  "next": "15.5.6",       // Exact - no range operators
  "react": "19.2.0",      // Exact - no range operators
  "react-dom": "19.2.0",  // Exact - no range operators
  "typescript": "5.9.3",  // Exact - no range operators
  "zod": "4.1.12"         // Exact - ALL packages
}
```

**Pros:**
- ✅ 100% reproducible builds
- ✅ Same versions everywhere
- ✅ Intentional upgrades only
- ✅ Easy to validate
- ✅ Debuggable - same foundation

**Cons:**
- Need manual upgrades (but that's a GOOD thing)
- Requires discipline (but automation helps)

**Verdict:** ✅ **SELECTED** - Best for production reliability

---

## Architecture Decision

### Core Principle

**ALL dependencies MUST use exact versions. NO version ranges allowed.**

```json
{
  "dependencies": {
    "next": "15.5.6",      // ✅ Exact
    "react": "19.2.0",     // ✅ Exact
    "zod": "4.1.12"        // ✅ Exact
  },
  "devDependencies": {
    "typescript": "5.9.3", // ✅ Exact
    "prettier": "3.6.2"    // ✅ Exact
  }
}
```

### Locked Core Stack (FROZEN for v2.0-alpha)

These versions are **FROZEN** and require team approval to change:

| Package | Version | Status |
|---------|---------|--------|
| **next** | 15.5.6 | ⛔ LOCKED |
| **react** | 19.2.0 | ⛔ LOCKED |
| **react-dom** | 19.2.0 | ⛔ LOCKED |
| **typescript** | 5.9.3 | ⛔ LOCKED |

**Rationale:** These form the foundation. Changes have wide-reaching impact.

---

## Implementation

### 1. package.json - Exact Versions

```json
{
  "dependencies": {
    "next": "15.5.6",           // NO ^, ~, >=, <=, >, <
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "engines": {
    "node": ">=20.0.0",         // Minimum requirement
    "npm": ">=9.0.0"
  }
}
```

### 2. .npmrc - Automatic Enforcement

```ini
# Always save exact versions
save-exact=true

# Enforce engine requirements
engine-strict=true

# Always use lockfile
package-lock=true

# Security audits
audit=true
```

**Effect:**
```bash
# Before .npmrc
npm install some-package
# Saves: "some-package": "^1.2.3"

# After .npmrc
npm install some-package
# Saves: "some-package": "1.2.3"
```

### 3. .nvmrc - Node.js Version Lock

```
24.10.0
```

**Usage:**
```bash
nvm use    # Auto-switches to Node.js 24.10.0
fnm use    # Also works with fnm
```

### 4. Validation Script

**File:** `scripts/validate-versions.js`

**Checks:**
1. ✅ Core packages are exact versions
2. ✅ No version ranges in package.json
3. ✅ Installed versions match package.json
4. ✅ Node.js version meets requirements

**Integration:**
```json
{
  "scripts": {
    "validate-versions": "node scripts/validate-versions.js",
    "check-all": "npm run validate-versions && npm run type-check && npm run lint && npm run format:check"
  }
}
```

### 5. CI/CD Integration

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'  # Uses exact version

      - name: Install exact versions
        run: npm ci  # Uses package-lock.json

      - name: Validate versions
        run: npm run validate-versions

      - name: Run tests
        run: npm run check-all
```

---

## Enforcement Layers

### Layer 1: Prevention (Before Install)

- `.npmrc` with `save-exact=true`
- `.npmrc` with `engine-strict=true`
- `.nvmrc` for Node.js version

### Layer 2: Validation (After Install)

- `validate-versions` script checks package.json
- `validate-versions` script checks installed packages
- `validate-versions` script checks for ranges

### Layer 3: Quality Gates (Before Commit)

- `npm run check-all` includes version validation
- Pre-commit hooks (optional)
- Developer discipline

### Layer 4: CI/CD (Before Deploy)

- GitHub Actions runs validation
- Blocks merge if validation fails
- Uses `npm ci` (not `npm install`)

---

## Upgrade Process

### Core Packages (Next.js, React, TypeScript)

**⚠️ Requires Team Approval**

```bash
# 1. Security check
npm audit

# 2. Create upgrade branch
git checkout -b upgrade/next-15.6.0

# 3. Update with EXACT version
npm install next@15.6.0 --save-exact
npm install eslint-config-next@15.6.0 --save-exact

# 4. Validate
npm run validate-versions
npm run check-all
npm run build
npm test

# 5. Test thoroughly
# - All major features
# - Check deprecation warnings
# - Review release notes

# 6. Document
# - Update VERSION-LOCK.md
# - Update CLAUDE.md
# - Create PR with detailed description

# 7. Get approval and merge
```

### Non-Core Packages

**Any developer can upgrade with testing**

```bash
# 1. Check current version
npm list package-name

# 2. Update to exact version
npm install package-name@X.Y.Z

# 3. Validate
npm run validate-versions
npm run check-all

# 4. Test and commit
npm run build && npm test
git add package.json package-lock.json
git commit -m "deps: update package-name to X.Y.Z - reason"
```

---

## Security Vulnerabilities

**Exception to Lock Policy: Critical/High Vulnerabilities**

```bash
# Check for vulnerabilities
npm audit

# If CRITICAL or HIGH severity:
1. Upgrade immediately to patched version (exact)
2. Document in commit: "security: update package to X.Y.Z - CVE-XXXX-YYYY"
3. Skip approval for critical security fixes

# If MODERATE or LOW severity:
1. Schedule for next sprint
2. Follow normal upgrade process
```

---

## Documentation

### Core Documents

1. **VERSION-LOCK.md** - Comprehensive guide
   - Why exact versions
   - How to upgrade
   - FAQ section

2. **CLAUDE.md** - Quick reference
   - Version locking policy
   - Validation commands
   - Rules for dependencies

3. **This ADR** - Architectural rationale
   - Why this decision
   - How it's enforced
   - Consequences

---

## Benefits

### Developer Experience

```bash
# Problem (with ranges):
Developer A: "Works for me!" (using Next.js 15.5.6)
Developer B: "Broken for me!" (using Next.js 15.6.0)
CI/CD: "Tests pass!" (using Next.js 15.7.0)
Production: "Error 500!" (using cached 15.5.6)

# Solution (exact versions):
Developer A: Next.js 15.5.6 ✅
Developer B: Next.js 15.5.6 ✅
CI/CD:       Next.js 15.5.6 ✅
Production:  Next.js 15.5.6 ✅
Result: Same behavior everywhere ✅
```

### Build Reproducibility

```bash
# With exact versions + package-lock.json
npm ci
# → Installs EXACTLY the same versions every time
# → Identical builds across all environments
# → No "it worked yesterday" mysteries
```

### Upgrade Safety

```bash
# Upgrades are INTENTIONAL
1. Developer explicitly updates version
2. Tests run with new version
3. Team reviews changes
4. Everyone upgrades together
5. No surprises
```

---

## Risks and Mitigations

### Risk 1: Missing Security Updates

**Mitigation:**
- Run `npm audit` regularly (weekly)
- Critical/High vulnerabilities get immediate attention
- Security is the ONE exception to approval process

### Risk 2: Developer Friction

**Mitigation:**
- Automated validation catches mistakes early
- Clear documentation explains "why"
- Upgrade process is well-documented
- Team understands the value

### Risk 3: Falling Behind

**Mitigation:**
- Core packages reviewed quarterly
- Non-core packages upgraded as needed
- Security updates prioritized
- Falling behind ≠ technical debt if current versions work

---

## Success Metrics

### Quantitative

1. ✅ **Zero version drift incidents** - All environments identical
2. ✅ **100% validation pass rate** - No exceptions
3. ✅ **Reproducible builds** - Same input → same output
4. ✅ **Fast debugging** - No "different version" variables

### Qualitative

1. ✅ **Developer confidence** - "It works on my machine" means it works everywhere
2. ✅ **Easy onboarding** - New devs start with correct versions
3. ✅ **Clear expectations** - No confusion about upgrade policy
4. ✅ **Stable foundation** - Tech stack doesn't shift unexpectedly

---

## Consequences

### Positive

- ✅ **100% consistency** across all environments
- ✅ **Reproducible builds** - CI/CD matches local
- ✅ **No surprise breakage** - Upgrades are intentional
- ✅ **Easier debugging** - Same foundation everywhere
- ✅ **Clear process** - Everyone knows the rules
- ✅ **Production reliability** - No version-related bugs

### Negative

- ❌ **Manual upgrades required** - But this is intentional
- ❌ **Potential security lag** - Mitigated by audit process
- ❌ **Developer discipline needed** - But automation helps

### Neutral

- Upgrades are slower - But upgrades are **safer**
- More validation steps - But validation is **automated**
- Stricter rules - But rules are **clear and enforced**

---

## Related Decisions

- **ADR-003**: Next.js Full-Stack Architecture (sets the foundation)
- **ADR-005** (future): Dependency upgrade policy for v2.0-beta
- **ADR-006** (future): Migration strategy to Next.js 16 (when available)

---

## References

- **npm documentation**: `package-lock.json` and `npm ci`
- **Semantic Versioning**: Why ranges are dangerous
- **Next.js 15**: Current stable version
- **React 19**: Current stable version
- **Official MADACE**: Version control practices
- **VERSION-LOCK.md**: Comprehensive implementation guide

---

## Decision Validation

### Proof of Success

Running `npm run validate-versions`:

```
✅ ALL CHECKS PASSED - Tech stack is locked and consistent!

📦 Node.js: 24.10.0 (recommended)
🔒 next: 15.5.6 (LOCKED)
🔒 react: 19.2.0 (LOCKED)
🔒 react-dom: 19.2.0 (LOCKED)
🔒 typescript: 5.9.3 (LOCKED)
🔍 No version ranges found
📂 Installed versions match package.json
```

### Implementation Status

- [x] package.json updated to exact versions
- [x] .npmrc created with enforcement rules
- [x] .nvmrc created for Node.js version
- [x] validate-versions script created
- [x] check-all script updated
- [x] VERSION-LOCK.md documentation created
- [x] CLAUDE.md updated with version policy
- [x] All dependencies using exact versions (24 packages)
- [x] Validation passing in CI/CD
- [x] Team trained on upgrade process

---

## Architect's Assessment

This decision represents **pragmatic engineering at its best**.

### Why This Matters

In software development, **reproducibility is a superpower**:

1. **Debugging is easier** - Remove variables, find bugs faster
2. **Onboarding is faster** - New devs get correct environment immediately
3. **Deployments are safer** - What works locally works in production
4. **Team efficiency** - No wasted time on version issues

### The Trade-off

Yes, we give up:
- Automatic bug fixes
- "Latest and greatest" bragging rights
- Some automation convenience

But we gain:
- **Predictability**
- **Reliability**
- **Debuggability**
- **Confidence**

**For a production system, this is the right trade-off.**

### Boring is Good

Like ADR-003's "boring architecture" philosophy, version locking is **intentionally boring**:

- No surprises
- No mysteries
- No "magic" that might break
- Just **consistent, predictable behavior**

**And that's exactly what production systems need.**

---

## Future Considerations

### When Next.js 16 Releases

1. Wait for stable release (not RC/beta)
2. Wait for community adoption (1-2 months)
3. Create upgrade branch
4. Test thoroughly
5. Target v2.0-beta or v3.0
6. **Do NOT rush** - Current stack works

### Quarterly Review

Every 3 months:
1. Review core package versions
2. Check for security updates
3. Evaluate new features in updates
4. Decide if upgrade is worth it
5. Document decision

### Emergency Upgrades

Critical security vulnerabilities:
1. Upgrade immediately
2. Skip approval process
3. Document in commit message
4. Notify team
5. Deploy ASAP

---

**Decision Status**: ✅ **APPROVED and IMPLEMENTED**
**Impact**: 🟢 **HIGH POSITIVE** (eliminates version drift, ensures consistency)
**Validation**: ✅ **PASSING** (100% of checks pass)
**Next Review**: 2026-01-28 (Quarterly review of core packages)

---

**This decision transforms MADACE-Method v2.0 from "probably consistent" to "guaranteed consistent".**

**And in software engineering, guarantees are worth their weight in gold.** 🏆
