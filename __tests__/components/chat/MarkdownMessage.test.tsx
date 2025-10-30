/**
 * MarkdownMessage Component Tests
 *
 * Tests for Markdown rendering, syntax highlighting, and XSS prevention
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarkdownMessage from '@/components/features/chat/MarkdownMessage';

describe('MarkdownMessage', () => {
  describe('Basic Markdown', () => {
    it('should render bold text', () => {
      const { container } = render(<MarkdownMessage content="This is **bold** text" />);
      const boldElement = container.querySelector('strong');
      expect(boldElement).toBeInTheDocument();
      expect(boldElement?.textContent).toBe('bold');
    });

    it('should render italic text', () => {
      const { container } = render(<MarkdownMessage content="This is *italic* text" />);
      const italicElement = container.querySelector('em');
      expect(italicElement).toBeInTheDocument();
      expect(italicElement?.textContent).toBe('italic');
    });

    it('should render strikethrough text', () => {
      const { container } = render(<MarkdownMessage content="This is ~~strikethrough~~ text" />);
      const delElement = container.querySelector('del');
      expect(delElement).toBeInTheDocument();
      expect(delElement?.textContent).toBe('strikethrough');
    });

    it('should render headers', () => {
      const { container } = render(<MarkdownMessage content="# Header 1\n## Header 2\n### Header 3" />);
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('should render unordered lists', () => {
      const { container } = render(
        <MarkdownMessage content="- Item 1\n- Item 2\n- Item 3" />
      );
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('should render ordered lists', () => {
      const { container } = render(
        <MarkdownMessage content="1. First\n2. Second\n3. Third" />
      );
      const ol = container.querySelector('ol');
      expect(ol).toBeInTheDocument();
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('should render blockquotes', () => {
      const { container } = render(<MarkdownMessage content="> This is a quote" />);
      const blockquote = container.querySelector('blockquote');
      expect(blockquote).toBeInTheDocument();
    });

    it('should render links with target=_blank', () => {
      const { container } = render(
        <MarkdownMessage content="[Click here](https://example.com)" />
      );
      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should render horizontal rules', () => {
      const { container } = render(<MarkdownMessage content="---" />);
      const hr = container.querySelector('hr');
      expect(hr).toBeInTheDocument();
    });
  });

  describe('Code Rendering', () => {
    it('should render inline code', () => {
      const { container } = render(<MarkdownMessage content="Use `console.log()` to debug" />);
      const code = container.querySelector('code');
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toBe('console.log()');
    });

    it('should render code blocks', () => {
      const content = '```javascript\nconst x = 42;\n```';
      const { container } = render(<MarkdownMessage content={content} />);
      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
    });

    it('should render code blocks with language badges', () => {
      const content = '```typescript\nfunction hello() {}\n```';
      const { container } = render(<MarkdownMessage content={content} />);
      // Check for language badge
      const badge = container.querySelector('.bg-blue-600');
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe('typescript');
    });

    it('should render code blocks with line numbers', () => {
      const content = '```javascript\nline1\nline2\nline3\n```';
      const { container } = render(<MarkdownMessage content={content} />);
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize script tags', () => {
      const maliciousContent = '<script>alert("XSS")</script>';
      const { container } = render(<MarkdownMessage content={maliciousContent} />);
      const script = container.querySelector('script');
      expect(script).not.toBeInTheDocument();
    });

    it('should sanitize onclick handlers', () => {
      const maliciousContent = '<a href="#" onclick="alert(\'XSS\')">Click me</a>';
      const { container } = render(<MarkdownMessage content={maliciousContent} />);
      const link = container.querySelector('a');
      expect(link?.hasAttribute('onclick')).toBe(false);
    });

    it('should sanitize iframe tags', () => {
      const maliciousContent = '<iframe src="https://evil.com"></iframe>';
      const { container } = render(<MarkdownMessage content={maliciousContent} />);
      const iframe = container.querySelector('iframe');
      expect(iframe).not.toBeInTheDocument();
    });

    it('should sanitize style tags with javascript', () => {
      const maliciousContent = '<style>body { background: url("javascript:alert(\'XSS\')") }</style>';
      const { container } = render(<MarkdownMessage content={maliciousContent} />);
      const style = container.querySelector('style');
      expect(style).not.toBeInTheDocument();
    });

    it('should sanitize data URLs with scripts', () => {
      const maliciousContent = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      const { container } = render(<MarkdownMessage content={maliciousContent} />);
      const link = container.querySelector('a');
      // rehype-sanitize should remove or neutralize dangerous data URLs
      if (link) {
        const href = link.getAttribute('href');
        expect(href).not.toContain('script');
      }
    });

    it('should allow safe HTML tags', () => {
      const safeContent = '<strong>Bold</strong> and <em>italic</em>';
      const { container } = render(<MarkdownMessage content={safeContent} />);
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
    });
  });

  describe('Tables', () => {
    it('should render tables', () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
      `.trim();

      const { container } = render(<MarkdownMessage content={tableMarkdown} />);
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();

      const thead = container.querySelector('thead');
      const tbody = container.querySelector('tbody');
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });
  });

  describe('Images', () => {
    it('should render images with proper attributes', () => {
      const imageMarkdown = '![Alt text](https://example.com/image.png)';
      const { container } = render(<MarkdownMessage content={imageMarkdown} />);
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute('alt')).toBe('Alt text');
      expect(img?.getAttribute('src')).toBe('https://example.com/image.png');
      expect(img?.getAttribute('loading')).toBe('lazy');
    });
  });

  describe('Complex Content', () => {
    it('should render mixed markdown content', () => {
      const complexMarkdown = `
# Title

This is **bold** and *italic* text.

## Code Example

\`\`\`typescript
function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

> Quote: "Testing is important"

- List item 1
- List item 2

[Link](https://example.com)
      `.trim();

      const { container } = render(<MarkdownMessage content={complexMarkdown} />);

      // Check various elements are rendered
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.querySelector('em')).toBeInTheDocument();
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('blockquote')).toBeInTheDocument();
      expect(container.querySelector('ul')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeInTheDocument();
    });
  });
});
