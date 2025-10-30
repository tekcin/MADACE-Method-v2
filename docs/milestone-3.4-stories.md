# Milestone 3.4: Web IDE & Real-time Collaboration - Story Breakdown

**Milestone**: 3.4 - Web IDE & Real-time Collaboration
**Priority**: P2 (Nice to Have - Team Features)
**Timeline**: 6-8 weeks (Weeks 14-21)
**Total Points**: 71 points
**Status**: 📅 Planned

---

## Overview

This milestone transforms MADACE into a fully collaborative development platform with an integrated web-based IDE and real-time multi-user editing capabilities. Users will be able to code, manage files, and collaborate with team members entirely in the browser.

**Key Innovation**: Monaco Editor (VS Code engine) embedded in MADACE with real-time collaboration powered by WebSocket sync.

**Target Users**: Development teams who want to collaborate on projects in real-time, and solo developers who prefer in-browser coding.

**Success Metrics**:

- Monaco Editor loads and renders code with syntax highlighting
- File explorer provides full CRUD operations on project files
- WebSocket sync enables real-time collaboration with < 100ms latency
- 20+ teams actively collaborate on projects
- Integrated terminal executes commands successfully

---

## Week 14-15: Monaco Editor Integration (19 points)

### [IDE-001] Integrate Monaco Editor with Basic Features (10 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Embed Monaco Editor (the same editor powering VS Code) into MADACE with basic editing capabilities, syntax highlighting, and file loading.

**Acceptance Criteria**:

- ✅ Monaco Editor package installed (`@monaco-editor/react`)
- ✅ Editor component renders at `/ide` route
- ✅ Syntax highlighting for 20+ languages:
  - TypeScript, JavaScript, Python, Rust, Go, Java, C++, C#
  - HTML, CSS, JSON, YAML, Markdown, SQL
  - Shell scripts, Dockerfile, and more
- ✅ Basic editor features:
  - Line numbers
  - Minimap (code overview)
  - Find/Replace (Ctrl+F / Cmd+F)
  - Bracket matching
  - Auto-indentation
  - Word wrap toggle
- ✅ Theme support:
  - Light theme (VS Code Light)
  - Dark theme (VS Code Dark) - default
  - High contrast themes
- ✅ File loading:
  - Load file content via API: `GET /api/v3/files/:path`
  - Display file in editor
  - Show loading state while fetching
- ✅ Performance:
  - Loads files up to 1MB without lag
  - Syntax highlighting renders in < 500ms

**Technical Details**:

- **Library**: `@monaco-editor/react` v4.6+
- **Editor Config**:
  ```typescript
  const editorOptions = {
    fontSize: 14,
    minimap: { enabled: true },
    lineNumbers: 'on',
    wordWrap: 'off',
    theme: 'vs-dark',
    automaticLayout: true, // Responsive to container resize
  };
  ```
- **API Integration**: Fetch file content from backend
- **State Management**: React useState for file content, Zustand for editor state

**Implementation Steps**:

1. Install dependencies: `npm install @monaco-editor/react`
2. Create `components/features/ide/MonacoEditor.tsx` - Editor wrapper component
3. Create `app/ide/page.tsx` - IDE page route
4. Configure Monaco loader with CDN or local bundle
5. Implement file loading from API
6. Add theme selector UI
7. Add editor options panel (word wrap, minimap toggle)
8. Test syntax highlighting for all supported languages
9. Test performance with large files (1MB+)
10. Write unit tests for editor component

**Files to Create/Modify**:

- `components/features/ide/MonacoEditor.tsx` (new) - Monaco wrapper
- `components/features/ide/EditorToolbar.tsx` (new) - Toolbar with options
- `app/ide/page.tsx` (new) - IDE page
- `app/api/v3/files/[...path]/route.ts` (new) - File read/write API
- `lib/services/file-service.ts` (new) - File operations
- `__tests__/components/ide/MonacoEditor.test.tsx` (new) - Editor tests
- `__tests__/lib/services/file-service.test.ts` (new) - File service tests

**Definition of Done**:

- Monaco Editor renders in browser
- Syntax highlighting works for 20+ languages
- Files load from API and display correctly
- Theme switching functional
- Performance targets met (< 500ms for syntax highlighting)
- Tests pass (> 80% coverage)
- Documentation added to `docs/IDE-GUIDE.md`

---

### [IDE-002] Add Multi-file Tab Support (5 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Enable users to open multiple files simultaneously in tabs, with tab switching and close functionality.

**Acceptance Criteria**:

- ✅ **Tab Bar Component**:
  - Horizontal tab bar above editor
  - Each tab shows file name and file icon (based on extension)
  - Active tab highlighted with different background color
  - Close button (X) on each tab
  - Max 10 tabs open at once (show warning if exceeded)
- ✅ **Tab Navigation**:
  - Click tab to switch files
  - Keyboard shortcuts:
    - `Ctrl+Tab` (Cmd+Tab) - Next tab
    - `Ctrl+Shift+Tab` - Previous tab
    - `Ctrl+W` (Cmd+W) - Close current tab
  - Double-click file in explorer to open in new tab
- ✅ **Tab State Management**:
  - Track open tabs in state (file path, content, isDirty)
  - Unsaved changes indicator (dot on tab)
  - Prompt before closing tab with unsaved changes
  - Restore tabs on page reload (localStorage)
- ✅ **Tab Context Menu**:
  - Right-click tab for menu:
    - Close
    - Close Others
    - Close All
    - Copy Path
    - Reveal in Explorer

**Technical Details**:

- **State**: Zustand store for open tabs
- **Tab Component**: `components/features/ide/TabBar.tsx`
- **Persistence**: localStorage for tab restoration
- **Keyboard Shortcuts**: Use `react-hotkeys-hook`

**Implementation Steps**:

1. Create `components/features/ide/TabBar.tsx` - Tab bar component
2. Create `components/features/ide/Tab.tsx` - Individual tab component
3. Create Zustand store: `lib/stores/ide-store.ts` - Tab state management
4. Implement tab switching logic
5. Add unsaved changes detection (compare original vs current content)
6. Implement tab close with confirmation
7. Add keyboard shortcuts
8. Add right-click context menu
9. Implement tab persistence with localStorage
10. Write tests for tab operations

**Files to Create/Modify**:

- `components/features/ide/TabBar.tsx` (new) - Tab bar
- `components/features/ide/Tab.tsx` (new) - Tab component
- `components/features/ide/TabContextMenu.tsx` (new) - Context menu
- `lib/stores/ide-store.ts` (new) - IDE state management
- `app/ide/page.tsx` (modify) - Integrate tab bar
- `__tests__/components/ide/TabBar.test.tsx` (new) - Tab bar tests
- `__tests__/lib/stores/ide-store.test.ts` (new) - Store tests

**Definition of Done**:

- Multiple files can be opened in tabs
- Tab switching works (mouse and keyboard)
- Unsaved changes prompt works
- Tab persistence across page reloads
- Context menu functional
- Tests pass

---

### [IDE-003] Add IntelliSense and Auto-completion (4 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Enable Monaco's built-in IntelliSense and auto-completion for TypeScript/JavaScript with language server integration.

**Acceptance Criteria**:

- ✅ **IntelliSense Features**:
  - Auto-completion suggestions (Ctrl+Space)
  - Parameter hints (function signatures)
  - Hover tooltips (show type information)
  - Error squiggles (TypeScript type errors)
  - Quick info on hover
- ✅ **Language Support**:
  - Full IntelliSense for TypeScript/JavaScript
  - Basic completion for JSON (schema-based)
  - Basic completion for HTML/CSS
  - Path completion for imports
- ✅ **Project Awareness**:
  - Load `tsconfig.json` for TypeScript project settings
  - Load `package.json` for available packages
  - Type definitions from `node_modules/@types`
- ✅ **Performance**:
  - Suggestions appear in < 100ms
  - No lag when typing

**Technical Details**:

- **Monaco LSP**: Monaco has built-in TypeScript language service
- **Configuration**: Load project files (`tsconfig.json`, `package.json`)
- **Type Definitions**: Fetch from CDN or load from project

**Implementation Steps**:

1. Configure Monaco's TypeScript compiler options
2. Load `tsconfig.json` from project via API
3. Load `package.json` for dependency information
4. Enable IntelliSense in editor options
5. Test auto-completion for common TypeScript patterns
6. Test hover tooltips and error squiggles
7. Write tests for IntelliSense functionality

**Files to Create/Modify**:

- `lib/ide/typescript-config.ts` (new) - TS config loader
- `components/features/ide/MonacoEditor.tsx` (modify) - Add IntelliSense config
- `app/api/v3/files/tsconfig.json/route.ts` (new) - Load tsconfig.json
- `__tests__/lib/ide/typescript-config.test.ts` (new) - Config tests

**Definition of Done**:

- Auto-completion works for TypeScript/JavaScript
- Hover tooltips show type information
- Error squiggles appear for type errors
- Performance targets met (< 100ms)
- Tests pass

---

## Week 16-17: File Explorer & Project Management (18 points)

### [FILES-001] Build File Tree Explorer with CRUD Operations (10 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Create a visual file tree explorer with full create, read, update, delete operations on files and folders.

**Acceptance Criteria**:

- ✅ **File Tree Component**:
  - Left sidebar with collapsible file tree
  - Shows project root and all nested files/folders
  - Expandable folders (click to expand/collapse)
  - File icons based on extension (TypeScript, JavaScript, JSON, Markdown, etc.)
  - Folder icons (open/closed states)
- ✅ **File Operations**:
  - **Create File**: Right-click folder → "New File" → Enter name → Created
  - **Create Folder**: Right-click folder → "New Folder" → Enter name → Created
  - **Rename**: Right-click → "Rename" → Enter new name → Renamed
  - **Delete**: Right-click → "Delete" → Confirm → Deleted
  - **Copy**: Right-click → "Copy" → Right-click destination → "Paste"
  - **Move**: Drag file/folder to new location (drag-and-drop)
- ✅ **File Opening**:
  - Single-click: Select file (show in preview)
  - Double-click: Open file in editor tab
  - Middle-click: Open in background tab
- ✅ **Context Menu**:
  - Right-click shows context menu with operations
  - Context-sensitive options (file vs folder)
- ✅ **Empty States**:
  - "No files in this folder" message for empty folders
  - "Open a project" button if no project loaded

**Technical Details**:

- **Component Library**: `react-arborist` for tree view or custom implementation
- **State Management**: Zustand store for file tree state
- **API Endpoints**:
  - `GET /api/v3/files` - List files (recursive)
  - `POST /api/v3/files` - Create file
  - `PUT /api/v3/files/:path` - Update file
  - `DELETE /api/v3/files/:path` - Delete file
  - `POST /api/v3/files/move` - Move file/folder
  - `POST /api/v3/files/copy` - Copy file/folder
- **Icons**: `react-icons` or custom icon set (VS Code icons)

**Implementation Steps**:

1. Create `components/features/ide/FileExplorer.tsx` - File tree component
2. Create `components/features/ide/FileTreeNode.tsx` - Tree node component
3. Create `components/features/ide/FileContextMenu.tsx` - Context menu
4. Create API routes for file operations
5. Implement file tree state management with Zustand
6. Implement drag-and-drop with `react-dnd`
7. Add file operation handlers (create, rename, delete, copy, move)
8. Add confirmation dialogs for destructive actions
9. Test all file operations
10. Write unit tests for file operations

**Files to Create/Modify**:

- `components/features/ide/FileExplorer.tsx` (new) - File tree
- `components/features/ide/FileTreeNode.tsx` (new) - Tree node
- `components/features/ide/FileContextMenu.tsx` (new) - Context menu
- `components/features/ide/FileOperationDialog.tsx` (new) - Dialogs (rename, create, etc.)
- `lib/stores/file-tree-store.ts` (new) - File tree state
- `app/api/v3/files/route.ts` (new) - File list API
- `app/api/v3/files/[...path]/route.ts` (modify) - Add POST/DELETE handlers
- `app/api/v3/files/move/route.ts` (new) - Move operation
- `app/api/v3/files/copy/route.ts` (new) - Copy operation
- `__tests__/components/ide/FileExplorer.test.tsx` (new) - Explorer tests
- `__tests__/app/api/v3/files/route.test.ts` (new) - API tests

**Definition of Done**:

- File tree displays all project files
- All CRUD operations work (create, read, update, delete, copy, move)
- Drag-and-drop functional
- Context menu shows appropriate options
- Confirmation dialogs prevent accidental deletions
- Tests pass (> 80% coverage)

---

### [FILES-002] Add File Search and Git Status Indicators (8 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Implement fuzzy file search and Git status indicators in the file explorer.

**Acceptance Criteria**:

- ✅ **File Search**:
  - Search box at top of file explorer
  - Fuzzy matching (e.g., "tscon" matches "tsconfig.json")
  - Search across all files in project
  - Keyboard shortcut: `Ctrl+P` (Cmd+P) - Quick open file
  - Results show file path and match score
  - Arrow keys navigate results, Enter opens file
  - ESC closes search
- ✅ **Git Status Indicators**:
  - Modified files: Yellow "M" badge
  - New files: Green "U" badge (untracked)
  - Deleted files: Red "D" badge
  - Staged files: Green "A" badge (added)
  - Git-ignored files: Grayed out
- ✅ **Git Integration**:
  - Read `.gitignore` to hide ignored files (optional toggle)
  - Run `git status --porcelain` to get file statuses
  - Update status in real-time (poll every 10 seconds)
- ✅ **Search Results UI**:
  - Dropdown overlay with search results
  - Show file path, file icon, and status badge
  - Click result to open file
  - Show "No results" message if no matches

**Technical Details**:

- **Fuzzy Search**: `fuse.js` for fuzzy matching
- **Git Integration**: Execute `git status` via API endpoint
- **Status Polling**: `setInterval` to refresh every 10 seconds
- **Search UI**: Overlay component with `Cmd+P` shortcut

**Implementation Steps**:

1. Create `components/features/ide/FileSearch.tsx` - Search component
2. Create `components/features/ide/SearchResults.tsx` - Results dropdown
3. Install `fuse.js` for fuzzy matching
4. Create API endpoint: `GET /api/v3/git/status` - Returns file statuses
5. Implement search logic with Fuse.js
6. Implement keyboard shortcut (`Ctrl+P`) with `react-hotkeys-hook`
7. Add Git status badges to FileTreeNode component
8. Implement status polling
9. Add `.gitignore` parsing logic
10. Write tests for search and Git status

**Files to Create/Modify**:

- `components/features/ide/FileSearch.tsx` (new) - Search component
- `components/features/ide/SearchResults.tsx` (new) - Results dropdown
- `components/features/ide/FileTreeNode.tsx` (modify) - Add Git status badges
- `app/api/v3/git/status/route.ts` (new) - Git status API
- `lib/services/git-service.ts` (new) - Git operations
- `__tests__/components/ide/FileSearch.test.tsx` (new) - Search tests
- `__tests__/lib/services/git-service.test.ts` (new) - Git service tests

**Definition of Done**:

- File search works with fuzzy matching
- `Ctrl+P` quick open functional
- Git status badges appear on files
- Status updates every 10 seconds
- `.gitignore` respected
- Tests pass

---

## Week 18-19: Real-time Collaboration Foundation (21 points)

### [COLLAB-001] Set up WebSocket Server and Basic Sync (10 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Implement WebSocket server for real-time collaboration with basic document synchronization.

**Acceptance Criteria**:

- ✅ **WebSocket Server**:
  - WebSocket server running on `/api/v3/collab/ws`
  - Uses Socket.IO v4+ for cross-browser compatibility
  - Connection authentication (verify user token)
  - Room-based architecture (one room per project)
  - Auto-reconnect on connection loss
- ✅ **Client Connection**:
  - Web UI connects to WebSocket on IDE page load
  - Shows connection status indicator (green = connected, red = disconnected)
  - Reconnects automatically if disconnected
- ✅ **Basic Sync**:
  - When user edits file, broadcast changes to all room members
  - Sync events: `file:open`, `file:edit`, `file:close`, `file:save`
  - Each event includes: userId, fileName, changes (delta or full content)
  - Other users' editors update in real-time
- ✅ **Conflict Resolution**:
  - Use Operational Transformation (OT) or CRDT for conflict-free sync
  - Library: `yjs` (CRDT) or `ot.js` (OT)
  - Ensure eventual consistency across all clients
- ✅ **Performance**:
  - Latency < 100ms for sync events
  - No lag when multiple users edit simultaneously

**Technical Details**:

- **Stack**: Socket.IO server + client
- **Collaboration Library**: Yjs (recommended) or ot.js
- **Architecture**:
  ```
  Client 1 (Monaco) ↔ Yjs Provider ↔ WebSocket Server ↔ Yjs Provider ↔ Client 2 (Monaco)
  ```
- **Room Management**: Each project has a unique room ID
- **Authentication**: JWT token passed on connection

**Implementation Steps**:

1. Install dependencies: `npm install socket.io yjs y-socket.io`
2. Create `lib/collab/websocket-server.ts` - WebSocket server setup
3. Create `lib/collab/room-manager.ts` - Room management logic
4. Create `app/api/v3/collab/ws/route.ts` - WebSocket API route (Next.js)
5. Create client: `lib/collab/websocket-client.ts` - Client connection
6. Integrate Yjs with Monaco Editor
7. Implement sync events (file:open, file:edit, etc.)
8. Add connection status indicator in UI
9. Test with multiple browser tabs (simulate multiple users)
10. Write integration tests for sync

**Files to Create/Modify**:

- `lib/collab/websocket-server.ts` (new) - WebSocket server
- `lib/collab/room-manager.ts` (new) - Room management
- `lib/collab/websocket-client.ts` (new) - Client connection
- `lib/collab/yjs-provider.ts` (new) - Yjs integration
- `app/api/v3/collab/ws/route.ts` (new) - WebSocket route
- `components/features/ide/ConnectionStatus.tsx` (new) - Status indicator
- `components/features/ide/MonacoEditor.tsx` (modify) - Integrate Yjs
- `__tests__/lib/collab/websocket-server.test.ts` (new) - Server tests
- `__tests__/lib/collab/yjs-provider.test.ts` (new) - Sync tests

**Definition of Done**:

- WebSocket server running and accepting connections
- Multiple users can connect to same project
- File edits sync in real-time across all clients
- Conflict resolution works (no data corruption)
- Latency < 100ms
- Tests pass
- Documentation added to `docs/COLLABORATION-GUIDE.md`

---

### [COLLAB-002] Add Presence Awareness and Shared Cursors (8 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Show which users are online and display their cursors in the editor in real-time.

**Acceptance Criteria**:

- ✅ **Presence Awareness**:
  - Show list of online users in sidebar
  - Each user has avatar (photo or initials), name, and color
  - Show "1 user online" or "5 users online" indicator
  - Show when users join/leave (toast notification)
  - Update presence list in real-time
- ✅ **Shared Cursors**:
  - Show other users' cursors in editor
  - Each cursor has user's color (assigned when joining)
  - Cursor label shows user's name
  - Cursor position updates in real-time (< 50ms latency)
  - Show user's current selection (highlight range)
- ✅ **User Colors**:
  - Auto-assign unique color to each user (from predefined palette)
  - Colors persist for duration of session
  - Avoid similar colors for better distinction
- ✅ **Performance**:
  - Cursor updates don't lag editor typing
  - Efficient cursor position broadcasting (throttle to 50ms)

**Technical Details**:

- **Presence**: Yjs Awareness API tracks user presence
- **Cursor Rendering**: Monaco Editor decorations API
- **Color Palette**: 10 predefined colors (blue, green, purple, orange, pink, teal, red, yellow, indigo, cyan)
- **Throttling**: Throttle cursor position updates to 50ms

**Implementation Steps**:

1. Integrate Yjs Awareness for presence tracking
2. Create `components/features/ide/PresenceList.tsx` - Online users list
3. Create `components/features/ide/CursorOverlay.tsx` - Shared cursor rendering
4. Assign user colors on connection
5. Broadcast cursor position on Monaco `onDidChangeCursorPosition` event
6. Render remote cursors using Monaco decorations
7. Add join/leave toast notifications
8. Implement throttling for cursor updates
9. Write tests for presence and cursor sync

**Files to Create/Modify**:

- `lib/collab/presence-manager.ts` (new) - Presence tracking
- `lib/collab/cursor-sync.ts` (new) - Cursor synchronization
- `components/features/ide/PresenceList.tsx` (new) - Online users list
- `components/features/ide/CursorOverlay.tsx` (new) - Cursor rendering
- `components/features/ide/MonacoEditor.tsx` (modify) - Add cursor sync
- `__tests__/lib/collab/presence-manager.test.ts` (new) - Presence tests
- `__tests__/lib/collab/cursor-sync.test.ts` (new) - Cursor tests

**Definition of Done**:

- Online users list displays all connected users
- Shared cursors appear in editor with user colors
- Cursor positions update in real-time
- Join/leave notifications work
- Performance targets met (< 50ms latency)
- Tests pass

---

### [COLLAB-003] Build In-app Team Chat (3 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Add a lightweight text chat for teams collaborating on projects.

**Acceptance Criteria**:

- ✅ **Chat Panel**:
  - Collapsible chat panel in right sidebar
  - Message list with user avatars and names
  - Message timestamps ("2 minutes ago")
  - Auto-scroll to latest message
- ✅ **Message Input**:
  - Text input at bottom of chat panel
  - Send button + Enter key to send
  - Max message length: 500 characters
  - Character counter
- ✅ **Real-time Updates**:
  - Messages broadcast via WebSocket to all room members
  - New message notification (badge on chat icon if panel closed)
  - Sound notification (optional, user can disable)
- ✅ **Message History**:
  - Load last 50 messages on chat open
  - Infinite scroll to load older messages
- ✅ **Lightweight**:
  - Chat does NOT require database persistence (session-only)
  - Messages stored in memory on WebSocket server
  - Lost when server restarts (acceptable for v3.0)

**Technical Details**:

- **WebSocket Events**: `chat:message`, `chat:history`
- **In-memory Storage**: Array of messages in room state
- **Max History**: Keep last 100 messages per room

**Implementation Steps**:

1. Create `components/features/ide/ChatPanel.tsx` - Chat panel component
2. Create `components/features/ide/ChatMessage.tsx` - Message component
3. Add chat events to WebSocket server
4. Implement in-memory message storage in room
5. Implement message broadcasting
6. Add notification badge and sound
7. Write tests for chat functionality

**Files to Create/Modify**:

- `components/features/ide/ChatPanel.tsx` (new) - Chat panel
- `components/features/ide/ChatMessage.tsx` (new) - Message component
- `lib/collab/room-manager.ts` (modify) - Add chat message storage
- `lib/collab/websocket-server.ts` (modify) - Add chat events
- `__tests__/components/ide/ChatPanel.test.tsx` (new) - Chat tests

**Definition of Done**:

- Chat panel functional in IDE
- Messages sent and received in real-time
- Notification badge appears for new messages
- Message history loads on open
- Tests pass

---

## Week 20-21: Integrated Terminal & Testing (13 points)

### [IDE-004] Add Integrated Terminal with Command Execution (8 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Embed a terminal in the IDE for executing shell commands and viewing output.

**Acceptance Criteria**:

- ✅ **Terminal Component**:
  - Terminal panel at bottom of IDE (resizable)
  - Toggle with `Ctrl+\`` (Cmd+\``) keyboard shortcut
  - Black background, white text (classic terminal appearance)
  - Command prompt: `user@project:~$`
- ✅ **Command Execution**:
  - Type command and press Enter to execute
  - Commands run on backend server (not in browser)
  - API endpoint: `POST /api/v3/terminal/exec` with command string
  - Stream output back to terminal in real-time (WebSocket or SSE)
- ✅ **Supported Commands**:
  - Common CLI tools: `ls`, `cd`, `pwd`, `cat`, `mkdir`, `rm`, `touch`
  - Node.js tools: `npm install`, `npm run dev`, `npm test`
  - Git commands: `git status`, `git add`, `git commit`, `git push`
  - MADACE CLI: `madace agents list`, `madace workflows run`, etc.
- ✅ **Features**:
  - Command history (up/down arrows)
  - Tab completion for file paths (basic)
  - ANSI color support (e.g., colorized `ls` output)
  - Scrollback buffer (last 1000 lines)
  - Clear terminal with `clear` command or `Ctrl+L`
- ✅ **Security**:
  - Whitelist allowed commands (prevent malicious commands like `rm -rf /`)
  - Sandbox terminal to project directory (cannot access parent directories)
  - Rate limit command execution (max 10 commands per minute)

**Technical Details**:

- **Library**: `xterm.js` for terminal UI
- **Backend**: Node.js `child_process.spawn()` to execute commands
- **Streaming**: WebSocket for real-time output streaming
- **Security**: Command whitelist + directory sandboxing

**Implementation Steps**:

1. Install dependencies: `npm install @xterm/xterm @xterm/addon-fit`
2. Create `components/features/ide/Terminal.tsx` - Terminal component
3. Create `app/api/v3/terminal/exec/route.ts` - Command execution API
4. Implement command execution with `child_process.spawn()`
5. Stream output via WebSocket
6. Add command history support
7. Add ANSI color parsing
8. Implement command whitelist and sandboxing
9. Write tests for terminal and command execution

**Files to Create/Modify**:

- `components/features/ide/Terminal.tsx` (new) - Terminal component
- `app/api/v3/terminal/exec/route.ts` (new) - Command execution API
- `lib/terminal/command-executor.ts` (new) - Command execution logic
- `lib/terminal/command-whitelist.ts` (new) - Allowed commands
- `__tests__/components/ide/Terminal.test.tsx` (new) - Terminal tests
- `__tests__/lib/terminal/command-executor.test.ts` (new) - Executor tests

**Definition of Done**:

- Terminal renders in IDE
- Commands execute and output streams to terminal
- Command history works
- ANSI colors supported
- Security measures in place (whitelist, sandboxing)
- Tests pass
- Documentation added to `docs/TERMINAL-GUIDE.md`

---

### [IDE-005] Testing, Optimization, and v3.0-beta Release (5 points)

**Priority**: P2
**Status**: 📅 Planned

**Description**: Comprehensive testing, performance optimization, and preparation for v3.0-beta release.

**Acceptance Criteria**:

**Testing**:

- ✅ Unit tests for all IDE components (coverage > 80%)
- ✅ Integration tests for file operations
- ✅ Integration tests for WebSocket collaboration
- ✅ E2E tests for IDE workflows:
  - Open IDE → Load file → Edit → Save → Close
  - Open file → Collaborate with 2nd user → See changes sync
  - Open terminal → Run command → See output
- ✅ Cross-browser testing (Chrome, Firefox, Safari, Edge)
- ✅ Performance testing (load time, sync latency, memory usage)

**Optimization**:

- ✅ **Load Time**: IDE page loads in < 3 seconds
- ✅ **Sync Latency**: Real-time sync < 100ms
- ✅ **Memory Usage**: < 500MB for IDE with 10 open tabs
- ✅ **Code Splitting**: Lazy load Monaco Editor (reduces initial bundle size)
- ✅ **WebSocket Optimization**: Minimize message size, use binary protocol if needed
- ✅ **File Tree Virtualization**: Use virtual scrolling for large projects (1000+ files)

**Documentation**:

- ✅ User guide: `docs/IDE-GUIDE.md` (how to use IDE)
- ✅ Collaboration guide: `docs/COLLABORATION-GUIDE.md` (how to collaborate)
- ✅ Terminal guide: `docs/TERMINAL-GUIDE.md` (how to use terminal)
- ✅ API documentation: `docs/API-V3.md` (all v3 endpoints)
- ✅ Update README.md with v3.0 features

**Release Preparation**:

- ✅ Version bump to `v3.0.0-beta`
- ✅ Create release notes: `RELEASE-NOTES-v3.0.md`
- ✅ Tag release: `git tag v3.0-beta`
- ✅ Deploy to staging environment for final testing
- ✅ Announce v3.0-beta release

**Technical Details**:

- **Testing**: Jest + Playwright
- **Optimization**: Webpack bundle analyzer, React Profiler
- **Documentation**: Markdown with code examples

**Implementation Steps**:

1. Write comprehensive unit tests for all components
2. Write integration tests for key workflows
3. Write E2E tests with Playwright
4. Run performance profiling (bundle size, load time, memory)
5. Optimize based on profiling results (code splitting, lazy loading)
6. Test in all major browsers
7. Write user documentation
8. Update API documentation
9. Create release notes
10. Deploy to staging and test
11. Tag release and announce

**Files to Create/Modify**:

- `__tests__/**/*.test.tsx` (new) - Comprehensive tests
- `e2e-tests/ide.spec.ts` (new) - IDE E2E tests
- `e2e-tests/collaboration.spec.ts` (new) - Collaboration E2E tests
- `docs/IDE-GUIDE.md` (new) - User guide
- `docs/COLLABORATION-GUIDE.md` (new) - Collaboration guide
- `docs/TERMINAL-GUIDE.md` (new) - Terminal guide
- `docs/API-V3.md` (new) - API documentation
- `RELEASE-NOTES-v3.0.md` (new) - Release notes
- `README.md` (modify) - Add v3.0 features
- `package.json` (modify) - Version bump to 3.0.0-beta

**Definition of Done**:

- All tests pass (> 80% coverage)
- Performance targets met
- Cross-browser compatibility verified
- All documentation complete
- v3.0-beta released and announced

---

## Summary

**Total Stories**: 11 stories
**Total Points**: 71 points

**Week 14-15 (Monaco Editor)**: 19 points

- [IDE-001] Integrate Monaco Editor with basic features (10 points)
- [IDE-002] Add multi-file tab support (5 points)
- [IDE-003] Add IntelliSense and auto-completion (4 points)

**Week 16-17 (File Explorer)**: 18 points

- [FILES-001] Build file tree explorer with CRUD (10 points)
- [FILES-002] Add file search and Git status (8 points)

**Week 18-19 (Collaboration)**: 21 points

- [COLLAB-001] Set up WebSocket server and basic sync (10 points)
- [COLLAB-002] Add presence awareness and shared cursors (8 points)
- [COLLAB-003] Build in-app team chat (3 points)

**Week 20-21 (Terminal & Testing)**: 13 points

- [IDE-004] Add integrated terminal (8 points)
- [IDE-005] Testing, optimization, and v3.0-beta release (5 points)

**Estimated Timeline**: 6-8 weeks (42-56 days)

**Key Dependencies**:

- Milestone 3.1 complete (database and file API)
- Milestone 3.2 complete (CLI foundation)
- Milestone 3.3 complete (chat and memory for team features)
- Node.js v20+ (for terminal command execution)
- WebSocket infrastructure (Socket.IO)

**Success Criteria**:

- Monaco Editor functional with syntax highlighting
- File explorer provides full CRUD operations
- Real-time collaboration works with < 100ms latency
- 20+ teams actively collaborate
- Integrated terminal executes commands
- Comprehensive test coverage (> 80%)
- Complete documentation

---

**Technical Architecture Notes**:

**IDE Architecture**:

```
Browser (React)
     │
     ├─ Monaco Editor Component
     │      └─ Yjs Provider (CRDT sync)
     │
     ├─ File Explorer Component
     │      └─ File Tree State (Zustand)
     │
     ├─ Terminal Component (xterm.js)
     │      └─ WebSocket Stream
     │
     └─ WebSocket Client
            └─ Socket.IO → WebSocket Server
```

**Real-time Sync Flow**:

```
User A: Type in Monaco → Yjs CRDT → WebSocket Server
                                          ↓
User B: Monaco ← Yjs CRDT ← WebSocket Server
```

**Collaboration Stack**:

- **Sync Engine**: Yjs (CRDT-based, conflict-free)
- **Transport**: Socket.IO (WebSocket + fallbacks)
- **Editor**: Monaco Editor (VS Code engine)
- **Terminal**: xterm.js (terminal emulator)
- **File Tree**: react-arborist or custom tree view

**Security Considerations**:

- Terminal commands whitelisted (prevent malicious commands)
- File operations sandboxed to project directory
- WebSocket authentication with JWT
- Rate limiting for command execution
- CORS configured for WebSocket connections

---

**Next Steps**:

1. Update `docs/workflow-status.md` with these 11 stories
2. Move [IDE-001] to TODO when ready to start
3. Begin implementation of Monaco Editor integration
4. Set up Socket.IO WebSocket server

**Release Target**: v3.0-beta (Web IDE & Collaboration Complete)

---

**Last Updated**: 2025-10-30 by Claude Code (MADACE PM Agent)
**Status**: 📅 Ready for Implementation
