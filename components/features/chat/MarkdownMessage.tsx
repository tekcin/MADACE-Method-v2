/**
 * MarkdownMessage Component
 *
 * Renders Markdown content with syntax highlighting and XSS protection
 */

'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import CodeBlock from './CodeBlock';
import type { Components } from 'react-markdown';

export interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Custom components for react-markdown
 *
 * Note: react-markdown's Components type system uses complex internal types
 * that don't play well with strict TypeScript. Using `any` for component props
 * is safe here as react-markdown handles the type checking internally.
 */
const components: Components = {
  // Code blocks with syntax highlighting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ children, ...props }: any) => {
    // Check if this is a task list item (checkbox)
    const isTaskList = props.className?.includes('task-list-item');

    if (isTaskList) {
      return (
        <li className="flex items-start gap-2 text-gray-800 dark:text-gray-200" {...props}>
          {children}
        </li>
      );
    }

    return (
      <li className="text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </li>
    );
  },

  // Custom checkbox rendering for task lists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: ({ ...props }: any) => {
    if (props.type === 'checkbox') {
      return (
        <input
          {...props}
          className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          disabled={false}
        />
      );
    }
    return <input {...props} />;
  },

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
  hr: ({ ...props }) => <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />,

  // Tables with enhanced styling
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900" {...props}>
      {children}
    </tbody>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tr: ({ children, ...props }: any) => {
    const isBodyRow = props.className?.includes('tbody');
    return (
      <tr
        className={
          isBodyRow
            ? 'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50'
            : 'border-b border-gray-200 dark:border-gray-700'
        }
        {...props}
      >
        {children}
      </tr>
    );
  },
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200" {...props}>
      {children}
    </td>
  ),

  // Images
  img: ({ src, alt }) => {
    // Ensure src is a string for Next.js Image component
    const imageSrc = typeof src === 'string' ? src : '';
    return (
      <Image
        src={imageSrc}
        alt={alt || ''}
        width={800}
        height={600}
        className="my-2 h-auto max-w-full rounded-lg"
        loading="lazy"
        style={{ width: '100%', height: 'auto' }}
      />
    );
  },
};

export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[
          remarkGfm, // GitHub Flavored Markdown (tables, task lists, strikethrough, etc.)
        ]}
        rehypePlugins={[
          rehypeRaw, // Allow HTML tags
          rehypeSanitize, // Sanitize HTML to prevent XSS
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
