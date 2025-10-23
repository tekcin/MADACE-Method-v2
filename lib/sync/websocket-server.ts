/**
 * WebSocket Server for Real-Time Synchronization
 *
 * Broadcasts state changes to all connected clients (Web UI and CLI tools)
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { randomUUID } from 'crypto';
import type {
  SyncMessage,
  ClientInfo,
  BroadcastOptions,
  StateUpdateMessage,
  WorkflowEventMessage,
  AgentEventMessage,
  ConfigUpdateMessage,
} from './types';

/**
 * WebSocket Sync Server
 *
 * Manages WebSocket connections and broadcasts state changes
 */
export class WebSocketSyncServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, { ws: WebSocket; info: ClientInfo }> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly pingIntervalMs = 30000; // 30 seconds

  /**
   * Start the WebSocket server
   */
  start(port: number = 3001): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port });

        this.wss.on('listening', () => {
          console.log(`[WebSocket] Server listening on port ${port}`);
          this.startPingInterval();
          resolve();
        });

        this.wss.on('connection', (ws, request) => {
          this.handleConnection(ws, request);
        });

        this.wss.on('error', (error) => {
          console.error('[WebSocket] Server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Close all client connections
    for (const [clientId, { ws }] of this.clients) {
      ws.close();
      this.clients.delete(clientId);
    }

    // Close server
    return new Promise((resolve, reject) => {
      if (!this.wss) {
        resolve();
        return;
      }

      this.wss.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log('[WebSocket] Server stopped');
          this.wss = null;
          resolve();
        }
      });
    });
  }

  /**
   * Handle new client connection
   */
  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    const clientId = randomUUID();
    const info: ClientInfo = {
      id: clientId,
      connectedAt: Date.now(),
      metadata: {
        source: this.detectSource(request),
        userAgent: request.headers['user-agent'],
      },
    };

    this.clients.set(clientId, { ws, info });
    console.log(`[WebSocket] Client connected: ${clientId} (source: ${info.metadata?.source})`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'ping',
      timestamp: Date.now(),
      data: { clientId, message: 'Connected to MADACE sync server' },
    });

    ws.on('message', (data) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}`);
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket] Client error (${clientId}):`, error);
      this.clients.delete(clientId);
    });

    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.info.lastPing = Date.now();
      }
    });
  }

  /**
   * Detect client source from request
   */
  private detectSource(request: IncomingMessage): 'web-ui' | 'cli-claude' | 'cli-gemini' {
    const userAgent = request.headers['user-agent'] || '';

    if (userAgent.includes('claude-cli')) {
      return 'cli-claude';
    } else if (userAgent.includes('gemini-cli')) {
      return 'cli-gemini';
    }

    return 'web-ui';
  }

  /**
   * Handle message from client
   */
  private handleMessage(clientId: string, data: Buffer | ArrayBuffer | Buffer[]): void {
    try {
      const message = JSON.parse(data.toString()) as SyncMessage;

      // Handle pong responses
      if (message.type === 'pong') {
        const client = this.clients.get(clientId);
        if (client) {
          client.info.lastPing = Date.now();
        }
        return;
      }

      // Broadcast message to other clients
      console.log(`[WebSocket] Message from ${clientId}:`, message.type);
      this.broadcast(message, { excludeClient: clientId });
    } catch (error) {
      console.error(`[WebSocket] Failed to parse message from ${clientId}:`, error);
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, message: SyncMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`[WebSocket] Failed to send to client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(message: SyncMessage, options?: BroadcastOptions): number {
    let sent = 0;

    for (const [clientId, { ws, info }] of this.clients) {
      // Skip excluded client
      if (options?.excludeClient === clientId) {
        continue;
      }

      // Apply filter
      if (options?.filter && !options.filter(info)) {
        continue;
      }

      // Send message
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          sent++;
        } catch (error) {
          console.error(`[WebSocket] Failed to send to client ${clientId}:`, error);
        }
      }
    }

    return sent;
  }

  /**
   * Broadcast state update
   */
  broadcastStateUpdate(workflowName: string, state: StateUpdateMessage['data']['state']): number {
    const message: StateUpdateMessage = {
      type: 'state_updated',
      timestamp: Date.now(),
      data: {
        workflowName,
        state,
      },
    };

    return this.broadcast(message);
  }

  /**
   * Broadcast workflow event
   */
  broadcastWorkflowEvent(
    type: 'workflow_started' | 'workflow_completed' | 'workflow_failed',
    workflowName: string,
    details?: { message?: string; error?: string }
  ): number {
    const message: WorkflowEventMessage = {
      type,
      timestamp: Date.now(),
      data: {
        workflowName,
        ...details,
      },
    };

    return this.broadcast(message);
  }

  /**
   * Broadcast agent event
   */
  broadcastAgentEvent(agentId: string, agentName: string): number {
    const message: AgentEventMessage = {
      type: 'agent_loaded',
      timestamp: Date.now(),
      data: {
        agentId,
        agentName,
      },
    };

    return this.broadcast(message);
  }

  /**
   * Broadcast config update
   */
  broadcastConfigUpdate(
    section: 'project' | 'llm' | 'modules',
    changes: Record<string, unknown>
  ): number {
    const message: ConfigUpdateMessage = {
      type: 'config_updated',
      timestamp: Date.now(),
      data: {
        section,
        changes,
      },
    };

    return this.broadcast(message);
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();

      for (const [clientId, { ws, info }] of this.clients) {
        if (ws.readyState === WebSocket.OPEN) {
          // Send ping
          ws.ping();

          // Check for stale connections (no pong for 60 seconds)
          if (info.lastPing && now - info.lastPing > 60000) {
            console.log(`[WebSocket] Closing stale connection: ${clientId}`);
            ws.close();
            this.clients.delete(clientId);
          }
        } else {
          // Clean up closed connections
          this.clients.delete(clientId);
        }
      }
    }, this.pingIntervalMs);
  }

  /**
   * Get connected clients count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client info
   */
  getClients(): ClientInfo[] {
    return Array.from(this.clients.values()).map(({ info }) => info);
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.wss !== null;
  }
}

// Singleton instance
let instance: WebSocketSyncServer | null = null;

/**
 * Get singleton WebSocket server instance
 */
export function getWebSocketServer(): WebSocketSyncServer {
  if (!instance) {
    instance = new WebSocketSyncServer();
  }
  return instance;
}

/**
 * Start WebSocket server (singleton)
 */
export async function startWebSocketServer(port: number = 3001): Promise<WebSocketSyncServer> {
  const server = getWebSocketServer();

  if (!server.isRunning()) {
    await server.start(port);
  }

  return server;
}

/**
 * Stop WebSocket server (singleton)
 */
export async function stopWebSocketServer(): Promise<void> {
  if (instance) {
    await instance.stop();
    instance = null;
  }
}
