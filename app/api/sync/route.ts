/**
 * Sync Service API Routes
 *
 * Endpoints for managing the WebSocket sync service
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  startSyncService,
  stopSyncService,
  isSyncServiceRunning,
  getWebSocketServer,
} from '@/lib/sync';

/**
 * GET /api/sync - Get sync service status
 */
export async function GET(_request: NextRequest) {
  try {
    const isRunning = isSyncServiceRunning();
    const wsServer = getWebSocketServer();

    return NextResponse.json({
      running: isRunning,
      clients: isRunning ? wsServer.getClients() : [],
      clientCount: isRunning ? wsServer.getClientCount() : 0,
      uptime: isRunning ? Date.now() : 0,
    });
  } catch (error) {
    console.error('[API /api/sync GET] Error getting sync status:', error);
    return NextResponse.json(
      {
        error: 'Failed to get sync service status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync - Start or stop sync service
 *
 * Request body:
 * - action: 'start' | 'stop'
 * - wsPort?: number (optional, default: 3001)
 * - statePaths?: string[] (optional)
 * - configPath?: string (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, wsPort, statePaths, configPath } = body;

    if (!action || (action !== 'start' && action !== 'stop')) {
      return NextResponse.json(
        {
          error: 'Invalid action',
          message: 'Action must be "start" or "stop"',
        },
        { status: 400 }
      );
    }

    if (action === 'start') {
      // Check if already running
      if (isSyncServiceRunning()) {
        return NextResponse.json({
          success: true,
          message: 'Sync service is already running',
          running: true,
        });
      }

      // Start sync service
      await startSyncService({
        wsPort,
        statePaths,
        configPath,
      });

      const wsServer = getWebSocketServer();

      return NextResponse.json({
        success: true,
        message: 'Sync service started successfully',
        running: true,
        wsPort: wsPort || 3001,
        clientCount: wsServer.getClientCount(),
      });
    } else {
      // Stop sync service
      if (!isSyncServiceRunning()) {
        return NextResponse.json({
          success: true,
          message: 'Sync service is already stopped',
          running: false,
        });
      }

      await stopSyncService();

      return NextResponse.json({
        success: true,
        message: 'Sync service stopped successfully',
        running: false,
      });
    }
  } catch (error) {
    console.error('[API /api/sync POST] Error managing sync service:', error);
    return NextResponse.json(
      {
        error: 'Failed to manage sync service',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
