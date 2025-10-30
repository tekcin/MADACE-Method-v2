/**
 * Documentation Viewer
 * Displays list of available documentation files
 */

import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';

interface DocFile {
  name: string;
  path: string;
  category: string;
}

async function getDocFiles(): Promise<DocFile[]> {
  const docsDir = path.join(process.cwd(), 'docs');
  const files: DocFile[] = [];

  try {
    // Read root-level docs
    const rootFiles = await fs.readdir(docsDir);
    for (const file of rootFiles) {
      const filePath = path.join(docsDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile() && file.endsWith('.md')) {
        files.push({
          name: file.replace('.md', ''),
          path: file,
          category: 'Root',
        });
      } else if (stat.isDirectory() && !file.startsWith('.')) {
        // Read subdirectory docs
        const subFiles = await fs.readdir(filePath);
        for (const subFile of subFiles) {
          const subFilePath = path.join(filePath, subFile);
          const subStat = await fs.stat(subFilePath);

          if (subStat.isFile() && subFile.endsWith('.md')) {
            files.push({
              name: subFile.replace('.md', ''),
              path: `${file}/${subFile}`,
              category: file,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading docs directory:', error);
  }

  return files;
}

export default async function DocsPage() {
  const docFiles = await getDocFiles();

  // Group by category
  const grouped = docFiles.reduce(
    (acc, file) => {
      if (!acc[file.category]) {
        acc[file.category] = [];
      }
       
      acc[file.category]!.push(file);
      return acc;
    },
    {} as Record<string, DocFile[]>
  );

  // Sort categories (Root first, then alphabetically)
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === 'Root') return -1;
    if (b === 'Root') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse all available documentation files for MADACE-Method v3.0
          </p>
        </div>

        {/* Documentation Categories */}
        <div className="space-y-8">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {category === 'Root' ? 'Main Documentation' : category.toUpperCase()}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                { }
                {grouped[category]!.sort((a, b) => a.name.localeCompare(b.name)).map((file) => (
                  <Link
                    key={file.path}
                    href={`/docs/${file.path}`}
                    className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                  >
                    <div className="flex items-start">
                      <span className="mr-3 text-2xl">📄</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{file.path}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {docFiles.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No documentation files found.</p>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
