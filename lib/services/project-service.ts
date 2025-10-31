/**
 * Project Service
 *
 * CRUD operations for MADACE projects with member management and access control
 */

import { prisma } from '@/lib/database/client';
import type { Project, ProjectMember, User } from '@prisma/client';
import { z } from 'zod';

/**
 * Validation Schemas
 */
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  userId: z.string().min(1, 'User ID is required'), // Creator becomes owner
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export const AddMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['owner', 'admin', 'member']).default('member'),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;

export type ProjectWithMembers = Project & {
  members: Array<ProjectMember & { user: User }>;
  _count: {
    agents: number;
    workflows: number;
    stories: number;
    chatSessions: number;
  };
};

/**
 * Get all projects for a user
 */
export async function getProjects(userId: string): Promise<ProjectWithMembers[]> {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          agents: true,
          workflows: true,
          stories: true,
          chatSessions: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return projects;
}

/**
 * Get a single project by ID (with permission check)
 */
export async function getProject(
  projectId: string,
  userId: string
): Promise<ProjectWithMembers | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          agents: true,
          workflows: true,
          stories: true,
          chatSessions: true,
        },
      },
    },
  });

  return project;
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<ProjectWithMembers> {
  const validated = CreateProjectSchema.parse(input);

  // Ensure user exists
  const user = await prisma.user.findUnique({
    where: { id: validated.userId },
  });

  if (!user) {
    throw new Error(`User not found: ${validated.userId}`);
  }

  // Create project with creator as owner
  const project = await prisma.project.create({
    data: {
      name: validated.name,
      description: validated.description,
      members: {
        create: {
          userId: validated.userId,
          role: 'owner',
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          agents: true,
          workflows: true,
          stories: true,
          chatSessions: true,
        },
      },
    },
  });

  return project;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput
): Promise<ProjectWithMembers> {
  const validated = UpdateProjectSchema.parse(input);

  // Check if user has admin or owner role
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
      role: {
        in: ['owner', 'admin'],
      },
    },
  });

  if (!member) {
    throw new Error('Permission denied: Only owners and admins can update projects');
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: validated,
    include: {
      members: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          agents: true,
          workflows: true,
          stories: true,
          chatSessions: true,
        },
      },
    },
  });

  return project;
}

/**
 * Delete a project (owner only)
 */
export async function deleteProject(projectId: string, userId: string): Promise<void> {
  // Check if user is owner
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
      role: 'owner',
    },
  });

  if (!member) {
    throw new Error('Permission denied: Only owners can delete projects');
  }

  // Cascade delete handled by Prisma schema
  await prisma.project.delete({
    where: { id: projectId },
  });
}

/**
 * Add a member to a project
 */
export async function addProjectMember(
  projectId: string,
  requestingUserId: string,
  input: AddMemberInput
): Promise<ProjectMember> {
  const validated = AddMemberSchema.parse(input);

  // Check if requesting user is owner or admin
  const requestingMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: requestingUserId,
      role: {
        in: ['owner', 'admin'],
      },
    },
  });

  if (!requestingMember) {
    throw new Error('Permission denied: Only owners and admins can add members');
  }

  // Check if user already exists in project
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: validated.userId,
        projectId,
      },
    },
  });

  if (existingMember) {
    throw new Error('User is already a member of this project');
  }

  // Ensure target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: validated.userId },
  });

  if (!targetUser) {
    throw new Error(`User not found: ${validated.userId}`);
  }

  // Add member
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: validated.userId,
      role: validated.role,
    },
  });

  return member;
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(
  projectId: string,
  requestingUserId: string,
  targetUserId: string
): Promise<void> {
  // Check if requesting user is owner or admin
  const requestingMember = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: requestingUserId,
      role: {
        in: ['owner', 'admin'],
      },
    },
  });

  if (!requestingMember) {
    throw new Error('Permission denied: Only owners and admins can remove members');
  }

  // Check if target is the last owner
  if (targetUserId !== requestingUserId) {
    const targetMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: targetUserId,
          projectId,
        },
      },
    });

    if (targetMember?.role === 'owner') {
      const ownerCount = await prisma.projectMember.count({
        where: {
          projectId,
          role: 'owner',
        },
      });

      if (ownerCount === 1) {
        throw new Error('Cannot remove the last owner from the project');
      }
    }
  }

  // Remove member
  await prisma.projectMember.delete({
    where: {
      userId_projectId: {
        userId: targetUserId,
        projectId,
      },
    },
  });
}

/**
 * Get project members
 */
export async function getProjectMembers(
  projectId: string,
  userId: string
): Promise<Array<ProjectMember & { user: User }>> {
  // Check if user is a member
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!member) {
    throw new Error('Permission denied: You are not a member of this project');
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  });

  return members;
}

/**
 * Check if user has specific role in project
 */
export async function hasProjectRole(
  projectId: string,
  userId: string,
  requiredRoles: Array<'owner' | 'admin' | 'member'>
): Promise<boolean> {
  const member = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId,
      role: {
        in: requiredRoles,
      },
    },
  });

  return !!member;
}

/**
 * Get user's role in project
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string
): Promise<'owner' | 'admin' | 'member' | null> {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  return member?.role as 'owner' | 'admin' | 'member' | null;
}
