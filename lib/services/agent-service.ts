/**
 * Agent Service Layer
 *
 * Business logic for managing agents in the database.
 * All agent operations should go through this service layer.
 */

import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma, DatabaseError, handlePrismaError } from '@/lib/database';

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Schema for agent metadata
 */
export const AgentMetadataSchema = z.object({
  name: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  module: z.enum(['mam', 'mab', 'cis', 'core']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});

/**
 * Schema for creating a new agent
 */
export const CreateAgentSchema = z.object({
  name: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  icon: z.string().min(1).max(10),
  module: z.enum(['mam', 'mab', 'cis', 'core']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  persona: z.object({
    role: z.string(),
    identity: z.string().optional(),
    communication_style: z.string().optional(),
    principles: z.array(z.string()).optional(),
  }),
  menu: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      action: z.string(),
    })
  ),
  prompts: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      prompt: z.string(),
      type: z.enum(['system', 'user', 'assistant']).optional(),
    })
  ),
  createdBy: z.string().optional(),
  projectId: z.string().optional(),
});

/**
 * Schema for updating an existing agent (all fields optional except validation)
 */
export const UpdateAgentSchema = CreateAgentSchema.partial();

/**
 * Schema for searching agents
 */
export const SearchAgentsSchema = z.object({
  query: z.string().min(1),
  module: z.enum(['mam', 'mab', 'cis', 'core']).optional(),
  projectId: z.string().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type SearchAgentsInput = z.infer<typeof SearchAgentsSchema>;

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Create a new agent in the database
 *
 * @param data - Agent creation data
 * @returns Created agent with ID
 * @throws DatabaseError if validation fails or database operation fails
 */
export async function createAgent(data: CreateAgentInput) {
  try {
    // Validate input
    const validated = CreateAgentSchema.parse(data);

    // Create agent in database
    const agent = await prisma.agent.create({
      data: {
        name: validated.name,
        title: validated.title,
        icon: validated.icon,
        module: validated.module,
        version: validated.version,
        persona: validated.persona as Prisma.InputJsonValue,
        menu: validated.menu as Prisma.InputJsonValue,
        prompts: validated.prompts as Prisma.InputJsonValue,
        createdBy: validated.createdBy,
        projectId: validated.projectId,
      },
    });

    return agent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DatabaseError(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        error,
        'createAgent'
      );
    }
    throw handlePrismaError(error, 'createAgent');
  }
}

/**
 * Get a single agent by ID
 *
 * @param id - Agent ID
 * @returns Agent or null if not found
 * @throws DatabaseError if database operation fails
 */
export async function getAgent(id: string) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        memories: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return agent;
  } catch (error) {
    throw handlePrismaError(error, 'getAgent');
  }
}

/**
 * Get a single agent by name
 *
 * @param name - Agent name
 * @returns Agent or null if not found
 * @throws DatabaseError if database operation fails
 */
export async function getAgentByName(name: string) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { name },
      include: {
        memories: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return agent;
  } catch (error) {
    throw handlePrismaError(error, 'getAgentByName');
  }
}

/**
 * List all agents with optional filtering
 *
 * @param options - Filter options
 * @returns Array of agents
 * @throws DatabaseError if database operation fails
 */
export async function listAgents(options?: {
  projectId?: string;
  module?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: Prisma.AgentWhereInput = {};

    if (options?.projectId) {
      where.projectId = options.projectId;
    }

    if (options?.module) {
      where.module = options.module;
    }

    const agents = await prisma.agent.findMany({
      where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            memories: true,
          },
        },
      },
    });

    return agents;
  } catch (error) {
    throw handlePrismaError(error, 'listAgents');
  }
}

/**
 * Update an existing agent
 *
 * @param id - Agent ID
 * @param data - Fields to update
 * @returns Updated agent
 * @throws DatabaseError if validation fails, agent not found, or database operation fails
 */
export async function updateAgent(id: string, data: UpdateAgentInput) {
  try {
    // Validate input
    const validated = UpdateAgentSchema.parse(data);

    // Convert JSON fields to Prisma format
    const updateData: Prisma.AgentUpdateInput = {};

    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.icon !== undefined) updateData.icon = validated.icon;
    if (validated.module !== undefined) updateData.module = validated.module;
    if (validated.version !== undefined) updateData.version = validated.version;
    if (validated.persona !== undefined)
      updateData.persona = validated.persona as Prisma.InputJsonValue;
    if (validated.menu !== undefined) updateData.menu = validated.menu as Prisma.InputJsonValue;
    if (validated.prompts !== undefined)
      updateData.prompts = validated.prompts as Prisma.InputJsonValue;
    if (validated.createdBy !== undefined) updateData.createdBy = validated.createdBy;
    if (validated.projectId !== undefined)
      updateData.project = { connect: { id: validated.projectId } };

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData,
    });

    return agent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DatabaseError(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        error,
        'updateAgent'
      );
    }
    throw handlePrismaError(error, 'updateAgent');
  }
}

/**
 * Delete an agent by ID
 *
 * @param id - Agent ID
 * @returns Deleted agent
 * @throws DatabaseError if agent not found or database operation fails
 */
export async function deleteAgent(id: string) {
  try {
    const agent = await prisma.agent.delete({
      where: { id },
    });

    return agent;
  } catch (error) {
    throw handlePrismaError(error, 'deleteAgent');
  }
}

/**
 * Search agents by name, title, or module
 *
 * @param params - Search parameters
 * @returns Array of matching agents
 * @throws DatabaseError if validation fails or database operation fails
 */
export async function searchAgents(params: SearchAgentsInput) {
  try {
    // Validate input
    const validated = SearchAgentsSchema.parse(params);

    const where: Prisma.AgentWhereInput = {
      OR: [{ name: { contains: validated.query } }, { title: { contains: validated.query } }],
    };

    if (validated.module) {
      where.module = validated.module;
    }

    if (validated.projectId) {
      where.projectId = validated.projectId;
    }

    const agents = await prisma.agent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            memories: true,
          },
        },
      },
    });

    return agents;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DatabaseError(
        `Validation failed: ${error.issues.map((e) => e.message).join(', ')}`,
        error,
        'searchAgents'
      );
    }
    throw handlePrismaError(error, 'searchAgents');
  }
}

/**
 * Get agent count by module
 *
 * @returns Object with count per module
 * @throws DatabaseError if database operation fails
 */
export async function getAgentCountByModule(): Promise<Record<string, number>> {
  try {
    const counts = await prisma.agent.groupBy({
      by: ['module'],
      _count: true,
    });

    return counts.reduce(
      (acc, { module, _count }) => {
        acc[module] = _count;
        return acc;
      },
      {} as Record<string, number>
    );
  } catch (error) {
    throw handlePrismaError(error, 'getAgentCountByModule');
  }
}

/**
 * Duplicate an existing agent with a new name
 *
 * @param id - Source agent ID
 * @param newName - New agent name
 * @returns Created agent
 * @throws DatabaseError if source agent not found or database operation fails
 */
export async function duplicateAgent(id: string, newName: string) {
  try {
    // Get source agent
    const sourceAgent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!sourceAgent) {
      throw new DatabaseError(`Agent with ID ${id} not found`, undefined, 'duplicateAgent');
    }

    // Create duplicate
    const duplicate = await prisma.agent.create({
      data: {
        name: newName,
        title: `${sourceAgent.title} (Copy)`,
        icon: sourceAgent.icon,
        module: sourceAgent.module,
        version: sourceAgent.version,
        persona: sourceAgent.persona as Prisma.InputJsonValue,
        menu: sourceAgent.menu as Prisma.InputJsonValue,
        prompts: sourceAgent.prompts as Prisma.InputJsonValue,
        createdBy: sourceAgent.createdBy,
        projectId: sourceAgent.projectId,
      },
    });

    return duplicate;
  } catch (error) {
    throw handlePrismaError(error, 'duplicateAgent');
  }
}

/**
 * Export agent as JSON
 *
 * @param id - Agent ID
 * @returns Agent data as JSON-serializable object
 * @throws DatabaseError if agent not found or database operation fails
 */
export async function exportAgent(id: string) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new DatabaseError(`Agent with ID ${id} not found`, undefined, 'exportAgent');
    }

    // Return JSON-serializable format
    return {
      name: agent.name,
      title: agent.title,
      icon: agent.icon,
      module: agent.module,
      version: agent.version,
      persona: agent.persona as Record<string, unknown>,
      menu: agent.menu as Record<string, unknown>[],
      prompts: agent.prompts as Record<string, unknown>[],
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw handlePrismaError(error, 'exportAgent');
  }
}

/**
 * Import agent from JSON
 *
 * @param data - Agent JSON data
 * @param projectId - Optional project ID to associate with
 * @returns Created agent
 * @throws DatabaseError if validation fails or database operation fails
 */
export async function importAgent(data: unknown, projectId?: string) {
  try {
    // Validate and parse JSON data
    const agentData = CreateAgentSchema.parse(data);

    // Create agent
    return await createAgent({
      ...agentData,
      projectId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DatabaseError(
        `Invalid agent JSON format: ${error.issues.map((e) => e.message).join(', ')}`,
        error,
        'importAgent'
      );
    }
    throw handlePrismaError(error, 'importAgent');
  }
}
