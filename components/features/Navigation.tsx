'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  RectangleStackIcon,
  BeakerIcon,
  ViewColumnsIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  CloudArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { ProjectSelector } from './ProjectSelector';
import { ProjectModal } from './ProjectModal';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftIcon },
  { name: 'Kanban', href: '/kanban', icon: ViewColumnsIcon },
  { name: 'Assess', href: '/assess', icon: ChartBarIcon },
  { name: 'Import', href: '/import', icon: CloudArrowDownIcon },
  { name: 'Agents', href: '/agents', icon: UserGroupIcon },
  { name: 'Workflows', href: '/workflows', icon: RectangleStackIcon },
  { name: 'Sync Status', href: '/sync-status', icon: ArrowPathIcon },
  { name: 'LLM Test', href: '/llm-test', icon: BeakerIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for custom event to open project modal
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-create-project-modal', handleOpenModal);
    return () => window.removeEventListener('open-create-project-modal', handleOpenModal);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="bg-opacity-75 fixed inset-0 z-40 bg-gray-600 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          <Link
            href="/"
            className={`flex items-center ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
          >
            <span className="text-xl font-bold text-blue-600">
              {sidebarCollapsed ? 'M' : 'MADACE'}
            </span>
            {!sidebarCollapsed && <span className="ml-2 text-sm text-gray-500">v3.0</span>}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Desktop collapse button */}
          <button
            type="button"
            className="hidden rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:block dark:hover:bg-gray-800"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Project Selector */}
        {!sidebarCollapsed && (
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <ProjectSelector />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                } ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 MADACE-Method</p>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed right-4 bottom-4 z-50 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Project Creation Modal */}
      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode="create" />
    </>
  );
}
