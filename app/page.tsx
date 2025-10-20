import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
          MADACE-Method v2.0
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Multi-Agent Development Architecture for Complex Ecosystems
        </p>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-500">
          A framework for building complex software systems using AI-powered multi-agent workflows.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/agents"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </Link>
          <Link
            href="/workflows"
            className="text-sm leading-6 font-semibold text-gray-900 dark:text-white"
          >
            View workflows <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
          <div className="relative pl-16">
            <dt className="text-base leading-7 font-semibold text-gray-900 dark:text-white">
              <div className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl">🤖</span>
              </div>
              AI-Powered Agents
            </dt>
            <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
              Specialized AI agents for planning, architecture, development, and management.
            </dd>
          </div>
          <div className="relative pl-16">
            <dt className="text-base leading-7 font-semibold text-gray-900 dark:text-white">
              <div className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl">🔄</span>
              </div>
              Workflow Automation
            </dt>
            <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
              Automated workflows for story creation, implementation, and deployment.
            </dd>
          </div>
          <div className="relative pl-16">
            <dt className="text-base leading-7 font-semibold text-gray-900 dark:text-white">
              <div className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xl">⚡</span>
              </div>
              Multi-LLM Support
            </dt>
            <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
              Choose from Gemini, Claude, OpenAI, or local models for maximum flexibility.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
