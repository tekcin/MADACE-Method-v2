/**
 * File API Endpoints
 *
 * GET /api/v3/files/[...path] - Read file content
 * PUT /api/v3/files/[...path] - Write file content
 * POST /api/v3/files/[...path] - List directory contents
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  readFile,
  writeFile,
  listFiles,
  fileExists,
  detectLanguage,
} from '@/lib/services/file-service';

/**
 * GET /api/v3/files/[...path]
 * Read file content
 *
 * Returns:
 * - 200: { success: true, content: string, language: string }
 * - 404: { success: false, error: 'File not found' }
 * - 403: { success: false, error: 'Access denied' }
 * - 500: { success: false, error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');

    // Check if file exists
    if (!fileExists(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file content
    const content = await readFile(filePath);

    // Detect language from file extension
    const fileName = path[path.length - 1] || '';
    const language = detectLanguage(fileName);

    return NextResponse.json({
      success: true,
      content,
      language,
      path: filePath,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Path traversal or access denied
      if (error.message.includes('Access denied')) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Path traversal detected' },
          { status: 403 }
        );
      }

      // File not found
      if (error.message.includes('File not found')) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }

      // Other errors
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v3/files/[...path]
 * Write file content
 *
 * Body: { content: string }
 *
 * Returns:
 * - 200: { success: true, path: string }
 * - 400: { success: false, error: 'Missing content' }
 * - 403: { success: false, error: 'Access denied' }
 * - 500: { success: false, error: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join('/');

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid content field' },
        { status: 400 }
      );
    }

    // Write file content
    await writeFile(filePath, content);

    return NextResponse.json({
      success: true,
      path: filePath,
      message: 'File saved successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      // Path traversal or access denied
      if (error.message.includes('Access denied')) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Path traversal detected' },
          { status: 403 }
        );
      }

      // Other errors
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v3/files/[...path]
 * List directory contents
 *
 * Returns:
 * - 200: { success: true, files: string[] }
 * - 404: { success: false, error: 'Directory not found' }
 * - 403: { success: false, error: 'Access denied' }
 * - 500: { success: false, error: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const dirPath = path.join('/');

    // List directory contents
    const files = await listFiles(dirPath);

    return NextResponse.json({
      success: true,
      files,
      path: dirPath,
    });
  } catch (error) {
    if (error instanceof Error) {
      // Path traversal or access denied
      if (error.message.includes('Access denied')) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Path traversal detected' },
          { status: 403 }
        );
      }

      // Directory not found
      if (error.message.includes('Directory not found')) {
        return NextResponse.json(
          { success: false, error: 'Directory not found' },
          { status: 404 }
        );
      }

      // Other errors
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
