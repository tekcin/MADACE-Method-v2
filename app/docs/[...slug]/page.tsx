/**
 * Individual Documentation File Viewer
 * Displays a specific markdown documentation file
 */

import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocContent(slug: string[]): Promise<{ content: string; title: string } | null> {
  try {
    // Decode URL segments to handle encoded paths like %2F
    const decodedSlug = slug.map((segment) => decodeURIComponent(segment));
    const docPath = path.join(process.cwd(), 'docs', ...decodedSlug);
    const content = await fs.readFile(docPath, 'utf-8');

    // Extract title from first heading or filename
    const firstLine = content.split('\n')[0] || '';
    const filename = decodedSlug[decodedSlug.length - 1] || 'Document';
    const title = firstLine.startsWith('#')
      ? firstLine.replace(/^#+\s*/, '')
      : filename.replace('.md', '');

    return { content, title };
  } catch (error) {
    console.error('Error reading doc file:', error);
    return null;
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = await getDocContent(slug);

  if (!doc) {
    notFound();
  }

  // Decode slug for display
  const decodedSlug = slug.map((segment) => decodeURIComponent(segment));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/docs"
            className="mb-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Documentation
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{doc.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{decodedSlug.join(' / ')}</p>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <pre className="font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {doc.content}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/docs"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Documentation
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = await getDocContent(slug);
  const decodedSlug = slug.map((segment) => decodeURIComponent(segment));

  return {
    title: doc ? `${doc.title} - Documentation` : 'Documentation',
    description: `MADACE-Method v3.0 Documentation: ${decodedSlug.join('/')}`,
  };
}
