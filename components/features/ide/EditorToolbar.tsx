'use client';

import React from 'react';

export interface EditorToolbarProps {
  /** Current theme */
  theme: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
  /** Theme change callback */
  onThemeChange: (theme: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light') => void;
  /** Word wrap enabled */
  wordWrap: boolean;
  /** Word wrap toggle callback */
  onWordWrapToggle: () => void;
  /** Minimap enabled */
  minimap: boolean;
  /** Minimap toggle callback */
  onMinimapToggle: () => void;
  /** Line numbers mode */
  lineNumbers: 'on' | 'off' | 'relative';
  /** Line numbers change callback */
  onLineNumbersChange: (mode: 'on' | 'off' | 'relative') => void;
  /** Font size */
  fontSize: number;
  /** Font size change callback */
  onFontSizeChange: (size: number) => void;
  /** Current file name (optional) */
  fileName?: string;
  /** Current language (optional) */
  language?: string;
}

/**
 * Editor Toolbar Component
 *
 * Provides controls for editor theme, word wrap, minimap, and other options
 */
export default function EditorToolbar({
  theme,
  onThemeChange,
  wordWrap,
  onWordWrapToggle,
  minimap,
  onMinimapToggle,
  lineNumbers,
  onLineNumbersChange,
  fontSize,
  onFontSizeChange,
  fileName,
  language,
}: EditorToolbarProps) {
  const themes = [
    { value: 'vs-dark' as const, label: 'Dark' },
    { value: 'vs-light' as const, label: 'Light' },
    { value: 'hc-black' as const, label: 'High Contrast Dark' },
    { value: 'hc-light' as const, label: 'High Contrast Light' },
  ];

  const lineNumberModes = [
    { value: 'on' as const, label: 'On' },
    { value: 'off' as const, label: 'Off' },
    { value: 'relative' as const, label: 'Relative' },
  ];

  const fontSizes = [10, 12, 14, 16, 18, 20, 22, 24];

  return (
    <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 text-sm">
      {/* Left: File info */}
      <div className="flex items-center space-x-4 text-gray-300">
        {fileName && (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{fileName}</span>
            {language && (
              <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
                {language}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Editor options */}
      <div className="flex items-center space-x-4">
        {/* Theme selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="theme-select" className="text-gray-400 text-xs">
            Theme:
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) =>
              onThemeChange(
                e.target.value as 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light'
              )
            }
            className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {themes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font size selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="font-size-select" className="text-gray-400 text-xs">
            Font:
          </label>
          <select
            id="font-size-select"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}px
              </option>
            ))}
          </select>
        </div>

        {/* Line numbers toggle */}
        <div className="flex items-center space-x-2">
          <label htmlFor="line-numbers-select" className="text-gray-400 text-xs">
            Lines:
          </label>
          <select
            id="line-numbers-select"
            value={lineNumbers}
            onChange={(e) =>
              onLineNumbersChange(e.target.value as 'on' | 'off' | 'relative')
            }
            className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {lineNumberModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {/* Word wrap toggle */}
        <button
          onClick={onWordWrapToggle}
          className={`px-3 py-1 rounded text-xs border transition-colors ${
            wordWrap
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}
          title="Toggle word wrap"
        >
          Wrap
        </button>

        {/* Minimap toggle */}
        <button
          onClick={onMinimapToggle}
          className={`px-3 py-1 rounded text-xs border transition-colors ${
            minimap
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}
          title="Toggle minimap"
        >
          Minimap
        </button>
      </div>
    </div>
  );
}
