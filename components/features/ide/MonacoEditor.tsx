'use client';

import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

export interface MonacoEditorProps {
  /** File content to display */
  value?: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Editor theme (vs-dark, vs-light, hc-black, hc-light) */
  theme?: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
  /** Callback when content changes */
  onChange?: (value: string | undefined) => void;
  /** Read-only mode */
  readOnly?: boolean;
  /** Show line numbers */
  lineNumbers?: 'on' | 'off' | 'relative';
  /** Enable minimap */
  minimap?: boolean;
  /** Word wrap */
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  /** Font size */
  fontSize?: number;
  /** Tab size */
  tabSize?: number;
  /** Editor height */
  height?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * Monaco Editor Component
 *
 * Wraps @monaco-editor/react with VS Code editor functionality
 * Supports 20+ programming languages with syntax highlighting
 */
export default function MonacoEditor({
  value = '',
  language = 'typescript',
  theme = 'vs-dark',
  onChange,
  readOnly = false,
  lineNumbers = 'on',
  minimap = true,
  wordWrap = 'off',
  fontSize = 14,
  tabSize = 2,
  height = '100%',
  loading = false,
}: MonacoEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  /**
   * Handle editor mount
   */
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure editor
    editor.updateOptions({
      readOnly,
      lineNumbers,
      minimap: { enabled: minimap },
      wordWrap,
      fontSize,
      tabSize,
      automaticLayout: true, // Responsive to container resize
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save command (will be handled by parent component)
      // Future: dispatch save event to parent
    });

    // Add find/replace shortcuts (already built-in to Monaco)
    // Ctrl+F / Cmd+F - Find
    // Ctrl+H / Cmd+H - Replace
  };

  /**
   * Handle content change
   */
  const handleEditorChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Loading indicator */}
      {loading && !isEditorReady && (
        <div className="flex items-center justify-center h-full bg-gray-900">
          <div className="text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading editor...
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <Editor
        height={height}
        language={language}
        value={value}
        theme={theme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-gray-400 text-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Initializing Monaco Editor...
            </div>
          </div>
        }
        options={{
          readOnly,
          lineNumbers,
          minimap: { enabled: minimap },
          wordWrap,
          fontSize,
          tabSize,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}

/**
 * Supported languages:
 * - TypeScript (.ts, .tsx)
 * - JavaScript (.js, .jsx)
 * - Python (.py)
 * - Rust (.rs)
 * - Go (.go)
 * - Java (.java)
 * - C++ (.cpp, .h)
 * - C# (.cs)
 * - HTML (.html)
 * - CSS (.css)
 * - JSON (.json)
 * - YAML (.yaml, .yml)
 * - Markdown (.md)
 * - SQL (.sql)
 * - Shell (.sh, .bash)
 * - Dockerfile
 * - And 20+ more languages supported by Monaco
 */
