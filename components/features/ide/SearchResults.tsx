'use client';

import React, { useEffect, useRef } from 'react';
import { FileTreeItem } from './FileTreeNode';
import { GitStatus } from './FileSearch';

export interface SearchResultsProps {
  /** Search results */
  results: FileTreeItem[];
  /** Currently selected index */
  selectedIndex: number;
  /** Callback when result is clicked */
  onSelect: (file: FileTreeItem) => void;
  /** Git status for files */
  gitStatus?: GitStatus;
}

/**
 * SearchResults Component
 *
 * Displays search results in a scrollable list with keyboard navigation
 */
export default function SearchResults({
  results,
  selectedIndex,
  onSelect,
  gitStatus = {},
}: SearchResultsProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  /**
   * Get file icon color based on extension
   */
  const getFileIconColor = (extension?: string): string => {
    const ext = extension?.toLowerCase() || '';

    if (['ts', 'tsx'].includes(ext)) return 'text-blue-400';
    if (['js', 'jsx'].includes(ext)) return 'text-yellow-400';
    if (ext === 'json') return 'text-yellow-500';
    if (['py'].includes(ext)) return 'text-green-400';
    if (['rs'].includes(ext)) return 'text-orange-400';
    if (['go'].includes(ext)) return 'text-cyan-400';
    if (['html'].includes(ext)) return 'text-orange-500';
    if (['css', 'scss'].includes(ext)) return 'text-blue-500';
    if (['md', 'mdx'].includes(ext)) return 'text-gray-300';

    return 'text-gray-400';
  };

  /**
   * Get Git status badge
   */
  const getGitStatusBadge = (filePath: string) => {
    const status = gitStatus[filePath];
    if (!status) return null;

    const badges = {
      M: { label: 'M', color: 'bg-yellow-600 text-yellow-100' }, // Modified
      A: { label: 'A', color: 'bg-green-600 text-green-100' }, // Added/Staged
      D: { label: 'D', color: 'bg-red-600 text-red-100' }, // Deleted
      U: { label: 'U', color: 'bg-green-500 text-green-100' }, // Untracked
      '??': { label: 'U', color: 'bg-green-500 text-green-100' }, // Untracked (git status format)
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span
        className={`text-xs font-bold px-1.5 py-0.5 rounded ${badge.color}`}
        title={`Git status: ${status}`}
      >
        {badge.label}
      </span>
    );
  };

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 mb-3 text-gray-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <p className="text-sm">No files found</p>
        <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {results.map((file, index) => (
        <div
          key={file.id}
          ref={index === selectedIndex ? selectedRef : null}
          onClick={() => onSelect(file)}
          className={`
            flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
            ${
              index === selectedIndex
                ? 'bg-blue-900 bg-opacity-40 border-l-2 border-blue-500'
                : 'hover:bg-gray-700'
            }
          `}
        >
          {/* File icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 flex-shrink-0 ${getFileIconColor(file.extension)}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">{file.name}</div>
            <div className="text-xs text-gray-400 truncate">{file.path}</div>
          </div>

          {/* Git status badge */}
          {getGitStatusBadge(file.path)}

          {/* Selection indicator */}
          {index === selectedIndex && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-blue-400 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
