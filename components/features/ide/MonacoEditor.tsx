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

    // Configure TypeScript/JavaScript language services
    if (language === 'typescript' || language === 'javascript') {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        strict: false, // Less strict for better IntelliSense suggestions
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        resolveJsonModule: true,
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [
          1108, // Ignore "return not in function" for top-level await
          2304, // Ignore "Cannot find name" for common globals
        ],
      });

      // Enable suggestions from lib definitions
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

      // Add common type definitions for better IntelliSense
      const reactTypes = `
        declare module 'react' {
          export function useState<T>(initialValue: T): [T, (value: T) => void];
          export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
          export function useRef<T>(initialValue: T): { current: T };
          export function useCallback<T extends Function>(callback: T, deps: any[]): T;
          export function useMemo<T>(factory: () => T, deps: any[]): T;
          export const FC: any;
          export const Component: any;
        }
      `;

      const nextTypes = `
        declare module 'next' {
          export const useRouter: () => any;
          export const Link: any;
          export const Image: any;
        }
        declare module 'next/router' {
          export const useRouter: () => any;
        }
      `;

      // Add type definitions to Monaco's extra libs
      monaco.languages.typescript.typescriptDefaults.addExtraLib(reactTypes, 'file:///node_modules/@types/react/index.d.ts');
      monaco.languages.typescript.typescriptDefaults.addExtraLib(nextTypes, 'file:///node_modules/@types/next/index.d.ts');
    }

    // Configure editor with comprehensive IntelliSense
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
      // IntelliSense suggestions
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showModules: true,
        showProperties: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showInterfaces: true,
        showTypeParameters: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true,
        showStructs: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        insertMode: 'replace', // Replace existing text when accepting suggestion
        filterGraceful: true, // Allow fuzzy matching
        snippetsPreventQuickSuggestions: false,
        localityBonus: true, // Prioritize nearby suggestions
        shareSuggestSelections: true,
        showMethods: true,
      },
      // Quick suggestions (auto-trigger)
      quickSuggestions: {
        other: true, // Trigger in code
        comments: false, // Don't trigger in comments
        strings: false, // Don't trigger in strings
      },
      quickSuggestionsDelay: 100, // Delay before showing suggestions (ms)
      // Parameter hints
      parameterHints: {
        enabled: true,
        cycle: true, // Cycle through parameter hints
      },
      // Hover information
      hover: {
        enabled: true,
        delay: 300, // Delay before showing hover (ms)
        sticky: true, // Hover stays visible when moving mouse
      },
      // Code lens (show references, implementations)
      codeLens: true,
      // Format on type (auto-format as you type)
      formatOnType: true,
      formatOnPaste: true,
      // Auto-closing brackets, quotes
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'languageDefined',
      // Accept suggestion on commit characters
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      // Tab completion
      tabCompletion: 'on',
      // Word-based suggestions
      wordBasedSuggestions: 'matchingDocuments',
      // Semantic tokens
      'semanticHighlighting.enabled': true,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save command (will be handled by parent component)
      // Future: dispatch save event to parent
    });

    // Add find/replace shortcuts (already built-in to Monaco)
    // Ctrl+F / Cmd+F - Find
    // Ctrl+H / Cmd+H - Replace
    // Ctrl+Space - Trigger suggestions manually
    // Ctrl+Shift+Space - Trigger parameter hints
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
