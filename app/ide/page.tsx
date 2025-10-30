'use client';

import React, { useState } from 'react';
import MonacoEditor from '@/components/features/ide/MonacoEditor';
import EditorToolbar from '@/components/features/ide/EditorToolbar';

/**
 * IDE Page Component
 *
 * Full-featured code editor powered by Monaco Editor (VS Code engine)
 * Supports 20+ programming languages with syntax highlighting
 */
export default function IDEPage() {
  // Editor state
  const [content, setContent] = useState(SAMPLE_TYPESCRIPT);
  const [language, setLanguage] = useState<string>('typescript');
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light'>(
    'vs-dark'
  );
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState<'on' | 'off' | 'relative'>('on');
  const [fontSize, setFontSize] = useState(14);
  const [fileName, setFileName] = useState('example.ts');
  const [isLoading, setIsLoading] = useState(false);

  // Sample files for demonstration
  const sampleFiles: Record<string, { content: string; language: string }> = {
    'example.ts': {
      content: SAMPLE_TYPESCRIPT,
      language: 'typescript',
    },
    'example.py': {
      content: SAMPLE_PYTHON,
      language: 'python',
    },
    'example.rs': {
      content: SAMPLE_RUST,
      language: 'rust',
    },
    'example.go': {
      content: SAMPLE_GO,
      language: 'go',
    },
    'README.md': {
      content: SAMPLE_MARKDOWN,
      language: 'markdown',
    },
    'styles.css': {
      content: SAMPLE_CSS,
      language: 'css',
    },
    'config.json': {
      content: SAMPLE_JSON,
      language: 'json',
    },
    'config.yaml': {
      content: SAMPLE_YAML,
      language: 'yaml',
    },
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (newFileName: string) => {
    const file = sampleFiles[newFileName];
    if (file) {
      setIsLoading(true);
      setFileName(newFileName);
      setLanguage(file.language);
      setContent(file.content);
      // Simulate file loading delay
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  /**
   * Handle content change
   */
  const handleContentChange = (value: string | undefined) => {
    setContent(value || '');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">MADACE IDE</h1>
          <span className="text-sm text-gray-400">
            Powered by Monaco Editor (VS Code)
          </span>
        </div>

        {/* File selector */}
        <div className="flex items-center space-x-3">
          <label htmlFor="file-select" className="text-gray-400 text-sm">
            Open File:
          </label>
          <select
            id="file-select"
            value={fileName}
            onChange={(e) => handleFileChange(e.target.value)}
            className="bg-gray-700 text-gray-200 text-sm rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(sampleFiles).map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor toolbar */}
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
        fileName={fileName}
        language={language}
      />

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          value={content}
          language={language}
          theme={theme}
          onChange={handleContentChange}
          wordWrap={wordWrap ? 'on' : 'off'}
          minimap={minimap}
          lineNumbers={lineNumbers}
          fontSize={fontSize}
          loading={isLoading}
        />
      </div>

      {/* Footer */}
      <div className="h-8 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-6 text-xs text-gray-400">
        <div>
          Lines: {content.split('\n').length} | Characters: {content.length}
        </div>
        <div>
          Language: {language.toUpperCase()} | Encoding: UTF-8 | Tab Size: 2
        </div>
      </div>
    </div>
  );
}

// Sample file contents
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
| File Loading | 🚧 In Progress |
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
    file_explorer: true
    integrated_terminal: true
  collaboration:
    websocket: true
    real_time_sync: true
    shared_cursors: true
`;
