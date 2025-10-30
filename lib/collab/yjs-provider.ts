/**
 * Yjs Provider for Real-time Collaboration
 *
 * Integrates Yjs CRDT (Conflict-free Replicated Data Type) with Monaco Editor
 * for real-time collaborative editing. Uses WebSocket provider for synchronization.
 */

'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { editor as MonacoEditor } from 'monaco-editor';

/**
 * Yjs document and provider for a file
 */
export interface YjsDocument {
  doc: Y.Doc;
  provider: WebsocketProvider;
  text: Y.Text;
  isConnected: boolean;
}

/**
 * Provider status
 */
export enum ProviderStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  SYNCING = 'syncing',
  SYNCED = 'synced',
}

/**
 * Yjs Provider Manager
 *
 * Manages Yjs documents and WebSocket providers for collaborative editing.
 */
export class YjsProviderManager {
  private documents: Map<string, YjsDocument> = new Map();
  private serverUrl: string;

  constructor(serverUrl?: string) {
    // Default to current origin WebSocket endpoint
    this.serverUrl = serverUrl || this.getDefaultServerUrl();
  }

  /**
   * Get default WebSocket server URL
   */
  private getDefaultServerUrl(): string {
    if (typeof window === 'undefined') {
      return 'ws://localhost:3000';
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }

  /**
   * Create or get Yjs document for a file
   *
   * @param roomId - Room ID (typically project ID)
   * @param filePath - File path within the project
   * @returns Yjs document and provider
   */
  getOrCreateDocument(roomId: string, filePath: string): YjsDocument {
    const docId = `${roomId}:${filePath}`;

    // Return existing document if already created
    if (this.documents.has(docId)) {
      return this.documents.get(docId)!;
    }

    // Create new Yjs document
    const doc = new Y.Doc();

    // Create WebSocket provider for this document
    const provider = new WebsocketProvider(this.serverUrl, docId, doc, {
      connect: true,
      params: {
        roomId,
        filePath,
      },
    });

    // Get shared text type for Monaco Editor binding
    const text = doc.getText('monaco');

    // Track connection status
    let isConnected = false;

    provider.on('status', (event: { status: string }) => {
      isConnected = event.status === 'connected';
      console.log(`[YjsProvider] ${docId} status:`, event.status);
    });

    provider.on('sync', (isSynced: boolean) => {
      console.log(`[YjsProvider] ${docId} synced:`, isSynced);
    });

    const yjsDoc: YjsDocument = {
      doc,
      provider,
      text,
      isConnected,
    };

    this.documents.set(docId, yjsDoc);

    console.log(`[YjsProvider] Created document: ${docId}`);

    return yjsDoc;
  }

  /**
   * Get existing document
   *
   * @param roomId - Room ID
   * @param filePath - File path
   * @returns Yjs document or undefined
   */
  getDocument(roomId: string, filePath: string): YjsDocument | undefined {
    const docId = `${roomId}:${filePath}`;
    return this.documents.get(docId);
  }

  /**
   * Destroy document and disconnect provider
   *
   * @param roomId - Room ID
   * @param filePath - File path
   */
  destroyDocument(roomId: string, filePath: string): void {
    const docId = `${roomId}:${filePath}`;
    const yjsDoc = this.documents.get(docId);

    if (!yjsDoc) {
      return;
    }

    // Disconnect and destroy provider
    yjsDoc.provider.disconnect();
    yjsDoc.provider.destroy();

    // Destroy Yjs document
    yjsDoc.doc.destroy();

    this.documents.delete(docId);

    console.log(`[YjsProvider] Destroyed document: ${docId}`);
  }

  /**
   * Destroy all documents
   */
  destroyAll(): void {
    this.documents.forEach((yjsDoc) => {
      yjsDoc.provider.disconnect();
      yjsDoc.provider.destroy();
      yjsDoc.doc.destroy();
    });

    this.documents.clear();

    console.log('[YjsProvider] Destroyed all documents');
  }

  /**
   * Get all active documents
   */
  getActiveDocuments(): string[] {
    return Array.from(this.documents.keys());
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    return this.documents.size;
  }
}

/**
 * Monaco Editor binding for Yjs
 *
 * Synchronizes Monaco Editor content with Yjs shared text.
 */
export class MonacoYjsBinding {
  private editor: MonacoEditor.IStandaloneCodeEditor;
  private yText: Y.Text;
  private isLocalChange = false;
  private monacoDisposable: { dispose: () => void } | null = null;
  private yjsObserver: ((event: Y.YTextEvent) => void) | null = null;

  constructor(editor: MonacoEditor.IStandaloneCodeEditor, yText: Y.Text) {
    this.editor = editor;
    this.yText = yText;

    this.setupBinding();
  }

  /**
   * Set up bidirectional binding between Monaco and Yjs
   */
  private setupBinding(): void {
    // Get current Yjs text content
    const currentYjsContent = this.yText.toString();

    // Initialize Monaco editor with Yjs content if not empty
    if (currentYjsContent && this.editor.getValue() !== currentYjsContent) {
      this.isLocalChange = true;
      this.editor.setValue(currentYjsContent);
      this.isLocalChange = false;
    }

    // Listen to Monaco editor changes and update Yjs
    this.monacoDisposable = this.editor.onDidChangeModelContent((event) => {
      if (this.isLocalChange) {
        return; // Skip updates caused by remote changes
      }

      // Apply changes to Yjs document
      this.yText.doc?.transact(() => {
        event.changes.forEach((change) => {
          const offset = change.rangeOffset;
          const length = change.rangeLength;
          const text = change.text;

          // Delete old text
          if (length > 0) {
            this.yText.delete(offset, length);
          }

          // Insert new text
          if (text) {
            this.yText.insert(offset, text);
          }
        });
      });
    });

    // Listen to Yjs changes and update Monaco editor
    this.yjsObserver = (event: Y.YTextEvent) => {
      if (event.transaction.local) {
        return; // Skip local changes (already applied to Monaco)
      }

      this.isLocalChange = true;

      // Apply Yjs changes to Monaco editor
      const model = this.editor.getModel();
      if (model) {
        let offset = 0;

        event.delta.forEach((op) => {
          if (op.retain) {
            offset += op.retain;
          } else if (op.insert) {
            const insertText = Array.isArray(op.insert) ? op.insert.join('') : String(op.insert);

            const position = model.getPositionAt(offset);
            const range = {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            };

            model.pushEditOperations([], [{ range, text: insertText }], () => null);

            offset += insertText.length;
          } else if (op.delete) {
            const deleteLength = op.delete;
            const startPosition = model.getPositionAt(offset);
            const endPosition = model.getPositionAt(offset + deleteLength);

            const range = {
              startLineNumber: startPosition.lineNumber,
              startColumn: startPosition.column,
              endLineNumber: endPosition.lineNumber,
              endColumn: endPosition.column,
            };

            model.pushEditOperations([], [{ range, text: '' }], () => null);
          }
        });
      }

      this.isLocalChange = false;
    };

    this.yText.observe(this.yjsObserver);

    console.log('[MonacoYjsBinding] Binding established');
  }

  /**
   * Destroy binding and clean up listeners
   */
  destroy(): void {
    if (this.monacoDisposable) {
      this.monacoDisposable.dispose();
      this.monacoDisposable = null;
    }

    if (this.yjsObserver) {
      this.yText.unobserve(this.yjsObserver);
      this.yjsObserver = null;
    }

    console.log('[MonacoYjsBinding] Binding destroyed');
  }
}

// Singleton instance
let providerInstance: YjsProviderManager | null = null;

/**
 * Get Yjs provider manager singleton
 */
export function getYjsProviderManager(serverUrl?: string): YjsProviderManager {
  if (!providerInstance) {
    providerInstance = new YjsProviderManager(serverUrl);
  }
  return providerInstance;
}
