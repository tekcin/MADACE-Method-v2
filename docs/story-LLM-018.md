# Story: [LLM-018] LLM Connection Testing UI

**Status**: TODO
**Points**: 5
**Module**: LLM Integration
**Dependencies**: LLM-013, LLM-014, LLM-015, LLM-016, LLM-017 (All LLM providers)

---

## Overview

Create a comprehensive web-based UI for testing LLM connections across all 4 providers (Gemini, Claude, OpenAI, Local). This allows users to verify their API keys, test model connectivity, and ensure proper LLM setup before using MADACE agents.

---

## Acceptance Criteria

- [ ] LLM connection testing page created at `app/llm-test/page.tsx`
- [ ] Provider selection dropdown (Gemini, Claude, OpenAI, Local)
- [ ] Dynamic form fields based on selected provider
  - [ ] API key input (for Gemini, Claude, OpenAI)
  - [ ] Base URL input (for Local/Ollama)
  - [ ] Model selection dropdown (provider-specific models)
- [ ] Test prompt textarea with default value
- [ ] "Test Connection" button with loading state
- [ ] Result display area showing:
  - [ ] Success/failure status
  - [ ] LLM response content
  - [ ] Token usage statistics
  - [ ] Error messages with helpful troubleshooting
- [ ] Integration with `POST /api/llm/test` endpoint
- [ ] Responsive design with dark mode support
- [ ] Accessibility features (ARIA labels, keyboard navigation)
- [ ] Save tested configuration to settings (optional)
- [ ] All quality checks pass (type-check, lint, format, build)

---

## Technical Design

### Component Structure

```
app/llm-test/
└── page.tsx         # Main LLM testing page

components/features/llm/
├── LLMTestForm.tsx       # Test form component
├── ProviderSelect.tsx    # Provider selection
├── ModelSelect.tsx       # Model selection (provider-specific)
└── TestResult.tsx        # Result display component
```

### Page Layout

```typescript
'use client';

export default function LLMTestPage() {
  const [provider, setProvider] = useState<'gemini' | 'claude' | 'openai' | 'local'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('http://localhost:11434');
  const [model, setModel] = useState('');
  const [testPrompt, setTestPrompt] = useState('Hello! Please respond with a brief greeting.');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleTest = async () => {
    // Call POST /api/llm/test
  };

  return (
    <div className="container mx-auto p-6">
      <h1>LLM Connection Test</h1>
      {/* Provider selection */}
      {/* Configuration form */}
      {/* Test button */}
      {/* Results display */}
    </div>
  );
}
```

### Provider Models

```typescript
const PROVIDER_MODELS = {
  gemini: ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  openai: ['gpt-4o-latest', 'gpt-4o-mini', 'gpt-3.5-turbo-latest'],
  local: ['llama3.1', 'codellama:7b', 'mistral:7b', 'custom'],
};
```

### API Integration

Uses existing `POST /api/llm/test` endpoint:

```typescript
const response = await fetch('/api/llm/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider,
    apiKey,
    baseURL,
    model,
    testPrompt,
  }),
});
```

### Error Handling

Display provider-specific error messages:

- **Gemini**: "Invalid API key. Get yours at https://makersuite.google.com/app/apikey"
- **Claude**: "Invalid API key. Get yours at https://console.anthropic.com/account/keys"
- **OpenAI**: "Invalid API key. Get yours at https://platform.openai.com/api-keys"
- **Local**: "Cannot connect to Ollama. Ensure it's running: ollama serve"

---

## Implementation Plan

### Step 1: Create page structure (15 min)

```bash
mkdir -p app/llm-test
touch app/llm-test/page.tsx
```

### Step 2: Create reusable components (30 min)

```bash
mkdir -p components/features/llm
touch components/features/llm/LLMTestForm.tsx
touch components/features/llm/ProviderSelect.tsx
touch components/features/llm/ModelSelect.tsx
touch components/features/llm/TestResult.tsx
```

### Step 3: Implement provider selection logic (20 min)

- Dropdown with 4 providers
- Dynamic form fields based on selection
- Model dropdown updates based on provider

### Step 4: Implement test functionality (25 min)

- API call to `/api/llm/test`
- Loading state during test
- Result parsing and display
- Token usage display

### Step 5: Add error handling and UX (20 min)

- Error message formatting
- Helpful troubleshooting links
- Success/failure indicators
- Copy response button

### Step 6: Styling and accessibility (15 min)

- Tailwind CSS styling
- Dark mode support
- Responsive layout
- ARIA labels
- Keyboard navigation

### Step 7: Testing and quality checks (10 min)

- Manual testing with all 4 providers
- Type-check, lint, format
- Production build verification

**Total**: ~135 minutes (~2.25 hours)

---

## Dependencies

**Requires**:

- ✅ [LLM-013] Multi-provider LLM client (DONE)
- ✅ [LLM-014] Gemini provider (DONE)
- ✅ [LLM-015] Claude provider (DONE)
- ✅ [LLM-016] OpenAI provider (DONE)
- ✅ [LLM-017] Local provider (DONE)
- ✅ `POST /api/llm/test` endpoint (exists)

**Blocks**:

- None (optional feature, doesn't block other stories)

---

## Testing Checklist

**Manual Testing**:

- [ ] Test Gemini provider with valid API key
- [ ] Test Gemini provider with invalid API key (verify error message)
- [ ] Test Claude provider with valid API key
- [ ] Test Claude provider with invalid API key (verify error message)
- [ ] Test OpenAI provider with valid API key
- [ ] Test OpenAI provider with invalid API key (verify error message)
- [ ] Test Local provider with Ollama running
- [ ] Test Local provider with Ollama stopped (verify error message)
- [ ] Verify model dropdown updates when changing providers
- [ ] Verify loading state shows during test
- [ ] Verify success response displays correctly
- [ ] Verify token usage displays
- [ ] Test responsive design on mobile
- [ ] Test dark mode

**Quality Checks**:

```bash
npm run type-check  # TypeScript compilation
npm run lint        # ESLint
npm run format      # Prettier
npm run build       # Production build
```

---

## Definition of Done

- ✅ LLM test page accessible at `/llm-test`
- ✅ All 4 providers can be tested
- ✅ Valid API keys show success with response
- ✅ Invalid API keys show helpful error messages
- ✅ Local provider connects to Ollama
- ✅ Token usage statistics displayed
- ✅ Responsive design works on all screen sizes
- ✅ Dark mode supported
- ✅ All quality checks pass
- ✅ Production build succeeds
- ✅ Story moved to DONE in workflow status

---

## Success Metrics

- Users can verify LLM configuration before using agents
- Clear error messages reduce support requests
- All 4 providers testable from single UI
- Zero configuration needed (uses existing API endpoint)

---

## Related Documentation

- [LLM-SELECTION.md](../LLM-SELECTION.md) - LLM provider guide
- [story-LLM-013.md](./story-LLM-013.md) - Multi-provider client
- [story-LLM-014.md](./story-LLM-014.md) - Gemini provider
- [story-LLM-015.md](./story-LLM-015.md) - Claude provider
- [story-LLM-016.md](./story-LLM-016.md) - OpenAI provider
- [story-LLM-017.md](./story-LLM-017.md) - Local provider
- `app/api/llm/test/route.ts` - Test API endpoint

---

**Story Created By**: SM Agent (Scrum Master)
**Date Created**: 2025-10-22
**Estimated Time**: 2-2.5 hours
