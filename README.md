
# ProfitWise AI Trading Platform

A modern web application for AI-powered trading insights and portfolio management.

## Features

- 📊 Real-time portfolio tracking and analytics
- 🤖 AI-powered trading insights and recommendations
- 👥 Social trading with trader following
- 💰 Multi-wallet management system
- 📚 Educational resources and webinars
- 📧 Email notifications and alerts
- 🔒 Secure authentication system
- ⚙️ Advanced admin controls
- 📱 Responsive design

## Tech Stack

- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query + Context
- **Authentication**: Custom auth with sessions
- **Email**: EJS templates
- **Charts**: Chart.js

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
cd client && npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Project Structure

```
├── client/           # Frontend React application
├── server/           # Express.js backend
├── shared/           # Shared types and schemas
└── docs/            # Documentation
```

## Documentation

See the [docs](./docs) directory for detailed documentation:

- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Components](./docs/COMPONENTS.md)

## License

MIT
