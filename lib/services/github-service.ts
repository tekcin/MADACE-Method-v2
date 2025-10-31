/**
 * GitHub Service
 *
 * Handles GitHub repository operations:
 * - Clone repositories
 * - Analyze project structure
 * - Extract repository metadata
 */

import simpleGit, { SimpleGit } from 'simple-git';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  url: string;
  branch?: string;
}

export interface ProjectAnalysis {
  name: string;
  description: string;
  language: string;
  languages: Record<string, number>;
  totalFiles: number;
  totalLines: number;
  directories: string[];
  fileTypes: Record<string, number>;
  hasPackageJson: boolean;
  hasPrisma: boolean;
  hasDocker: boolean;
  dependencies: string[];
  devDependencies: string[];
  repositoryUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastUpdated: string;
  defaultBranch: string;
}

export class GitHubService {
  private git: SimpleGit;
  private octokit: Octokit;
  private cloneDir: string;

  constructor(cloneDir = './madace-data/cloned-repos') {
    this.git = simpleGit();
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Optional, for higher rate limits
    });
    this.cloneDir = cloneDir;
  }

  /**
   * Parse GitHub URL to extract owner and repo name
   */
  parseGitHubUrl(url: string): GitHubRepoInfo | null {
    try {
      // Support various GitHub URL formats
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/\.]+)(\.git)?$/,
        /github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2],
            branch: match[3] || undefined,
            url: `https://github.com/${match[1]}/${match[2]}.git`,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing GitHub URL:', error);
      return null;
    }
  }

  /**
   * Fetch repository metadata from GitHub API
   */
  async getRepositoryMetadata(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });

      // Get languages
      const { data: languages } = await this.octokit.repos.listLanguages({
        owner,
        repo,
      });

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description || '',
        language: data.language || 'Unknown',
        languages,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        lastUpdated: data.updated_at,
        defaultBranch: data.default_branch,
        repositoryUrl: data.html_url,
        cloneUrl: data.clone_url,
      };
    } catch (error) {
      console.error('Error fetching repository metadata:', error);
      throw new Error('Failed to fetch repository metadata');
    }
  }

  /**
   * Clone a GitHub repository
   */
  async cloneRepository(repoInfo: GitHubRepoInfo): Promise<string> {
    try {
      // Ensure clone directory exists
      await fs.mkdir(this.cloneDir, { recursive: true });

      const targetDir = path.join(this.cloneDir, `${repoInfo.owner}-${repoInfo.repo}`);

      // Remove existing directory if it exists
      if (existsSync(targetDir)) {
        await fs.rm(targetDir, { recursive: true, force: true });
      }

      // Clone the repository
      console.warn(`Cloning ${repoInfo.url} to ${targetDir}...`);

      const cloneOptions: string[] = [];
      if (repoInfo.branch) {
        cloneOptions.push('--branch', repoInfo.branch);
      }
      cloneOptions.push('--depth', '1'); // Shallow clone for faster cloning

      await this.git.clone(repoInfo.url, targetDir, cloneOptions);

      console.warn('Clone completed successfully');
      return targetDir;
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw new Error('Failed to clone repository');
    }
  }

  /**
   * Analyze project files and structure
   */
  async analyzeProject(projectPath: string, repoInfo: GitHubRepoInfo): Promise<ProjectAnalysis> {
    try {
      // Get repository metadata
      const metadata = await this.getRepositoryMetadata(repoInfo.owner, repoInfo.repo);

      // Analyze file structure
      const fileTypes: Record<string, number> = {};
      const directories: string[] = [];
      let totalFiles = 0;
      let totalLines = 0;

      const scanDir = async (dir: string, basePath = ''): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);

          // Skip .git and node_modules
          if (entry.name === '.git' || entry.name === 'node_modules') {
            continue;
          }

          if (entry.isDirectory()) {
            directories.push(relativePath);
            await scanDir(fullPath, relativePath);
          } else if (entry.isFile()) {
            totalFiles++;

            // Count file types
            const ext = path.extname(entry.name) || 'no-extension';
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;

            // Count lines for text files
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              totalLines += content.split('\n').length;
            } catch {
              // Skip binary files
            }
          }
        }
      };

      await scanDir(projectPath);

      // Check for specific files
      const hasPackageJson = existsSync(path.join(projectPath, 'package.json'));
      const hasPrisma = existsSync(path.join(projectPath, 'prisma'));
      const hasDocker = existsSync(path.join(projectPath, 'Dockerfile'));

      // Read package.json if exists
      let dependencies: string[] = [];
      let devDependencies: string[] = [];

      if (hasPackageJson) {
        try {
          const packageJsonContent = await fs.readFile(
            path.join(projectPath, 'package.json'),
            'utf-8'
          );
          const packageJson = JSON.parse(packageJsonContent);
          dependencies = Object.keys(packageJson.dependencies || {});
          devDependencies = Object.keys(packageJson.devDependencies || {});
        } catch {
          // Skip if package.json is invalid
        }
      }

      return {
        name: metadata.name,
        description: metadata.description,
        language: metadata.language,
        languages: metadata.languages,
        totalFiles,
        totalLines,
        directories,
        fileTypes,
        hasPackageJson,
        hasPrisma,
        hasDocker,
        dependencies,
        devDependencies,
        repositoryUrl: metadata.repositoryUrl,
        stars: metadata.stars,
        forks: metadata.forks,
        openIssues: metadata.openIssues,
        lastUpdated: metadata.lastUpdated,
        defaultBranch: metadata.defaultBranch,
      };
    } catch (error) {
      console.error('Error analyzing project:', error);
      throw new Error('Failed to analyze project');
    }
  }

  /**
   * Import a GitHub repository (clone and analyze)
   */
  async importRepository(url: string): Promise<ProjectAnalysis> {
    const repoInfo = this.parseGitHubUrl(url);

    if (!repoInfo) {
      throw new Error('Invalid GitHub URL');
    }

    const projectPath = await this.cloneRepository(repoInfo);
    const analysis = await this.analyzeProject(projectPath, repoInfo);

    return analysis;
  }

  /**
   * Clean up cloned repository
   */
  async cleanupRepository(owner: string, repo: string): Promise<void> {
    try {
      const targetDir = path.join(this.cloneDir, `${owner}-${repo}`);
      if (existsSync(targetDir)) {
        await fs.rm(targetDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Error cleaning up repository:', error);
    }
  }
}

// Export singleton instance
export const githubService = new GitHubService();
