# Job Number Tracker

A full-stack web application for claiming and tracking sequential job numbers by client with complete audit logging.

## Overview

This application helps teams manage job number assignments across multiple clients. Each client has a unique code (e.g., INS, PONT) and job numbers are automatically generated sequentially (INS-001, INS-002, etc.). The system maintains a complete audit trail of all claims and client edits.

## Features

- **Client Management**: Create, edit, and delete clients with 3-4 letter codes
- **Job Number Claims**: One-click claim with automatic clipboard copy and counter increment
- **Atomic Transactions**: Thread-safe job number generation prevents duplicates
- **Activity Logging**: Complete audit trail of all job claims and client edits
- **Edit Tracking**: Shows before/after values for all client changes
- **Multi-user Support**: Shared access without authentication

## Tech Stack

### Backend
- **Runtime**: Node.js 18+ (ES modules)
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3 (synchronous, fast)
- **Validation**: express-validator
- **Security**: helmet, cors middleware
- **API Style**: RESTful JSON with consistent response format

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite (fast HMR, optimized builds)
- **State Management**: TanStack React Query (server state + caching)
- **Forms**: React Hook Form (performant validation)
- **HTTP Client**: Axios with interceptors
- **Date Formatting**: date-fns
- **Styling**: CSS with CSS variables (no framework)

## Project Structure

```
project-counter/
├── server/                      # Backend application
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js     # SQLite connection & init
│   │   │   └── schema.sql      # Database schema
│   │   ├── models/
│   │   │   ├── Client.js       # Client CRUD + claim logic
│   │   │   └── ClaimLog.js     # Activity log queries
│   │   ├── routes/
│   │   │   ├── clients.js      # Client endpoints
│   │   │   └── claimLog.js     # Activity log endpoint
│   │   └── index.js            # Express server setup
│   ├── data/                    # SQLite database file (gitignored)
│   └── package.json
│
├── client/                      # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── clients/        # Client form & list
│   │   ├── pages/
│   │   │   ├── ClientsPage.jsx # Main client management
│   │   │   └── ClaimLogPage.jsx # Activity log view
│   │   ├── hooks/
│   │   │   ├── useClients.js   # React Query hooks
│   │   │   └── useClaimLog.js  # Activity log hook
│   │   ├── services/
│   │   │   └── api.js          # Axios client
│   │   └── App.jsx             # Root component with tabs
│   ├── index.html
│   └── package.json
│
├── package.json                 # Root workspace config
├── .env.example                 # Environment variables template
├── DEPLOYMENT.md               # Deployment guide for Render/Netlify
└── docs/                        # Additional documentation
    ├── API.md                   # API reference
    ├── DATABASE.md              # Schema documentation
    └── CONTRIBUTING.md          # Development workflow
```

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd project-counter

# Install all dependencies (root + server + client)
npm install
```

### Development

```bash
# Start both backend and frontend (recommended)
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:5173

# Or start individually:
npm run dev:server  # Backend only
npm run dev:client  # Frontend only
```

Open http://localhost:5173 in your browser.

### First-time Setup

1. The database will be created automatically on first run
2. No seed data required - start by creating your first client
3. Check the terminal for any errors

## Usage

### Creating a Client

1. Go to **Clients** tab
2. Click **+ New Client**
3. Enter:
   - **Code**: 3-4 uppercase letters (e.g., INS, PONT)
   - **Name**: Client name (e.g., Inspire, Pontiac)
4. Click **Create Client**

### Claiming a Job Number

1. Find the client in the table
2. See the **Next Job Number** column (e.g., INS-003)
3. Click **Claim Job Number**
4. Job number is copied to clipboard automatically
5. Counter increments (next claim will be INS-004)
6. Paste the job number wherever needed

### Editing a Client

1. Click **Edit** on any client
2. Modify:
   - **Code**: Change the client prefix
   - **Name**: Update client name
   - **Last Job Number**: Adjust the counter (changes what's claimed next)
3. See live preview of next job number
4. Click **Update Client**
5. All changes are logged in Activity Log

### Viewing Activity Log

1. Go to **Activity Log** tab
2. See chronological list of:
   - **Claims**: Job numbers claimed with timestamps
   - **Edits**: Client changes showing before/after values
3. Filter by client (if implemented)
4. Export data (if implemented)

## API Reference

See [docs/API.md](docs/API.md) for complete API documentation.

**Quick Reference:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create new client |
| PUT | `/api/clients/:id` | Update client (logs changes) |
| DELETE | `/api/clients/:id` | Delete client |
| POST | `/api/clients/:id/claim-job-number` | Claim and increment |
| GET | `/api/claim-log` | Get activity history |

## Database

See [docs/DATABASE.md](docs/DATABASE.md) for detailed schema documentation.

**Tables:**
- `clients` - Client information and counters
- `claim_log` - Job number claim history
- `client_edit_log` - Client edit audit trail
- `projects` - Legacy table (not in use)

**Key Features:**
- Atomic transactions for data consistency
- Foreign key constraints with cascade deletes
- Indexed queries for performance
- Timestamps on all records

## Development Workflow

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for full development guide.

**Key Points:**
- Use feature branches
- Write meaningful commit messages
- Test locally before pushing
- Auto-deployment on push to `main`

## Environment Variables

Create `.env` in root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/project-counter.db

# CORS (use * for development, specific origin for production)
CORS_ORIGIN=http://localhost:5173
```

For frontend (Netlify):
```env
VITE_API_URL=https://your-api.onrender.com/api
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Summary:**
- **Backend**: Render (with persistent disk or PostgreSQL)
- **Frontend**: Netlify
- **CI/CD**: Automatic deployment on git push

## Testing

```bash
# Backend tests (if implemented)
npm run test:server

# Frontend tests (if implemented)
npm run test:client

# E2E tests (if implemented)
npm run test:e2e
```

## Architecture Decisions

### Why SQLite?
- Simple setup, no external database server required
- Fast for read-heavy workloads
- Built-in transaction support
- Easy to backup (single file)

### Why better-sqlite3?
- Synchronous API (simpler code, no async overhead)
- Faster than async SQLite drivers
- Transaction support for atomic operations

### Why React Query?
- Automatic caching and invalidation
- Reduces boilerplate for data fetching
- Optimistic updates
- Background refetching

### Why No Authentication?
- Internal team tool with shared access
- Simplifies deployment and usage
- Can be added later if needed

## Performance Considerations

- **Job Number Generation**: Uses atomic transactions (no race conditions)
- **Database Indexes**: All foreign keys and frequently queried columns
- **Query Optimization**: Composite indexes for common queries
- **Frontend Caching**: React Query caches API responses
- **Build Optimization**: Vite tree-shaking and code splitting

## Security

- **Input Validation**: All endpoints validate inputs
- **SQL Injection**: Parameterized queries only
- **CORS**: Restricted to specific origins in production
- **Helmet.js**: Security headers enabled
- **No Sensitive Data**: No passwords or PII stored

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill

# Or use different port
PORT=3002 npm run dev:server
```

### Database Locked
- SQLite doesn't support high concurrency writes
- Use PostgreSQL in production if needed
- Check for long-running transactions

### CORS Errors
- Verify `CORS_ORIGIN` environment variable
- Check frontend is using correct API URL
- Ensure no trailing slashes

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for:
- Code style guidelines
- Git workflow
- Pull request process
- Testing requirements

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/jeremyorion/project-counter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jeremyorion/project-counter/discussions)
- **Documentation**: See `/docs` folder

## Roadmap

Potential future enhancements:
- [ ] User authentication
- [ ] Client-specific permissions
- [ ] Export to CSV/Excel
- [ ] Search and filtering in Activity Log
- [ ] Bulk job number claims
- [ ] API rate limiting
- [ ] Webhook notifications
- [ ] Dark mode

---

Built with ❤️ for efficient project management
