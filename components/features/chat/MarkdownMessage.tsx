/**
 * MarkdownMessage Component
 *
 * Renders Markdown content with syntax highlighting and XSS protection
 */

'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import CodeBlock from './CodeBlock';
import type { Components } from 'react-markdown';

export interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Custom components for react-markdown
 */
const components: Components = {
  // Code blocks with syntax highlighting
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    // Check if inline by checking if className contains "language-"
    const isInline = !className || !className.startsWith('language-');

    if (isInline) {
      // Inline code
      return (
        <code
          className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-red-600 dark:bg-gray-700 dark:text-red-400"
          {...props}
        >
          {children}
        </code>
      );
    }

    // Code block
    return <CodeBlock code={code} language={language} showLineNumbers={true} />;
  },

  // Links with external target
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-blue-600 hover:underline dark:text-blue-400"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),

  // Headers with proper styling
  h1: ({ children, ...props }) => (
    <h1 className="mt-4 mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mt-3 mb-2 text-xl font-bold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-2 mb-1 text-lg font-bold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),

  // Lists with proper styling
  ul: ({ children, ...props }) => (
    <ul className="my-2 list-inside list-disc space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 list-inside list-decimal space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </li>
  ),

  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-2 border-l-4 border-blue-500 bg-blue-50 py-2 pl-4 text-gray-700 italic dark:bg-blue-900/20 dark:text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Paragraphs
  p: ({ children, ...props }) => (
    <p className="my-2 text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </p>
  ),

  // Horizontal rules
  hr: ({ ...props }) => (
    <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />
  ),

  // Tables
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className="min-w-full border-collapse border border-gray-300 dark:border-gray-600"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr className="border-b border-gray-300 dark:border-gray-600" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2 text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </td>
  ),

  // Images
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt}
      className="my-2 h-auto max-w-full rounded-lg"
      loading="lazy"
      {...props}
    />
  ),
};

export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={components}
        rehypePlugins={[
          rehypeRaw, // Allow HTML tags
          rehypeSanitize, // Sanitize HTML to prevent XSS
          rehypeHighlight, // Syntax highlighting
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
