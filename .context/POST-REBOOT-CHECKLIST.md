# POST-REBOOT CHECKLIST

**Quick reference for what to do after system reboot**

---

## ✅ IMMEDIATE ACTIONS (Do These First)

### 1. Navigate to Project Directory
```bash
cd /Users/nimda/MADACE-Method-v2.0
```

### 2. Start Development Services
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Prisma Studio (database GUI)
npm run db:studio
```

### 3. Verify Services Are Running
```bash
# Check Next.js (should return HTML)
curl -I http://localhost:3000

# Check Prisma Studio (should return 200 OK)
curl -I http://localhost:5555
```

### 4. Verify Database State (Zodiac App Data)
```bash
npm run view:zodiac
```

**Expected Output**:
- ✅ 3 team members (Alice, Bob, Carol)
- ✅ 12 stories (5 DONE, 1 IN_PROGRESS, 1 TODO, 5 BACKLOG)
- ✅ 3 workflows (2 completed, 1 in-progress)

---

## 🔄 RESTART CLAUDE CODE

**Required to activate Chrome DevTools MCP server**

The `.mcp.json` file has been updated with Chrome DevTools MCP configuration.
After restarting Claude Code, you'll have access to 26 browser automation tools.

---

## 🧪 TEST SYSTEM (Do These After Services Start)

### Browser Interface Tests
```
✅ http://localhost:3000           # Home Dashboard
✅ http://localhost:3000/status    # Kanban Board (should show 12 Zodiac stories)
✅ http://localhost:3000/workflows # Workflow execution
✅ http://localhost:3000/chat      # Chat interface
✅ http://localhost:5555           # Prisma Studio (database tables)
```

### CLI Tests
```bash
✅ npm run madace repl             # Interactive REPL
✅ npm run madace dashboard        # Terminal dashboard
✅ npm run madace chat             # CLI chat
```

---

## 🎯 CHROME DEVTOOLS MCP TESTING

**After Claude Code Restart**, ask Claude to:

1. Open http://localhost:3000 in Chrome
2. Take screenshot of dashboard
3. Navigate to http://localhost:3000/status
4. Take screenshot of Zodiac App Kanban board
5. Analyze network requests and performance

---

## 📊 EXPECTED STATE

### Database
- **Type**: SQLite (development)
- **Location**: `prisma/dev.db`
- **Status**: Seeded with Zodiac App dummy project
- **Project ID**: `cmhe949rp0000rzhh5s2p4yfs`

### Git
- **Branch**: `main`
- **Last Commit**: `cbbc4b5` - docs: Update PRD and PLAN
- **Status**: Clean (no uncommitted changes)

### Services
- **Next.js**: Port 3000
- **Prisma Studio**: Port 5555
- **Ollama**: Not running (optional)

---

## 🆘 IF SOMETHING BREAKS

### Services Won't Start
```bash
# Kill stuck processes
lsof -ti:3000 | xargs kill -9
lsof -ti:5555 | xargs kill -9

# Restart
npm run dev
npm run db:studio
```

### Database Issues
```bash
# Regenerate Prisma Client
npm run db:generate

# Re-seed Zodiac App
npm run seed:zodiac
```

### Build Issues
```bash
# Clean and rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 📁 SESSION STATE REFERENCE

Full session details saved in:
- `.context/SESSION-STATE-CURRENT.md` (comprehensive state)
- `.context/POST-REBOOT-CHECKLIST.md` (this file)
- `.context/RESUME.md` (project resume)

---

**Last Updated**: 2025-10-31 02:50:00 UTC
**Status**: 🟢 READY FOR REBOOT
