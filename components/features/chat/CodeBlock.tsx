/**
 * CodeBlock Component
 *
 * Displays syntax-highlighted code with line numbers and copy button
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  code,
  language = 'plaintext',
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      // Check if language is supported by highlight.js
      const lang = hljs.getLanguage(language) ? language : 'plaintext';
      const result = hljs.highlight(code, { language: lang });
      setHighlightedCode(result.value);
    } catch {
      // Fallback to plain text if highlighting fails
      setHighlightedCode(code);
    }
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const lines = highlightedCode.split('\n');

  return (
    <div className="group relative my-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between rounded-t-lg bg-gray-800 px-4 py-2 dark:bg-gray-950">
        {/* Language Badge */}
        <div className="flex items-center gap-2">
          {language && language !== 'plaintext' && (
            <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              {language}
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded bg-gray-700 px-2.5 py-1 text-xs text-white transition-colors hover:bg-gray-600"
          title="Copy code"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code Block */}
      <pre className="overflow-x-auto rounded-b-lg bg-gray-900 p-0 text-sm dark:bg-gray-950">
        <code ref={codeRef} className="block">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td
                      className="border-r border-gray-700 bg-gray-800 px-4 py-1 text-right align-top text-gray-500 select-none dark:border-gray-800 dark:bg-gray-900"
                      style={{ minWidth: '3em' }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="px-4 py-1 text-gray-100"
                      dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              className="px-4 py-3 text-gray-100"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </code>
      </pre>
    </div>
  );
}
