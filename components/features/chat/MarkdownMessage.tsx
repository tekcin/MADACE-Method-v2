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
  code: ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const code = String(children).replace(/\n$/, '');

    // Check if inline by checking if className contains "language-"
    const isInline = !className || !className.startsWith('language-');

    if (isInline) {
      // Inline code
      return (
        <code
          className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono"
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
  a: ({ node, children, href, ...props }) => (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),

  // Headers with proper styling
  h1: ({ node, children, ...props }) => (
    <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2 className="text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 className="text-lg font-bold mt-2 mb-1 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),

  // Lists with proper styling
  ul: ({ node, children, ...props }) => (
    <ul className="list-disc list-inside my-2 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ node, children, ...props }) => (
    <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, ...props }) => (
    <li className="text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </li>
  ),

  // Blockquotes
  blockquote: ({ node, children, ...props }) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 py-2 my-2 italic text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Paragraphs
  p: ({ node, children, ...props }) => (
    <p className="my-2 text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </p>
  ),

  // Horizontal rules
  hr: ({ node, ...props }) => <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />,

  // Tables
  table: ({ node, children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, ...props }) => (
    <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ node, children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ node, children, ...props }) => (
    <tr className="border-b border-gray-300 dark:border-gray-600" {...props}>
      {children}
    </tr>
  ),
  th: ({ node, children, ...props }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </th>
  ),
  td: ({ node, children, ...props }) => (
    <td className="px-4 py-2 text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </td>
  ),

  // Images
  img: ({ node, src, alt, ...props }) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg my-2"
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
