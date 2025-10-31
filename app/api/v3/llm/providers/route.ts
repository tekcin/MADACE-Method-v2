/**
 * LLM Providers API
 *
 * GET /api/v3/llm/providers - Get available LLM providers based on configuration
 */

import { NextResponse } from 'next/server';

export interface LLMProviderInfo {
  id: string;
  name: string;
  available: boolean;
  isDefault: boolean;
  description: string;
}

export async function GET() {
  try {
    const providers: LLMProviderInfo[] = [
      {
        id: 'local',
        name: 'Local (Ollama/Gemma3)',
        available: true, // Always available if running
        isDefault: process.env.PLANNING_LLM === 'local',
        description: 'Local LLM via Ollama (Free, Private, No API key needed)',
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        available: !!process.env.GEMINI_API_KEY,
        isDefault: process.env.PLANNING_LLM === 'gemini',
        description: 'Google Gemini 2.0 Flash (Fast, Cost-effective)',
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        available: !!process.env.CLAUDE_API_KEY,
        isDefault: process.env.PLANNING_LLM === 'claude',
        description: 'Claude 3.5 Sonnet (Advanced reasoning)',
      },
      {
        id: 'openai',
        name: 'OpenAI GPT-4',
        available: !!process.env.OPENAI_API_KEY,
        isDefault: process.env.PLANNING_LLM === 'openai',
        description: 'GPT-4 Turbo (Powerful, General-purpose)',
      },
    ];

    // Sort: default first, then available, then by name
    providers.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      providers,
      default: process.env.PLANNING_LLM || 'local',
    });
  } catch (error) {
    console.error('[LLM Providers API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get providers' },
      { status: 500 }
    );
  }
}
