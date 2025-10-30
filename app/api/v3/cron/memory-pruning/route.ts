/**
 * Memory Pruning Cron API
 *
 * POST /api/v3/cron/memory-pruning - Trigger memory pruning manually
 *
 * This endpoint can be called by cron services like:
 * - Vercel Cron
 * - GitHub Actions
 * - AWS EventBridge
 * - Manual admin trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailyMemoryMaintenance } from '@/lib/cron/memory-pruner';
import { getPruningStats } from '@/lib/services/memory-pruner';

/**
 * POST /api/v3/cron/memory-pruning
 * Run memory pruning
 */
export async function POST(_request: NextRequest) {
  try {
    // Optional: Add auth check here to prevent unauthorized access
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    const result = await runDailyMemoryMaintenance();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] Memory pruning error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run memory pruning',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v3/cron/memory-pruning
 * Get pruning statistics (dry run)
 */
export async function GET(_request: NextRequest) {
  try {
    const stats = await getPruningStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[API] Get pruning stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pruning stats',
      },
      { status: 500 }
    );
  }
}
