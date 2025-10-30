# WebSocket Server Setup for Real-time Collaboration

This document explains how to set up the WebSocket server for real-time collaboration features in MADACE v3.0.

## Overview

**Challenge**: Next.js 15 with App Router doesn't support WebSocket servers in API routes.

**Solution**: Use a custom Next.js server that integrates Socket.IO for WebSocket communication.

## Architecture

```
┌─────────────────────────────────────────┐
│        Custom Next.js Server            │
│  (server.ts)                            │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  HTTP Server │  │  Socket.IO      │ │
│  │  (Next.js)   │  │  WebSocket      │ │
│  └──────────────┘  └─────────────────┘ │
│         │                  │            │
└─────────┼──────────────────┼────────────┘
          │                  │
          ▼                  ▼
    Next.js Pages    WebSocket Clients
    (React App)      (Browser WS)
```

## Quick Start

### 1. Install Dependencies

Already installed in package.json:

```bash
npm install socket.io socket.io-client yjs y-websocket y-monaco
```

### 2. Run Development Server with WebSocket

Use the custom server script:

```bash
npm run dev:collab
```

Or manually:

```bash
npx tsx server.ts
```

### 3. Build and Start Production Server

```bash
npm run build
npm run start:collab
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# WebSocket Configuration
HOSTNAME=localhost
PORT=3000

# CORS for WebSocket
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

For production:

```env
HOSTNAME=0.0.0.0
PORT=3000
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:collab": "tsx server.ts",
    "build": "next build",
    "start": "next start",
    "start:collab": "NODE_ENV=production tsx server.ts"
  }
}
```

## Client-Side Usage

### Connect to WebSocket

```typescript
import { getWebSocketClient } from '@/lib/collab/websocket-client';

// In your React component
useEffect(() => {
  const client = getWebSocketClient();

  // Connect to server
  client.connect();

  // Join a room (project)
  client.joinRoom('project-id', {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#3b82f6', // Blue
  });

  // Listen to connection status
  const unsubscribe = client.onStatusChange((status) => {
    console.log('Connection status:', status);
  });

  // Cleanup
  return () => {
    client.disconnect();
    unsubscribe();
  };
}, []);
```

### Display Connection Status

```tsx
import ConnectionStatus from '@/components/features/ide/ConnectionStatus';

export default function MyPage() {
  return (
    <div>
      <ConnectionStatus showUserCount showDetails />
    </div>
  );
}
```

## Server-Side Architecture

### Files Created

1. **server.ts** - Custom Next.js server with Socket.IO
2. **lib/collab/websocket-server.ts** - WebSocket server manager
3. **lib/collab/room-manager.ts** - Room and user management
4. **lib/collab/websocket-client.ts** - Client-side WebSocket connection
5. **lib/collab/yjs-provider.ts** - Yjs CRDT provider for collaborative editing
6. **components/features/ide/ConnectionStatus.tsx** - UI status indicator

### Server Lifecycle

1. **Initialization**:
   - Next.js app prepared
   - HTTP server created
   - Socket.IO attached to HTTP server
   - Room manager initialized

2. **Client Connection**:
   - Client connects via Socket.IO
   - Authentication (optional JWT validation)
   - Join room (project-based)
   - Presence tracking

3. **Real-time Sync**:
   - File operations broadcast to room members
   - Yjs CRDT for conflict-free editing
   - Awareness API for cursors/presence

4. **Shutdown**:
   - Graceful shutdown on SIGTERM/SIGINT
   - Close all WebSocket connections
   - Clean up resources

## Production Deployment

### Option 1: Single Server (Recommended for Small-Medium Apps)

Run the custom server:

```bash
npm run build
npm run start:collab
```

Pros:

- Simple deployment
- Single port (3000)
- Shared HTTP/WS server

Cons:

- Vertical scaling only
- All traffic on one server

### Option 2: Separate WebSocket Server (Scalable)

1. **App Server** (Next.js):

   ```bash
   npm run start  # Standard Next.js server
   ```

2. **WebSocket Server** (separate process):

   ```bash
   # Create dedicated WS server
   npx tsx lib/collab/standalone-ws-server.ts
   ```

3. **Nginx Configuration**:

   ```nginx
   # Proxy WebSocket requests to WS server
   location /api/v3/collab/ws {
       proxy_pass http://ws-server:3001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }

   # Proxy HTTP requests to Next.js
   location / {
       proxy_pass http://nextjs:3000;
   }
   ```

Pros:

- Horizontal scaling
- Isolate WebSocket load
- Better resource management

Cons:

- More complex deployment
- Two services to manage

### Option 3: Vercel with External WebSocket

Since Vercel doesn't support WebSocket:

1. **Deploy Next.js to Vercel** (without WebSocket)
2. **Deploy WebSocket server to** Railway/Render/AWS:
   ```bash
   # Standalone WS server
   npx tsx lib/collab/standalone-ws-server.ts
   ```
3. **Configure client** to connect to external WS URL:
   ```env
   NEXT_PUBLIC_WS_URL=wss://ws.yourdomain.com
   ```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start custom server
CMD ["npm", "run", "start:collab"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  madace-web:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - HOSTNAME=0.0.0.0
      - PORT=3000
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - NEXT_PUBLIC_WS_URL=ws://localhost:3000
    volumes:
      - ./madace-data:/app/data
```

## Troubleshooting

### Issue: WebSocket connection fails

**Solution 1**: Check if custom server is running:

```bash
# Should show WebSocket server message
npm run dev:collab
```

**Solution 2**: Verify WebSocket URL:

```typescript
console.log(process.env.NEXT_PUBLIC_WS_URL);
```

### Issue: CORS errors

**Solution**: Update server CORS configuration:

```typescript
// In server.ts
const wsServer = initializeWebSocketServer(server, {
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST'],
  credentials: true,
});
```

### Issue: Connection drops frequently

**Solution**: Increase ping timeout:

```typescript
// In websocket-client.ts
client.connect(undefined, {
  reconnectionDelay: 2000,
  reconnectionAttempts: 10,
  timeout: 20000, // 20 seconds
});
```

## Monitoring

### WebSocket Server Stats

```typescript
import { getWebSocketServer } from '@/lib/collab/websocket-server';

const server = getWebSocketServer();
const roomManager = server.getRoomManager();

console.log('Connected users:', server.getConnectedUsersCount());
console.log('Active rooms:', roomManager.getActiveRooms().length);
console.log('Room stats:', roomManager.getStats());
```

### Client-Side Monitoring

```typescript
const client = getWebSocketClient();

client.onStatusChange((status) => {
  // Log to analytics
  console.log('WS Status:', status);
});
```

## Security

### Authentication

Add JWT validation in server:

```typescript
// In websocket-server.ts
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const user = verifyJWT(token);
    socket.data.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});
```

### Rate Limiting

Limit events per user:

```typescript
// In room-manager.ts
const eventCounts = new Map<string, number>();

function rateLimit(socketId: string): boolean {
  const count = eventCounts.get(socketId) || 0;

  if (count > 100) {
    // Max 100 events per second
    return false;
  }

  eventCounts.set(socketId, count + 1);

  setTimeout(() => {
    eventCounts.set(socketId, 0);
  }, 1000);

  return true;
}
```

## Performance Tips

1. **Use Binary Transport**: Enable binary mode for faster sync
2. **Throttle Events**: Limit cursor position updates to 50ms
3. **Compress Data**: Enable compression for large payloads
4. **Connection Pooling**: Reuse connections when possible

## Next Steps

1. ✅ WebSocket server infrastructure complete
2. ⏳ Integrate Yjs with Monaco Editor
3. ⏳ Add presence awareness (shared cursors)
4. ⏳ Build in-app team chat
5. ⏳ Add collaborative file editing

---

**Documentation Version**: 1.0
**Last Updated**: 2025-10-30
**MADACE Version**: v3.0-alpha
