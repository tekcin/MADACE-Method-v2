export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            MADACE-Method v2.0 - Multi-Agent Development Architecture
          </div>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <a
              href="https://github.com/yourusername/madace"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              GitHub
            </a>
            <a href="/docs" className="hover:text-gray-700 dark:hover:text-gray-300">
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
