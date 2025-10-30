'use client';

import React from 'react';

export interface TabProps {
  /** File name to display */
  fileName: string;
  /** Whether this tab is active */
  isActive: boolean;
  /** Whether the file has unsaved changes */
  isDirty?: boolean;
  /** Callback when tab is clicked */
  onClick: () => void;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Programming language for icon/color */
  language?: string;
}

/**
 * Tab Component
 *
 * Individual tab for a file in the IDE
 * Shows file name, dirty indicator, and close button
 */
export default function Tab({
  fileName,
  isActive,
  isDirty = false,
  onClick,
  onClose,
  language,
}: TabProps) {
  /**
   * Get icon/color for language
   */
  const getLanguageColor = (lang?: string): string => {
    const colors: Record<string, string> = {
      typescript: 'text-blue-400',
      javascript: 'text-yellow-400',
      python: 'text-green-400',
      rust: 'text-orange-400',
      go: 'text-cyan-400',
      java: 'text-red-400',
      cpp: 'text-purple-400',
      csharp: 'text-purple-400',
      html: 'text-orange-500',
      css: 'text-blue-500',
      json: 'text-yellow-500',
      yaml: 'text-pink-400',
      markdown: 'text-gray-400',
      sql: 'text-cyan-500',
      shell: 'text-green-500',
    };
    return colors[lang || ''] || 'text-gray-400';
  };

  /**
   * Handle close button click
   */
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tab from activating
    onClose();
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 px-4 py-2 cursor-pointer
        border-r border-gray-700 transition-colors min-w-[120px] max-w-[200px]
        ${
          isActive
            ? 'bg-gray-900 text-white border-b-2 border-blue-500'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200'
        }
      `}
    >
      {/* File name with language color */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className={`text-xs ${getLanguageColor(language)}`}>●</span>
        <span className="text-sm truncate">{fileName}</span>
        {isDirty && <span className="text-xs text-blue-400">•</span>}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className={`
          flex items-center justify-center w-5 h-5 rounded
          transition-colors hover:bg-gray-700
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
        title="Close file"
        aria-label={`Close ${fileName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
