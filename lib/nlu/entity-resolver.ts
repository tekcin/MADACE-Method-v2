/**
 * Entity Resolver
 *
 * Resolves entity values using fuzzy matching and synonym resolution
 * Fetches dynamic entities from database (agent names, story IDs, etc.)
 */

import Fuse from 'fuse.js';
import type { NLUEntity, MadaceEntityType } from './types';
import * as agentService from '@/lib/services/agent-service';
import { createStateMachine } from '@/lib/state/machine';
import type { StoryState } from '@/lib/state/types';

/**
 * Entity resolution result
 */
export interface EntityResolutionResult {
  resolved: boolean;
  originalValue: string;
  resolvedValue: string;
  confidence: number;
  matches: EntityMatch[];
  source: 'exact' | 'fuzzy' | 'synonym' | 'not_found';
}

/**
 * Entity match from fuzzy search
 */
export interface EntityMatch {
  value: string;
  score: number; // Lower is better (0 = perfect match)
  metadata?: Record<string, any>;
}

/**
 * Entity synonym mapping
 */
export interface EntitySynonym {
  canonical: string;
  synonyms: string[];
}

/**
 * Entity resolver options
 */
export interface EntityResolverOptions {
  /**
   * Fuzzy matching threshold (0.0 = perfect match, 1.0 = anything)
   */
  fuzzyThreshold?: number;

  /**
   * Maximum number of fuzzy matches to return
   */
  maxMatches?: number;

  /**
   * Entity synonyms for common variations
   */
  synonyms?: EntitySynonym[];
}

/**
 * Entity Resolver
 *
 * Resolves entity values using:
 * - Exact matching (highest priority)
 * - Synonym resolution (predefined mappings)
 * - Fuzzy matching with Fuse.js (typo tolerance)
 * - Dynamic database lookups
 */
export class EntityResolver {
  private options: EntityResolverOptions;
  private agentCache: Map<string, string[]> = new Map();
  private storyCache: Map<string, string[]> = new Map();
  private cacheTimeout = 5000; // 5 seconds
  private lastCacheUpdate = 0;

  // Default synonyms for common entity types
  private defaultSynonyms: EntitySynonym[] = [
    // Agent synonyms
    { canonical: 'PM', synonyms: ['project manager', 'pm agent', 'manager'] },
    { canonical: 'Analyst', synonyms: ['business analyst', 'analyst agent', 'ba'] },
    { canonical: 'Architect', synonyms: ['tech lead', 'architect agent', 'technical architect'] },
    { canonical: 'SM', synonyms: ['scrum master', 'sm agent', 'agile coach'] },
    { canonical: 'DEV', synonyms: ['developer', 'dev agent', 'engineer', 'coder'] },

    // State synonyms
    { canonical: 'BACKLOG', synonyms: ['backlog', 'planned', 'icebox'] },
    { canonical: 'TODO', synonyms: ['todo', 'to do', 'ready', 'queued'] },
    { canonical: 'IN_PROGRESS', synonyms: ['in progress', 'in-progress', 'wip', 'working', 'active'] },
    { canonical: 'DONE', synonyms: ['done', 'complete', 'finished', 'closed'] },
  ];

  constructor(options: EntityResolverOptions = {}) {
    this.options = {
      fuzzyThreshold: options.fuzzyThreshold ?? 0.4,
      maxMatches: options.maxMatches ?? 5,
      synonyms: options.synonyms ?? this.defaultSynonyms,
    };
  }

  /**
   * Resolve entity value with fuzzy matching and synonym resolution
   */
  async resolveEntity(entity: NLUEntity): Promise<EntityResolutionResult> {
    const originalValue = entity.value?.toString() || '';

    // Try exact match first
    const exactMatch = await this.tryExactMatch(entity, originalValue);
    if (exactMatch) {
      return exactMatch;
    }

    // Try synonym resolution
    const synonymMatch = this.trySynonymMatch(entity, originalValue);
    if (synonymMatch) {
      return synonymMatch;
    }

    // Try fuzzy matching
    const fuzzyMatch = await this.tryFuzzyMatch(entity, originalValue);
    if (fuzzyMatch) {
      return fuzzyMatch;
    }

    // No match found
    return {
      resolved: false,
      originalValue,
      resolvedValue: originalValue,
      confidence: 0,
      matches: [],
      source: 'not_found',
    };
  }

  /**
   * Try exact match (case-insensitive)
   */
  private async tryExactMatch(entity: NLUEntity, value: string): Promise<EntityResolutionResult | null> {
    const candidates = await this.getCandidates(entity);

    // Case-insensitive exact match
    const exactMatch = candidates.find((candidate) => candidate.toLowerCase() === value.toLowerCase());

    if (exactMatch) {
      return {
        resolved: true,
        originalValue: value,
        resolvedValue: exactMatch,
        confidence: 1.0,
        matches: [{ value: exactMatch, score: 0 }],
        source: 'exact',
      };
    }

    return null;
  }

  /**
   * Try synonym match
   */
  private trySynonymMatch(entity: NLUEntity, value: string): EntityResolutionResult | null {
    const valueLower = value.toLowerCase();

    for (const synonym of this.options.synonyms!) {
      // Check if value matches any synonym
      const matchesSynonym = synonym.synonyms.some((s) => s.toLowerCase() === valueLower);

      if (matchesSynonym) {
        return {
          resolved: true,
          originalValue: value,
          resolvedValue: synonym.canonical,
          confidence: 0.95,
          matches: [{ value: synonym.canonical, score: 0.05 }],
          source: 'synonym',
        };
      }
    }

    return null;
  }

  /**
   * Try fuzzy match using Fuse.js
   */
  private async tryFuzzyMatch(entity: NLUEntity, value: string): Promise<EntityResolutionResult | null> {
    const candidates = await this.getCandidates(entity);

    if (candidates.length === 0) {
      return null;
    }

    // Create Fuse instance for fuzzy searching
    const fuse = new Fuse(candidates, {
      threshold: this.options.fuzzyThreshold,
      distance: 100,
      includeScore: true,
    });

    // Search for matches
    const results = fuse.search(value);

    if (results.length === 0) {
      return null;
    }

    // Get top matches
    const topMatches = results.slice(0, this.options.maxMatches!).map((result) => ({
      value: result.item,
      score: result.score ?? 1.0,
    }));

    // Best match (guaranteed to exist since results.length > 0)
    const bestMatch = topMatches[0];

    if (!bestMatch) {
      // Should never happen, but satisfy TypeScript
      return null;
    }

    return {
      resolved: true,
      originalValue: value,
      resolvedValue: bestMatch.value,
      confidence: 1 - bestMatch.score, // Convert score to confidence (lower score = higher confidence)
      matches: topMatches,
      source: 'fuzzy',
    };
  }

  /**
   * Get candidates for fuzzy matching based on entity type
   */
  private async getCandidates(entity: NLUEntity): Promise<string[]> {
    switch (entity.type) {
      case '@agent':
        return await this.getAgentCandidates();

      case '@story':
        return await this.getStoryCandidates();

      case '@state':
        return this.getStateCandidates();

      case '@workflow':
        return this.getWorkflowCandidates();

      default:
        return [];
    }
  }

  /**
   * Get agent candidates from database (with caching)
   */
  private async getAgentCandidates(): Promise<string[]> {
    // Check cache
    if (this.agentCache.has('all') && Date.now() - this.lastCacheUpdate < this.cacheTimeout) {
      return this.agentCache.get('all')!;
    }

    try {
      // Fetch agents from database
      const agents = await agentService.listAgents({});
      const agentNames = agents.map((agent) => agent.name);

      // Update cache
      this.agentCache.set('all', agentNames);
      this.lastCacheUpdate = Date.now();

      return agentNames;
    } catch (error) {
      console.error('[EntityResolver] Failed to fetch agents:', error);
      return [];
    }
  }

  /**
   * Get story candidates from state machine (with caching)
   */
  private async getStoryCandidates(): Promise<string[]> {
    // Check cache
    if (this.storyCache.has('all') && Date.now() - this.lastCacheUpdate < this.cacheTimeout) {
      return this.storyCache.get('all')!;
    }

    try {
      const statusFile = process.env.STATUS_FILE || 'docs/mam-workflow-status.md';
      const stateMachine = createStateMachine(statusFile);
      await stateMachine.load();

      const status = stateMachine.getStatus();
      const allStories = [
        ...status.backlog,
        ...status.todo,
        ...status.inProgress,
        ...status.done,
      ];

      const storyIds = allStories.map((story) => story.id);

      // Update cache
      this.storyCache.set('all', storyIds);
      this.lastCacheUpdate = Date.now();

      return storyIds;
    } catch (error) {
      console.error('[EntityResolver] Failed to fetch stories:', error);
      return [];
    }
  }

  /**
   * Get state candidates (static list)
   */
  private getStateCandidates(): string[] {
    const states: StoryState[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'];
    return states;
  }

  /**
   * Get workflow candidates
   */
  private getWorkflowCandidates(): string[] {
    // TODO: Implement when workflow engine is ready
    // For now, return common workflow names
    return ['planning', 'assessment', 'architecture', 'implementation', 'testing'];
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.agentCache.clear();
    this.storyCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Add custom synonym
   */
  addSynonym(synonym: EntitySynonym): void {
    this.options.synonyms!.push(synonym);
  }

  /**
   * Get all synonyms
   */
  getSynonyms(): EntitySynonym[] {
    return this.options.synonyms!;
  }
}

/**
 * Create entity resolver with default options
 */
export function createEntityResolver(options?: EntityResolverOptions): EntityResolver {
  return new EntityResolver(options);
}
