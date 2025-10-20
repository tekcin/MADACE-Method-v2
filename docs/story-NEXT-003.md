# [NEXT-003] Setup ESLint and Prettier

**Status:** Ready (IN PROGRESS)
**Points:** 2
**Epic:** Milestone 1.1 - Next.js Project Foundation
**Created:** 2025-10-20
**Completed:** _[Pending]_
**Assigned:** DEV Agent
**Actual Time:** _[To be filled after completion]_

---

## Description

Configure ESLint and Prettier for the Next.js project to enforce consistent code quality and formatting standards across the MADACE-Method v2.0 codebase.

**Context:**

- [NEXT-001] completed - Next.js 15 is initialized with basic ESLint
- [NEXT-002] completed - Project structure is organized
- We need comprehensive linting rules for TypeScript + React + Tailwind CSS
- Prettier will auto-format code for consistency

**Why This Story:**
Establishing code quality tools early prevents technical debt and ensures all code follows consistent patterns. This is especially important for a framework project like MADACE where code quality directly impacts user experience.

---

## Acceptance Criteria

- [ ] ESLint configured with Next.js + TypeScript + React 19 rules
- [ ] Prettier configured with Tailwind CSS plugin
- [ ] ESLint and Prettier work together without conflicts
- [ ] `.eslintrc.json` updated with MADACE-specific rules
- [ ] `.prettierrc` created with formatting preferences
- [ ] `.prettierignore` created to exclude generated files
- [ ] npm scripts added: `lint`, `lint:fix`, `format`, `format:check`
- [ ] Pre-commit hook configured (optional, recommended)
- [ ] All existing code passes linting
- [ ] All existing code is properly formatted
- [ ] No TypeScript errors after configuration
- [ ] Configuration documented in README.md

---

## Implementation Plan

### Step 1: Install Dependencies

```bash
npm install --save-dev \
  eslint-config-next@latest \
  eslint-config-prettier \
  prettier \
  prettier-plugin-tailwindcss \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser
```

### Step 2: Configure ESLint

Update `.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals", "next/typescript", "prettier"],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // React
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Next.js
    "@next/next/no-html-link-for-pages": "error",

    // General
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

### Step 3: Configure Prettier

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Step 4: Create .prettierignore

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
.next
out
build
dist

# Cache
.turbo
.eslintcache

# Environment
.env
.env.local
.env.production.local
.env.development.local

# Misc
.DS_Store
*.pem

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Generated files
madace-data
```

### Step 5: Add npm Scripts

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check-all": "npm run type-check && npm run lint && npm run format:check"
  }
}
```

### Step 6: Fix Existing Code

Run linting and formatting on existing code:

```bash
# Format all code
npm run format

# Fix auto-fixable lint issues
npm run lint:fix

# Check for remaining issues
npm run check-all
```

### Step 7: Update Documentation

Add to README.md under "Development" section:

```markdown
## Code Quality

This project uses ESLint and Prettier for code quality and formatting.

**Commands:**

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Auto-fix linting errors
- `npm run format` - Format all code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run check-all` - Run type checking, linting, and format check

**Editor Integration:**

- VSCode: Install ESLint and Prettier extensions
- Configure format on save in `.vscode/settings.json`
```

### Step 8: (Optional) Setup Pre-commit Hook

Install husky for git hooks:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Create `lint-staged` config in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

---

## Technical Notes

### ESLint + Prettier Integration

ESLint and Prettier can conflict. We solve this by:

1. Using `eslint-config-prettier` to disable ESLint formatting rules
2. Letting Prettier handle all formatting
3. Using ESLint only for code quality rules

### Tailwind CSS Class Sorting

`prettier-plugin-tailwindcss` automatically sorts Tailwind classes:

```tsx
// Before
<div className="p-4 text-sm bg-blue-500 rounded-lg mt-2">

// After (automatically sorted)
<div className="mt-2 rounded-lg bg-blue-500 p-4 text-sm">
```

### TypeScript-Specific Rules

We use `@typescript-eslint` for TypeScript-aware linting:

- Catches unused variables (with `_` prefix escape hatch)
- Warns on `any` type usage
- Enforces modern TypeScript patterns

---

## Testing Checklist

**Installation:**

- [ ] All ESLint dependencies installed
- [ ] All Prettier dependencies installed
- [ ] `package-lock.json` updated

**Configuration:**

- [ ] `.eslintrc.json` exists and valid
- [ ] `.prettierrc` exists and valid
- [ ] `.prettierignore` exists

**Functionality:**

- [ ] `npm run lint` runs without errors
- [ ] `npm run format` formats code
- [ ] `npm run check-all` passes
- [ ] Tailwind classes are sorted by Prettier

**Documentation:**

- [ ] README.md updated with code quality section
- [ ] Commands documented

**Code Quality:**

```bash
# All of these should pass:
npm run type-check
npm run lint
npm run format:check
```

---

## Dependencies

**Depends On:**

- [NEXT-001] Initialize Next.js 15 project (DONE) ✅
- [NEXT-002] Configure project structure (DONE) ✅

**Blocks:**

- [NEXT-004] Configure environment variables
- All future code implementation stories

---

## Risks & Mitigations

**Risk 1: ESLint/Prettier Conflicts**

- **Risk:** Rules may conflict causing confusion
- **Mitigation:** Use `eslint-config-prettier` to disable ESLint formatting
- **Likelihood:** Low (using proven configuration)

**Risk 2: Strict Rules Block Development**

- **Risk:** Overly strict rules slow down development
- **Mitigation:** Start with warnings, elevate to errors gradually
- **Likelihood:** Low (balanced configuration)

**Risk 3: Breaking Existing Code**

- **Risk:** Formatting changes may break functionality
- **Mitigation:** Test after formatting, review changes carefully
- **Likelihood:** Very Low (Prettier is safe)

---

## Definition of Done

This story is considered DONE when:

1. ✅ ESLint configured with Next.js + TypeScript + React rules
2. ✅ Prettier configured with Tailwind CSS plugin
3. ✅ `.eslintrc.json`, `.prettierrc`, `.prettierignore` created
4. ✅ npm scripts added (`lint`, `lint:fix`, `format`, `format:check`, `check-all`)
5. ✅ All existing code passes `npm run check-all`
6. ✅ All existing code is formatted with Prettier
7. ✅ No TypeScript errors
8. ✅ README.md updated with code quality documentation
9. ✅ Git committed with clear message
10. ✅ Story moved to DONE in workflow status
11. ✅ Next story [NEXT-004] moved to TODO

---

## Time Estimate

**Estimated Time:** 30-45 minutes

**Breakdown:**

- Install dependencies: 5 minutes
- Configure ESLint: 10 minutes
- Configure Prettier: 5 minutes
- Add npm scripts: 5 minutes
- Fix existing code: 10 minutes
- Update documentation: 5 minutes
- Testing and verification: 5 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Ensure [NEXT-002] is complete
- Review existing Next.js ESLint configuration
- Understand ESLint vs Prettier responsibilities

### During Implementation

- Install dependencies one step at a time
- Test configuration after each step
- Review formatting changes before committing
- Don't skip documentation updates

### After Completion

- Run `npm run check-all` to verify everything passes
- Commit with descriptive message
- Update workflow status
- Configure your editor to use ESLint + Prettier

---

## Related Documentation

- [Next.js ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [Prettier](https://prettier.io/docs/en/index.html)
- [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [typescript-eslint](https://typescript-eslint.io/)

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Pending review with *story-ready workflow]_
**Implemented By:** _[DEV Agent will guide implementation]_
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20
