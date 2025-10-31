/**
 * ChatInput Component
 *
 * Message input with Send button and Enter key support
 */

'use client';

import { useState, useRef, useEffect } from 'react';

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  maxLength = 4000,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = input.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            data-testid="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            aria-label="Chat message input"
            className={`w-full rounded-lg border ${
              isOverLimit
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            } resize-none overflow-hidden bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400`}
            rows={1}
            style={{ minHeight: '52px', maxHeight: '200px' }}
          />

          {/* Character Count */}
          {charCount > maxLength * 0.8 && (
            <div
              className={`absolute right-12 bottom-2 text-xs ${
                isOverLimit ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          data-testid="send-button"
          onClick={handleSend}
          disabled={disabled || !input.trim() || isOverLimit}
          className="flex-shrink-0 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          title="Send (Enter)"
          aria-label="Send message"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Hint Text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Press{' '}
        <kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 dark:border-gray-600 dark:bg-gray-800">
          Enter
        </kbd>{' '}
        to send,{' '}
        <kbd className="rounded border border-gray-300 bg-gray-100 px-1 py-0.5 dark:border-gray-600 dark:bg-gray-800">
          Shift+Enter
        </kbd>{' '}
        for new line
      </p>
    </div>
  );
}
