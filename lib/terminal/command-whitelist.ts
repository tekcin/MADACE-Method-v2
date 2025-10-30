/**
 * Terminal Command Whitelist
 *
 * Defines allowed commands and validation rules for terminal execution.
 * Provides security layer to prevent dangerous operations.
 */

/**
 * Command validation result
 */
export interface ValidationResult {
  allowed: boolean;
  reason?: string;
  sanitizedCommand?: string;
}

/**
 * Whitelist configuration
 */
interface WhitelistConfig {
  allowedCommands: string[]; // Allowed base commands
  allowedPrefixes: string[]; // Allowed command prefixes (e.g., "npm ")
  blockedPatterns: RegExp[]; // Blocked patterns
  blockedCommands: string[]; // Explicitly blocked commands
}

/**
 * Default whitelist configuration
 *
 * Allows common development commands while blocking dangerous operations.
 */
const DEFAULT_WHITELIST: WhitelistConfig = {
  // File system operations (read-only or safe)
  allowedCommands: [
    'ls',
    'dir',
    'pwd',
    'cd',
    'cat',
    'head',
    'tail',
    'less',
    'more',
    'find',
    'grep',
    'tree',
    'wc',
    'diff',
    'file',
    'stat',
    'du',
    'df',
    'which',
    'whereis',
    'echo',
    'printf',
    'clear',
    'help',
  ],

  // Allowed command prefixes (commands with subcommands)
  allowedPrefixes: [
    'npm ',
    'npx ',
    'yarn ',
    'pnpm ',
    'node ',
    'git ',
    'madace ',
    'docker ',
    'docker-compose ',
    'curl ',
    'wget ',
    'ping ',
    'traceroute ',
    'nslookup ',
    'dig ',
    'ssh ',
    'scp ',
    'rsync ',
    'tar ',
    'gzip ',
    'gunzip ',
    'unzip ',
    'zip ',
  ],

  // Blocked patterns (dangerous operations)
  blockedPatterns: [
    /rm\s+-rf\s+\//i, // rm -rf / (delete root)
    /rm\s+-rf\s+\*/i, // rm -rf * (delete all)
    /dd\s+/i, // dd (disk operations)
    /mkfs/i, // mkfs (format disk)
    /fdisk/i, // fdisk (partition disk)
    /parted/i, // parted (partition disk)
    /chmod\s+777/i, // chmod 777 (security risk)
    /chown\s+-R/i, // chown -R (recursive ownership change)
    /killall/i, // killall (kill all processes)
    /reboot/i, // reboot
    /shutdown/i, // shutdown
    /halt/i, // halt
    /poweroff/i, // poweroff
    /init\s+0/i, // init 0 (shutdown)
    /init\s+6/i, // init 6 (reboot)
    /:\(\)\s*\{\s*:\|\:&\s*\}/i, // Fork bomb
    /eval\s+/i, // eval (code execution risk)
    /exec\s+/i, // exec (code execution risk)
    /sudo/i, // sudo (privilege escalation)
    /su\s+/i, // su (switch user)
  ],

  // Explicitly blocked commands
  blockedCommands: [
    'rm',
    'rmdir',
    'mv',
    'cp', // Allow in future with safeguards
    'touch',
    'mkdir',
    'chmod',
    'chown',
    'chgrp',
    'kill',
    'pkill',
    'killall',
    'reboot',
    'shutdown',
    'halt',
    'poweroff',
    'init',
    'telinit',
    'systemctl',
    'service',
    'dd',
    'mkfs',
    'fdisk',
    'parted',
    'mount',
    'umount',
    'fsck',
    'format',
    'sudo',
    'su',
    'passwd',
    'useradd',
    'userdel',
    'groupadd',
    'groupdel',
    'eval',
    'exec',
  ],
};

/**
 * Validate a command against the whitelist
 *
 * @param command - Full command string to validate
 * @param config - Optional custom whitelist configuration
 * @returns Validation result
 */
export function validateCommand(
  command: string,
  config: WhitelistConfig = DEFAULT_WHITELIST
): ValidationResult {
  const trimmedCommand = command.trim();

  // Empty command
  if (!trimmedCommand) {
    return {
      allowed: false,
      reason: 'Empty command',
    };
  }

  // Extract base command (first word)
  const baseCommand = extractBaseCommand(trimmedCommand);

  // Check blocked commands first
  if (config.blockedCommands.includes(baseCommand.toLowerCase())) {
    return {
      allowed: false,
      reason: `Command '${baseCommand}' is blocked for security reasons`,
    };
  }

  // Check blocked patterns
  for (const pattern of config.blockedPatterns) {
    if (pattern.test(trimmedCommand)) {
      return {
        allowed: false,
        reason: 'Command matches a blocked pattern (dangerous operation)',
      };
    }
  }

  // Check allowed commands (exact match)
  if (config.allowedCommands.includes(baseCommand.toLowerCase())) {
    return {
      allowed: true,
      sanitizedCommand: trimmedCommand,
    };
  }

  // Check allowed prefixes
  for (const prefix of config.allowedPrefixes) {
    if (trimmedCommand.toLowerCase().startsWith(prefix.toLowerCase())) {
      return {
        allowed: true,
        sanitizedCommand: trimmedCommand,
      };
    }
  }

  // Command not in whitelist
  return {
    allowed: false,
    reason: `Command '${baseCommand}' is not in the whitelist`,
  };
}

/**
 * Extract base command from full command string
 *
 * Examples:
 * - "ls -la" -> "ls"
 * - "npm run dev" -> "npm"
 * - "git status" -> "git"
 *
 * @param command - Full command string
 * @returns Base command
 */
function extractBaseCommand(command: string): string {
  const trimmed = command.trim();
  const firstSpace = trimmed.indexOf(' ');

  if (firstSpace === -1) {
    return trimmed; // No arguments, entire string is the command
  }

  return trimmed.substring(0, firstSpace);
}

/**
 * Check if a specific command is allowed
 *
 * @param commandName - Command name to check (e.g., "git", "npm")
 * @returns True if command is allowed
 */
export function isCommandAllowed(commandName: string): boolean {
  const result = validateCommand(commandName);
  return result.allowed;
}

/**
 * Get list of allowed commands
 *
 * @param config - Optional custom whitelist configuration
 * @returns Array of allowed command names
 */
export function getAllowedCommands(config: WhitelistConfig = DEFAULT_WHITELIST): string[] {
  return [...config.allowedCommands, ...config.allowedPrefixes.map((p) => p.trim())];
}

/**
 * Get list of blocked commands
 *
 * @param config - Optional custom whitelist configuration
 * @returns Array of blocked command names
 */
export function getBlockedCommands(config: WhitelistConfig = DEFAULT_WHITELIST): string[] {
  return [...config.blockedCommands];
}

/**
 * Create custom whitelist configuration
 *
 * @param overrides - Partial configuration to override defaults
 * @returns Merged whitelist configuration
 */
export function createWhitelistConfig(overrides: Partial<WhitelistConfig>): WhitelistConfig {
  return {
    allowedCommands: overrides.allowedCommands || DEFAULT_WHITELIST.allowedCommands,
    allowedPrefixes: overrides.allowedPrefixes || DEFAULT_WHITELIST.allowedPrefixes,
    blockedPatterns: overrides.blockedPatterns || DEFAULT_WHITELIST.blockedPatterns,
    blockedCommands: overrides.blockedCommands || DEFAULT_WHITELIST.blockedCommands,
  };
}

/**
 * Sanitize command string
 *
 * Removes potentially dangerous characters and sequences.
 * Note: This is a basic implementation. For production, consider more robust sanitization.
 *
 * @param command - Command string to sanitize
 * @returns Sanitized command
 */
export function sanitizeCommand(command: string): string {
  let sanitized = command.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove command injection attempts (basic)
  // Note: With shell=true in spawn, these are still risky. Whitelist is the primary defense.
  // sanitized = sanitized.replace(/[;&|`$()]/g, '');

  return sanitized;
}

/**
 * Default export: validation function
 */
export default validateCommand;
