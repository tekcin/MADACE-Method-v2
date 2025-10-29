# [NEXT-005] Create Base Layout and Navigation

**Status:** DONE ✅
**Points:** 3
**Epic:** Milestone 1.1 - Next.js Project Foundation
**Created:** 2025-10-20
**Completed:** 2025-10-20
**Assigned:** DEV Agent
**Actual Time:** 45 minutes

---

## Description

Create the base application layout with navigation structure for the MADACE-Method v2.0 Next.js application. This includes the root layout, navigation sidebar/header, and responsive design foundation.

**Context:**

- [NEXT-001] completed - Next.js 15 is initialized
- [NEXT-002] completed - Project structure is organized
- [NEXT-003] completed - ESLint and Prettier configured
- [NEXT-004] completed - Environment variables configured
- We need a consistent layout across all pages
- Navigation should support the MADACE workflow (Dashboard, Agents, Workflows, Settings)
- Layout should be responsive and accessible

**Why This Story:**
A well-designed base layout ensures consistent user experience across the application. The navigation structure will guide users through the MADACE workflow phases and make the application intuitive to use.

---

## Acceptance Criteria

- [ ] Root layout (`app/layout.tsx`) updated with MADACE branding
- [ ] Navigation component created (`components/features/Navigation.tsx`)
- [ ] Responsive sidebar or header navigation implemented
- [ ] Navigation links for main sections (Dashboard, Agents, Workflows, Settings)
- [ ] Active route highlighting
- [ ] Mobile-responsive navigation (hamburger menu for mobile)
- [ ] Dark mode support (using Tailwind CSS)
- [ ] Accessibility features (ARIA labels, keyboard navigation)
- [ ] Footer component with version info
- [ ] Layout works on all screen sizes (mobile, tablet, desktop)
- [ ] No console errors or warnings
- [ ] TypeScript types properly defined
- [ ] Code passes all quality checks (lint, format, type-check)

---

## Implementation Plan

### Step 1: Update Root Layout

Update `app/layout.tsx` with MADACE branding and metadata:

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/features/Navigation';
import { Footer } from '@/components/features/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MADACE-Method v2.0',
  description: 'Multi-Agent Development Architecture for Complex Ecosystems',
  keywords: ['MADACE', 'Multi-Agent', 'Development', 'AI', 'Workflow'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

### Step 2: Create Navigation Component

Create `components/features/Navigation.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { HomeIcon, UsersIcon, CogIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Agents', href: '/agents', icon: UsersIcon },
  { name: 'Workflows', href: '/workflows', icon: CogIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                MADACE
              </Link>
              <span className="ml-2 text-sm text-gray-500">v2.0</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pt-2 pb-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block border-l-4 py-2 pr-4 pl-3 text-base font-medium ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
```

### Step 3: Create Footer Component

Create `components/features/Footer.tsx`:

```tsx
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
```

### Step 4: Install Heroicons

```bash
npm install @heroicons/react
```

### Step 5: Create Placeholder Pages

Create placeholder pages for navigation links:

```bash
# Create directories
mkdir -p app/agents app/workflows app/settings

# Create placeholder pages
# app/agents/page.tsx
# app/workflows/page.tsx
# app/settings/page.tsx
```

Example placeholder (`app/agents/page.tsx`):

```tsx
export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agents</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Agent management coming soon...</p>
    </div>
  );
}
```

### Step 6: Update Home Page

Update `app/page.tsx` to use consistent layout:

```tsx
export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
          MADACE-Method v2.0
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          Multi-Agent Development Architecture for Complex Ecosystems
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/agents"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </a>
          <a href="/docs" className="text-sm leading-6 font-semibold text-gray-900 dark:text-white">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Add Dark Mode Support

Update `tailwind.config.ts` to enable dark mode:

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      // Your theme extensions
    },
  },
  plugins: [],
};
export default config;
```

### Step 8: Test Responsiveness

Test on different screen sizes:

```bash
# Start development server
npm run dev

# Open in browser:
# - Desktop: http://localhost:3000
# - Test mobile: Use browser DevTools responsive mode
# - Test tablet: Use browser DevTools responsive mode
```

**Test Checklist:**

- [ ] Navigation appears correctly on desktop
- [ ] Mobile menu opens/closes properly
- [ ] Active route is highlighted
- [ ] All links work correctly
- [ ] Dark mode styles work
- [ ] Footer appears at bottom
- [ ] No layout shift or flickering

### Step 9: Run Quality Checks

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format check
npm run format:check

# All checks
npm run check-all
```

---

## Technical Notes

### Next.js App Router Layout

Next.js 15 uses the App Router with layouts:

- `app/layout.tsx` - Root layout (wraps all pages)
- Layout is shared across all routes
- Client components needed for interactivity (`'use client'`)

### Heroicons Integration

Using Heroicons for consistent icon design:

- `@heroicons/react/24/outline` - Outline icons
- `@heroicons/react/24/solid` - Solid icons
- Tree-shakeable imports

### Dark Mode Strategy

Using Tailwind's class-based dark mode:

- `dark:` prefix for dark mode styles
- Requires `darkMode: 'class'` in tailwind.config.ts
- Future: Add dark mode toggle component

### Responsive Design

Using Tailwind's responsive breakpoints:

- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- Mobile-first approach

### Accessibility

Following WCAG guidelines:

- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast ratios

---

## Testing Checklist

**Layout:**

- [ ] Root layout renders correctly
- [ ] Navigation component displays
- [ ] Footer component displays
- [ ] Layout is responsive on all screen sizes

**Navigation:**

- [ ] All navigation links work
- [ ] Active route is highlighted correctly
- [ ] Mobile menu opens and closes
- [ ] Clicking mobile link closes menu
- [ ] Keyboard navigation works

**Pages:**

- [ ] Home page renders correctly
- [ ] Agents page accessible
- [ ] Workflows page accessible
- [ ] Settings page accessible

**Dark Mode:**

- [ ] Dark mode classes apply correctly
- [ ] Text is readable in dark mode
- [ ] No color contrast issues

**Accessibility:**

- [ ] Screen reader announces navigation properly
- [ ] Tab navigation works in order
- [ ] Focus indicators visible
- [ ] ARIA labels present

**Quality:**

```bash
# All of these should pass:
npm run type-check
npm run lint
npm run format:check
npm run build
```

---

## Dependencies

**Depends On:**

- [NEXT-001] Initialize Next.js 15 project (DONE) ✅
- [NEXT-002] Configure project structure (DONE) ✅
- [NEXT-003] Setup ESLint and Prettier (DONE) ✅
- [NEXT-004] Configure environment variables (DONE) ✅

**Blocks:**

- [SETUP-002] Setup wizard UI (needs base layout)
- [UI-001] Home dashboard page (needs navigation)
- All future UI components and pages

---

## Risks & Mitigations

**Risk 1: Layout Shift on Page Load**

- **Risk:** Navigation may cause layout shift affecting performance
- **Mitigation:** Use proper height constraints, avoid dynamic sizing
- **Likelihood:** Low (using fixed header height)

**Risk 2: Mobile Menu Accessibility**

- **Risk:** Mobile menu may not be keyboard accessible
- **Mitigation:** Test with keyboard and screen readers
- **Likelihood:** Low (using proper ARIA and focus management)

**Risk 3: Dark Mode Flash**

- **Risk:** Flash of light mode before dark mode loads
- **Mitigation:** Future story will add dark mode persistence
- **Likelihood:** Medium (acceptable for now, will fix in dark mode story)

---

## Definition of Done

This story is considered DONE when:

1. ✅ Root layout updated with MADACE branding
2. ✅ Navigation component created and functional
3. ✅ Footer component created
4. ✅ Responsive design works on mobile, tablet, desktop
5. ✅ Mobile hamburger menu works properly
6. ✅ Active route highlighting works
7. ✅ Dark mode styles applied
8. ✅ Accessibility features implemented
9. ✅ Placeholder pages created (agents, workflows, settings)
10. ✅ Home page updated with consistent layout
11. ✅ Heroicons installed and working
12. ✅ All quality checks pass (type-check, lint, format)
13. ✅ No console errors or warnings
14. ✅ Build succeeds (`npm run build`)
15. ✅ Git committed with clear message
16. ✅ Story moved to DONE in workflow status

---

## Time Estimate

**Estimated Time:** 45-60 minutes

**Breakdown:**

- Update root layout: 5 minutes
- Create Navigation component: 15 minutes
- Create Footer component: 5 minutes
- Install Heroicons: 2 minutes
- Create placeholder pages: 10 minutes
- Update home page: 5 minutes
- Configure dark mode: 3 minutes
- Testing and responsiveness: 10 minutes
- Quality checks and fixes: 5 minutes

**Actual Time:** _[To be filled after completion]_

---

## Implementation Notes

### Before You Start

- Ensure [NEXT-004] is complete
- Review Next.js App Router documentation
- Plan navigation structure based on MADACE workflow
- Consider future features (dark mode toggle, user menu)

### During Implementation

- Test responsiveness at each step
- Check keyboard navigation frequently
- Use semantic HTML elements
- Keep components simple and focused
- Follow existing code style

### After Completion

- Test on multiple screen sizes
- Verify all links work
- Run all quality checks
- Test keyboard navigation
- Commit with descriptive message

---

## Related Documentation

- [Next.js Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Heroicons](https://heroicons.com/)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Application structure

---

**Story Created By:** SM Agent (Scrum Master)
**Reviewed By:** _[Auto-approved for implementation]_
**Implemented By:** DEV Agent
**Date Created:** 2025-10-20
**Last Updated:** 2025-10-20
