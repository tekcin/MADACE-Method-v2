/**
 * CLI Markdown Renderer
 *
 * Renders Markdown content for terminal output with colors
 */

import chalk from 'chalk';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

/**
 * Configure marked with terminal renderer
 */
marked.setOptions({
  // @ts-ignore - marked-terminal types are incomplete
  renderer: new TerminalRenderer({
    // Code blocks
    code: chalk.yellow,
    blockquote: chalk.gray.italic,
    html: chalk.gray,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.bold.underline,
    hr: chalk.gray,
    listitem: chalk.white,
    list: (body: string) => body,
    paragraph: chalk.white,
    strong: chalk.bold.white,
    em: chalk.italic.white,
    codespan: chalk.cyan,
    del: chalk.dim.strikethrough,
    link: chalk.blue.underline,
    href: chalk.blue.underline,

    // Width for wrapping
    width: 80,

    // Show section prefixes
    showSectionPrefix: true,

    // Bullets for lists
    unescape: true,
    emoji: true,

    // Code block settings
    tab: 2,
  }),
});

/**
 * Render Markdown string to colored terminal output
 */
export function renderMarkdown(markdown: string): string {
  try {
    const rendered = marked.parse(markdown, { async: false }) as string;
    return rendered.trim();
  } catch (error) {
    console.error(chalk.red('Error rendering Markdown:'), error);
    return markdown; // Fallback to plain text
  }
}

/**
 * Render inline code (for quick code snippets)
 */
export function renderInlineCode(code: string): string {
  return chalk.cyan(`\`${code}\``);
}

/**
 * Render code block with basic highlighting
 */
export function renderCodeBlock(code: string, language = ''): string {
  const lines = code.split('\n');
  const header = language ? chalk.blue(`[${language}]`) : '';

  const numberedLines = lines.map((line, index) => {
    const lineNumber = chalk.dim.gray(`${(index + 1).toString().padStart(3, ' ')} │ `);
    return lineNumber + chalk.yellow(line);
  });

  return `${header}\n${chalk.gray('─'.repeat(80))}\n${numberedLines.join('\n')}\n${chalk.gray('─'.repeat(80))}`;
}

/**
 * Strip Markdown formatting (for plain text display)
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#+\s/g, '') // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/~~(.+?)~~/g, '$1') // Strikethrough
    .replace(/`(.+?)`/g, '$1') // Inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1') // Images
    .replace(/>\s/g, '') // Blockquotes
    .replace(/^\s*[-*+]\s/gm, '• ') // List items
    .replace(/^\s*\d+\.\s/gm, '• '); // Numbered lists
}

/**
 * Format a message for CLI output (with author and timestamp)
 */
export function formatMessageForCLI(
  author: string,
  content: string,
  timestamp?: Date,
  isMarkdown = true
): string {
  const timeStr = timestamp
    ? chalk.dim(`[${timestamp.toLocaleTimeString()}]`)
    : '';

  const authorColor = author === 'You' ? chalk.blue : chalk.green;
  const authorStr = authorColor.bold(`${author}:`);

  const formattedContent = isMarkdown ? renderMarkdown(content) : content;

  return `\n${authorStr} ${timeStr}\n${formattedContent}\n`;
}

/**
 * Example usage
 */
export function demo() {
  const exampleMarkdown = `
# Hello World

This is **bold** and this is *italic*.

Here's some \`inline code\` and a [link](https://example.com).

## Code Block

\`\`\`typescript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote

- List item 1
- List item 2
- List item 3

1. First
2. Second
3. Third
`;

  console.log(renderMarkdown(exampleMarkdown));
}
