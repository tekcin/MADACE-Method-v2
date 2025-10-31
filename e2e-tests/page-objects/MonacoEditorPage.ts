/**
 * Page Object Model for Monaco Editor
 *
 * Strict TypeScript implementation for Monaco editor interactions
 */

import { Page, Locator } from '@playwright/test';

export interface EditorPosition {
  lineNumber: number;
  column: number;
}

export interface EditorSelection {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface EditorConfig {
  language?: string;
  theme?: 'vs-dark' | 'vs-light';
  readOnly?: boolean;
}

export class MonacoEditorPage {
  readonly page: Page;
  private readonly editorContainer: Locator;
  private readonly editorTextarea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editorContainer = page.locator('.monaco-editor');
    this.editorTextarea = page.locator('.monaco-editor textarea');
  }

  /**
   * Wait for Monaco editor to load
   */
  async waitForLoad(): Promise<void> {
    await this.editorContainer.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForFunction(
      () => {
        return window.monaco !== undefined;
      },
      { timeout: 10000 }
    );
  }

  /**
   * Get editor content
   */
  async getContent(): Promise<string> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      return editor.getValue();
    });
  }

  /**
   * Set editor content
   */
  async setContent(content: string): Promise<void> {
    await this.page.evaluate((text) => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      editor.setValue(text);
    }, content);
    await this.page.waitForTimeout(300);
  }

  /**
   * Type text into editor
   */
  async type(text: string): Promise<void> {
    await this.editorTextarea.focus();
    await this.page.keyboard.type(text);
    await this.page.waitForTimeout(100);
  }

  /**
   * Insert text at specific position
   */
  async insertAt(position: EditorPosition, text: string): Promise<void> {
    await this.setCursorPosition(position);
    await this.type(text);
  }

  /**
   * Get cursor position
   */
  async getCursorPosition(): Promise<EditorPosition> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      const position = editor.getPosition();
      return {
        lineNumber: position.lineNumber,
        column: position.column,
      };
    });
  }

  /**
   * Set cursor position
   */
  async setCursorPosition(position: EditorPosition): Promise<void> {
    await this.page.evaluate((pos) => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      editor.setPosition(pos);
    }, position);
  }

  /**
   * Get line count
   */
  async getLineCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      return editor.getLineCount();
    });
  }

  /**
   * Get line content
   */
  async getLine(lineNumber: number): Promise<string> {
    return await this.page.evaluate((line) => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      return editor.getLineContent(line);
    }, lineNumber);
  }

  /**
   * Select text
   */
  async select(selection: EditorSelection): Promise<void> {
    await this.page.evaluate((sel) => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      editor.setSelection(sel);
    }, selection);
  }

  /**
   * Select all text
   */
  async selectAll(): Promise<void> {
    await this.editorTextarea.focus();
    await this.page.keyboard.press('Control+A');
  }

  /**
   * Copy selection to clipboard
   */
  async copy(): Promise<void> {
    await this.page.keyboard.press('Control+C');
    await this.page.waitForTimeout(100);
  }

  /**
   * Cut selection to clipboard
   */
  async cut(): Promise<void> {
    await this.page.keyboard.press('Control+X');
    await this.page.waitForTimeout(100);
  }

  /**
   * Paste from clipboard
   */
  async paste(): Promise<void> {
    await this.page.keyboard.press('Control+V');
    await this.page.waitForTimeout(100);
  }

  /**
   * Undo last action
   */
  async undo(): Promise<void> {
    await this.page.keyboard.press('Control+Z');
    await this.page.waitForTimeout(100);
  }

  /**
   * Redo last undone action
   */
  async redo(): Promise<void> {
    await this.page.keyboard.press('Control+Shift+Z');
    await this.page.waitForTimeout(100);
  }

  /**
   * Find text in editor
   */
  async find(searchText: string): Promise<void> {
    await this.page.keyboard.press('Control+F');
    await this.page.waitForTimeout(200);
    await this.page.keyboard.type(searchText);
  }

  /**
   * Replace text in editor
   */
  async replace(searchText: string, replaceText: string): Promise<void> {
    await this.page.keyboard.press('Control+H');
    await this.page.waitForTimeout(200);
    await this.page.keyboard.type(searchText);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.type(replaceText);
  }

  /**
   * Go to line
   */
  async gotoLine(lineNumber: number): Promise<void> {
    await this.page.keyboard.press('Control+G');
    await this.page.waitForTimeout(200);
    await this.page.keyboard.type(lineNumber.toString());
    await this.page.keyboard.press('Enter');
  }

  /**
   * Format document
   */
  async format(): Promise<void> {
    await this.page.keyboard.press('Shift+Alt+F');
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if editor has focus
   */
  async isFocused(): Promise<boolean> {
    return await this.editorTextarea.evaluate((el) => {
      return document.activeElement === el;
    });
  }

  /**
   * Focus editor
   */
  async focus(): Promise<void> {
    await this.editorTextarea.focus();
    await this.page.waitForTimeout(100);
  }

  /**
   * Get editor language
   */
  async getLanguage(): Promise<string> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      return editor.getLanguageId();
    });
  }

  /**
   * Set editor language
   */
  async setLanguage(language: string): Promise<void> {
    await this.page.evaluate((lang) => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      window.monaco.editor.setModelLanguage(editor, lang);
    }, language);
  }

  /**
   * Check if editor is read-only
   */
  async isReadOnly(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      return editor.getOptions().get(window.monaco.editor.EditorOption.readOnly);
    });
  }

  /**
   * Get selection text
   */
  async getSelection(): Promise<string> {
    return await this.page.evaluate(() => {
      const editor = (window as any).monaco?.editor?.getModels()[0];
      if (!editor) throw new Error('Monaco editor not found');
      const selection = editor.getSelection();
      return editor.getValueInRange(selection);
    });
  }

  /**
   * Clear editor content
   */
  async clear(): Promise<void> {
    await this.selectAll();
    await this.page.keyboard.press('Delete');
    await this.page.waitForTimeout(100);
  }

  /**
   * Check if editor is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      await this.editorContainer.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
}
