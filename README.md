# Doc Agent Board

A modern task management and document collaboration platform with Electron desktop support and real-time AI integration.

## Architecture

**Frontend**: React 18 + TypeScript + Vite
**Backend**: Express + TypeScript with Claude AI integration
**Database**: Supabase (PostgreSQL) + MongoDB
**Desktop**: Electron app
**Authentication**: Supabase Auth

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

## Features

- **Kanban-style task boards** with TanStack Query caching
- **Real-time collaboration** with automatic background updates
- **Document management** system
- **Authentication & protected routes** with Supabase
- **Dark/light theme switching** with next-themes
- **Desktop application** via Electron
- **AI integration** via backend API with optimistic updates
- **Smart caching** with 30-second refresh intervals
- **Optimistic UI updates** with automatic error recovery
- **Background data synchronization** without user intervention

## Data Management Architecture

The application uses a sophisticated caching strategy powered by TanStack Query:

- **Custom Hooks**: All data operations use centralized hooks in `src/hooks/useBoardData.ts`
- **Automatic Caching**: Data cached for 30 seconds with background refresh
- **Smart Invalidation**: Related data updates when mutations occur
- **Optimistic Updates**: UI responds immediately, rolls back on failure
- **Error Recovery**: Built-in retry logic with exponential backoff
- **Real-time Sync**: Combines manual refresh with automatic updates
