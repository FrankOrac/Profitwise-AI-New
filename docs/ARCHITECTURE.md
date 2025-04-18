
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

### UI Components

- Shadcn/ui component library
- Tailwind CSS for styling
- Chart.js for data visualization
- Responsive design system

## Backend Architecture

### Server Structure

- **routes.ts**: API route definitions
- **auth.ts**: Authentication logic
- **db.ts**: Database connection and queries
- **storage.ts**: File storage utilities
- **email.ts**: Email service integration

### Database

PostgreSQL with Drizzle ORM for:
- Type-safe queries
- Migrations
- Schema management
- Relationship handling

### Email System

- EJS templates for emails
- SMTP configuration
- Template management
- Bulk sending capabilities

## Security

- Session-based authentication
- CSRF protection
- Secure password hashing
- Input validation with Zod
- Rate limiting
- Security headers

## Performance

- Vite for fast development
- Code splitting by route
- Lazy loading of components
- Efficient database queries
- Optimized asset delivery
- Caching strategies

## Deployment

- Production-ready setup
- Environment configuration
- Build optimization
- Performance monitoring
