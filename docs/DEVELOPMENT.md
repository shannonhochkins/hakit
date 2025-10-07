
## 🔧 Developer Quick Start

This document contains development notes and setup instructions for contributors.

> **Note**: This project is in active development, so expect changes and updates frequently.

## Pre-requisites

1. **Bun** - Fast JavaScript runtime and package manager
2. **Environment Variables** - Copy `.env.example` to `.env` and fill in required values:
   - `DATABASE_URL` - PostgreSQL connection string
   - Kinde authentication variables (see Authentication section)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/shannonhochkins/hakit.git
   cd hakit
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your database and authentication details
   ```

4. **Start development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to start building!


## Database Setup

### Google Cloud Postgres
- Need to attach IP address to access the DB, will be the server and any local IP needed

### Supabase DB with Drizzle-kit ORM

Environment setup - `DATABASE_URL` should be obtained from Supabase (use Session pooler URL):

1. Generate SQL files from schemas: `bun drizzle-kit generate`
2. Migrate the data to the database: `bun run migrate.ts`
3. Visualize the database: `bunx drizzle-kit studio`

When adding new columns, run through all the steps again.

## Authentication

Using Kinde for authentication locally. Environment variables needed from hakit.kinde.com/admin are:

```bash
KINDE_DOMAIN=https://hakit.kinde.com
KINDE_CLIENT_ID=<YOUR_CLIENT_ID>
KINDE_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
KINDE_REDIRECT_URI=http://localhost:3000/api/callback
KINDE_LOGOUT_REDIRECT_URI=http://localhost:3000
```

### Kinde Redirect URLs
May need to update the redirect URLs in the application settings within the Kinde dashboard if new domains are added. The redirect URLs are used to redirect the user back to the application after authentication.

## API Documentation

The API includes OpenAPI 3.0 documentation with interactive Swagger UI:

### How to Access:
- **Interactive Documentation:** `http://localhost:3000/api/docs` - Scaler interface, will inherit authentication once logged in via the main application. Only works in development mode.

All protected endpoints require authentication through the main application first.

## Project Structure

```
├── packages/
│   ├── editor/          # React frontend application
│   │   ├── src/
│   │   │   ├── routes/  # TanStack Router pages
│   │   │   └── ...
│   │   └── ...
│   └── server/          # Hono backend API
│       ├── routes/      # API endpoints
│       ├── db/          # Database schema and migrations
│       └── ...
├── drizzle/             # Database migration files
├── docs/                # Documentation
└── ...
```

## Development Scripts

- `bun run dev` - Start both server and editor in development mode
- `bun run dev:server` - Start only the backend server
- `bun run dev:editor` - Start only the frontend editor
- `bun run build` - Build the editor for production, will run lint, tests, typescript checks, and format code
- `bun run test` - Run tests
- `bun run lint` - Lint the codebase
- `bun run format` - Format code with Prettier

## Contributing

1. Follow the existing code style and patterns
2. Run `bun run build` before committing
3. Add tests for new features when applicable
4. Update documentation as needed
