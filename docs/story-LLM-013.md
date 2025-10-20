# [LLM-013] Multi-provider LLM Client

**Status:** Ready (IN PROGRESS)
**Points:** 8
**Epic:** Milestone 1.4 - LLM Integration
**Created:** 2025-10-20
**Completed:** _[Pending]_
**Assigned:** DEV Agent
**Actual Time:** _[To be filled after completion]_

---

## Description

Create a unified LLM client abstraction that supports multiple providers (Gemini, Claude, OpenAI, and Local/Ollama) with a consistent interface. This is the foundation for all LLM interactions in MADACE.

**Context:**

- [SETUP-002] completed - Setup wizard collects LLM configuration
- We have `.env.example` with all LLM provider configurations
- We need a type-safe, provider-agnostic LLM client
- This will be used by agents, workflows, and all LLM-dependent features
- Must support streaming responses for better UX

**Why This Story:**
A well-designed LLM abstraction is critical for MADACE's multi-provider approach. Users should be able to switch between providers seamlessly, and the application code should not be coupled to any specific LLM API.

---

## Acceptance Criteria

- [ ] `lib/llm/client.ts` - Main LLM client with unified interface
- [ ] `lib/llm/types.ts` - TypeScript types for LLM requests/responses
- [ ] `lib/llm/providers/` - Directory for provider implementations
- [ ] Support for all 4 providers (Gemini, Claude, OpenAI, Local)
- [ ] Unified `chat()` method with streaming support
- [ ] Error handling with provider-specific error mapping
- [ ] Rate limiting and retry logic
- [ ] Configuration validation
- [ ] TypeScript types for all interfaces
- [ ] Unit tests for core client logic
- [ ] Example usage documentation
- [ ] No console errors or warnings
- [ ] All quality checks pass (lint, format, type-check)

---

## Implementation Plan

### Step 1: Create LLM Types

Create `lib/llm/types.ts`:

```typescript
export type LLMProvider = 'gemini' | 'claude' | 'openai' | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  baseURL?: string; // For local/custom endpoints
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

export interface LLMError {
  provider: LLMProvider;
  code: string;
  message: string;
  retryable: boolean;
}

export interface ILLMProvider {
  chat(request: LLMRequest): Promise<LLMResponse>;
  chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>;
  validateConfig(config: LLMConfig): boolean;
}
```

### Step 2: Create Base LLM Client

Create `lib/llm/client.ts`:

```typescript
import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk, ILLMProvider } from './types';
import { GeminiProvider } from './providers/gemini';
import { ClaudeProvider } from './providers/claude';
import { OpenAIProvider } from './providers/openai';
import { LocalProvider } from './providers/local';

export class LLMClient {
  private provider: ILLMProvider;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
  }

  private createProvider(config: LLMConfig): ILLMProvider {
    switch (config.provider) {
      case 'gemini':
        return new GeminiProvider(config);
      case 'claude':
        return new ClaudeProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      case 'local':
        return new LocalProvider(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    if (!this.provider.validateConfig(this.config)) {
      throw new Error('Invalid LLM configuration');
    }

    return this.provider.chat(request);
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    if (!this.provider.validateConfig(this.config)) {
      throw new Error('Invalid LLM configuration');
    }

    yield* this.provider.chatStream(request);
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...updates };
    this.provider = this.createProvider(this.config);
  }
}

// Factory function for easy creation
export function createLLMClient(config: LLMConfig): LLMClient {
  return new LLMClient(config);
}
```

### Step 3: Create Provider Base Class

Create `lib/llm/providers/base.ts`:

```typescript
import type { LLMConfig, LLMRequest, LLMResponse, LLMStreamChunk, ILLMProvider } from '../types';

export abstract class BaseLLMProvider implements ILLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract chat(request: LLMRequest): Promise<LLMResponse>;
  abstract chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>;

  validateConfig(config: LLMConfig): boolean {
    if (!config.model) {
      return false;
    }

    // API key required for cloud providers
    if (config.provider !== 'local' && !config.apiKey) {
      return false;
    }

    return true;
  }

  protected handleError(error: unknown, provider: string): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`[${provider}] ${message}`);
  }
}
```

### Step 4: Create Stub Provider Implementations

For this story, create stub implementations that return mock responses. Future stories will implement the actual API calls.

Create `lib/llm/providers/gemini.ts`:

```typescript
import { BaseLLMProvider } from './base';
import type { LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

export class GeminiProvider extends BaseLLMProvider {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // TODO [LLM-014]: Implement actual Gemini API call
    return {
      content: '[MOCK] Gemini response: ' + request.messages.map((m) => m.content).join(' '),
      provider: 'gemini',
      model: this.config.model,
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
      finishReason: 'stop',
    };
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // TODO [LLM-014]: Implement actual streaming
    const response = await this.chat(request);
    yield { content: response.content, done: false };
    yield { content: '', done: true };
  }
}
```

Create similar stubs for:

- `lib/llm/providers/claude.ts`
- `lib/llm/providers/openai.ts`
- `lib/llm/providers/local.ts`

### Step 5: Create Configuration Helper

Create `lib/llm/config.ts`:

```typescript
import type { LLMConfig } from './types';

export function getLLMConfigFromEnv(): LLMConfig {
  const provider = (process.env.PLANNING_LLM || 'gemini') as LLMConfig['provider'];

  const configs: Record<string, Partial<LLMConfig>> = {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY,
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
    local: {
      baseURL: process.env.LOCAL_MODEL_URL || 'http://localhost:11434',
      model: process.env.LOCAL_MODEL_NAME || 'llama2',
    },
  };

  return {
    provider,
    ...configs[provider],
  } as LLMConfig;
}
```

### Step 6: Export from Index

Update `lib/llm/index.ts`:

```typescript
export { LLMClient, createLLMClient } from './client';
export { getLLMConfigFromEnv } from './config';
export * from './types';
```

### Step 7: Create Example API Route

Create `app/api/llm/test/route.ts` to demonstrate usage:

```typescript
import { NextResponse } from 'next/server';
import { createLLMClient, getLLMConfigFromEnv } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const config = getLLMConfigFromEnv();
    const client = createLLMClient(config);

    const response = await client.chat({
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Step 8: Test and Verify

```bash
# Run quality checks
npm run check-all

# Test the API route
curl -X POST http://localhost:3000/api/llm/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, world!"}'
```

---

## Technical Notes

### Architecture Pattern

Using **Strategy Pattern** for provider implementations:

- `LLMClient` is the context
- `ILLMProvider` is the strategy interface
- Each provider class is a concrete strategy

### Why Stubs for Now?

We're creating stub implementations because:

1. Actual API integration requires testing with real API keys
2. Each provider has unique authentication and request formats
3. Allows us to build the architecture without external dependencies
4. Future stories ([LLM-014] through [LLM-017]) will implement real providers

### Error Handling Strategy

- Provider-specific errors mapped to common error types
- Retryable vs non-retryable errors classified
- Rate limiting handled at client level

### Type Safety

- All provider responses mapped to common `LLMResponse` type
- TypeScript ensures compile-time type safety
- Runtime validation where needed

---

## Testing Checklist

**Type Definitions:**

- [ ] All types defined in `lib/llm/types.ts`
- [ ] Exported properly from index
- [ ] No TypeScript errors

**Client Implementation:**

- [ ] `LLMClient` class created
- [ ] Provider factory working
- [ ] `chat()` method implemented
- [ ] `chatStream()` method implemented
- [ ] Configuration validation working

**Provider Stubs:**

- [ ] Gemini provider stub created
- [ ] Claude provider stub created
- [ ] OpenAI provider stub created
- [ ] Local provider stub created
- [ ] All stubs return mock responses

**Configuration:**

- [ ] `getLLMConfigFromEnv()` reads environment variables
- [ ] Config validation works
- [ ] Invalid config throws error

**API Route:**

- [ ] Test API route created
- [ ] Returns mock response
- [ ] Error handling works

**Quality:**

```bash
npm run type-check  # Pass
npm run lint        # Pass
npm run format:check # Pass
npm run build       # Pass
```

---

## Dependencies

**Depends On:**

- [NEXT-001] through [NEXT-005] (DONE) ✅
- [SETUP-002] Setup wizard UI (DONE) ✅
- [NEXT-004] Environment variables (DONE) ✅

**Blocks:**

- [LLM-014] Gemini provider implementation (actual API calls)
- [LLM-015] Claude provider implementation
- [LLM-016] OpenAI provider implementation
- [LLM-017] Local model provider
- [LLM-018] LLM connection testing UI
- All agent and workflow functionality

---

## Risks & Mitigations

**Risk 1: Provider API Changes**

- **Risk:** LLM provider APIs may change frequently
- **Mitigation:** Abstraction layer isolates changes, only provider implementations need updates
- **Likelihood:** Medium (common in AI space)

**Risk 2: Streaming Complexity**

- **Risk:** Streaming implementations differ significantly across providers
- **Mitigation:** Using AsyncGenerator for consistent streaming interface
- **Likelihood:** High (will address in provider-specific stories)

**Risk 3: Rate Limiting**

- **Risk:** Different providers have different rate limits
- **Mitigation:** Implement retry logic with exponential backoff
- **Likelihood:** High (will implement in this or next story)

---

## Definition of Done

This story is considered DONE when:

1. ✅ All types defined in `lib/llm/types.ts`
2. ✅ `LLMClient` class implemented in `lib/llm/client.ts`
3. ✅ Base provider class created
4. ✅ Stub implementations for all 4 providers
5. ✅ Configuration helper (`getLLMConfigFromEnv`)
6. ✅ Test API route working
7. ✅ All exports properly configured
8. ✅ TypeScript types properly defined
9. ✅ No TypeScript errors
10. ✅ All quality checks pass (type-check, lint, format)
11. ✅ Build succeeds
12. ✅ Example usage documented
13. ✅ Git committed with clear message
14. ✅ Story moved to DONE in workflow status

---

## Time Estimate

**Estimated Time:** 90-120 minutes

**Breakdown:**

- Create types: 15 minutes
- Create base client: 20 minutes
- Create base provider class: 15 minutes
- Create 4 provider stubs: 20 minutes
- Create config helper: 10 minutes
- Create test API route: 10 minutes
- Testing and verification: 15 minutes
- Documentation: 10 minutes
- Quality checks and fixes: 10 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Review existing LLM type definitions in `lib/types/`
- Check `.env.example` for LLM configuration format
- Understand AsyncGenerator for streaming
- Review provider documentation (for future reference)

### During Implementation

- Keep interfaces simple and focused
- Use TypeScript strict mode throughout
- Add TODO comments for future provider implementations
- Test with multiple providers
- Document all public APIs

### After Completion

- Verify all providers return consistent response format
- Test configuration validation
- Test error handling
- Run all quality checks
- Commit with descriptive message

---

## Related Documentation

- [TypeScript AsyncGenerator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-6.html#generators)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
- [.env.example](../.env.example) - LLM configuration reference

---

## Future Enhancements

These will be implemented in subsequent stories:

- **[LLM-014]** Actual Gemini API integration
- **[LLM-015]** Actual Claude API integration
- **[LLM-016]** Actual OpenAI API integration
- **[LLM-017]** Actual Ollama integration
- **[LLM-018]** UI for testing LLM connections
- **Rate limiting** and retry logic
- **Caching** for repeated requests
- **Token counting** utilities
- **Cost tracking** per provider

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Auto-approved for implementation]_
**Implemented By:** DEV Agent
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20
