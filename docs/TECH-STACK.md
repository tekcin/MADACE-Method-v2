# MADACE-Method v2.0 Technology Stack

**Version**: 1.0.0
**Last Updated**: 2025-10-20

---

## Core Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 15.5.6 |
| **UI Library** | React | 19.0.0 |
| **Language** | TypeScript | 5.7.3 |
| **Runtime** | Node.js | 20+ |
| **Styling** | Tailwind CSS | 4.1.1 |
| **Validation** | Zod | 4.1.12 |
| **YAML Parser** | js-yaml | 4.1.0 |
| **Templates** | Handlebars | 4.7.8 |

---

## Development Tools

| Tool | Version |
|------|---------|
| **Linter** | ESLint | 9.19.0 |
| **Package Manager** | npm | 11.6.0 |

---

## LLM Providers (User-Selectable)

- Google Gemini (via `@google/generative-ai`)
- Anthropic Claude (via `@anthropic-ai/sdk`)
- OpenAI GPT (via `openai`)
- Local Models (via Ollama HTTP API)

---

## Deployment

- **Primary**: Docker (Alpine-based, ~200MB production image)
- **Development**: Docker with VSCode Server + Cursor (~2-3GB)
- **Alternative**: Vercel

---

## Architecture Summary

- **Runtime**: Single (Node.js 20+)
- **Language**: Single (TypeScript)
- **Pattern**: Full-stack (Next.js App Router)
- **State**: File-based (YAML, JSON, Markdown)

---

## Standard Tech Stack Block for Documentation

Copy-paste this block into any documentation:

```markdown
**Tech Stack**: Next.js 15 • React 19 • TypeScript 5 • Node.js 20+ • Tailwind CSS 4 • Zod • Handlebars
```

---

## Standard Tech Stack Block for LLM Prompts

**ALWAYS include this in LLM prompts:**

```
TECH STACK CONTEXT:
- Framework: Next.js 15.5.6 (App Router)
- Language: TypeScript 5.7.3 (strict mode)
- Runtime: Node.js 20+
- UI: React 19.0.0 + Tailwind CSS 4.1.1
- Validation: Zod 4.1.12
- YAML: js-yaml 4.1.0
- Templates: Handlebars 4.7.8
- Pattern: Full-stack TypeScript (single runtime, no FFI)
```

---

## Version Update Policy

When updating versions:
1. Update this file first
2. Update package.json
3. Update all *.md files that reference versions
4. Update LLM prompt templates
5. Commit with message: "Update tech stack to [version]"

---

**Canonical Source**: This file (`docs/TECH-STACK.md`) is the single source of truth for all technology versions.
