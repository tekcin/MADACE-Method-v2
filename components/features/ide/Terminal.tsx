'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  projectPath?: string;
  visible?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function Terminal({
  projectPath = '/Users/nimda/MADACE-Method-v2.0',
  visible = true,
  onHeightChange,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      },
      rows: 20,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;32mMADACE Terminal v3.0\x1b[0m');
    term.writeln('Type "help" for available commands or "clear" to clear screen.');
    term.write('\r\n$ ');

    // Handle key input
    let line = '';
    term.onKey(({ key, domEvent }) => {
      const char = key;
      const ev = domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        // Enter key
        term.write('\r\n');
        if (line.trim()) {
          executeCommand(line.trim(), term);
          setCommandHistory((prev) => [...prev, line.trim()]);
          setHistoryIndex(-1);
        }
        line = '';
      } else if (ev.keyCode === 8) {
        // Backspace
        if (line.length > 0) {
          line = line.substring(0, line.length - 1);
          term.write('\b \b');
        }
      } else if (ev.keyCode === 38) {
        // Up arrow - command history
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          const cmd = commandHistory[newIndex];
          if (cmd) {
            // Clear current line
            term.write('\r\x1b[K$ ');
            term.write(cmd);
            line = cmd;
          }
        }
      } else if (ev.keyCode === 40) {
        // Down arrow - command history
        if (historyIndex !== -1) {
          const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
          setHistoryIndex(newIndex);
          const cmd = commandHistory[newIndex];
          if (cmd) {
            // Clear current line
            term.write('\r\x1b[K$ ');
            term.write(cmd);
            line = cmd;
          }
        }
      } else if (ev.keyCode === 76 && ev.ctrlKey) {
        // Ctrl+L - clear screen
        term.clear();
        term.write('$ ');
        line = '';
      } else if (printable) {
        line += char;
        term.write(char);
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeCommand = async (command: string, term: XTerm) => {
    const trimmedCommand = command.trim();

    // Built-in commands
    if (trimmedCommand === 'clear') {
      term.clear();
      term.write('$ ');
      return;
    }

    if (trimmedCommand === 'help') {
      term.writeln('\r\n\x1b[1;36mAvailable Commands:\x1b[0m');
      term.writeln('  clear          - Clear the terminal screen');
      term.writeln('  help           - Show this help message');
      term.writeln('  ls             - List directory contents');
      term.writeln('  pwd            - Print working directory');
      term.writeln('  cd <dir>       - Change directory');
      term.writeln('  cat <file>     - Display file contents');
      term.writeln('  npm <cmd>      - Run npm commands');
      term.writeln('  git <cmd>      - Run git commands');
      term.writeln('  madace <cmd>   - Run MADACE CLI commands');
      term.writeln('\r\n$ ');
      return;
    }

    // Execute command via API
    try {
      const response = await fetch('/api/v3/terminal/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: trimmedCommand,
          cwd: projectPath,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        term.writeln(`\r\n\x1b[1;31mError: ${error.error || 'Command execution failed'}\x1b[0m`);
        term.write('$ ');
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Write stdout
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          lines.forEach((line: string) => {
            term.writeln(`\r\n${line}`);
          });
        }

        // Write stderr in red
        if (result.stderr) {
          const lines = result.stderr.split('\n');
          lines.forEach((line: string) => {
            term.writeln(`\r\n\x1b[1;31m${line}\x1b[0m`);
          });
        }
      } else {
        term.writeln(`\r\n\x1b[1;31mError: ${result.error}\x1b[0m`);
      }

      term.write('\r\n$ ');
    } catch (error) {
      term.writeln(
        `\r\n\x1b[1;31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`
      );
      term.write('\r\n$ ');
    }
  };

  const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.max(100, Math.min(800, startHeight + delta));
      setHeight(newHeight);
      onHeightChange?.(newHeight);

      // Refit terminal
      if (fitAddonRef.current) {
        setTimeout(() => {
          fitAddonRef.current?.fit();
        }, 0);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!visible) return null;

  return (
    <div className="flex flex-col border-t border-gray-700 bg-[#1e1e1e]" style={{ height }}>
      {/* Resize handle */}
      <div
        className="h-1 cursor-ns-resize bg-gray-700 transition-colors hover:bg-blue-500"
        onMouseDown={handleResize}
      />

      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-300">Terminal</span>
          <span className="text-xs text-gray-500">{projectPath}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="text-xs text-gray-400 hover:text-white"
            onClick={() => {
              if (xtermRef.current) {
                xtermRef.current.clear();
                xtermRef.current.write('$ ');
              }
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal container */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-hidden p-2"
        style={{ backgroundColor: '#1e1e1e' }}
      />
    </div>
  );
}
