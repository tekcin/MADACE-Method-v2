# ✅ Post-Reboot Checklist

**Date**: October 30, 2025
**Purpose**: Quick verification after system reboot

---

## Step 1: System Check (2 minutes)

```bash
# Navigate to project
cd /Users/nimda/MADACE-Method-v2.0

# Verify Node.js
node --version
# Expected: v24.10.0

# Start dev server
npm run dev
# Expected: Server starts on http://localhost:3000
```

**Status**: [ ] Dev server running

---

## Step 2: Claude Code Restart (1 minute)

1. **Completely quit Claude Code**: `Cmd+Q`
2. **Reopen Claude Code**
3. **Open project**: /Users/nimda/MADACE-Method-v2.0

**Status**: [ ] Claude Code restarted

---

## Step 3: Verify Context7 MCP (2 minutes)

**Check MCP is loaded**:
- Look for MCP servers in Claude Code status
- Should see: "context7" listed

**Test Context7**:
```
use context7 to help me understand Next.js 15.5.6 App Router
```

**Expected**: Response includes up-to-date Next.js 15.5.6 documentation

**Status**: [ ] Context7 working

---

## Step 4: Verify Console.log Cleanup (1 minute)

```bash
# Run ESLint
npm run lint
# Expected: No console.log warnings

# Check specific counts
npm run lint 2>&1 | grep -c "console"
# Expected: 0 (or only console.error/warn mentions)
```

**Status**: [ ] ESLint passing (0 console.log warnings)

---

## Step 5: Quality Checks (3 minutes)

```bash
# Run all checks
npm run check-all

# Individual checks
npm run type-check    # May show pre-existing test errors (OK)
npm run lint          # Should pass
npm run format:check  # Should pass
npm run build         # Should compile in ~6s
```

**Status**: [ ] Build passing [ ] Lint passing

---

## Step 6: Optional - Get Context7 API Key

If you want higher rate limits:

1. Visit: https://context7.com/dashboard
2. Create free account
3. Copy API key
4. Update `.mcp.json`:
   ```json
   {
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["-y", "@upstash/context7-mcp@latest"],
         "env": {
           "CONTEXT7_API_KEY": "your-key-here"
         }
       }
     }
   }
   ```
5. Restart Claude Code again

**Status**: [ ] API key added (optional)

---

## 🎯 Success Criteria

All must be ✅ to consider session resumed successfully:

- [x] Dev server running on http://localhost:3000
- [x] Claude Code restarted and project opened
- [x] Context7 MCP loaded and working
- [x] ESLint passing with 0 console.log warnings
- [x] Production build compiles successfully

---

## 📞 If Something Doesn't Work

**Dev server won't start**:
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Context7 not loaded**:
```bash
# Verify config exists
cat .mcp.json

# Check format is valid
cat .mcp.json | jq .

# Restart Claude Code completely
```

**ESLint issues**:
```bash
# Re-run to see details
npm run lint

# Check specific file
npx eslint path/to/file.ts
```

---

## 📁 Reference Files

- **Full Details**: `.context/SESSION-STATE.md`
- **Quick Status**: `.context/QUICK-STATUS.txt`
- **This Checklist**: `.context/POST-REBOOT-CHECKLIST.md`

---

**Estimated Time**: 10 minutes total
**Priority**: Complete Steps 1-5, Step 6 is optional
