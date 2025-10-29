# Story: [LLM-015] Claude Provider Implementation

**Status**: IN PROGRESS
**Points**: 5
**Module**: LLM Integration
**Dependencies**: LLM Client (LLM-013), Base Provider

---

## Overview

Implement real Anthropic Claude API integration following the established provider pattern. Support Claude 3.5 Sonnet and other Claude models with streaming, error handling, and rate limiting.

---

## Acceptance Criteria

- [ ] Real Anthropic Claude Messages API integration
- [ ] Support for Claude models: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022, claude-3-opus-20240229
- [ ] HTTP API calls to api.anthropic.com/v1/messages
- [ ] Server-Sent Events (SSE) streaming with AsyncGenerator
- [ ] Comprehensive error handling with Claude-specific error codes
- [ ] Rate limiting with sliding window tracker
- [ ] Retry logic with exponential backoff
- [ ] Response transformation and validation
- [ ] TypeScript strict mode compliance
- [ ] All quality checks pass (type-check, lint, format, build)

---

## Technical Design

### Claude Messages API

**Endpoint**: `https://api.anthropic.com/v1/messages`

**Authentication**:

- Header: `x-api-key: <API_KEY>`
- Header: `anthropic-version: 2023-06-01`

**Request Format**:

```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [{ "role": "user", "content": "Hello, Claude" }]
}
```

**Response Format**:

```json
{
  "id": "msg_...",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "Hello!" }],
  "model": "claude-3-5-sonnet-20241022",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 5
  }
}
```

### Supported Models

- **claude-3-5-sonnet-20241022**: Most intelligent model (200K context)
- **claude-3-5-haiku-20241022**: Fast and affordable (200K context)
- **claude-3-opus-20240229**: Previous flagship (200K context)

### Error Codes

- `INVALID_API_KEY`: Invalid or missing API key
- `INVALID_REQUEST`: Malformed request
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `OVERLOADED`: API temporarily overloaded
- `CONTEXT_LENGTH_EXCEEDED`: Message too long
- `MODEL_NOT_FOUND`: Invalid model name

### Rate Limits

- Tier 1 (default): 50 requests/min
- Tier 2: 1000 requests/min
- Tier 3: 2000 requests/min
- Tier 4: 4000 requests/min

Use conservative default of 50 req/min with sliding window tracking.

---

## Implementation Plan

1. **Review existing providers** (10 min)
   - Study Gemini provider implementation
   - Study OpenAI provider implementation
   - Identify common patterns

2. **Implement Claude API client** (30 min)
   - HTTP client with proper headers
   - Request/response transformation
   - Error handling and mapping

3. **Add streaming support** (20 min)
   - SSE stream parser
   - AsyncGenerator implementation
   - Handle stream events

4. **Add rate limiting** (15 min)
   - Sliding window tracker
   - Conservative 50 req/min default
   - Rate limit error handling

5. **Add retry logic** (15 min)
   - Exponential backoff
   - Max 3 retries
   - Jitter for distributed systems

6. **Testing and quality** (10 min)
   - Run quality checks
   - Verify production build
   - Update exports

**Total**: ~100 minutes

---

## File Structure

```
lib/llm/providers/
├── base.ts           # BaseLLMProvider ✅
├── gemini.ts         # GeminiProvider ✅
├── openai.ts         # OpenAIProvider ✅
├── local.ts          # LocalProvider ✅
└── claude.ts         # ClaudeProvider (UPDATE)
```

---

## Success Metrics

- ✅ All quality checks pass
- ✅ Production build succeeds
- ✅ Real API integration works
- ✅ Streaming responses work
- ✅ Error handling comprehensive
- ✅ Rate limiting functional

---

**Story created**: 2025-10-22
**Story started**: 2025-10-22
