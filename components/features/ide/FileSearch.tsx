'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Fuse from 'fuse.js';
import SearchResults from './SearchResults';
import { FileTreeItem } from './FileTreeNode';

export interface GitStatus {
  [filePath: string]: 'M' | 'A' | 'D' | 'U' | '??'; // Modified, Added, Deleted, Untracked
}

export interface FileSearchProps {
  /** All files in the project (flat list) */
  files: FileTreeItem[];
  /** Git status for files */
  gitStatus?: GitStatus;
  /** Callback when file is selected */
  onFileSelect: (file: FileTreeItem) => void;
  /** Callback when search is closed */
  onClose?: () => void;
  /** Is search open? */
  isOpen?: boolean;
}

/**
 * FileSearch Component
 *
 * Quick file search with Ctrl+P/Cmd+P keyboard shortcut
 * Fuzzy matching powered by Fuse.js
 */
export default function FileSearch({
  files,
  gitStatus = {},
  onFileSelect,
  onClose,
  isOpen: controlledIsOpen,
}: FileSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileTreeItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Support both controlled and uncontrolled mode
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen =
    controlledIsOpen !== undefined
      ? (value: boolean) => {
          if (!value && onClose) onClose();
        }
      : setInternalIsOpen;

  // Fuzzy search with Fuse.js
  const fuse = useRef(
    new Fuse<FileTreeItem>([], {
      keys: ['name', 'path'],
      threshold: 0.4, // 40% similarity required
      ignoreLocation: true, // Match anywhere in string
      includeScore: true,
    })
  );

  // Update Fuse index when files change
  useEffect(() => {
    const filesList = files.filter((f) => f.type === 'file');
    fuse.current.setCollection(filesList);
  }, [files]);

  // Keyboard shortcut: Ctrl+P / Cmd+P to open
  useHotkeys(
    'ctrl+p, meta+p',
    (e) => {
      e.preventDefault();
      setIsOpen(true);
      setQuery('');
      setSelectedIndex(0);
    },
    { enableOnFormTags: false }
  );

  // Keyboard shortcut: ESC to close
  useHotkeys(
    'esc',
    () => {
      if (isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    },
    { enableOnFormTags: true, enabled: isOpen }
  );

  // Keyboard shortcut: Arrow Up
  useHotkeys(
    'up',
    (e) => {
      if (isOpen && results.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      }
    },
    { enableOnFormTags: true, enabled: isOpen }
  );

  // Keyboard shortcut: Arrow Down
  useHotkeys(
    'down',
    (e) => {
      if (isOpen && results.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      }
    },
    { enableOnFormTags: true, enabled: isOpen }
  );

  // Keyboard shortcut: Enter to select
  useHotkeys(
    'enter',
    () => {
      if (isOpen && results.length > 0 && results[selectedIndex]) {
        handleSelectFile(results[selectedIndex]);
      }
    },
    { enableOnFormTags: true, enabled: isOpen }
  );

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search files when query changes
  useEffect(() => {
    if (query.trim()) {
      const searchResults = fuse.current.search(query);
      setResults(searchResults.map((r) => r.item).slice(0, 20)); // Limit to 20 results
      setSelectedIndex(0); // Reset selection
    } else {
      setResults(files.filter((f) => f.type === 'file').slice(0, 20)); // Show recent files
    }
  }, [query, files]);

  /**
   * Handle file selection
   */
  const handleSelectFile = (file: FileTreeItem) => {
    onFileSelect(file);
    setIsOpen(false);
    setQuery('');
  };

  /**
   * Handle click outside to close
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-start justify-center bg-black pt-20"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-2xl">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-700 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-3 h-5 w-5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files... (fuzzy matching enabled)"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
          />
          <div className="ml-3 flex items-center gap-2 text-xs text-gray-500">
            <kbd className="rounded bg-gray-700 px-2 py-1 text-gray-300">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="rounded bg-gray-700 px-2 py-1 text-gray-300">↵</kbd>
            <span>Select</span>
            <kbd className="rounded bg-gray-700 px-2 py-1 text-gray-300">ESC</kbd>
            <span>Close</span>
          </div>
        </div>

        {/* Search results */}
        <SearchResults
          results={results}
          selectedIndex={selectedIndex}
          onSelect={handleSelectFile}
          gitStatus={gitStatus}
        />
      </div>
    </div>
  );
}
