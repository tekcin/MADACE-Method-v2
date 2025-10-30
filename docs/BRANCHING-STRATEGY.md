# MADACE v3.0 Branching Strategy

**Last Updated**: 2025-10-30
**Version**: 1.0.0

This document defines the Git branching strategy for MADACE v3.0 development.

---

## Overview

MADACE v3.0 uses a **simplified Git Flow** branching model with three types of branches:

1. **Main Branch** (`main`) - Production-ready code
2. **Development Branch** (`develop/v3`) - Integration branch for v3.0
3. **Task Branches** (`task/XXX`) - Feature/fix development

This strategy supports:

- Parallel feature development
- Clean release history
- MADACE Method workflow (BACKLOG → TODO → IN PROGRESS → DONE)
- Single source of truth (main branch)

---

## Branch Types

### 1. Main Branch (`main`)

**Purpose**: Production-ready, stable code

**Rules**:

- Always deployable
- Protected branch (no direct commits)
- All changes via pull requests
- Requires CI/CD checks to pass
- Tagged with release versions (e.g., `v3.2-alpha`)

**Workflow**:

```bash
# Never commit directly to main
# Always merge via PR from task branches or develop/v3
```

### 2. Development Branch (`develop/v3`)

**Purpose**: Integration branch for v3.0 development

**Rules**:

- Contains latest v3.0 development work
- May be temporarily unstable during integration
- Periodically merged to `main` for releases
- Protected branch (no direct commits recommended)

**Workflow**:

```bash
# Merge completed task branches to develop/v3
git checkout develop/v3
git pull origin develop/v3
git merge task/XXX
git push origin develop/v3

# When ready for release, merge to main
git checkout main
git merge develop/v3
git tag v3.X-alpha
git push origin main --tags
```

### 3. Task Branches (`task/XXX`)

**Purpose**: Individual story/feature development

**Naming Convention**:

```
task/<story-number>
task/<story-id>
task/<feature-name>

Examples:
- task/001  (Task #1)
- task/DB-001  (Database setup story)
- task/CHAT-001  (Chat feature story)
```

**Rules**:

- Branch from `develop/v3` or `main`
- One branch per MADACE story (matches IN PROGRESS state)
- Delete after merging (keep git history clean)
- Small, focused changes (< 1000 lines recommended)

**Workflow**:

```bash
# 1. Create task branch
git checkout develop/v3
git pull origin develop/v3
git checkout -b task/PLAN-003
git push -u origin task/PLAN-003

# 2. Work on feature
git add .
git commit -m "feat(plan): Add branching strategy docs"
git push

# 3. When ready, create PR and merge
# After merge, delete branch
git checkout develop/v3
git branch -d task/PLAN-003
git push origin --delete task/PLAN-003
```

---

## Branching Flow Diagram

```
main (production)
  │
  ├─── v3.1-alpha (tag)
  ├─── v3.2-alpha (tag)
  ├─── v3.3-alpha (tag)
  │
  └─── develop/v3 (integration)
         │
         ├─── task/001 (merged, deleted)
         ├─── task/DB-001 (merged, deleted)
         ├─── task/CHAT-001 (merged, deleted)
         └─── task/PLAN-003 (active)
```

---

## Integration with MADACE Method

The branching strategy aligns with MADACE state machine:

| MADACE State    | Git Action                       |
| --------------- | -------------------------------- |
| **BACKLOG**     | Story exists, no branch yet      |
| **TODO**        | Story ready, no branch yet       |
| **IN PROGRESS** | Create `task/XXX` branch         |
| **DONE**        | Merge branch, delete task branch |

**Example Workflow**:

```bash
# Story moves from TODO → IN PROGRESS
# Create task branch
git checkout -b task/MEMORY-003

# Work on story
# Make commits following conventional commit format

# Story moves IN PROGRESS → DONE
# Create PR, get approval, merge to develop/v3
# Delete task/MEMORY-003 branch
```

---

## Commit Message Format

Use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `style`: Code style changes (formatting, no logic change)

**Examples**:

```bash
feat(chat): Add message threading support
fix(memory): Correct importance decay calculation
docs(branching): Add branching strategy guide
test(nlu): Add entity resolver tests
refactor(agents): Extract prompt builder logic
chore(deps): Update Next.js to 15.5.6
```

---

## Branch Protection Rules

### Main Branch (`main`)

**Required**:

- ✅ Require pull request before merging
- ✅ Require status checks to pass
  - TypeScript compilation (`npm run type-check`)
  - Linting (`npm run lint`)
  - Tests (`npm test`)
  - Build (`npm run build`)
- ✅ Require conversation resolution before merging
- ✅ No force pushes
- ✅ No branch deletion

### Development Branch (`develop/v3`)

**Recommended**:

- ⚠️ Allow direct commits (for quick fixes during development)
- ✅ Require status checks to pass
- ✅ No force pushes

### Task Branches (`task/XXX`)

**Flexible**:

- No restrictions (developer freedom)
- Can be force-pushed during development
- Can be rebased before merging
- Deleted after merge

---

## Branch Cleanup

### Merged Branches

Delete merged task branches to keep repository clean:

```bash
# List merged branches
git branch --merged main

# Delete local merged branches (except main, develop/v3)
git branch --merged main | grep -E "task/" | xargs git branch -d

# Delete remote merged branches
git branch -r --merged main | grep -E "task/" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

### Stale Branches

Review and delete stale branches (no commits in 30+ days):

```bash
# Find stale branches
git for-each-ref --sort=-committerdate refs/heads/ --format='%(refname:short)|%(committerdate:iso)'

# Delete stale branch
git branch -D task/XXX
git push origin --delete task/XXX
```

---

## Release Process

MADACE v3.0 uses **alpha releases** during development:

### Alpha Release Workflow

1. **Complete a Milestone** (e.g., Milestone 3.3)
2. **Merge to Main**:

   ```bash
   git checkout main
   git pull origin main
   git merge develop/v3
   git push origin main
   ```

3. **Tag Release**:

   ```bash
   git tag v3.3-alpha
   git push origin v3.3-alpha
   ```

4. **Update Changelog**:
   - Document features, fixes, breaking changes
   - Update `docs/workflow-status.md`
   - Create GitHub release with notes

### Release Naming

- `v3.1-alpha` - Milestone 3.1 (Database Migration)
- `v3.2-alpha` - Milestone 3.2 (CLI Enhancements)
- `v3.3-alpha` - Milestone 3.3 (Conversational AI & NLU)
- `v3.4-alpha` - Milestone 3.4 (Web IDE & Collaboration)
- `v3.0.0` - Final v3.0 production release

---

## Common Scenarios

### Scenario 1: Start New Story

```bash
# 1. Pull latest develop/v3
git checkout develop/v3
git pull origin develop/v3

# 2. Create task branch
git checkout -b task/DB-005
git push -u origin task/DB-005

# 3. Update workflow-status.md (move story to IN PROGRESS)
# 4. Start coding!
```

### Scenario 2: Finish Story

```bash
# 1. Ensure all changes committed
git add .
git commit -m "feat(db): Complete agent CRUD API endpoints"

# 2. Push to remote
git push origin task/DB-005

# 3. Create Pull Request (GitHub UI)
# 4. Get review, address feedback
# 5. Merge PR
# 6. Update workflow-status.md (move story to DONE)

# 7. Clean up local branch
git checkout develop/v3
git pull origin develop/v3
git branch -d task/DB-005
```

### Scenario 3: Sync with Main

If `main` receives hotfixes, sync `develop/v3`:

```bash
git checkout develop/v3
git pull origin develop/v3
git merge main
git push origin develop/v3

# Update task branches if needed
git checkout task/XXX
git merge develop/v3
```

### Scenario 4: Hotfix for Production

For critical bugs in `main`:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix bug
git add .
git commit -m "fix(api): Resolve memory leak in chat stream"

# 3. Merge to main
git checkout main
git merge hotfix/critical-bug
git tag v3.2.1-alpha
git push origin main --tags

# 4. Merge to develop/v3
git checkout develop/v3
git merge hotfix/critical-bug
git push origin develop/v3

# 5. Delete hotfix branch
git branch -d hotfix/critical-bug
```

---

## Best Practices

### DO:

- ✅ Keep task branches small and focused
- ✅ Commit frequently with meaningful messages
- ✅ Pull latest `develop/v3` before creating task branch
- ✅ Delete merged branches promptly
- ✅ Use conventional commit format
- ✅ Run `npm run check-all` before pushing
- ✅ Keep one task branch active per developer
- ✅ Tag all milestone releases

### DON'T:

- ❌ Commit directly to `main`
- ❌ Force push to `main` or `develop/v3`
- ❌ Leave stale branches for > 30 days
- ❌ Mix multiple stories in one branch
- ❌ Skip CI/CD checks
- ❌ Commit sensitive data (API keys, secrets)
- ❌ Create long-lived feature branches (> 2 weeks)

---

## FAQ

**Q: When should I branch from `main` vs `develop/v3`?**

A: Always branch from `develop/v3` for new features. Only branch from `main` for hotfixes.

**Q: How many task branches can I have active?**

A: Ideally **one** per developer, matching the MADACE rule (one story IN PROGRESS at a time).

**Q: What if my task branch conflicts with `develop/v3`?**

A: Merge `develop/v3` into your task branch and resolve conflicts:

```bash
git checkout task/XXX
git merge develop/v3
# Resolve conflicts
git add .
git commit
git push
```

**Q: Can I rebase my task branch?**

A: Yes, but only if you're the only one working on it. Never rebase shared branches.

**Q: How do I handle long-running stories (> 1 week)?**

A: Break them into smaller sub-stories with separate task branches. Merge incrementally.

**Q: What if I need to switch stories mid-development?**

A: Commit or stash your work, then create a new branch:

```bash
git add .
git stash
git checkout develop/v3
git checkout -b task/URGENT-FIX
```

---

## Tools and Automation

### Branch Cleanup Script

Create `.github/scripts/cleanup-branches.sh`:

```bash
#!/bin/bash
# Auto-delete merged task branches

git fetch --prune

# Delete local merged branches
git branch --merged main | grep -E "task/" | xargs git branch -d

echo "Cleanup complete!"
```

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Run quality checks before commit

npm run type-check && npm run lint && npm run format:check
```

---

## References

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [MADACE Method](../README.md)

---

**For questions or improvements, contact the MADACE team.**
