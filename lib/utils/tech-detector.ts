/**
 * Technology Detection Utilities
 * Detects technologies, frameworks, and tools from project analysis data
 */

interface Technology {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool' | 'infrastructure' | 'other';
  version?: string;
  confidence?: number;
  usageCount?: number;
  description?: string;
}

interface ProjectAnalysis {
  language: string;
  languages: Record<string, number>;
  dependencies: string[];
  devDependencies: string[];
  hasPackageJson: boolean;
  hasPrisma: boolean;
  hasDocker: boolean;
  totalFiles: number;
  fileTypes: Record<string, number>;
}

// Framework detection patterns
const frameworkPatterns: Record<
  string,
  {
    category: Technology['category'];
    description: string;
    detectIn: 'dependencies' | 'devDependencies' | 'both';
  }
> = {
  react: {
    category: 'framework',
    description: 'JavaScript library for building user interfaces',
    detectIn: 'dependencies',
  },
  'react-dom': {
    category: 'framework',
    description: 'React package for working with the DOM',
    detectIn: 'dependencies',
  },
  next: {
    category: 'framework',
    description: 'React framework for production',
    detectIn: 'dependencies',
  },
  vue: {
    category: 'framework',
    description: 'Progressive JavaScript framework',
    detectIn: 'dependencies',
  },
  angular: {
    category: 'framework',
    description: 'Platform for building web applications',
    detectIn: 'dependencies',
  },
  svelte: {
    category: 'framework',
    description: 'Cybernetically enhanced web apps',
    detectIn: 'dependencies',
  },
  express: {
    category: 'framework',
    description: 'Fast, unopinionated web framework for Node.js',
    detectIn: 'dependencies',
  },
  fastify: {
    category: 'framework',
    description: 'Fast and low overhead web framework',
    detectIn: 'dependencies',
  },
  koa: {
    category: 'framework',
    description: 'Expressive middleware for Node.js',
    detectIn: 'dependencies',
  },
  nestjs: {
    category: 'framework',
    description: 'Progressive Node.js framework',
    detectIn: 'dependencies',
  },
  '@nestjs/core': {
    category: 'framework',
    description: 'Progressive Node.js framework',
    detectIn: 'dependencies',
  },

  // Databases
  prisma: {
    category: 'database',
    description: 'Next-generation ORM for Node.js and TypeScript',
    detectIn: 'dependencies',
  },
  '@prisma/client': {
    category: 'database',
    description: 'Prisma Client for database access',
    detectIn: 'dependencies',
  },
  mongoose: {
    category: 'database',
    description: 'MongoDB object modeling for Node.js',
    detectIn: 'dependencies',
  },
  typeorm: {
    category: 'database',
    description: 'ORM for TypeScript and JavaScript',
    detectIn: 'dependencies',
  },
  sequelize: {
    category: 'database',
    description: 'Promise-based Node.js ORM',
    detectIn: 'dependencies',
  },
  pg: {
    category: 'database',
    description: 'PostgreSQL client for Node.js',
    detectIn: 'dependencies',
  },
  mysql: {
    category: 'database',
    description: 'MySQL client for Node.js',
    detectIn: 'dependencies',
  },
  mysql2: {
    category: 'database',
    description: 'Fast MySQL client for Node.js',
    detectIn: 'dependencies',
  },
  mongodb: {
    category: 'database',
    description: 'Official MongoDB driver for Node.js',
    detectIn: 'dependencies',
  },
  redis: {
    category: 'database',
    description: 'Redis client for Node.js',
    detectIn: 'dependencies',
  },

  // Build Tools
  webpack: {
    category: 'tool',
    description: 'Module bundler',
    detectIn: 'devDependencies',
  },
  vite: {
    category: 'tool',
    description: 'Next generation frontend tooling',
    detectIn: 'devDependencies',
  },
  rollup: {
    category: 'tool',
    description: 'Module bundler for JavaScript',
    detectIn: 'devDependencies',
  },
  esbuild: {
    category: 'tool',
    description: 'Extremely fast JavaScript bundler',
    detectIn: 'devDependencies',
  },
  parcel: {
    category: 'tool',
    description: 'Blazing fast, zero configuration web bundler',
    detectIn: 'devDependencies',
  },

  // Testing
  jest: {
    category: 'tool',
    description: 'Delightful JavaScript testing framework',
    detectIn: 'devDependencies',
  },
  vitest: {
    category: 'tool',
    description: 'Blazing fast unit test framework',
    detectIn: 'devDependencies',
  },
  '@playwright/test': {
    category: 'tool',
    description: 'End-to-end testing framework',
    detectIn: 'devDependencies',
  },
  cypress: {
    category: 'tool',
    description: 'End-to-end testing framework',
    detectIn: 'devDependencies',
  },
  mocha: {
    category: 'tool',
    description: 'Feature-rich JavaScript test framework',
    detectIn: 'devDependencies',
  },

  // Linting & Formatting
  eslint: {
    category: 'tool',
    description: 'Pluggable linting utility for JavaScript',
    detectIn: 'devDependencies',
  },
  prettier: {
    category: 'tool',
    description: 'Opinionated code formatter',
    detectIn: 'devDependencies',
  },

  // Type Checking
  typescript: {
    category: 'language',
    description: 'TypeScript language',
    detectIn: 'devDependencies',
  },

  // UI Libraries
  '@mui/material': {
    category: 'framework',
    description: 'Material-UI React components',
    detectIn: 'dependencies',
  },
  antd: {
    category: 'framework',
    description: 'Enterprise-class UI design language',
    detectIn: 'dependencies',
  },
  tailwindcss: {
    category: 'framework',
    description: 'Utility-first CSS framework',
    detectIn: 'devDependencies',
  },
  bootstrap: {
    category: 'framework',
    description: 'Popular CSS framework',
    detectIn: 'dependencies',
  },
};

export function detectTechnologies(analysis: ProjectAnalysis): Technology[] {
  const technologies: Technology[] = [];
  const detectedNames = new Set<string>();

  // Detect primary languages
  Object.entries(analysis.languages).forEach(([lang, _bytes], index) => {
    if (!detectedNames.has(lang)) {
      technologies.push({
        name: lang,
        category: 'language',
        confidence: index === 0 ? 100 : Math.min(95, 100 - index * 10),
        description: index === 0 ? 'Primary language' : undefined,
      });
      detectedNames.add(lang);
    }
  });

  // Detect from dependencies
  const allDeps = [...analysis.dependencies, ...analysis.devDependencies];

  allDeps.forEach((dep) => {
    const pattern = frameworkPatterns[dep];
    if (pattern && !detectedNames.has(dep)) {
      // Try to extract version from package.json (if available)
      technologies.push({
        name: dep,
        category: pattern.category,
        description: pattern.description,
        confidence: 95,
      });
      detectedNames.add(dep);
    }
  });

  // Detect Docker
  if (analysis.hasDocker) {
    technologies.push({
      name: 'Docker',
      category: 'infrastructure',
      description: 'Containerization platform',
      confidence: 100,
    });
  }

  // Detect Node.js
  if (analysis.hasPackageJson) {
    if (!detectedNames.has('Node.js')) {
      technologies.push({
        name: 'Node.js',
        category: 'infrastructure',
        description: 'JavaScript runtime',
        confidence: 100,
      });
      detectedNames.add('Node.js');
    }
  }

  // Detect based on file types
  const fileTypes = analysis.fileTypes;

  // Python detection
  if (fileTypes['.py'] && !detectedNames.has('Python')) {
    technologies.push({
      name: 'Python',
      category: 'language',
      description: 'Programming language',
      confidence: 90,
      usageCount: fileTypes['.py'],
    });
    detectedNames.add('Python');
  }

  // Java detection
  if (fileTypes['.java'] && !detectedNames.has('Java')) {
    technologies.push({
      name: 'Java',
      category: 'language',
      description: 'Programming language',
      confidence: 90,
      usageCount: fileTypes['.java'],
    });
    detectedNames.add('Java');
  }

  // Go detection
  if (fileTypes['.go'] && !detectedNames.has('Go')) {
    technologies.push({
      name: 'Go',
      category: 'language',
      description: 'Programming language',
      confidence: 90,
      usageCount: fileTypes['.go'],
    });
    detectedNames.add('Go');
  }

  // Rust detection
  if (fileTypes['.rs'] && !detectedNames.has('Rust')) {
    technologies.push({
      name: 'Rust',
      category: 'language',
      description: 'Programming language',
      confidence: 90,
      usageCount: fileTypes['.rs'],
    });
    detectedNames.add('Rust');
  }

  // Ruby detection
  if (fileTypes['.rb'] && !detectedNames.has('Ruby')) {
    technologies.push({
      name: 'Ruby',
      category: 'language',
      description: 'Programming language',
      confidence: 90,
      usageCount: fileTypes['.rb'],
    });
    detectedNames.add('Ruby');
  }

  // PHP detection
  if (fileTypes['.php'] && !detectedNames.has('PHP')) {
    technologies.push({
      name: 'PHP',
      category: 'language',
      description: 'Programming language',
      confidence: 90,
      usageCount: fileTypes['.php'],
    });
    detectedNames.add('PHP');
  }

  // Sort by confidence and category
  technologies.sort((a, b) => {
    const categoryOrder = {
      language: 0,
      framework: 1,
      database: 2,
      tool: 3,
      infrastructure: 4,
      other: 5,
    };
    const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (catDiff !== 0) return catDiff;
    return (b.confidence || 0) - (a.confidence || 0);
  });

  return technologies;
}

export function generateTechStackSummary(technologies: Technology[]): string {
  const categories = technologies.reduce(
    (acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category].push(tech.name);
      return acc;
    },
    {} as Record<string, string[]>
  );

  let summary = '';
  Object.entries(categories).forEach(([category, techs]) => {
    summary += `${category}: ${techs.join(', ')}\n`;
  });

  return summary;
}
