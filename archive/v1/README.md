# MADACE v1.0 - Original Node.js CLI Implementation

> **Archived**: This document describes the original MADACE v1.0 implementation, which has been superseded by the current v3.0 full-stack TypeScript implementation.

## Overview

MADACE v1.0 was the **original Node.js command-line interface (CLI)** implementation of the MADACE methodology. It was a pure Node.js tool designed for terminal-based project management and AI-driven development workflows.

## Architecture

**v1.0 Stack:**
- **Runtime**: Node.js (pure JavaScript/Node.js CLI)
- **Interface**: Terminal/Command-line only
- **Storage**: File-based (YAML, Markdown)
- **LLM Integration**: Direct API calls to LLM providers
- **State Management**: Markdown-based state machine
- **Agent System**: YAML-defined agents with file-based prompts

**Key Characteristics:**
- ✅ Lightweight CLI tool
- ✅ File-based configuration
- ✅ Markdown workflow status tracking
- ✅ YAML agent definitions
- ✅ Direct LLM API integration
- ❌ No database persistence
- ❌ No web UI
- ❌ No real-time collaboration
- ❌ No REST API

## Official Repository

The **official MADACE v1.0 (Node.js CLI)** is maintained in a separate repository:

**Repository**: [https://github.com/tekcin/MADACE-METHOD](https://github.com/tekcin/MADACE-METHOD)

This repository contains the original implementation with:
- Pure Node.js CLI architecture
- File-based agent and workflow management
- Terminal-based interactive workflows
- Markdown state tracking
- YAML configuration

## Evolution Path

```
v1.0 (Node.js CLI)
  │
  ├─> Pure terminal-based tool
  ├─> File-based storage
  └─> Single-user workflow
      │
      v
v2.0 (Experimental Next.js)
  │
  ├─> Added Next.js web UI
  ├─> Kept file-based storage
  └─> Hybrid CLI + Web approach
      │
      v
v3.0 (Production Full-Stack) ← CURRENT
  │
  ├─> Full database integration (Prisma + PostgreSQL/SQLite)
  ├─> Advanced web UI with React 19
  ├─> REST API for all operations
  ├─> Real-time collaboration features
  ├─> Multi-provider LLM support
  └─> Production-ready deployment
```

## Why v3.0?

The current **MADACE v3.0** represents a complete architectural evolution:

### What v1.0 Offered:
- ✅ Simple, lightweight CLI tool
- ✅ Easy to install and run (`npm install -g`)
- ✅ File-based configuration (no database setup)
- ✅ Immediate terminal workflows

### What v3.0 Adds:
- ✅ **Database-backed persistence** - No data loss, robust storage
- ✅ **Web UI** - Visual workflow execution, agent management
- ✅ **REST API** - Integration with external tools
- ✅ **Real-time collaboration** - Multiple users, WebSocket updates
- ✅ **Advanced features** - Chat UI, IDE integration, memory system
- ✅ **Production deployment** - Docker, HTTPS, scalability
- ✅ **Developer tools** - Prisma Studio, debugging interfaces
- ✅ **Testing infrastructure** - E2E tests, quality gates

## When to Use v1.0 vs v3.0

### Use MADACE v1.0 (Node.js CLI) if you need:
- A lightweight, terminal-only tool
- No database or infrastructure setup
- Simple file-based workflows
- Quick local prototyping
- Minimal dependencies

**Install**: `npm install -g madace-method` (from official repo)

### Use MADACE v3.0 (This Repository) if you need:
- Full-stack web application
- Database-backed persistence
- Team collaboration features
- REST API integration
- Production deployment
- Advanced AI features (chat, memory, orchestration)

**Repository**: [This repository - MADACE-Method-v2.0](https://github.com/your-org/MADACE-Method-v2.0)

## Migration Notes

If you're migrating from v1.0 to v3.0:

1. **Agent Definitions**: YAML format is compatible, but v3.0 stores agents in database
2. **Workflow Status**: Markdown format can be imported via v3.0 state machine
3. **Configuration**: v1.0 config files can be converted to v3.0 database records
4. **LLM Integration**: v3.0 uses the same LLM provider APIs with enhanced features

**Migration Tool**: Use `npm run import-madace-v3` to import v1.0 YAML agents into v3.0 database.

## Key Differences

| Feature | v1.0 (CLI) | v3.0 (Full-Stack) |
|---------|------------|-------------------|
| **Interface** | Terminal only | Web UI + API |
| **Storage** | Files (YAML/MD) | Database (Prisma) |
| **Agents** | YAML files | Database + YAML import |
| **Workflows** | Markdown status | Database + visual UI |
| **LLM** | Direct API calls | Multi-provider client |
| **Collaboration** | Single user | Multi-user + real-time |
| **Deployment** | npm install -g | Docker + cloud |
| **Testing** | Manual | E2E + unit tests |
| **API** | None | Full REST API |
| **Memory** | None | Persistent agent memory |

## Documentation

For v1.0 documentation, see:
- Official repository: [https://github.com/tekcin/MADACE-METHOD](https://github.com/tekcin/MADACE-METHOD)
- v1.0 README and installation guide
- v1.0 CLI command reference

For v3.0 documentation, see:
- [Main README](../../README.md)
- [PRD](../../PRD.md) - Product requirements
- [ARCHITECTURE](../../ARCHITECTURE.md) - System architecture
- [CLAUDE.md](../../CLAUDE.md) - Development guide

## License

Both v1.0 and v3.0 follow the same open-source license. See the main repository for details.

## Contact

For questions about:
- **v1.0 (Original CLI)**: See [https://github.com/tekcin/MADACE-METHOD](https://github.com/tekcin/MADACE-METHOD)
- **v3.0 (This implementation)**: Open an issue in this repository

---

**Archived**: October 31, 2025
**Superseded by**: MADACE v3.0 (Full-Stack TypeScript Implementation)
