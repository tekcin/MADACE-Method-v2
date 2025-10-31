# Project Management Architecture

## Overview

Enable users to create, load, and switch between multiple MADACE projects. Each project has isolated workflows, stories, agents, and chat sessions.

## Database Schema (Already Exists!)

The Project model is already defined in `prisma/schema.prisma`:

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  agents       Agent[]
  workflows    Workflow[]
  configs      Config[]
  stories      StateMachine[]
  chatSessions ChatSession[]
  members      ProjectMember[]
}
```

### Relationships

- **Agent** → projectId (optional, null = global)
- **Workflow** → projectId (required)
- **Config** → projectId (optional)
- **StateMachine** → projectId (required)
- **ChatSession** → projectId (optional)
- **ProjectMember** → userId + projectId (access control)

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Navigation Bar                        │
│  [MADACE Logo] [Current: "Zodiac App" ▼] [Settings]    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Project Context Provider                    │
│  - currentProject: Project | null                       │
│  - projects: Project[]                                  │
│  - switchProject(id)                                     │
│  - createProject(data)                                   │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌─────────┐
    │ Agents  │    │ Workflows│    │  Chat   │
    │ (scoped)│    │ (scoped) │    │(scoped) │
    └─────────┘    └──────────┘    └─────────┘
```

## API Routes

### `/api/v3/projects`

```typescript
// GET - List all projects for current user
// POST - Create new project
```

### `/api/v3/projects/[id]`

```typescript
// GET - Get project details
// PUT - Update project
// DELETE - Delete project (cascade delete all related data)
```

### `/api/v3/projects/[id]/members`

```typescript
// GET - List project members
// POST - Add member
// DELETE - Remove member
```

## Service Layer

### `/lib/services/project-service.ts`

```typescript
export async function getProjects(userId: string): Promise<Project[]>;
export async function createProject(data: CreateProjectInput): Promise<Project>;
export async function getProject(id: string): Promise<Project | null>;
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project>;
export async function deleteProject(id: string): Promise<void>;
export async function switchProject(projectId: string): Promise<void>;
```

## UI Components

### 1. Project Selector (Navigation Bar)

- **Location**: `components/features/ProjectSelector.tsx`
- **Functionality**:
  - Dropdown showing current project
  - List of all user's projects
  - "Create New Project" button
  - Recent projects (quick switch)

### 2. Project Creation Modal

- **Location**: `components/features/ProjectModal.tsx`
- **Fields**:
  - Project Name (required)
  - Description (optional)
  - Template (optional: blank, web app, mobile app, etc.)

### 3. Project Context Provider

- **Location**: `lib/context/ProjectContext.tsx`
- **State**:
  ```typescript
  {
    currentProject: Project | null;
    projects: Project[];
    isLoading: boolean;
    switchProject: (id: string) => Promise<void>;
    createProject: (data) => Promise<Project>;
    updateProject: (id, data) => Promise<Project>;
    deleteProject: (id) => Promise<void>;
  }
  ```

## User Experience Flow

### First-Time User

1. Lands on welcome page
2. Prompted to create first project
3. Fills project details
4. Redirected to project dashboard

### Returning User

1. Last project auto-loaded
2. Can switch projects via dropdown
3. Create new project via "+" button

### Project Switching

1. Click project dropdown in nav
2. Select different project
3. All pages auto-refresh with new project scope
4. URL updates: `/dashboard?project=abc123`

## Data Migration Strategy

### Current State

- No projects exist
- All existing data (agents, workflows) have `projectId = null`

### Migration Plan

1. Create default "My First Project"
2. Associate all existing null-projectId data with default project
3. Future data requires projectId

```sql
-- Migration script
INSERT INTO Project (id, name, description)
VALUES ('default-project', 'My First Project', 'Default MADACE project');

UPDATE Agent SET projectId = 'default-project' WHERE projectId IS NULL;
UPDATE Workflow SET projectId = 'default-project' WHERE projectId IS NULL;
UPDATE StateMachine SET projectId = 'default-project' WHERE projectId IS NULL;
```

## Security & Permissions

### Project Roles (ProjectMember.role)

- **owner**: Full control (delete project, manage members)
- **admin**: Edit project, manage workflows, invite members
- **member**: View and create content

### Access Control

- User can only see projects they're a member of
- Project data is isolated (enforced via Prisma queries)
- Cascade delete when project deleted

## Phase 1 Implementation (MVP)

✅ Phase 1a: Database & Services

- [x] Prisma schema (already exists!)
- [ ] Project service layer
- [ ] API routes (CRUD)
- [ ] Migration script

✅ Phase 1b: UI Components

- [ ] Project context provider
- [ ] Project selector dropdown (nav bar)
- [ ] Create project modal
- [ ] Update existing pages to use project context

✅ Phase 1c: Integration

- [ ] Scope agents by project
- [ ] Scope workflows by project
- [ ] Scope chat sessions by project
- [ ] URL state management (`?project=id`)

## Future Enhancements

- **Project Templates**: Pre-configured setups (web, mobile, game)
- **Project Import/Export**: Share configurations
- **Project Archiving**: Soft delete
- **Project Analytics**: Usage stats, progress tracking
- **Team Collaboration**: Real-time presence, comments
- **Project Duplication**: Clone entire projects

## Testing Strategy

### Unit Tests

- Project service CRUD operations
- Access control logic
- Project switching logic

### Integration Tests

- Create project → add agents → verify isolation
- Switch projects → verify correct data loaded
- Delete project → verify cascade delete

### E2E Tests

- User creates new project
- User switches between projects
- User deletes project

## Success Metrics

- Users can create projects in < 30 seconds
- Project switching is instant (< 500ms)
- Zero data leakage between projects
- 100% test coverage for project service
