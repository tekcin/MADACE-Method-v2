# MADACE Development Guide

This guide explains how to develop MADACE using the **development container** with VSCode Server and Cursor pre-installed.

---

## Quick Start (Development Container)

```bash
# 1. Clone repository
git clone <repo-url>
cd MADACE-Method v2.0

# 2. Create data folder
mkdir madace-data

# 3. Start development container
docker-compose -f docker-compose.dev.yml up -d

# 4. Access development environment
# VSCode Server: http://localhost:8080
# Password: madace123
```

---

## What's Included

The development container comes with **everything pre-installed**:

### IDEs
- **VSCode Server** (code-server) on port 8080
- **Cursor IDE** on port 8081
- All extensions pre-configured

### Development Tools
- Node.js 20
- TypeScript, ts-node
- ESLint, Prettier
- Jest, Testing Library
- Git, curl, wget, vim, nano

### LLM Integration
- Claude CLI (`@anthropic-ai/claude-cli`)
- Ready for Gemini CLI integration

### VSCode Extensions
- ESLint (JavaScript/TypeScript linting)
- Prettier (Code formatting)
- Tailwind CSS IntelliSense
- TypeScript support
- Path Intellisense
- ES7 React Snippets
- Pretty TypeScript Errors

---

## Development Workflow

### 1. Access VSCode in Browser

```bash
# Start container
docker-compose -f docker-compose.dev.yml up -d

# Open browser
open http://localhost:8080

# Login
# Password: madace123
```

### 2. Edit Code

All code changes are **live-synced** between host and container:

```
Host: ./MADACE-Method v2.0/
  ↕ (live sync)
Container: /workspace/
```

**Edit files in browser → Auto-saves → Hot reload in Next.js**

### 3. View Changes

```
Next.js dev server: http://localhost:3000
Auto-reloads on file changes
```

### 4. Run Commands

**Inside VSCode terminal:**
```bash
npm run dev          # Start Next.js dev server
npm test             # Run tests
npm run lint         # Lint code
npm run build        # Build for production
```

---

## Container Management

### Start Container

```bash
# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Start with logs (foreground)
docker-compose -f docker-compose.dev.yml up

# View logs after starting
docker-compose -f docker-compose.dev.yml logs -f
```

### Stop Container

```bash
# Stop container (preserves volumes)
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.dev.yml down -v
```

### Restart Container

```bash
# Quick restart
docker-compose -f docker-compose.dev.yml restart

# Or stop and start
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

### Rebuild Container

After changing `Dockerfile.dev`:

```bash
# Rebuild image
docker-compose -f docker-compose.dev.yml build

# Rebuild and start
docker-compose -f docker-compose.dev.yml up -d --build
```

### Access Container Shell

```bash
# Bash shell as dev user
docker exec -it madace-dev bash

# Root shell (for system changes)
docker exec -it -u root madace-dev bash
```

---

## Ports

| Port | Service | URL |
|------|---------|-----|
| 3000 | Next.js Dev Server | http://localhost:3000 |
| 8080 | VSCode Server | http://localhost:8080 |
| 8081 | Cursor (if enabled) | http://localhost:8081 |

---

## Data Persistence

### What's Persisted

The development container uses **named volumes** for persistence:

```yaml
volumes:
  - .:/workspace                           # Source code (live sync)
  - ./madace-data:/workspace/madace-data  # User data
  - madace-node-modules:/workspace/node_modules
  - madace-vscode-extensions:/home/dev/.local/share/code-server
  - madace-cursor-config:/home/dev/.config/Cursor
```

### Source Code

- **Host**: `./MADACE-Method v2.0/`
- **Container**: `/workspace/`
- **Sync**: Live (two-way)

Any changes in the host directory instantly appear in the container and vice versa.

### User Data

- **Host**: `./madace-data/`
- **Container**: `/workspace/madace-data/`
- **Contents**:
  - `config/config.yaml` - MADACE configuration
  - `config/.env` - API keys and secrets
  - `docs/` - Generated documents
  - `agents/custom/` - Custom agents
  - `workflows/custom/` - Custom workflows

### Dependencies

```bash
# node_modules persisted in named volume
# Faster than host mount, survives container restarts
madace-node-modules:/workspace/node_modules
```

### VSCode Extensions

```bash
# Extensions persist across container restarts
madace-vscode-extensions:/home/dev/.local/share/code-server
```

---

## Hot Reload

The development container enables **hot reload** for instant feedback:

### Configuration

```typescript
// next.config.js (auto-configured in container)
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,           // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
    };
    return config;
  },
};
```

### Environment Variables

```yaml
# docker-compose.dev.yml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
```

### Testing Hot Reload

1. Open http://localhost:3000 in browser
2. Edit `app/page.tsx` in VSCode (port 8080)
3. Save file
4. Browser refreshes automatically ✅

---

## Development Commands

### Next.js

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run lint:fix     # Lint and auto-fix
```

### TypeScript

```bash
npx tsc --noEmit     # Type check without emitting
npx tsc --watch      # Type check in watch mode
```

### Testing

```bash
npm test             # Run all tests
npm test -- --watch  # Watch mode
npm test -- --coverage  # With coverage report
npm test -- MyComponent  # Specific test file
```

### Code Quality

```bash
npm run format       # Format with Prettier
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix ESLint issues
```

### Git

```bash
git status           # Check status
git add .            # Stage changes
git commit -m "msg"  # Commit
git push             # Push to remote
```

### Claude CLI

```bash
claude --version     # Check installation
claude               # Interactive mode
claude "Your prompt" # One-off prompt
```

---

## Debugging

### Next.js Debug Mode

```bash
# Start with debugging
NODE_OPTIONS='--inspect' npm run dev

# Access debugger
# Chrome: chrome://inspect
# VSCode: Attach to port 9229
```

### View Container Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs

# Follow logs (live)
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs madace-dev

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100
```

### Check Container Status

```bash
# Container status
docker ps

# Resource usage
docker stats madace-dev

# Inspect configuration
docker inspect madace-dev
```

---

## Customization

### Change VSCode Password

Edit `docker-compose.dev.yml`:

```yaml
environment:
  - CODE_SERVER_PASSWORD=your-new-password
```

Rebuild:
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

### Install Additional VSCode Extensions

**Method 1: Inside VSCode Server**
1. Open http://localhost:8080
2. Click Extensions (Ctrl+Shift+X)
3. Search and install

**Method 2: Via Dockerfile.dev**
Edit `Dockerfile.dev`:
```dockerfile
RUN code-server --install-extension publisher.extension-name
```

Rebuild:
```bash
docker-compose -f docker-compose.dev.yml build
```

### Install Additional npm Packages

**Temporary (lost on rebuild):**
```bash
docker exec -it madace-dev bash
npm install package-name
```

**Permanent:**
Add to `package.json` and rebuild:
```bash
docker-compose -f docker-compose.dev.yml build
```

### Change Port Mappings

Edit `docker-compose.dev.yml`:
```yaml
ports:
  - "3001:3000"    # Host 3001 → Container 3000
  - "8888:8080"    # Host 8888 → Container 8080
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.dev.yml
```

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs

# Remove and recreate
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Hot Reload Not Working

1. Check environment variables in `docker-compose.dev.yml`:
   ```yaml
   - CHOKIDAR_USEPOLLING=true
   - WATCHPACK_POLLING=true
   ```

2. Restart container:
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

### VSCode Extensions Not Loading

```bash
# Clear extensions and reinstall
docker-compose -f docker-compose.dev.yml down
docker volume rm madace-vscode-extensions
docker-compose -f docker-compose.dev.yml up -d --build
```

### Out of Disk Space

```bash
# Remove unused Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

## Best Practices

### 1. Commit Often

```bash
git add .
git commit -m "Clear, descriptive message"
git push
```

### 2. Test Before Committing

```bash
npm test           # Run tests
npm run lint       # Check code style
npm run build      # Ensure builds successfully
```

### 3. Use Feature Branches

```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

### 4. Keep Dependencies Updated

```bash
npm outdated       # Check for updates
npm update         # Update to latest compatible
npm audit          # Check for vulnerabilities
```

### 5. Backup Data Regularly

```bash
# Backup madace-data folder
tar -czf madace-data-backup-$(date +%Y%m%d).tar.gz madace-data/
```

---

## Production Deployment

When ready to deploy:

1. **Test production build locally:**
   ```bash
   npm run build
   npm start
   # Test at http://localhost:3000
   ```

2. **Build production container:**
   ```bash
   docker build -t madace-web:latest .
   ```

3. **Deploy:**
   ```bash
   docker-compose up -d
   # Uses docker-compose.yml (not docker-compose.dev.yml)
   ```

---

## Resources

- **ARCHITECTURE.md** - Technical architecture details
- **README.md** - Project overview
- **CLAUDE.md** - Claude Code assistant guide
- **PRD.md** - Product requirements
- **PLAN.md** - Development roadmap

---

## Support

For issues with the development container:

1. Check logs: `docker-compose -f docker-compose.dev.yml logs -f`
2. Rebuild: `docker-compose -f docker-compose.dev.yml up -d --build`
3. Fresh start: `docker-compose -f docker-compose.dev.yml down -v && docker-compose -f docker-compose.dev.yml up -d`
4. Report issue: [GitHub Issues](./issues)

---

**Happy Coding! 🚀**
