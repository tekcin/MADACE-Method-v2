# 🔒 Version Lock Documentation

**MADACE-Method v2.0 - Strict Version Control Policy**

This document explains the version locking strategy for MADACE-Method v2.0 and why it's critical for project stability.

## 📋 Table of Contents

- [Locked Versions](#locked-versions)
- [Rationale](#rationale)
- [Enforcement Mechanisms](#enforcement-mechanisms)
- [Validation Process](#validation-process)
- [Upgrading Dependencies](#upgrading-dependencies)
- [FAQ](#faq)

---

## 🔐 Locked Versions

### Core Tech Stack (FROZEN for v2.0-alpha)

```json
{
  "next": "15.5.6",      // ⛔ LOCKED - NO changes
  "react": "19.2.0",     // ⛔ LOCKED - NO changes
  "react-dom": "19.2.0", // ⛔ LOCKED - NO changes
  "typescript": "5.9.3"  // ⛔ LOCKED - NO changes
}
```

### Runtime Requirements

```json
{
  "node": ">=20.0.0",    // Minimum: 20.0.0
  "npm": ">=9.0.0"       // Minimum: 9.0.0
}
```

**Recommended versions:**
- **Node.js**: 24.10.0 (locked in `.nvmrc`)
- **npm**: 10.x or higher

---

## 🎯 Rationale

### Why Exact Versions?

#### 1. **Consistency Across Environments** ✅

```bash
# Developer 1 (with ^)
"next": "^15.5.6"  → installs 15.6.0 (hypothetically)

# Developer 2 (with ^)
"next": "^15.5.6"  → installs 15.5.6

# CI/CD
"next": "^15.5.6"  → installs 15.7.0 (hypothetically)

# Result: 3 different versions = bugs, inconsistencies, wasted time
```

**With exact versions:**
```bash
# Everyone
"next": "15.5.6"  → installs 15.5.6
# Result: 100% consistency
```

#### 2. **Reproducible Builds** ✅

- `npm ci` uses `package-lock.json` for exact installations
- Every build produces identical results
- No "works on my machine" problems

#### 3. **No Surprise Breaking Changes** ✅

Version ranges can introduce breaking changes:

```bash
# Problematic (with ^)
"some-package": "^2.1.0"
# ↓ Can install 2.9.0 which might have breaking changes
# ↓ Your code breaks in production, but worked locally

# Safe (exact version)
"some-package": "2.1.0"
# ↓ Always installs 2.1.0
# ↓ Upgrades are intentional and tested
```

#### 4. **MADACE Compliance** ✅

- Official requirement for v2.0-alpha certification
- Ensures all developers use the same foundation
- Simplifies support and debugging

---

## 🛡️ Enforcement Mechanisms

### 1. package.json (Exact Versions)

All dependencies use exact versions (no `^`, `~`, `>`, `<`):

```json
{
  "dependencies": {
    "next": "15.5.6",           // ✅ Exact
    "react": "19.2.0",          // ✅ Exact
    "zod": "4.1.12"             // ✅ Exact
  }
}
```

❌ **Invalid:**
```json
{
  "dependencies": {
    "next": "^15.5.6",    // ❌ Range operator
    "react": "~19.2.0",   // ❌ Range operator
    "zod": ">=4.0.0"      // ❌ Range operator
  }
}
```

### 2. .npmrc (Automatic Enforcement)

```ini
# Automatically save exact versions
save-exact=true

# Enforce engine requirements
engine-strict=true

# Always use package-lock.json
package-lock=true
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

### 3. .nvmrc (Node.js Version)

```
24.10.0
```

**Usage:**
```bash
# With nvm
nvm use           # Switches to 24.10.0

# With fnm
fnm use           # Switches to 24.10.0

# Manual check
node --version    # Should be v24.10.0
```

### 4. package.json engines (Runtime Requirements)

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  }
}
```

With `engine-strict=true` in `.npmrc`, npm will **refuse to install** if you're using wrong versions.

---

## ✅ Validation Process

### Automated Validation Script

**Location:** `scripts/validate-versions.js`

**What it checks:**
1. ✅ Next.js version is exactly 15.5.6
2. ✅ React version is exactly 19.2.0
3. ✅ React DOM version is exactly 19.2.0
4. ✅ TypeScript version is exactly 5.9.3
5. ✅ Node.js version is >= 20.0.0 (warns if not 24.10.0)
6. ✅ No version ranges in package.json
7. ✅ Installed versions match package.json

### Running Validation

```bash
# Standalone
npm run validate-versions

# As part of quality checks
npm run check-all  # Runs: validate-versions + type-check + lint + format:check
```

### Example Output

```
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
      ✅ PASS: Exact version match

   📌 react:
      Required: 19.2.0 (LOCKED)
      package.json: 19.2.0
      ✅ PASS: Exact version match

   📌 react-dom:
      Required: 19.2.0 (LOCKED)
      package.json: 19.2.0
      ✅ PASS: Exact version match

   📌 typescript:
      Required: 5.9.3 (LOCKED)
      package.json: 5.9.3
      ✅ PASS: Exact version match

🔍 Checking for version ranges in package.json:
   All dependencies should use EXACT versions (no ^, ~, >, <)
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
```

### CI/CD Integration

Add to your CI/CD pipeline (e.g., GitHub Actions):

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'  # Uses 24.10.0

      - name: Install dependencies
        run: npm ci  # Uses exact versions from package-lock.json

      - name: Validate versions
        run: npm run validate-versions  # Enforces version lock

      - name: Run tests
        run: npm run check-all
```

---

## 📦 Upgrading Dependencies

### Core Packages (Next.js, React, TypeScript)

**⚠️ FROZEN for v2.0-alpha - Requires team approval**

**Process:**

1. **Security Check**
   ```bash
   npm audit
   # Check for critical vulnerabilities in core packages
   ```

2. **Team Discussion**
   - Create GitHub issue/discussion
   - Document reason for upgrade (security, features, etc.)
   - Get consensus from team lead

3. **Create Upgrade Branch**
   ```bash
   git checkout -b upgrade/next-15.6.0
   ```

4. **Update Versions**
   ```bash
   # Example: Upgrading Next.js
   npm install next@15.6.0 --save-exact
   npm install eslint-config-next@15.6.0 --save-exact
   ```

5. **Validate**
   ```bash
   npm run validate-versions  # Should pass with new versions
   npm run check-all          # All quality checks
   npm run build              # Production build
   npm test                   # All tests
   ```

6. **Test Thoroughly**
   - Test all major features
   - Check for deprecation warnings
   - Review breaking changes in release notes
   - Test in staging environment

7. **Document**
   - Update VERSION-LOCK.md with new versions
   - Update CLAUDE.md
   - Create migration guide if needed

8. **Merge**
   - Create PR with detailed description
   - Get code review
   - Merge to main after approval

### Non-Core Packages

**Can be upgraded by any developer with proper testing**

**Process:**

```bash
# 1. Check current version
npm list <package-name>
# Example: npm list zod
# Output: zod@4.1.12

# 2. Check available versions
npm view <package-name> versions
# Example: npm view zod versions

# 3. Update to specific version (EXACT, no ranges!)
npm install <package-name>@<exact-version>
# Example: npm install zod@4.2.0

# 4. Validate
npm run validate-versions
npm run check-all

# 5. Test thoroughly
npm run build
npm test

# 6. Commit with clear message
git add package.json package-lock.json
git commit -m "deps: update zod to 4.2.0 - improved validation performance"

# 7. Create PR
git push origin upgrade/zod-4.2.0
# Create PR on GitHub
```

---

## ❓ FAQ

### Q: Why can't I use `^` or `~` in package.json?

**A:** Version ranges introduce unpredictability:

```bash
# With "^15.5.6":
Developer A installs: 15.5.6
Developer B installs: 15.6.0 (released yesterday)
CI/CD installs: 15.7.0 (released today)
# Result: 3 different versions = potential bugs
```

Exact versions ensure everyone uses the same code.

### Q: What if there's a security vulnerability?

**A:** Security vulnerabilities are the ONLY exception to the lock policy:

1. Check severity: `npm audit`
2. If **CRITICAL** or **HIGH**: Upgrade immediately
3. If **MODERATE** or **LOW**: Schedule for next sprint
4. Follow the upgrade process above
5. Document in commit message: `security: update package to X.Y.Z - CVE-XXXX-YYYY`

### Q: Can I use `npm install` or must I use `npm ci`?

**A:**

- **Development:** `npm install` is OK (with `.npmrc` enforcing exact versions)
- **CI/CD:** **ALWAYS use `npm ci`** (uses lockfile for reproducibility)
- **After pull:** `npm ci` recommended (faster + more reliable)

### Q: What if `npm audit` shows vulnerabilities?

**A:**

```bash
# Check audit
npm audit

# Review recommendations
npm audit fix  # DON'T RUN THIS! It may use version ranges

# Instead, upgrade manually:
npm install vulnerable-package@<safe-exact-version>
npm run validate-versions
npm run check-all
```

### Q: My IDE shows "Update available" for packages. Should I upgrade?

**A:**

- **Core packages (Next.js, React, TypeScript):** NO - Follow team approval process
- **Non-core packages:** YES - But follow the upgrade process above
- **Never use "Update all"** - Upgrade packages individually and test

### Q: What happens if I accidentally add a version range?

**A:**

The validation script will catch it:

```bash
npm run validate-versions
# ⚠️  Found version ranges:
#     dependencies: some-package = "^1.2.3"
# ❌ VALIDATION FAILED
```

Fix it:
```bash
npm install some-package@1.2.3  # Exact version
npm run validate-versions       # Should pass now
```

### Q: Why is Node.js 24.10.0 recommended but not enforced?

**A:**

- **Minimum:** 20.0.0 (enforced by `engines.node` in package.json)
- **Recommended:** 24.10.0 (locked in `.nvmrc` for consistency)
- Node.js versions 20.x through 24.x should all work
- But 24.10.0 is **tested and verified** - use it for consistency

### Q: Can I upgrade to Next.js 16 when it's released?

**A:**

**NO - not for v2.0-alpha release.**

Wait for:
1. Next.js 16 stable release (not RC/beta)
2. Community adoption (1-2 months)
3. Team approval and testing
4. Likely target: v2.0-beta or v3.0

For v2.0-alpha: **Next.js 15.5.6 is FROZEN.**

---

## 📝 Summary

### ✅ DO:
- Use exact versions in package.json
- Run `npm run validate-versions` before commits
- Use `npm ci` in CI/CD
- Commit package-lock.json
- Follow upgrade process for dependencies
- Test thoroughly after upgrades

### ❌ DON'T:
- Use version ranges (^, ~, >=, <=, >, <)
- Upgrade core packages without team approval
- Run `npm audit fix` (may use ranges)
- Skip validation checks
- Use different Node.js versions across team

### 🚀 Quick Commands

```bash
# Check versions
npm run validate-versions

# Full quality check (includes version validation)
npm run check-all

# Install with exact versions
npm ci

# Check Node.js version
node --version  # Should be v24.10.0

# Switch Node.js version (with nvm)
nvm use
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-28
**Status:** Active for MADACE-Method v2.0-alpha
