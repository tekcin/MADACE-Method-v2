'use client';

import { useState } from 'react';
import {
  CommandLineIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

type OS = 'mac' | 'linux' | 'windows';

interface CommandBlockProps {
  command: string;
  description?: string;
}

function CommandBlock({ command, description }: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4">
      {description && <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      <div className="group relative">
        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100 dark:bg-gray-950">
          <code>{command}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded-md bg-gray-800 p-2 text-gray-400 opacity-0 transition-opacity hover:bg-gray-700 hover:text-white group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function CLISetupPage() {
  const [selectedOS, setSelectedOS] = useState<OS>('mac');

  const osConfig = {
    mac: {
      label: 'macOS',
      prereqs: [
        {
          title: 'Homebrew (recommended)',
          command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        },
        {
          title: 'Node.js 20+ (via Homebrew)',
          command: 'brew install node@20',
        },
      ],
      install: [
        {
          title: 'Install via npm (global)',
          command: 'npm install -g madace-method',
        },
        {
          title: 'Or clone from GitHub',
          command: 'git clone https://github.com/tekcin/MADACE-Method-v2.git\ncd MADACE-Method-v2.0\nnpm install',
        },
      ],
    },
    linux: {
      label: 'Linux',
      prereqs: [
        {
          title: 'Node.js 20+ (Ubuntu/Debian)',
          command: 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt-get install -y nodejs',
        },
        {
          title: 'Node.js 20+ (Fedora/RHEL)',
          command: 'curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -\nsudo dnf install -y nodejs',
        },
      ],
      install: [
        {
          title: 'Install via npm (global)',
          command: 'npm install -g madace-method',
        },
        {
          title: 'Or clone from GitHub',
          command: 'git clone https://github.com/tekcin/MADACE-Method-v2.git\ncd MADACE-Method-v2.0\nnpm install',
        },
      ],
    },
    windows: {
      label: 'Windows',
      prereqs: [
        {
          title: 'Node.js 20+ (via installer)',
          command: '# Download from https://nodejs.org/\n# Or use winget:\nwinget install OpenJS.NodeJS.LTS',
        },
        {
          title: 'Git for Windows',
          command: 'winget install Git.Git',
        },
      ],
      install: [
        {
          title: 'Install via npm (global)',
          command: 'npm install -g madace-method',
        },
        {
          title: 'Or clone from GitHub',
          command: 'git clone https://github.com/tekcin/MADACE-Method-v2.git\ncd MADACE-Method-v2.0\nnpm install',
        },
      ],
    },
  };

  const config = osConfig[selectedOS];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" data-testid="cli-setup-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <CommandLineIcon className="h-10 w-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Install MADACE CLI
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Get started with the MADACE command-line interface for powerful AI-driven development workflows.
        </p>
      </div>

      {/* OS Selection Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Operating Systems">
            {(Object.keys(osConfig) as OS[]).map((os) => (
              <button
                key={os}
                onClick={() => setSelectedOS(os)}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  selectedOS === os
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {osConfig[os].label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Prerequisites */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Prerequisites
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Before installing MADACE CLI, ensure you have the following installed:
        </p>
        <div className="space-y-6">
          {config.prereqs.map((prereq, index) => (
            <div key={index}>
              <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                {prereq.title}
              </h3>
              <CommandBlock command={prereq.command} />
            </div>
          ))}
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Installation
        </h2>
        <div className="space-y-6">
          {config.install.map((step, index) => (
            <div key={index}>
              <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
                {step.title}
              </h3>
              <CommandBlock command={step.command} />
            </div>
          ))}
        </div>
      </section>

      {/* Verification */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Verify Installation
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Check that MADACE CLI is installed correctly:
        </p>
        <CommandBlock
          command="madace --version"
          description="Should display version 3.0 or higher"
        />
        <CommandBlock
          command="madace --help"
          description="Display available commands"
        />
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Quick Start
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Get started with these common commands:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Start Interactive REPL
            </h3>
            <CommandBlock command="madace repl" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Launch Terminal Dashboard
            </h3>
            <CommandBlock command="madace dashboard" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Chat with AI Agents
            </h3>
            <CommandBlock command="madace chat" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Import Agents to Database
            </h3>
            <CommandBlock command="npm run import-madace-v3" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Start Development Server
            </h3>
            <CommandBlock command="npm run dev" />
          </div>
        </div>
      </section>

      {/* Database Setup */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Database Setup
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          MADACE v3.0 uses Prisma ORM with SQLite (dev) or PostgreSQL (prod):
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Initialize Database
            </h3>
            <CommandBlock command="npm run db:push" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Run Database Migrations
            </h3>
            <CommandBlock command="npm run db:migrate" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Open Prisma Studio (GUI)
            </h3>
            <CommandBlock command="npm run db:studio" />
          </div>
        </div>
      </section>

      {/* Environment Variables */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Environment Configuration
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Create a <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">.env</code> file in the project root:
        </p>
        <CommandBlock
          command={`# Database
DATABASE_URL="file:./dev.db"

# LLM Providers (optional)
GEMINI_API_KEY="your-gemini-api-key"
ANTHROPIC_API_KEY="your-claude-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Local LLM (optional)
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="gemma3:latest"

# Application
PORT=3000
NODE_ENV=development`}
        />
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Troubleshooting
        </h2>
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Port 3000 already in use
            </h3>
            <CommandBlock command="lsof -ti:3000 | xargs kill -9" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Database schema out of sync
            </h3>
            <CommandBlock command="npm run db:generate" />
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
              Clear caches and rebuild
            </h3>
            <CommandBlock command="rm -rf .next node_modules/.cache && npm run build" />
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Additional Resources
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="https://github.com/tekcin/MADACE-Method-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              GitHub Repository
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Source code, issues, and contributions
            </p>
          </a>

          <a
            href="/docs"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Documentation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full guides and API reference
            </p>
          </a>

          <a
            href="/chat"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              AI Chat Interface
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chat with MADACE agents
            </p>
          </a>

          <a
            href="/workflows"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Workflows
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Execute guided development workflows
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
