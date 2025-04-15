
# Development Guide

## Local Development Setup

1. **Database Setup**
   ```bash
   createdb profitwise
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Start Development Server**
   - Click the "Run" button or use the "Dev Server New" workflow
   - Server will run on port 5000
   - Client dev server will run on port 3000

## Project Structure

- `/client` - React frontend
- `/server` - Express backend
- `/shared` - Shared types and schemas
- `/docs` - Documentation
- `/migrations` - Database migrations

## Common Modifications

### Frontend Changes
1. Navigate to `/client/src`
2. Components are in `/client/src/components`
3. Pages are in `/client/src/pages`
4. Make changes and save - hot reload will update

### Backend Changes
1. Navigate to `/server`
2. Main server file: `index.ts`
3. Routes in `routes.ts`
4. Services in `/server/services`

### Database Changes
1. Modify schema in `/shared/schema.ts`
2. Run migrations:
   ```bash
   npm run migrate
   ```

### Adding New Features
1. Frontend:
   - Add components in `/client/src/components`
   - Add pages in `/client/src/pages`
   - Update routes in `App.tsx`

2. Backend:
   - Add routes in `routes.ts`
   - Add services in `/server/services`
   - Update schema if needed

## Deployment on Replit

1. Click the "Deploy" button in Replit interface
2. Choose "Production" environment
3. Select deployment type (Autoscale recommended)
4. Configure environment variables if needed
5. Deploy!

## Troubleshooting

1. **Database Issues**
   - Check connection string in `server/db.ts`
   - Ensure database exists
   - Run migrations

2. **Build Issues**
   - Clear node_modules: `rm -rf node_modules`
   - Reinstall: `npm install`

3. **Runtime Issues**
   - Check console for errors
   - Verify environment variables
   - Check port configurations
