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
    <div className="flex items-center overflow-x-auto border-b border-gray-700 bg-gray-800">
      {/* Tab list */}
      <div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 flex flex-1 overflow-x-auto">
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
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-l border-gray-700 bg-gray-800 transition-colors hover:bg-gray-700"
          title="New file (Ctrl+N)"
          aria-label="New file"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 text-gray-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
    </div>
  );
}
