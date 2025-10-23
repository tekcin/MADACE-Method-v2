'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ViewColumnsIcon,
  BeakerIcon,
  Cog6ToothIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { WorkflowStatus } from '@/lib/state/types';

interface DashboardStats {
  projectName: string;
  totalCompleted: number;
  totalPoints: number;
  inProgress: number;
  backlog: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load workflow status
      const stateResponse = await fetch('/api/state');
      const stateData = await stateResponse.json();

      if (stateData.success) {
        const status: WorkflowStatus = stateData.status;
        const totalPoints = status.done.reduce((sum, story) => sum + (story.points || 0), 0);

        setStats({
          projectName: 'MADACE-Method v2.0',
          totalCompleted: status.done.length,
          totalPoints,
          inProgress: status.inProgress.length,
          backlog: status.backlog.length,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set default stats
      setStats({
        projectName: 'MADACE-Method v2.0',
        totalCompleted: 0,
        totalPoints: 0,
        inProgress: 0,
        backlog: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">MADACE-Method v2.0</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Methodology for AI-Driven Agile Collaboration Engine
        </p>
        <p className="text-muted-foreground mt-2 text-base">
          Build complex software systems using AI-powered multi-agent workflows
        </p>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="mt-12 text-center">
          <div className="border-primary inline-block h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-2 text-sm">Loading project statistics...</p>
        </div>
      ) : stats ? (
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completed</p>
                <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalCompleted}
                </p>
              </div>
              <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Points</p>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalPoints}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="text-xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">In Progress</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.inProgress}
                </p>
              </div>
              <ClockIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Backlog</p>
                <p className="mt-2 text-3xl font-bold">{stats.backlog}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/kanban"
            className="group bg-card hover:border-primary rounded-lg border p-6 transition-colors"
          >
            <ViewColumnsIcon className="text-primary h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Kanban Board</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Visual workflow tracking with drag-and-drop
            </p>
          </Link>

          <Link
            href="/llm-test"
            className="group bg-card hover:border-primary rounded-lg border p-6 transition-colors"
          >
            <BeakerIcon className="text-primary h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Test LLM</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Test your LLM provider configuration
            </p>
          </Link>

          <Link
            href="/agents"
            className="group bg-card hover:border-primary rounded-lg border p-6 transition-colors"
          >
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg text-2xl">
              🤖
            </div>
            <h3 className="mt-4 text-lg font-semibold">AI Agents</h3>
            <p className="text-muted-foreground mt-2 text-sm">Explore specialized AI agents</p>
          </Link>

          <Link
            href="/settings"
            className="group bg-card hover:border-primary rounded-lg border p-6 transition-colors"
          >
            <Cog6ToothIcon className="text-primary h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Settings</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Configure your project and preferences
            </p>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold">Core Features</h2>
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="bg-card relative rounded-lg border p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">AI-Powered Agents</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Specialized AI agents for Product Management, Architecture, Development, and Scrum
              Master roles. Each agent brings domain expertise to your project.
            </p>
            <div className="mt-4">
              <Link href="/agents" className="text-primary text-sm font-medium hover:underline">
                Explore agents →
              </Link>
            </div>
          </div>

          <div className="bg-card relative rounded-lg border p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">Workflow Automation</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Automated workflows guide you through story creation, implementation planning, and
              iterative development. State machine ensures proper story lifecycle.
            </p>
            <div className="mt-4">
              <Link href="/kanban" className="text-primary text-sm font-medium hover:underline">
                View Kanban →
              </Link>
            </div>
          </div>

          <div className="bg-card relative rounded-lg border p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">Multi-LLM Support</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Choose from Google Gemini, Anthropic Claude, OpenAI GPT, or local models (Ollama). Mix
              and match providers for different agents and use cases.
            </p>
            <div className="mt-4">
              <Link href="/llm-test" className="text-primary text-sm font-medium hover:underline">
                Test connection →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-card mt-16 rounded-lg border p-8">
        <div className="flex items-start gap-6">
          <RocketLaunchIcon className="text-primary h-12 w-12 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Getting Started</h2>
            <p className="text-muted-foreground mt-2">
              New to MADACE? Follow these steps to get up and running:
            </p>
            <ol className="mt-4 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  1
                </span>
                <span>
                  <Link href="/setup" className="text-primary font-medium hover:underline">
                    Complete the setup wizard
                  </Link>{' '}
                  to configure your project and LLM provider
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  2
                </span>
                <span>
                  <Link href="/llm-test" className="text-primary font-medium hover:underline">
                    Test your LLM connection
                  </Link>{' '}
                  to verify your API key and model selection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  3
                </span>
                <span>
                  <Link href="/agents" className="text-primary font-medium hover:underline">
                    Explore AI agents
                  </Link>{' '}
                  to understand their roles and capabilities
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  4
                </span>
                <span>
                  <Link href="/kanban" className="text-primary font-medium hover:underline">
                    View the Kanban board
                  </Link>{' '}
                  to track your project&apos;s progress
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground text-sm">
          Need help?{' '}
          <a
            href="https://github.com/tekcin/MADACE-METHOD"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            View documentation
          </a>
        </p>
      </div>
    </div>
  );
}
