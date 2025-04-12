
# Architecture Documentation

## Overview

ProfitWise AI is built using a modern full-stack architecture with TypeScript throughout the entire stack.

## Frontend Architecture

### Key Components

- **App.tsx**: Main application router and authentication wrapper
- **Pages**: Individual route components in `client/src/pages`
- **Components**: Reusable UI components in `client/src/components`
- **Hooks**: Custom React hooks in `client/src/hooks`

### State Management

- React Query for server state
- React Context for authentication state
- Local state with useState where appropriate

## Backend Architecture

### Server Structure

- **routes.ts**: API route definitions
- **auth.ts**: Authentication logic
- **db.ts**: Database connection and queries
- **storage.ts**: File storage utilities

### Database

PostgreSQL with Drizzle ORM for type-safe queries and migrations.

## Security

- Session-based authentication
- CSRF protection
- Secure password hashing
- Input validation with Zod

## Performance

- Vite for fast development and optimized builds
- Code splitting by route
- Lazy loading of components
- Efficient database queries with proper indexing
