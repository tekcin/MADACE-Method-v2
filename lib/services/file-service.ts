/**
 * File Service
 *
 * Handles file system operations for the IDE
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  return process.cwd();
}

/**
 * Read a file from the file system
 *
 * @param filePath - Relative path from project root
 * @returns File content as string
 */
export async function readFile(filePath: string): Promise<string> {
  const fullPath = path.join(getProjectRoot(), filePath);

  // Security: prevent path traversal
  const resolvedPath = path.resolve(fullPath);
  const projectRoot = path.resolve(getProjectRoot());
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Access denied: Path traversal detected');
  }

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Read file
  const content = await fs.readFile(resolvedPath, 'utf-8');
  return content;
}

/**
 * Write content to a file
 *
 * @param filePath - Relative path from project root
 * @param content - File content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const fullPath = path.join(getProjectRoot(), filePath);

  // Security: prevent path traversal
  const resolvedPath = path.resolve(fullPath);
  const projectRoot = path.resolve(getProjectRoot());
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Access denied: Path traversal detected');
  }

  // Ensure directory exists
  const dir = path.dirname(resolvedPath);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(resolvedPath, content, 'utf-8');
}

/**
 * List files in a directory
 *
 * @param dirPath - Relative directory path from project root
 * @returns Array of file names
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  const fullPath = path.join(getProjectRoot(), dirPath);

  // Security: prevent path traversal
  const resolvedPath = path.resolve(fullPath);
  const projectRoot = path.resolve(getProjectRoot());
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Access denied: Path traversal detected');
  }

  // Check if directory exists
  if (!existsSync(resolvedPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  // Read directory
  const files = await fs.readdir(resolvedPath);
  return files;
}

/**
 * Check if a path exists
 *
 * @param filePath - Relative path from project root
 * @returns true if exists, false otherwise
 */
export function fileExists(filePath: string): boolean {
  const fullPath = path.join(getProjectRoot(), filePath);

  // Security: prevent path traversal
  const resolvedPath = path.resolve(fullPath);
  const projectRoot = path.resolve(getProjectRoot());
  if (!resolvedPath.startsWith(projectRoot)) {
    return false;
  }

  return existsSync(resolvedPath);
}

/**
 * Detect file language from extension
 *
 * @param fileName - File name with extension
 * @returns Monaco editor language ID
 */
export function detectLanguage(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();

  const languageMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.rs': 'rust',
    '.go': 'go',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.cs': 'csharp',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'shell',
    '.bash': 'shell',
    '.xml': 'xml',
    '.php': 'php',
    '.rb': 'ruby',
    '.kt': 'kotlin',
    '.swift': 'swift',
  };

  return languageMap[ext] || 'plaintext';
}
