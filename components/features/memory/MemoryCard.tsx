'use client';

import { useState } from 'react';
import type { AgentMemory } from '@prisma/client';

interface MemoryCardProps {
  memory: AgentMemory;
  onDelete: (id: string) => void;
  onUpdate: (id: string, importance: number) => void;
}

const categoryLabels: Record<string, string> = {
  user_preference: 'User Preference',
  project_context: 'Project Context',
  conversation_summary: 'Conversation Summary',
  user_fact: 'User Fact',
};

const categoryColors: Record<string, string> = {
  user_preference: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  project_context: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  conversation_summary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  user_fact: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const importanceColors = [
  'bg-gray-200', // 0 (not used)
  'bg-red-200', // 1
  'bg-red-300', // 2
  'bg-orange-200', // 3
  'bg-orange-300', // 4
  'bg-yellow-200', // 5
  'bg-yellow-300', // 6
  'bg-green-200', // 7
  'bg-green-300', // 8
  'bg-blue-200', // 9
  'bg-blue-300', // 10
];

export function MemoryCard({ memory, onDelete, onUpdate }: MemoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [importance, setImportance] = useState(memory.importance);
  const [showDetails, setShowDetails] = useState(false);

  const handleSave = () => {
    if (importance !== memory.importance) {
      onUpdate(memory.id, importance);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setImportance(memory.importance);
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{memory.key}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                categoryColors[memory.category] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {categoryLabels[memory.category] || memory.category}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${memory.type === 'long-term' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}
            >
              {memory.type}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{memory.value}</p>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(memory.id)}
          className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title="Delete memory"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Importance Slider */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Importance: {importance}/10
          </label>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="rounded bg-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Edit
            </button>
          )}
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={importance}
          onChange={(e) => setImportance(parseInt(e.target.value))}
          disabled={!isEditing}
          className={`h-2 w-full cursor-pointer appearance-none rounded-lg ${
            importanceColors[importance]
          } ${isEditing ? '' : 'cursor-not-allowed opacity-60'}`}
        />
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Created: {timeSince(memory.createdAt)}</span>
          <span>Accessed: {memory.accessCount}×</span>
        </div>
        <div className="flex justify-between">
          <span>Last access: {timeSince(memory.lastAccessedAt)}</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            {showDetails ? 'Hide' : 'Show'} details
          </button>
        </div>
      </div>

      {/* Details (collapsed by default) */}
      {showDetails && (
        <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs dark:border-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Source:</span>
            <span className="text-gray-900 dark:text-gray-100">{memory.source}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Created at:</span>
            <span className="text-gray-900 dark:text-gray-100">{formatDate(memory.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last accessed:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatDate(memory.lastAccessedAt)}
            </span>
          </div>
          {memory.expiresAt && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Expires:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatDate(memory.expiresAt)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
