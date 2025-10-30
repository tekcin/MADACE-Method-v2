/**
 * CodeBlock Component
 *
 * Displays syntax-highlighted code with line numbers and copy button
 */

'use client';

import { useState } from 'react';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ code, language = 'text', showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="relative group">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
        title="Copy code"
      >
        {copied ? (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Copied!
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
            Copy
          </span>
        )}
      </button>

      {/* Language Badge */}
      {language && language !== 'text' && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
          {language}
        </div>
      )}

      {/* Code Block */}
      <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code className="block">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td className="text-gray-500 select-none text-right pr-4 align-top" style={{ minWidth: '3em' }}>
                      {index + 1}
                    </td>
                    <td className="text-gray-100 whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            code
          )}
        </code>
      </pre>
    </div>
  );
}
