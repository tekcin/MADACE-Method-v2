/**
 * Memory Pruning Cron Job
 *
 * Runs daily to prune old and low-importance memories
 * Also adjusts memory importance based on access patterns
 */

import { pruneMemories, adjustMemoryImportance } from '@/lib/services/memory-pruner';

/**
 * Run daily memory maintenance
 */
export async function runDailyMemoryMaintenance(): Promise<{
  pruned: number;
  adjusted: number;
  details: {
    expired: number;
    lowImportance30Days: number;
    mediumImportance90Days: number;
  };
}> {
  console.log('[Cron] Starting daily memory maintenance...');

  try {
    // 1. Adjust memory importance based on usage patterns
    const adjusted = await adjustMemoryImportance();
    console.log(`[Cron] Adjusted importance for ${adjusted} memories`);

    // 2. Prune old and low-importance memories
    const pruneResult = await pruneMemories();
    console.log(
      `[Cron] Pruned ${pruneResult.pruned} memories (expired: ${pruneResult.details.expired}, low importance: ${pruneResult.details.lowImportance30Days}, medium importance: ${pruneResult.details.mediumImportance90Days})`
    );

    return {
      pruned: pruneResult.pruned,
      adjusted,
      details: pruneResult.details,
    };
  } catch (error) {
    console.error('[Cron] Memory maintenance error:', error);
    throw error;
  }
}

/**
 * Schedule memory pruning (for environments with cron support)
 * Run this once at application startup
 *
 * Note: In production, you should use a proper cron scheduler like node-cron
 * or external services like GitHub Actions, Vercel Cron, or AWS EventBridge
 */
export function scheduleMemoryPruning(): void {
  // For development/demo: run every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  const runAndScheduleNext = () => {
    runDailyMemoryMaintenance()
      .then((result) => {
        console.log('[Cron] Memory maintenance completed:', result);
      })
      .catch((error) => {
        console.error('[Cron] Memory maintenance failed:', error);
      })
      .finally(() => {
        // Schedule next run
        setTimeout(runAndScheduleNext, TWENTY_FOUR_HOURS);
      });
  };

  // Run first time after 1 minute (to allow app to fully start)
  setTimeout(runAndScheduleNext, 60 * 1000);

  console.log('[Cron] Memory pruning scheduler initialized (runs daily)');
}

/**
 * Manual trigger for memory pruning (for testing or admin actions)
 */
export async function triggerMemoryPruning(): Promise<void> {
  console.log('[Manual] Triggering memory maintenance...');
  const result = await runDailyMemoryMaintenance();
  console.log('[Manual] Memory maintenance completed:', result);
}
