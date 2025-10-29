# LLM-014: Gemini Provider Implementation

**Story ID**: LLM-014  
**Title**: Gemini provider implementation  
**Points**: 5  
**Status**: Draft  
**Created**: 2025-10-22  
**Epic**: Core TypeScript Modules → LLM Integration  
**Phase**: 2.1 - LLM Provider Implementation

## User Story

As a **MADACE developer**, I want a **real Google Gemini LLM provider** so that the framework can **communicate with Google's Gemini models** for authentic AI-powered workflows and natural language processing.

## Acceptance Criteria

- [ ] **Real Google Gemini API integration** with proper authentication
- [ ] **Support for chat completions** with both blocking and streaming responses
- [ ] **Multiple Gemini models**: gemini-1.5-flash-latest, gemini-1.5-pro-latest, gemini-2.0-flash-exp
- [ ] **Rate limiting and retry logic** for API quota management
- [ ] **Error handling** with specific Gemini error codes and messages
- [ ] **Configuration validation** for API keys and model selection
- [ ] **Streaming support** for real-time response generation
- [ ] **Tool use integration** (future Gemini function calling support)
- [ ] **Cost estimation** based on model pricing (tokens input/output)
- [ ] **Test coverage** with mock and real API tests
- [ ] **TypeScript types** for all Gemini API responses and configurations
- [ ] **Integration** with existing LLM client factory pattern

## Technical Notes

### Core Requirements

The Gemini provider should provide:

1. **Real API Integration**: Actually call Google Gemini APIs (not mocks)
2. **Authentication Support**: API key management and validation
3. **Multiple Models**: Support Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.0 Flash
4. **Streaming**: AsyncGenerator for streaming chat responses
5. **Error Handling**: Specific Gemini error codes and retry logic
6. **Rate Limiting**: Respect Gemini API quotas and rate limits

### API Integration Points

- **File**: `lib/llm/providers/gemini.ts` - Replace mock with real implementation
- **Client**: Integration with existing `LLMClient` and factory pattern
- **Configuration**: Support via configuration manager and environment variables
- **Testing**: Real API tests with test key integration

### Google Gemini API Details

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models`

**Supported Models**:

```typescript
// Available models with their capabilities
const GEMINI_MODELS = {
  'gemini-2.0-flash-exp': {
    // Latest 2.0 experimental
    maxTokens: 8192,
    contextWindow: 1_000_000,
    streaming: true,
    functionCalling: true,
  },
  'gemini-1.5-flash-latest': {
    maxTokens: 8192,
    contextWindow: 1_000_000,
    streaming: true,
    functionCalling: true,
  },
  'gemini-1.5-pro-latest': {
    maxTokens: 8192,
    contextWindow: 2_000_000,
    streaming: true,
    functionCalling: true,
  },
} as const;
```

### Authentication

**API Key** Required:

- **Source**: `process.env.GEMINI_API_KEY` or configuration
- **Validation**: Verify key format and permissions
- **Error Handling**: Invalid key with helpful error message

**Request Headers**:

```typescript
{
  'Content-Type': 'application/json',
  'x-goog-api-key': 'YOUR_API_KEY'
}
```

### Request/Response Format

**Chat Request**:

```typescript
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
      role?: 'user' | 'model';
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}
```

**Response**:

```typescript
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}
```

## Implementation Details

### GeminiProvider Class Interface

```typescript
export class GeminiProvider extends BaseLLMProvider {
  constructor(config: LLMConfig) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.validateConfig();
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    // Real API call implementation
  }

  async *chatStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // Streaming implementation
  }

  private validateConfig(): void {
    // API key and model validation
  }

  private async callAPI<T>(endpoint: string, data: unknown): Promise<T> {
    // HTTP client with retry logic
  }
}
```

### Error Handling

```typescript
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {}
}

// Specific error codes
export const GEMINI_ERROR_CODES = {
  INVALID_API_KEY: 'API_KEY_INVALID',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  CONTENT_FILTERED: 'CONTENT_FILTERED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
```

### Rate Limiting Strategy

**Quota Management**:

- **Gemini 1.5 Flash**: 60 requests per minute
- **Gemini 1.5 Pro**: 15 requests per minute
- **Backoff Strategy**: Exponential backoff with jitter
- **Queue Management**: Request queuing during rate limit periods

### Test Requirements

**Unit Tests**:

```typescript
describe('GeminiProvider', () => {
  describe('constructor', () => {
    // Test API key validation
    // Test model validation
  });

  describe('chat', () => {
    // Test successful API call
    // Test error scenarios
    // Test response parsing
  });

  describe('chatStream', () => {
    // Test streaming response
    // Test chunk parsing
  });
});
```

**Integration Tests**:

```typescript
describe('Gemini Integration', () => {
  describe('Real API Tests', () => {
    // Test with real API key (if available)
    // Test different models
    // Test streaming
  });

  describe('Error Scenarios', () => {
    // Test invalid API keys
    // Test rate limiting
    // Test content filtering
  });
});
```

## Dependencies

- [CORE-013] ✅ Workflow Engine (lib/workflows/executor.ts)
- [CORE-014] ✅ Template Engine (lib/templates/engine.ts)
- [CORE-015] ✅ State Machine (lib/state/machine.ts)
- [CORE-016] ✅ Configuration Manager (lib/config/manager.ts)

## Security Considerations

**API Key Protection**:

- Never log API keys
- Store securely in environment variables
- Validate key format before requests

**Content Safety**:

- Respect Gemini content filters
- Handle filtered responses gracefully
- Log content filtering decisions

**Network Security**:

- HTTPS enforcement for all API calls
- Request timeout handling
- Proper error response parsing

## Cost Estimation

**Gemini Pricing** (per 1M tokens, approximate):

- **Gemini 2.0 Flash**: $0.075 (input), $0.30 (output)
- **Gemini 1.5 Flash**: $0.075 (input), $0.30 (output)
- **Gemini 1.5 Pro**: $3.50 (input), $10.50 (output)

**Implementation Features**:

- Token counting for cost tracking
- Model-specific rate limit enforcement
- Usage metadata capture for analytics

## Implementation Steps

1. **Replace mock implementation** in `lib/llm/providers/gemini.ts`
2. **Add HTTP client** with retry logic and error handling
3. **Implement real chat() method** with proper request formatting
4. **Implement chatStream() method** for streaming responses
5. **Add model validation** and API key checking
6. **Implement rate limiting** for different Gemini models
7. **Add comprehensive tests** with real API integration
8. **Update LLM client factory** to use real provider
9. **Add cost tracking** and usage metadata
10. **Test with existing workflow system**

## Definition of Done

- [ ] All acceptance criteria completed
- [ ] Real Gemini API calls working successfully
- [ ] Both blocking and streaming modes functional
- [ ] Error handling covers all Gemini error scenarios
- [ ] Rate limiting implemented and tested
- [ ] Unit tests pass with 100% coverage
- [ ] Integration tests with real API succeed
- [ ] Documentation includes API key setup guide
- [ ] Code review passes all quality checks
- [ ] Production build succeeds
- [ ] Story moved to DONE in workflow status
- [ ] Next story (LLM-015) auto-moved to TODO

## Risk Mitigation

### Technical Risks

- **API Rate Limits**: Implement proper queuing and backoff
- **API Key Security**: Never expose in logs or client code
- **Model Deprecation**: Support fallback to newer models
- **Network Issues**: Robust retry logic with exponential backoff

### Integration Risks

- **Breaking Changes**: Maintain backward compatibility with existing LLM client
- **Test Data**: Use test API keys for unit tests
- **Cost Management**: Implement token counting and usage tracking

## Success Metrics

- ✅ Real Gemini API calls succeed (test environment)
- ✅ All supported models respond correctly
- ✅ Streaming provides real-time chunks
- ✅ Error handling covers all documented scenarios
- ✅ Rate limiting prevents API quota violations
- ✅ Integration with existing LLM client seamless
- ✅ Tests pass in CI/CD pipeline
- ✅ Production deployment stable

---

**This story implements the real Google Gemini LLM provider to enable actual AI functionality in MADACE-Method v2.0, moving from mock implementations to production-ready AI integration.**
