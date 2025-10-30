/**
 * Toast Notification Component
 *
 * Simple toast notification system for displaying transient messages.
 * Used for collaboration events (user join/leave, file updates, etc.)
 */

'use client';

import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after N milliseconds (default: 3000)
}

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

/**
 * Individual Toast Component
 */
function Toast({ message, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after duration
    const dismissDuration = message.duration || 3000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Remove from DOM after fade-out animation
      setTimeout(() => onDismiss(message.id), 300);
    }, dismissDuration);

    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  const getBackgroundColor = (): string => {
    switch (message.type) {
      case 'success':
        return 'bg-green-600';
      case 'info':
        return 'bg-blue-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-700';
    }
  };

  const getIcon = (): string => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return '•';
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} mb-3 transform rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ minWidth: '300px', maxWidth: '400px' }}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-xl font-bold text-white">{getIcon()}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{message.title}</p>
          {message.message && <p className="mt-1 text-xs text-white/90">{message.message}</p>}
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(message.id), 300);
          }}
          className="flex-shrink-0 text-lg text-white/70 hover:text-white"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 *
 * Manages multiple toast notifications with auto-dismiss.
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Listen to custom toast events
    const handleToast = ((event: CustomEvent<ToastMessage>) => {
      const newToast = event.detail;
      setToasts((prev) => [...prev, newToast]);
    }) as EventListener;

    window.addEventListener('show-toast', handleToast);

    return () => {
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50" style={{ maxWidth: '400px' }}>
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to show a toast notification
 */
export function showToast(toast: Omit<ToastMessage, 'id'>): void {
  const toastMessage: ToastMessage = {
    ...toast,
    id: `toast-${Date.now()}-${Math.random()}`,
  };

  const event = new CustomEvent('show-toast', { detail: toastMessage });
  window.dispatchEvent(event);
}

/**
 * Helper functions for common toast types
 */
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    showToast({ type: 'success', title, message, duration }),

  info: (title: string, message?: string, duration?: number) =>
    showToast({ type: 'info', title, message, duration }),

  warning: (title: string, message?: string, duration?: number) =>
    showToast({ type: 'warning', title, message, duration }),

  error: (title: string, message?: string, duration?: number) =>
    showToast({ type: 'error', title, message, duration }),
};
