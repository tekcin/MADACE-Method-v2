'use client';

import React, { useState } from 'react';

export interface FileTreeItem {
  /** Unique identifier */
  id: string;
  /** File or folder name */
  name: string;
  /** Type */
  type: 'file' | 'folder';
  /** Full path */
  path: string;
  /** Children (for folders) */
  children?: FileTreeItem[];
  /** File extension (for files) */
  extension?: string;
}

export interface GitStatus {
  [filePath: string]: 'M' | 'A' | 'D' | 'U' | '??' | 'MM' | 'AM';
}

export interface FileTreeNodeProps {
  /** Tree item */
  item: FileTreeItem;
  /** Nesting level for indentation */
  level?: number;
  /** Callback when file is clicked */
  onFileClick?: (item: FileTreeItem) => void;
  /** Callback when item is right-clicked */
  onContextMenu?: (item: FileTreeItem, event: React.MouseEvent) => void;
  /** Currently selected file path */
  selectedPath?: string;
  /** Git status for files */
  gitStatus?: GitStatus;
}

/**
 * FileTreeNode Component
 *
 * Recursive component for displaying files and folders in a tree structure
 */
export default function FileTreeNode({
  item,
  level = 0,
  onFileClick,
  onContextMenu,
  selectedPath,
  gitStatus = {},
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Root folders expanded by default
  const isFolder = item.type === 'folder';
  const isSelected = item.path === selectedPath;

  /**
   * Get Git status badge
   */
  const getGitStatusBadge = () => {
    const status = gitStatus[item.path];
    if (!status || isFolder) return null;

    const badges = {
      M: { label: 'M', color: 'bg-yellow-600 text-yellow-100', title: 'Modified' },
      MM: {
        label: 'M',
        color: 'bg-yellow-600 text-yellow-100',
        title: 'Modified (staged and unstaged)',
      },
      A: { label: 'A', color: 'bg-green-600 text-green-100', title: 'Added (staged)' },
      AM: { label: 'A', color: 'bg-green-600 text-green-100', title: 'Added and modified' },
      D: { label: 'D', color: 'bg-red-600 text-red-100', title: 'Deleted' },
      U: { label: 'U', color: 'bg-green-500 text-green-100', title: 'Untracked' },
      '??': { label: 'U', color: 'bg-green-500 text-green-100', title: 'Untracked' },
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span
        className={`rounded px-1 py-0.5 text-xs font-bold ${badge.color} ml-2`}
        title={badge.title}
      >
        {badge.label}
      </span>
    );
  };

  /**
   * Get icon for file/folder
   */
  const getIcon = () => {
    if (isFolder) {
      return isExpanded ? (
        // Folder open icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4 text-yellow-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
          />
        </svg>
      ) : (
        // Folder closed icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4 text-yellow-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          />
        </svg>
      );
    }

    // File icon with color based on extension
    const extension = item.extension?.toLowerCase() || '';
    let color = 'text-gray-400';

    if (['ts', 'tsx'].includes(extension)) color = 'text-blue-400';
    else if (['js', 'jsx'].includes(extension)) color = 'text-yellow-400';
    else if (extension === 'json') color = 'text-yellow-500';
    else if (['py'].includes(extension)) color = 'text-green-400';
    else if (['rs'].includes(extension)) color = 'text-orange-400';
    else if (['go'].includes(extension)) color = 'text-cyan-400';
    else if (['html'].includes(extension)) color = 'text-orange-500';
    else if (['css', 'scss'].includes(extension)) color = 'text-blue-500';
    else if (['md', 'mdx'].includes(extension)) color = 'text-gray-300';

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`h-4 w-4 ${color}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    );
  };

  /**
   * Handle item click
   */
  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else if (onFileClick) {
      onFileClick(item);
    }
  };

  /**
   * Handle right-click
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onContextMenu) {
      onContextMenu(item, e);
    }
  };

  return (
    <div>
      {/* Current item */}
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ paddingLeft: `${level * 16}px` }}
        className={`flex cursor-pointer items-center gap-1.5 px-2 py-1 text-sm transition-colors hover:bg-gray-700 ${isSelected ? 'bg-opacity-30 bg-blue-900 text-white' : 'text-gray-300'} `}
      >
        {/* Expand/collapse arrow for folders */}
        {isFolder && (
          <div className="flex w-4 items-center justify-center">
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        )}
        {!isFolder && <div className="w-4" />}

        {/* Icon */}
        {getIcon()}

        {/* Name */}
        <span className="flex-1 truncate">{item.name}</span>

        {/* Git status badge */}
        {getGitStatusBadge()}
      </div>

      {/* Children (for expanded folders) */}
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
              onContextMenu={onContextMenu}
              selectedPath={selectedPath}
              gitStatus={gitStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
