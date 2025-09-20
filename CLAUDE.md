# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Doc Agent Board** is a sophisticated React-based task management and document collaboration platform with comprehensive organizational features. The application combines kanban-style boards, real-time AI integration, and multi-tenant organization management with both web and desktop support via Electron.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6 with nested routes
- **Database**: Dual database architecture (Supabase PostgreSQL + MongoDB)
- **Authentication**: Supabase Auth with persistent sessions
- **State Management**: TanStack Query for server state with optimistic updates
- **Form Handling**: React Hook Form with Zod validation
- **Theme Support**: next-themes for dark/light mode switching
- **Desktop**: Electron for cross-platform desktop application
- **Backend**: Express + TypeScript with Claude AI integration
- **Real-time**: WebSockets + Supabase subscriptions + auto-refresh

## Development Commands

```bash
# Frontend development server (port 8080)
npm run dev

# Full-stack development (frontend + backend)
npm run dev:full

# Desktop application development
npm run electron:dev

# Production builds
npm run build                # Web build
npm run build:dev           # Development build with debug info
npm run electron:pack       # Desktop package
npm run electron:dist       # Desktop distribution

# Backend operations
npm run server:dev          # Backend development
npm run server:build        # Backend build
npm run server:start        # Backend production

# Quality assurance
npm run lint                # ESLint check
npm run preview            # Preview production build
```

## Application Architecture & Flow

### Multi-Tenant Organization System
The application follows a hierarchical structure:
**User → Organization → Projects → Boards → Tasks**

1. **Authentication Layer** (`src/contexts/AuthContext.tsx`)
   - Supabase authentication with session persistence
   - Automatic cache invalidation on auth state changes
   - Prefetches user organizations on login

2. **Organization Management** (`src/contexts/OrganizationContext.tsx`)
   - Multi-tenant organization support with context switching
   - Global organization switching state prevents query race conditions
   - Automatic organization creation for new users
   - LocalStorage persistence for selected organization

3. **Data Management Layer** (`src/hooks/useBoardData.ts`)
   - Centralized TanStack Query hooks with intelligent caching
   - Optimistic updates with automatic rollback on failure
   - 30-second cache intervals with background refresh
   - Smart cache invalidation during organization switches

### Application Flow

1. **Initialization**: `src/main.tsx` → `src/App.tsx`
   - React 18 concurrent mode with createRoot
   - Provider hierarchy: QueryClient → Theme → Auth → Organization → Router

2. **Route Structure** (React Router v6):
   ```
   /auth → Auth.tsx (public)
   / → Layout → Dashboard (protected)
   /projects/:projectId/board → Board.tsx (protected)
   /docs → Docs.tsx (protected)
   /marketplace → Marketplace.tsx (protected)
   /about → About.tsx (protected)
   ```

3. **Protected Routes**: All main routes wrapped in `ProtectedRoute.tsx`
   - Automatic redirect to `/auth` if not authenticated
   - Organization verification and setup

### Component Architecture

#### Core Application Structure
- `src/App.tsx` - Provider setup and routing configuration
- `src/main.tsx` - React 18 application entry point
- `src/components/layout/Layout.tsx` - Main layout with Navbar + FloatingBottomBar

#### Context Providers
- `src/contexts/AuthContext.tsx` - User authentication and session management
- `src/contexts/OrganizationContext.tsx` - Organization switching and management
- Custom hooks: `src/hooks/useAuth.ts`, `src/hooks/useOrganization.ts`

#### Pages and Views
- `src/pages/Dashboard.tsx` - Organization overview with welcome flow
- `src/pages/Board.tsx` - Kanban board interface with project selection
- `src/pages/auth/Auth.tsx` - Authentication forms (login/signup)
- Additional pages: Docs, Marketplace, About, NotFound

#### Specialized Components
- `src/components/ui/` - shadcn/ui design system components
- `src/components/board/` - Board-specific components:
  - `BoardColumn.tsx` - Draggable columns with task lists
  - `TaskCard.tsx` - Individual task cards with editing
  - `BoardHeader.tsx` - Project header with controls
  - `FloatingActionBubble.tsx` - AI assistant integration
- `src/components/OrganizationSelector.tsx` - Organization switching interface
- `src/components/floatingBar/` - Bottom navigation with project context

### Core Features & Capabilities

- **Multi-tenant Organizations**: Complete organization management with switching
- **Project-based Boards**: Kanban-style task management per project
- **Real-time Collaboration**: WebSocket + Supabase subscriptions + auto-refresh
- **AI Integration**: Claude AI assistant for task creation and management
- **Authentication**: Full Supabase auth flow with protected routes
- **Responsive Design**: Mobile-first with adaptive layouts
- **Theme Support**: Automatic dark/light mode switching
- **Desktop App**: Cross-platform Electron application
- **Smart Caching**: TanStack Query with optimistic updates and background sync
- **Form Validation**: Zod schema validation with React Hook Form

## Important Configuration

### Path Aliases
- `@/` resolves to `src/` directory (configured in vite.config.ts and tsconfig.json)

### Environment Variables
- Supabase configuration is embedded in the client but should use environment variables for different environments

### Database Schema
- Database types are auto-generated in `src/integrations/supabase/types.ts`
- Supabase migrations are stored in `supabase/migrations/`

## Development Guidelines

### Component Creation
- Follow the existing shadcn/ui pattern for new UI components
- Use TypeScript interfaces for all props and state
- Implement responsive design using Tailwind CSS breakpoints
- Use TanStack Query hooks from `@/hooks/useBoardData.ts` for all server state management
- Avoid manual loading states, error handling, or useEffect for data fetching

### Authentication Flow
- All protected pages are wrapped with `ProtectedRoute` component
- Authentication state is managed through `AuthContext`
- Supabase handles session persistence automatically

### Styling Conventions
- Use Tailwind CSS utility classes
- Follow the shadcn/ui component patterns for consistency
- Utilize CSS variables defined in `src/index.css` for theme support

### Advanced Data Management & Caching Strategy

The application implements a sophisticated caching architecture centered around `src/hooks/useBoardData.ts`:

#### Query Hooks & Cache Management
- **`useProjectContext(projectId)`** - Main project data hook with 30s refresh intervals
- **`useUserOrganizations()`** - Organization list with 5-minute cache
- **`useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`** - Task CRUD with optimistic updates
- **`useCreateColumn()`, `useUpdateColumn()`, `useDeleteColumn()`** - Column management
- **`useMoveTask()`** - Drag-and-drop with immediate UI feedback
- **`useAIAssistant()`** - AI operations with background data refresh
- **`useEnsureUserOrganization()`** - First-time user organization setup

#### Cache Coordination & Race Condition Prevention
- **Organization Switching**: Global `isOrgSwitching` state blocks queries during transitions
- **Query Cancellation**: Automatic cancellation of stale requests during org switches
- **Cache Invalidation**: Strategic invalidation of organization-specific data
- **Optimistic Updates**: UI responds immediately with automatic rollback on failure
- **Background Sync**: 30-second intervals + window focus refresh
- **Error Handling**: Exponential backoff retry with 403/404 handling

### Database Interactions
- Import supabase client from `@/integrations/supabase/client`
- Use TanStack Query hooks instead of direct API calls for all data operations
- Follow Supabase RLS (Row Level Security) patterns for data access
- Mock data support: Toggle `USE_MOCK_DATA` in `src/lib/api.ts` for development