import { NextRequest, NextResponse } from 'next/server';
import { getGitStatus, isGitRepository, getGitBranch } from '@/lib/services/git-service';

/**
 * GET /api/v3/git/status
 *
 * Get Git status for the project
 *
 * Query parameters:
 * - projectRoot (optional): Path to project root (defaults to process.cwd())
 *
 * Returns:
 * {
 *   success: true,
 *   data: {
 *     isGitRepo: boolean,
 *     branch: string | null,
 *     files: GitFileStatus[],
 *     statusMap: { [path: string]: string }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectRoot = searchParams.get('projectRoot') || undefined;

    // Check if this is a Git repository
    const isGitRepo = await isGitRepository(projectRoot);

    if (!isGitRepo) {
      return NextResponse.json({
        success: true,
        data: {
          isGitRepo: false,
          branch: null,
          files: [],
          statusMap: {},
        },
      });
    }

    // Get Git status
    const { files, statusMap } = await getGitStatus(projectRoot);

    // Get current branch
    const branch = await getGitBranch(projectRoot);

    return NextResponse.json({
      success: true,
      data: {
        isGitRepo: true,
        branch,
        files,
        statusMap,
      },
    });
  } catch (error) {
    console.error('Git status API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get Git status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
