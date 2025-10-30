'use client';

import React, { useState, useEffect } from 'react';
import MonacoEditor from '@/components/features/ide/MonacoEditor';
import EditorToolbar from '@/components/features/ide/EditorToolbar';
import TabBar, { FileTab } from '@/components/features/ide/TabBar';
import FileExplorer from '@/components/features/ide/FileExplorer';
import FileSearch, { GitStatus } from '@/components/features/ide/FileSearch';
import ConnectionStatus from '@/components/features/ide/ConnectionStatus';
import { FileTreeItem } from '@/components/features/ide/FileTreeNode';

/**
 * IDE Page Component
 *
 * Full-featured code editor powered by Monaco Editor (VS Code engine)
 * Supports multi-file tab editing with keyboard shortcuts
 */
export default function IDEPage() {
  // Tab state
  const [tabs, setTabs] = useState<FileTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(true);

  // Editor options state
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light'>(
    'vs-dark'
  );
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState<'on' | 'off' | 'relative'>('on');
  const [fontSize, setFontSize] = useState(14);

  // Sample files for demonstration
  const sampleFiles: Record<string, { content: string; language: string }> = {
    'example.ts': { content: SAMPLE_TYPESCRIPT, language: 'typescript' },
    'example.py': { content: SAMPLE_PYTHON, language: 'python' },
    'example.rs': { content: SAMPLE_RUST, language: 'rust' },
    'example.go': { content: SAMPLE_GO, language: 'go' },
    'README.md': { content: SAMPLE_MARKDOWN, language: 'markdown' },
    'styles.css': { content: SAMPLE_CSS, language: 'css' },
    'config.json': { content: SAMPLE_JSON, language: 'json' },
    'config.yaml': { content: SAMPLE_YAML, language: 'yaml' },
  };

  // Git status state
  const [gitStatus, setGitStatus] = useState<GitStatus>({});

  // File tree structure
  const [fileTree] = useState<FileTreeItem>({
    id: 'root',
    name: 'project',
    type: 'folder',
    path: '/project',
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        path: '/project/src',
        children: [
          {
            id: 'example-ts',
            name: 'example.ts',
            type: 'file',
            path: '/project/src/example.ts',
            extension: 'ts',
          },
          {
            id: 'example-py',
            name: 'example.py',
            type: 'file',
            path: '/project/src/example.py',
            extension: 'py',
          },
          {
            id: 'example-rs',
            name: 'example.rs',
            type: 'file',
            path: '/project/src/example.rs',
            extension: 'rs',
          },
          {
            id: 'example-go',
            name: 'example.go',
            type: 'file',
            path: '/project/src/example.go',
            extension: 'go',
          },
        ],
      },
      {
        id: 'styles',
        name: 'styles',
        type: 'folder',
        path: '/project/styles',
        children: [
          {
            id: 'styles-css',
            name: 'styles.css',
            type: 'file',
            path: '/project/styles/styles.css',
            extension: 'css',
          },
        ],
      },
      {
        id: 'config',
        name: 'config',
        type: 'folder',
        path: '/project/config',
        children: [
          {
            id: 'config-json',
            name: 'config.json',
            type: 'file',
            path: '/project/config/config.json',
            extension: 'json',
          },
          {
            id: 'config-yaml',
            name: 'config.yaml',
            type: 'file',
            path: '/project/config/config.yaml',
            extension: 'yaml',
          },
        ],
      },
      {
        id: 'readme',
        name: 'README.md',
        type: 'file',
        path: '/project/README.md',
        extension: 'md',
      },
    ],
  });

  /**
   * Flatten file tree into a list of all files (for search)
   */
  const flattenFileTree = (tree: FileTreeItem): FileTreeItem[] => {
    const files: FileTreeItem[] = [];

    const traverse = (item: FileTreeItem) => {
      if (item.type === 'file') {
        files.push(item);
      }
      if (item.children) {
        item.children.forEach(traverse);
      }
    };

    traverse(tree);
    return files;
  };

  const allFiles = flattenFileTree(fileTree);

  /**
   * Fetch Git status from API
   */
  const fetchGitStatus = async () => {
    try {
      const response = await fetch('/api/v3/git/status');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.statusMap) {
          setGitStatus(data.data.statusMap);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Git status:', error);
    }
  };

  /**
   * Poll Git status every 10 seconds
   */
  useEffect(() => {
    // Initial fetch
    fetchGitStatus();

    // Poll every 10 seconds
    const interval = setInterval(fetchGitStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize with first file
   */
  useEffect(() => {
    const firstFileName = 'example.ts';
    const firstFile = sampleFiles[firstFileName];
    if (firstFile) {
      const initialTab: FileTab = {
        id: 'tab-0',
        fileName: firstFileName,
        content: firstFile.content,
        language: firstFile.language,
      };
      setTabs([initialTab]);
      setActiveTabId(initialTab.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get active tab
   */
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  /**
   * Handle tab selection
   */
  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
  };

  /**
   * Handle tab close
   */
  const handleTabClose = (tabId: string) => {
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    // Select adjacent tab if closing active tab
    if (tabId === activeTabId && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      const newActiveTab = newTabs[newActiveIndex];
      if (newActiveTab) {
        setActiveTabId(newActiveTab.id);
      }
    }
  };

  /**
   * Open a new file from file tree
   */
  const handleFileTreeClick = (item: FileTreeItem) => {
    if (item.type !== 'file') return;

    // Check if file is already open
    const existingTab = tabs.find((t) => t.fileName === item.name);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // Open new tab
    const file = sampleFiles[item.name];
    if (file) {
      const newTab: FileTab = {
        id: `tab-${Date.now()}`,
        fileName: item.name,
        content: file.content,
        language: file.language,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  /**
   * Open a new file by name (for dropdown)
   */
  const handleOpenFile = (fileName: string) => {
    // Check if file is already open
    const existingTab = tabs.find((t) => t.fileName === fileName);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // Open new tab
    const file = sampleFiles[fileName];
    if (file) {
      const newTab: FileTab = {
        id: `tab-${Date.now()}`,
        fileName,
        content: file.content,
        language: file.language,
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  /**
   * Handle content change
   */
  const handleContentChange = (value: string | undefined) => {
    if (activeTab) {
      const newTabs = tabs.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, content: value || '', isDirty: value !== sampleFiles[tab.fileName]?.content }
          : tab
      );
      setTabs(newTabs);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + W: Close current tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeTabId && tabs.length > 1) {
          handleTabClose(activeTabId);
        }
      }

      // Ctrl/Cmd + Tab: Next tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        if (tabs.length > 0) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          const nextTab = tabs[nextIndex];
          if (nextTab) {
            setActiveTabId(nextTab.id);
          }
        }
      }

      // Ctrl/Cmd + Shift + Tab: Previous tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        if (tabs.length > 0) {
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          const prevTab = tabs[prevIndex];
          if (prevTab) {
            setActiveTabId(prevTab.id);
          }
        }
      }

      // Ctrl/Cmd + 1-8: Switch to tab by number
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTabId(tabs[tabIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, activeTabId]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
          </button>

          <h1 className="text-xl font-bold text-white">MADACE IDE</h1>
          <span className="text-sm text-gray-400">
            Powered by Monaco Editor (VS Code)
          </span>
        </div>

        {/* File selector and connection status */}
        <div className="flex items-center space-x-4">
          {/* Connection status indicator */}
          <ConnectionStatus showUserCount showDetails />

          {/* File selector */}
          <div className="flex items-center space-x-3">
            <label htmlFor="file-select" className="text-gray-400 text-sm">
              Open File:
            </label>
            <select
              id="file-select"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleOpenFile(e.target.value);
                  e.target.value = ''; // Reset selection
                }
              }}
              className="bg-gray-700 text-gray-200 text-sm rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a file...</option>
              {Object.keys(sampleFiles)
                .filter((fileName) => !tabs.find((t) => t.fileName === fileName))
                .map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content area with sidebar and editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r border-gray-700 overflow-y-auto">
            <FileExplorer
              root={fileTree}
              selectedPath={activeTab ? `/project/${activeTab.fileName}` : undefined}
              onFileClick={handleFileTreeClick}
              gitStatus={gitStatus}
            />
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
          />

          {/* Editor toolbar */}
          {activeTab && (
            <EditorToolbar
              theme={theme}
              onThemeChange={setTheme}
              wordWrap={wordWrap}
              onWordWrapToggle={() => setWordWrap(!wordWrap)}
              minimap={minimap}
              onMinimapToggle={() => setMinimap(!minimap)}
              lineNumbers={lineNumbers}
              onLineNumbersChange={setLineNumbers}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              fileName={activeTab.fileName}
              language={activeTab.language}
            />
          )}

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            {activeTab ? (
              <MonacoEditor
                value={activeTab.content}
                language={activeTab.language}
                theme={theme}
                onChange={handleContentChange}
                wordWrap={wordWrap ? 'on' : 'off'}
                minimap={minimap}
                lineNumbers={lineNumbers}
                fontSize={fontSize}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">No files open</p>
                  <p className="text-sm">Select a file from the dropdown above to get started</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab && (
            <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6 text-xs text-gray-400">
              <div>
                Lines: {activeTab.content.split('\n').length} | Characters: {activeTab.content.length}
                {activeTab.isDirty && <span className="ml-2 text-blue-400">• Modified</span>}
              </div>
              <div>
                Language: {activeTab.language.toUpperCase()} | Encoding: UTF-8 | Tab Size: 2
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="h-6 bg-gray-900 border-t border-gray-800 flex items-center justify-center text-xs text-gray-500">
            <span>
              Shortcuts: Ctrl/Cmd+Tab (next tab) | Ctrl/Cmd+Shift+Tab (prev tab) | Ctrl/Cmd+W (close) |
              Ctrl/Cmd+1-8 (tab #)
            </span>
          </div>
        </div>
      </div>

      {/* File Search (Ctrl+P / Cmd+P) */}
      <FileSearch
        files={allFiles}
        gitStatus={gitStatus}
        onFileSelect={handleFileTreeClick}
      />
    </div>
  );
}

// Sample file contents (unchanged from IDE-001)
const SAMPLE_TYPESCRIPT = `/**
 * MADACE Method - TypeScript Example
 * Demonstrates syntax highlighting for TypeScript
 */

interface Agent {
  id: string;
  name: string;
  module: 'MAM' | 'MAB' | 'CIS';
  persona: {
    role: string;
    identity: string;
  };
}

async function createAgent(data: Partial<Agent>): Promise<Agent> {
  const response = await fetch('/api/v3/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(\`Failed to create agent: \${response.statusText}\`);
  }

  return response.json();
}

// Main execution
(async () => {
  const pmAgent = await createAgent({
    name: 'PM',
    module: 'MAM',
    persona: {
      role: 'Product Manager',
      identity: 'Strategic planning expert',
    },
  });

  console.log('Created agent:', pmAgent);
})();
`;

const SAMPLE_PYTHON = `"""
MADACE Method - Python Example
Demonstrates syntax highlighting for Python
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
import asyncio

@dataclass
class Agent:
    """Represents a MADACE agent"""
    id: str
    name: str
    module: str
    persona: Dict[str, str]

class AgentService:
    """Service for managing MADACE agents"""

    def __init__(self, base_url: str):
        self.base_url = base_url

    async def create_agent(self, data: Dict) -> Agent:
        """Create a new agent"""
        # Simulated API call
        return Agent(
            id="agent-123",
            name=data.get("name", "Unknown"),
            module=data.get("module", "MAM"),
            persona=data.get("persona", {})
        )

    async def list_agents(self) -> List[Agent]:
        """List all agents"""
        return []

# Main execution
async def main():
    service = AgentService("http://localhost:3000")

    pm_agent = await service.create_agent({
        "name": "PM",
        "module": "MAM",
        "persona": {
            "role": "Product Manager",
            "identity": "Strategic planning expert"
        }
    })

    print(f"Created agent: {pm_agent.name}")

if __name__ == "__main__":
    asyncio.run(main())
`;

const SAMPLE_RUST = `// MADACE Method - Rust Example
// Demonstrates syntax highlighting for Rust

use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
struct Agent {
    id: String,
    name: String,
    module: String,
    persona: HashMap<String, String>,
}

impl Agent {
    fn new(name: String, module: String) -> Self {
        Agent {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            module,
            persona: HashMap::new(),
        }
    }

    fn add_persona_field(&mut self, key: String, value: String) {
        self.persona.insert(key, value);
    }
}

fn main() {
    let mut pm_agent = Agent::new(
        String::from("PM"),
        String::from("MAM")
    );

    pm_agent.add_persona_field(
        String::from("role"),
        String::from("Product Manager")
    );

    println!("Created agent: {:?}", pm_agent);
}
`;

const SAMPLE_GO = `// MADACE Method - Go Example
// Demonstrates syntax highlighting for Go

package main

import (
\t"encoding/json"
\t"fmt"
\t"log"
)

type Agent struct {
\tID      string            \`json:"id"\`
\tName    string            \`json:"name"\`
\tModule  string            \`json:"module"\`
\tPersona map[string]string \`json:"persona"\`
}

func NewAgent(name, module string) *Agent {
\treturn &Agent{
\t\tID:      generateID(),
\t\tName:    name,
\t\tModule:  module,
\t\tPersona: make(map[string]string),
\t}
}

func (a *Agent) AddPersonaField(key, value string) {
\ta.Persona[key] = value
}

func generateID() string {
\treturn "agent-123" // Simplified
}

func main() {
\tpmAgent := NewAgent("PM", "MAM")
\tpmAgent.AddPersonaField("role", "Product Manager")
\tpmAgent.AddPersonaField("identity", "Strategic planning expert")
\t
\tjsonData, err := json.MarshalIndent(pmAgent, "", "  ")
\tif err != nil {
\t\tlog.Fatal(err)
\t}
\t
\tfmt.Printf("Created agent:\n%s\n", jsonData)
}
`;

const SAMPLE_MARKDOWN = `# MADACE Method - Markdown Example

This file demonstrates syntax highlighting for Markdown.

## Features

- **Bold text** and *italic text*
- [Links](https://github.com)
- \`Inline code\`

### Code Blocks

\`\`\`typescript
const greeting = "Hello, MADACE!";
console.log(greeting);
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

### Blockquotes

> MADACE Method: AI-Driven Agile Collaboration Engine

### Tables

| Feature | Status |
|---------|--------|
| Monaco Editor | ✅ Implemented |
| Syntax Highlighting | ✅ Working |
| Multi-file Tabs | ✅ Complete |
`;

const SAMPLE_CSS = `/* MADACE Method - CSS Example */
/* Demonstrates syntax highlighting for CSS */

:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --background: #1f2937;
  --text-color: #f3f4f6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--background);
  color: var(--text-color);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
`;

const SAMPLE_JSON = `{
  "name": "madace-method",
  "version": "3.0.0-alpha",
  "description": "AI-Driven Agile Collaboration Engine",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "next": "15.5.6",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "@monaco-editor/react": "^4.6.0",
    "@prisma/client": "6.17.1"
  },
  "keywords": [
    "agile",
    "ai",
    "collaboration",
    "madace",
    "project-management"
  ],
  "author": "MADACE Team",
  "license": "MIT"
}
`;

const SAMPLE_YAML = `# MADACE Method - YAML Example
# Demonstrates syntax highlighting for YAML

project:
  name: MADACE Method v3.0
  version: 3.0.0-alpha
  description: AI-Driven Agile Collaboration Engine

modules:
  - name: MAM
    description: MADACE Agile Method
    agents:
      - PM
      - SM
      - DEV

  - name: MAB
    description: MADACE Agent Builder
    agents:
      - Analyst
      - Architect

  - name: CIS
    description: Conversational Interaction System
    agents:
      - NLU
      - DialogManager

database:
  provider: postgresql
  url: \${DATABASE_URL}
  shadow_database_url: \${SHADOW_DATABASE_URL}

llm:
  provider: gemini
  model: gemini-2.0-flash-exp
  temperature: 0.7
  max_tokens: 8000

features:
  ide:
    monaco_editor: true
    multi_file_tabs: true
    file_explorer: true
    integrated_terminal: true
  collaboration:
    websocket: true
    real_time_sync: true
    shared_cursors: true
`;
