/**
 * Memory Extractor
 *
 * Extracts facts and preferences from user messages to save as agent memories
 */

import { saveMemory } from '@/lib/services/memory-service';

/**
 * Extracted memory fact
 */
export interface ExtractedMemory {
  category: 'user_preference' | 'project_context' | 'user_fact' | 'conversation_summary';
  key: string;
  value: string;
  importance: number; // 1-10
}

/**
 * Extract user facts from message
 * Looks for patterns like "My name is X", "I am X", "I work on X", etc.
 */
function extractUserFacts(message: string): ExtractedMemory[] {
  const facts: ExtractedMemory[] = [];

  // Name extraction: "my name is X", "i'm X", "i am X", "call me X"
  const namePatterns = [
    /my name is ([a-zA-Z]+)/i,
    /i'm ([a-zA-Z]+)/i,
    /i am ([a-zA-Z]+)/i,
    /call me ([a-zA-Z]+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      facts.push({
        category: 'user_fact',
        key: 'user_name',
        value: match[1],
        importance: 10, // Name is critical
      });
      break;
    }
  }

  // Work/Project context: "I work on X", "I'm building X", "working on X"
  const workPatterns = [
    /(?:i work on|i'm (?:building|working on|developing)|i am (?:building|working on|developing)) (.+?)(?:\.|,|$)/i,
    /my (?:project|work) (?:is|focuses on) (.+?)(?:\.|,|$)/i,
  ];

  for (const pattern of workPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const context = match[1].trim();
      facts.push({
        category: 'project_context',
        key: 'current_project',
        value: context,
        importance: 8, // High importance
      });
      break;
    }
  }

  // Tech stack: "using X", "with X", "prefer X"
  const techPatterns = [
    /(?:using|with|prefer|love|like) (next\.?js|react|vue|angular|typescript|javascript|python|rust|go|java|postgresql|mysql|mongodb|redis)/i,
  ];

  for (const pattern of techPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const tech = match[1];
      facts.push({
        category: 'project_context',
        key: 'tech_stack',
        value: tech,
        importance: 7,
      });
      // Only extract first tech mention
      break;
    }
  }

  // Role/Position: "I'm a X developer", "I am X"
  const rolePatterns = [
    /i'm a (.+?(?:developer|engineer|designer|manager|architect|analyst))(?:\.|,|$)/i,
    /i am a (.+?(?:developer|engineer|designer|manager|architect|analyst))(?:\.|,|$)/i,
    /i work as (?:a |an )?(.+?(?:developer|engineer|designer|manager|architect|analyst))(?:\.|,|$)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const role = match[1].trim();
      facts.push({
        category: 'user_fact',
        key: 'user_role',
        value: role,
        importance: 8,
      });
      break;
    }
  }

  return facts;
}

/**
 * Infer user preferences from message characteristics
 */
function inferPreferences(message: string, conversationHistory: string[]): ExtractedMemory[] {
  const preferences: ExtractedMemory[] = [];

  // Detect preference for concise responses if user messages are short
  const avgMessageLength =
    conversationHistory.reduce((sum, msg) => sum + msg.length, 0) /
    (conversationHistory.length || 1);

  if (conversationHistory.length >= 3 && avgMessageLength < 50) {
    preferences.push({
      category: 'user_preference',
      key: 'communication_style',
      value: 'concise',
      importance: 6,
    });
  } else if (conversationHistory.length >= 3 && avgMessageLength > 200) {
    preferences.push({
      category: 'user_preference',
      key: 'communication_style',
      value: 'detailed',
      importance: 6,
    });
  }

  // Detect preference for code examples
  if (message.includes('example') || message.includes('code') || message.includes('show me')) {
    preferences.push({
      category: 'user_preference',
      key: 'prefers_examples',
      value: 'true',
      importance: 5,
    });
  }

  return preferences;
}

/**
 * Extract all memories from a user message
 */
export function extractMemories(
  message: string,
  conversationHistory: string[] = []
): ExtractedMemory[] {
  const memories: ExtractedMemory[] = [];

  // Extract explicit user facts
  memories.push(...extractUserFacts(message));

  // Infer preferences
  memories.push(...inferPreferences(message, conversationHistory));

  return memories;
}

/**
 * Extract and save memories from a user message
 */
export async function extractAndSaveMemories(
  agentId: string,
  userId: string,
  message: string,
  conversationHistory: string[] = []
): Promise<number> {
  try {
    const extractedMemories = extractMemories(message, conversationHistory);

    let savedCount = 0;
    for (const memory of extractedMemories) {
      try {
        await saveMemory(agentId, userId, {
          category: memory.category,
          key: memory.key,
          value: memory.value,
          importance: memory.importance,
          source: 'inferred',
          type: 'long-term', // Save extracted facts as long-term memories
        });
        savedCount++;
      } catch (error) {
        // Skip if memory already exists or other error
        console.error('[MemoryExtractor] Error saving memory:', error);
      }
    }

    return savedCount;
  } catch (error) {
    console.error('[MemoryExtractor] Error extracting memories:', error);
    return 0;
  }
}
