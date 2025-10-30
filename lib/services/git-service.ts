import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface GitFileStatus {
  path: string;
  status: 'M' | 'A' | 'D' | 'U' | '??' | 'MM' | 'AM'; // Modified, Added, Deleted, Untracked, etc.
  staged: boolean;
}

export interface GitStatusResult {
  files: GitFileStatus[];
  statusMap: { [path: string]: GitFileStatus['status'] };
}

/**
 * Get Git status for all files in the project
 */
export async function getGitStatus(projectRoot?: string): Promise<GitStatusResult> {
  const cwd = projectRoot || process.cwd();

  try {
    // Run git status --porcelain (machine-readable format)
    const { stdout } = await execAsync('git status --porcelain', { cwd });

    const files: GitFileStatus[] = [];
    const statusMap: { [path: string]: GitFileStatus['status'] } = {};

    if (!stdout.trim()) {
      return { files, statusMap }; // No changes
    }

    // Parse git status output
    // Format: XY PATH
    // X = staged status, Y = unstaged status
    // ' M' = modified unstaged
    // 'M ' = modified staged
    // 'MM' = modified staged and unstaged
    // 'A ' = added
    // 'D ' = deleted
    // '??' = untracked

    const lines = stdout.trim().split('\n');

    for (const line of lines) {
      if (line.length < 3) continue;

      const stagedStatus = line[0];
      const unstagedStatus = line[1];
      const filePath = line.substring(3).trim();

      // Determine combined status
      let status: GitFileStatus['status'] = '??';
      let staged = false;

      if (stagedStatus === 'M' || unstagedStatus === 'M') {
        status = stagedStatus === 'M' && unstagedStatus === 'M' ? 'MM' : 'M';
        staged = stagedStatus === 'M';
      } else if (stagedStatus === 'A' || unstagedStatus === 'A') {
        status = stagedStatus === 'A' && unstagedStatus === 'M' ? 'AM' : 'A';
        staged = stagedStatus === 'A';
      } else if (stagedStatus === 'D' || unstagedStatus === 'D') {
        status = 'D';
        staged = stagedStatus === 'D';
      } else if (stagedStatus === '?' && unstagedStatus === '?') {
        status = '??';
        staged = false;
      }

      files.push({ path: filePath, status, staged });
      statusMap[filePath] = status;

      // Also add status for full path (with project root)
      const fullPath = path.join(cwd, filePath);
      statusMap[fullPath] = status;
    }

    return { files, statusMap };
  } catch (error) {
    // Not a git repository or git not installed
    console.error('Git status error:', error);
    return { files: [], statusMap: {} };
  }
}

/**
 * Check if directory is a Git repository
 */
export async function isGitRepository(projectRoot?: string): Promise<boolean> {
  const cwd = projectRoot || process.cwd();

  try {
    await execAsync('git rev-parse --git-dir', { cwd });
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse .gitignore file and return ignored patterns
 */
export async function getGitIgnorePatterns(projectRoot?: string): Promise<string[]> {
  const cwd = projectRoot || process.cwd();
  const gitignorePath = path.join(cwd, '.gitignore');

  try {
    const content = await fs.promises.readFile(gitignorePath, 'utf-8');
    const lines = content.split('\n');

    const patterns: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;

      patterns.push(trimmed);
    }

    return patterns;
  } catch {
    // No .gitignore file
    return [];
  }
}

/**
 * Check if file path matches any gitignore pattern
 *
 * Basic implementation - does not handle all gitignore edge cases
 */
export function isFileIgnored(filePath: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // Exact match
    if (filePath === pattern) return true;

    // Directory match (ends with /)
    if (pattern.endsWith('/') && filePath.startsWith(pattern)) return true;

    // Wildcard match (basic)
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
      );
      if (regex.test(filePath)) return true;
    }

    // Prefix match
    if (filePath.startsWith(pattern + '/')) return true;
  }

  return false;
}

/**
 * Get git branch name
 */
export async function getGitBranch(projectRoot?: string): Promise<string | null> {
  const cwd = projectRoot || process.cwd();

  try {
    const { stdout } = await execAsync('git branch --show-current', { cwd });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Get last commit message
 */
export async function getLastCommit(projectRoot?: string): Promise<string | null> {
  const cwd = projectRoot || process.cwd();

  try {
    const { stdout } = await execAsync('git log -1 --pretty=%B', { cwd });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}
