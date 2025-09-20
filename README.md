# Doc Agent Board

A sophisticated multi-tenant task management and document collaboration platform featuring real-time AI integration, organizational management, and cross-platform desktop support.

## Architecture Overview

**Frontend**: React 18 + TypeScript + Vite with SWC
**Backend**: Express + TypeScript with Claude AI integration
**Database**: Dual architecture (Supabase PostgreSQL + MongoDB)
**Desktop**: Electron for cross-platform applications
**Authentication**: Supabase Auth with persistent sessions
**Real-time**: WebSockets + Supabase subscriptions + TanStack Query auto-refresh

## Key Technologies

- **UI Framework**: shadcn/ui components on Radix primitives
- **Styling**: Tailwind CSS with next-themes
- **State Management**: TanStack Query with custom hooks + React Hook Form
- **Data Caching**: Automatic caching with smart invalidation and background updates
- **Real-time**: WebSockets + Supabase subscriptions + TanStack Query auto-refresh
- **Validation**: Zod schemas
- **Build**: Vite with SWC

## Development

```bash
# Install dependencies
npm install

# Frontend only (port 8080)
npm run dev

# Full stack (frontend + backend)
npm run dev:full

# Desktop app development
npm run electron:dev
```

## Build & Deploy

```bash
# Web build
npm run build

# Desktop builds
npm run electron:pack    # Package
npm run electron:dist    # Distribute

# Server
npm run server:build
npm run server:start
```

## Core Features

- **🏢 Multi-tenant Organizations** - Complete organization management with seamless switching
- **📋 Project-based Kanban Boards** - Advanced task management with drag-and-drop
- **🤖 AI Integration** - Claude AI assistant for intelligent task creation and management
- **⚡ Real-time Collaboration** - Live updates with WebSockets and Supabase subscriptions
- **📱 Responsive Design** - Mobile-first approach with adaptive layouts
- **🖥️ Desktop Application** - Cross-platform Electron app (Windows, macOS, Linux)
- **🔐 Secure Authentication** - Supabase auth with protected routes and persistent sessions
- **🎨 Theme Support** - Dark/light mode with automatic system detection
- **⚡ Smart Caching** - TanStack Query with optimistic updates and background sync
- **📄 Document Management** - Integrated document collaboration system

## Application Flow & Architecture

### Multi-Tenant Structure
The application follows a hierarchical organization model:
**User → Organization → Projects → Boards → Tasks**

### Key Architectural Components

1. **Authentication Layer** - Supabase auth with automatic session management
2. **Organization Context** - Multi-tenant support with seamless switching
3. **Data Management** - TanStack Query with sophisticated caching strategy
4. **Real-time Updates** - Background sync with optimistic UI updates

### Advanced Caching Strategy

- **Centralized Hooks** - All data operations through `src/hooks/useBoardData.ts`
- **30-Second Refresh** - Automatic background data synchronization
- **Optimistic Updates** - Immediate UI response with automatic rollback
- **Smart Invalidation** - Strategic cache clearing during organization switches
- **Race Condition Prevention** - Global switching states and query cancellation
- **Error Handling** - Exponential backoff retry with 403/404 handling

### Component Architecture

- **Context Providers** - Auth and Organization management
- **Protected Routes** - Automatic authentication verification
- **Responsive Layout** - Mobile-first design with adaptive components
- **shadcn/ui Integration** - Consistent design system with Radix primitives
