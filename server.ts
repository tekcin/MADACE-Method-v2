/**
 * Custom Next.js Server with WebSocket Support
 *
 * Next.js App Router doesn't support WebSocket servers in API routes.
 * This custom server integrates Socket.IO for real-time collaboration.
 *
 * Usage:
 *   npm run dev:collab    # Start with WebSocket support
 *   npm run build:collab  # Build with custom server
 *   npm run start:collab  # Start production server
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeWebSocketServer } from './lib/collab/websocket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);

      // Handle Next.js requests
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize WebSocket server
  const wsServer = initializeWebSocketServer(server);

  // Start server
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/api/v3/collab/ws`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received: closing HTTP server');
    wsServer.shutdown();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received: closing HTTP server');
    wsServer.shutdown();
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});
