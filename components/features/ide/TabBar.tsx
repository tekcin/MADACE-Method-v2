'use client';

import React from 'react';
import Tab from './Tab';

export interface FileTab {
  /** Unique identifier for the tab */
  id: string;
  /** File name */
  fileName: string;
  /** File content */
  content: string;
  /** Programming language */
  language: string;
  /** Whether file has unsaved changes */
  isDirty?: boolean;
}

export interface TabBarProps {
  /** Array of open tabs */
  tabs: FileTab[];
  /** ID of the currently active tab */
  activeTabId: string;
  /** Callback when a tab is selected */
  onTabSelect: (id: string) => void;
  /** Callback when a tab is closed */
  onTabClose: (id: string) => void;
  /** Callback when "New File" button is clicked */
  onNewFile?: () => void;
}

/**
 * TabBar Component
 *
 * Displays all open file tabs with scroll support
 * Allows switching between files and closing tabs
 */
export default function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewFile,
}: TabBarProps) {
  return (
    <div className="flex items-center bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {/* Tab list */}
      <div className="flex flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            fileName={tab.fileName}
            language={tab.language}
            isActive={tab.id === activeTabId}
            isDirty={tab.isDirty}
            onClick={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
      </div>

      {/* New file button */}
      {onNewFile && (
        <button
          onClick={onNewFile}
          className="flex items-center justify-center w-10 h-10 bg-gray-800 border-l border-gray-700 hover:bg-gray-700 transition-colors flex-shrink-0"
          title="New file (Ctrl+N)"
          aria-label="New file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
