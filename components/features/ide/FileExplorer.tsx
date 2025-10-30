'use client';

import React, { useState } from 'react';
import FileTreeNode, { FileTreeItem } from './FileTreeNode';

export interface FileExplorerProps {
  /** Root folder */
  root: FileTreeItem;
  /** Currently selected file path */
  selectedPath?: string;
  /** Callback when file is clicked */
  onFileClick?: (item: FileTreeItem) => void;
  /** Callback when file tree changes */
  onChange?: (root: FileTreeItem) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item: FileTreeItem | null;
}

/**
 * FileExplorer Component
 *
 * File tree explorer with CRUD operations (create, rename, delete)
 */
export default function FileExplorer({
  root,
  selectedPath,
  onFileClick,
  onChange,
}: FileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileTreeItem>(root);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);

  /**
   * Find item by path in tree
   */
  const findItemByPath = (
    tree: FileTreeItem,
    path: string
  ): FileTreeItem | null => {
    if (tree.path === path) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findItemByPath(child, path);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Update tree recursively
   */
  const updateTree = (
    tree: FileTreeItem,
    path: string,
    updater: (item: FileTreeItem) => FileTreeItem
  ): FileTreeItem => {
    if (tree.path === path) {
      return updater(tree);
    }
    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map((child) => updateTree(child, path, updater)),
      };
    }
    return tree;
  };

  /**
   * Delete item from tree
   */
  const deleteFromTree = (tree: FileTreeItem, path: string): FileTreeItem => {
    if (tree.children) {
      return {
        ...tree,
        children: tree.children
          .filter((child) => child.path !== path)
          .map((child) => deleteFromTree(child, path)),
      };
    }
    return tree;
  };

  /**
   * Add item to tree
   */
  const addToTree = (
    tree: FileTreeItem,
    parentPath: string,
    newItem: FileTreeItem
  ): FileTreeItem => {
    if (tree.path === parentPath) {
      return {
        ...tree,
        children: [...(tree.children || []), newItem].sort((a, b) => {
          // Folders first, then alphabetical
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        }),
      };
    }
    if (tree.children) {
      return {
        ...tree,
        children: tree.children.map((child) => addToTree(child, parentPath, newItem)),
      };
    }
    return tree;
  };

  /**
   * Handle context menu
   */
  const handleContextMenu = (item: FileTreeItem, event: React.MouseEvent) => {
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  /**
   * Close context menu
   */
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  /**
   * Handle new file
   */
  const handleNewFile = (parentItem: FileTreeItem) => {
    setNewItemParent(parentItem.path);
    setNewItemType('file');
    closeContextMenu();
  };

  /**
   * Handle new folder
   */
  const handleNewFolder = (parentItem: FileTreeItem) => {
    setNewItemParent(parentItem.path);
    setNewItemType('folder');
    closeContextMenu();
  };

  /**
   * Handle rename
   */
  const handleRename = (item: FileTreeItem) => {
    setRenaming(item.path);
    closeContextMenu();
  };

  /**
   * Handle delete
   */
  const handleDelete = (item: FileTreeItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const updated = deleteFromTree(fileTree, item.path);
      setFileTree(updated);
      if (onChange) onChange(updated);
    }
    closeContextMenu();
  };

  /**
   * Create new item
   */
  const createNewItem = (name: string) => {
    if (!newItemParent || !newItemType || !name.trim()) return;

    const parentPath = newItemParent;
    const newItem: FileTreeItem = {
      id: `${Date.now()}`,
      name: name.trim(),
      type: newItemType,
      path: `${parentPath}/${name.trim()}`,
      children: newItemType === 'folder' ? [] : undefined,
      extension: newItemType === 'file' ? name.split('.').pop() : undefined,
    };

    const updated = addToTree(fileTree, parentPath, newItem);
    setFileTree(updated);
    if (onChange) onChange(updated);

    setNewItemParent(null);
    setNewItemType(null);
  };

  /**
   * Rename item
   */
  const renameItem = (newName: string) => {
    if (!renaming || !newName.trim()) return;

    const updated = updateTree(fileTree, renaming, (item) => ({
      ...item,
      name: newName.trim(),
      path: item.path.replace(item.name, newName.trim()),
      extension: item.type === 'file' ? newName.split('.').pop() : undefined,
    }));

    setFileTree(updated);
    if (onChange) onChange(updated);
    setRenaming(null);
  };

  /**
   * Click outside to close menus
   */
  React.useEffect(() => {
    const handleClick = () => {
      closeContextMenu();
      if (newItemParent && !document.querySelector('[data-new-item-input]')) {
        setNewItemParent(null);
        setNewItemType(null);
      }
      if (renaming && !document.querySelector('[data-rename-input]')) {
        setRenaming(null);
      }
    };

    if (contextMenu.visible || newItemParent || renaming) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
    return undefined;
  }, [contextMenu.visible, newItemParent, renaming]);

  return (
    <div className="relative h-full bg-gray-900 text-gray-300 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-semibold text-gray-200">EXPLORER</span>
        <button
          onClick={() => handleNewFile(fileTree)}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="New File"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-gray-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* File tree */}
      <div className="py-1">
        <FileTreeNode
          item={fileTree}
          onFileClick={onFileClick}
          onContextMenu={handleContextMenu}
          selectedPath={selectedPath}
        />

        {/* New item input */}
        {newItemParent && newItemType && (
          <div className="px-2 py-1">
            <input
              data-new-item-input
              type="text"
              placeholder={`New ${newItemType} name...`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  createNewItem(e.currentTarget.value);
                } else if (e.key === 'Escape') {
                  setNewItemParent(null);
                  setNewItemType(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Rename input */}
        {renaming && (() => {
          const item = findItemByPath(fileTree, renaming);
          if (!item) return null;
          return (
            <div className="px-2 py-1">
              <input
                data-rename-input
                type="text"
                defaultValue={item.name}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameItem(e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    setRenaming(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 text-sm bg-gray-800 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          );
        })()}
      </div>

      {/* Context menu */}
      {contextMenu.visible && contextMenu.item && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1 min-w-[160px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.item.type === 'folder' && (
            <>
              <button
                onClick={() => handleNewFile(contextMenu.item!)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
              >
                New File
              </button>
              <button
                onClick={() => handleNewFolder(contextMenu.item!)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
              >
                New Folder
              </button>
              <div className="border-t border-gray-700 my-1" />
            </>
          )}
          <button
            onClick={() => handleRename(contextMenu.item!)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors"
          >
            Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenu.item!)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
