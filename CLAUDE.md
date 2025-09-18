# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based task board/project management application built with modern web technologies. It features authentication, a kanban-style board interface, document management, and marketplace functionality.

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6 with nested routes
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with persistent sessions
- **State Management**: React Query (@tanstack/react-query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Theme Support**: next-themes for dark/light mode switching

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development (preserves debugging info)
npm run build:dev

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Project Structure

### Core Application Files
- `src/App.tsx` - Main application component with routing setup and TanStack Query provider
- `src/main.tsx` - Application entry point with React 18 createRoot
- `src/contexts/AuthContext.tsx` - Authentication state management using Supabase
- `src/integrations/supabase/` - Supabase client configuration and TypeScript types
- `src/hooks/useBoardData.ts` - Custom TanStack Query hooks for all data operations

### Page Components
- `src/pages/Dashboard.tsx` - Main dashboard page
- `src/pages/Board.tsx` - Kanban board interface for task management
- `src/pages/Docs.tsx` - Document management system
- `src/pages/Marketplace.tsx` - Marketplace functionality
- `src/pages/About.tsx` - About page
- `src/pages/auth/Auth.tsx` - Authentication forms
- `src/pages/NotFound.tsx` - 404 error page

### Component Architecture
- `src/components/ui/` - Reusable UI components from shadcn/ui
- `src/components/layout/` - Layout components (Navbar, Sidebar, Layout wrapper)
- `src/components/board/` - Board-specific components (TaskCard, BoardColumn, etc.)
- `src/components/ProtectedRoute.tsx` - Route protection wrapper

### Key Features
- **Authentication**: Full auth flow with protected routes using Supabase
- **Responsive Design**: Mobile-first approach with responsive components
- **Theme Support**: Automatic dark/light mode switching
- **Real-time Updates**: Supabase real-time subscriptions for collaborative features
- **Form Validation**: Zod schema validation with React Hook Form integration

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

### Data Management & Caching
- **TanStack Query Integration**: All API interactions use custom hooks with automatic caching
- **Custom Hooks**: Located in `src/hooks/useBoardData.ts` for centralized data management
  - `useProjectContext(projectId)` - Fetches and caches project data with auto-refresh
  - `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()` - CRUD operations with optimistic updates
  - `useCreateColumn()`, `useUpdateColumn()` - Column management with cache invalidation
  - `useMoveTask()` - Task movement with real-time updates
  - `useAIAssistant()` - AI operations with automatic background refresh
- **Automatic Caching**: Data is cached for 30 seconds and auto-refreshes on window focus
- **Smart Invalidation**: Mutations automatically invalidate related cache entries
- **Background Updates**: Data refreshes every 30 seconds without user intervention
- **Optimistic Updates**: UI updates immediately, with rollback on failure
- **Error Handling**: Built-in retry logic with exponential backoff

### Database Interactions
- Import supabase client from `@/integrations/supabase/client`
- Use TanStack Query hooks instead of direct API calls for all data operations
- Follow Supabase RLS (Row Level Security) patterns for data access
- Mock data support: Toggle `USE_MOCK_DATA` in `src/lib/api.ts` for development