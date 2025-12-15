# Project Counter

A full-stack web application for managing projects and assigning sequential job numbers by client.

## Features

- **Client Management**: Add, edit, and delete clients with unique 3-letter codes
- **Project Management**: Create projects with auto-generated job numbers (e.g., INS-001, PON-002)
- **Auto Job Numbers**: Sequential numbering per client using atomic database transactions
- **Search & Filter**: Find projects by job number, title, client, or status
- **Dashboard**: View statistics and recent projects at a glance
- **Multi-user Support**: Shared access without authentication

## Tech Stack

### Backend
- Node.js with Express
- SQLite database (better-sqlite3)
- RESTful API with validation

### Frontend
- React 18 with Vite
- React Router for navigation
- TanStack React Query for data management
- React Hook Form for forms
- date-fns for date formatting

## Project Structure

```
project-counter/
├── server/               # Backend application
│   ├── src/
│   │   ├── db/          # Database schema and connection
│   │   ├── models/      # Data models with business logic
│   │   ├── routes/      # API endpoints
│   │   └── index.js     # Server entry point
│   └── data/            # SQLite database file
│
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # React Query hooks
│   │   ├── services/    # API client
│   │   └── styles/      # CSS styles
│   └── index.html
│
└── package.json         # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

### Installation

1. Install all dependencies:

```bash
npm install
```

This will install dependencies for the root workspace, server, and client.

### Development

Start both the backend server and frontend dev server:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

Open your browser to http://localhost:5173 to use the application.

### Individual Commands

Start only the backend server:
```bash
npm run dev:server
```

Start only the frontend dev server:
```bash
npm run dev:client
```

### Production Build

Build the frontend for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Usage

### Managing Clients

1. Navigate to the **Clients** page
2. Click **+ New Client** to add a client
3. Enter a 3-letter code (e.g., INS, PON) and client name
4. The system validates that codes are unique and exactly 3 letters

### Creating Projects

1. Navigate to the **Projects** page
2. Click **+ New Project**
3. Select a client from the dropdown
4. The next job number automatically displays (e.g., "Next: INS-003")
5. Fill in project details (title, description, status, dates)
6. Submit to create the project with an auto-generated job number

### Searching Projects

Use the filters on the Projects page to:
- Search by job number, title, or description
- Filter by specific client
- Filter by project status
- Combine multiple filters

### Dashboard

The dashboard shows:
- Total projects count
- Active projects count
- Total clients count
- Recent projects list
- Quick links to manage projects and clients

## API Endpoints

### Clients

- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/:id/next-job-number` - Get next job number

### Projects

- `GET /api/projects` - List projects (with optional filters)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Get project statistics
- `GET /api/projects/recent` - Get recent projects

## Database Schema

### clients table
- `id` - Auto-incrementing primary key
- `code` - 3-letter client code (unique)
- `name` - Client name
- `current_counter` - Tracks next job number sequence
- `created_at` - Timestamp
- `updated_at` - Timestamp

### projects table
- `id` - Auto-incrementing primary key
- `client_id` - Foreign key to clients
- `job_number` - Full job number (e.g., INS-001)
- `sequence_number` - Numeric sequence (1, 2, 3...)
- `title` - Project title
- `description` - Project description (optional)
- `status` - active, completed, on-hold, cancelled
- `start_date` - Project start date (optional)
- `due_date` - Project due date (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Job Number Generation

Job numbers are generated atomically using SQLite transactions to prevent duplicates:

1. Client counter is retrieved and incremented
2. Job number is generated (CODE-XXX format)
3. Project is created with the job number
4. All in a single atomic transaction

This ensures no duplicate job numbers even with concurrent users.

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/project-counter.db
CORS_ORIGIN=http://localhost:5173
```

## License

MIT
