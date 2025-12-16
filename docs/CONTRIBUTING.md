# Contributing Guide

Welcome to the Job Number Tracker project! This guide will help you set up your development environment and understand our workflows.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd project-counter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs dependencies for the root workspace, backend, and frontend.

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your local configuration.

4. **Start development servers:**
   ```bash
   npm run dev
   ```
   - Backend runs on `http://localhost:3001`
   - Frontend runs on `http://localhost:5173`

5. **Open the app:**
   Navigate to `http://localhost:5173` in your browser.

---

## Development Workflow

### Daily Development

**Start both servers (recommended):**
```bash
npm run dev
```

**Or start individually:**
```bash
npm run dev:server   # Backend only
npm run dev:client   # Frontend only
```

**The database will auto-create** on first server start at `server/data/project-counter.db`.

### Making Changes

1. Create a new branch for your feature/fix
2. Make your changes
3. Test locally
4. Commit with clear messages
5. Push and create a pull request

### Hot Module Replacement (HMR)

The frontend uses Vite with HMR, so changes appear instantly without full page reload:
- Edit React components → see changes immediately
- Edit CSS → styles update without refresh

The backend uses nodemon, which auto-restarts on file changes:
- Edit server code → server restarts automatically
- Database changes may require manual restart

---

## Code Style

### General Principles

- **Be consistent** with existing code
- **Keep it simple** - avoid over-engineering
- **Write readable code** - clarity over cleverness
- **Comment when necessary** - explain "why", not "what"

### JavaScript/JSX Style

**Modern ES6+ Features:**
```javascript
// Use const/let, not var
const apiUrl = process.env.VITE_API_URL;
let counter = 0;

// Use arrow functions
const increment = () => counter++;

// Use template literals
const message = `Counter is now ${counter}`;

// Use destructuring
const { code, name } = client;

// Use async/await, not callbacks
const data = await api.getClients();
```

**React Best Practices:**
```javascript
// Functional components with hooks
export default function ClientForm({ client, onSubmit }) {
  const [formData, setFormData] = useState({ code: '', name: '' });

  // Early returns for loading/error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    // Component JSX
  );
}

// Use React Query for data fetching
const { data, isLoading, error } = useClients();

// Keep components small and focused
// Extract reusable logic into custom hooks
```

**Backend Best Practices:**
```javascript
// Use ES modules, not CommonJS
import express from 'express';

// Validate inputs at API boundary
const validateClient = [
  body('code').trim().isLength({ min: 3, max: 4 }),
  body('name').trim().isLength({ min: 1, max: 255 })
];

// Use transactions for multi-step operations
db.transaction(() => {
  // Multiple database operations
})();

// Consistent error handling
try {
  const result = await operation();
  res.json({ success: true, data: result, error: null });
} catch (error) {
  res.status(500).json({ success: false, data: null, error: { message: error.message } });
}
```

### Naming Conventions

**Variables & Functions:**
- Use camelCase: `clientCode`, `getNextJobNumber()`
- Boolean variables: `isLoading`, `hasError`
- Event handlers: `handleClick`, `onSubmit`

**Components:**
- Use PascalCase: `ClientList`, `ClientForm`
- File names match component names: `ClientList.jsx`

**Constants:**
- Use UPPER_SNAKE_CASE for true constants: `API_BASE_URL`
- Use camelCase for configuration: `queryClient`

**Database:**
- Tables: lowercase with underscores: `claim_log`, `client_edit_log`
- Columns: lowercase with underscores: `client_id`, `job_number`

### File Organization

**Backend Structure:**
```
server/src/
├── db/
│   ├── database.js      # Database connection
│   └── schema.sql       # Schema definition
├── models/
│   ├── Client.js        # Data layer
│   └── ClaimLog.js
├── routes/
│   ├── clients.js       # API endpoints
│   └── claimLog.js
└── index.js             # Server setup
```

**Frontend Structure:**
```
client/src/
├── components/
│   └── clients/         # Feature-based organization
│       ├── ClientForm.jsx
│       └── ClientList.jsx
├── pages/
│   ├── ClientsPage.jsx  # Page components
│   └── ClaimLogPage.jsx
├── hooks/
│   └── useClients.js    # Custom hooks
├── services/
│   └── api.js           # API client
└── App.jsx              # Root component
```

---

## Project Structure

### Monorepo Workspace

The project uses npm workspaces for managing multiple packages:

```json
{
  "workspaces": ["server", "client"]
}
```

**Benefits:**
- Install all dependencies with one command
- Share common dependencies
- Run scripts across workspaces

**Package Management:**
```bash
# Install in specific workspace
npm install axios --workspace=server

# Install in all workspaces
npm install lodash --workspaces

# Install in root (dev dependencies)
npm install concurrently --save-dev
```

### Key Technologies

**Backend:**
- **Express.js** - Web framework
- **better-sqlite3** - SQLite driver (synchronous)
- **express-validator** - Input validation
- **cors** - CORS middleware
- **helmet** - Security headers

**Frontend:**
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TanStack React Query** - Server state management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **date-fns** - Date formatting

---

## Testing

### Manual Testing

Currently, the project relies on manual testing. When making changes:

1. **Test the happy path:**
   - Create a client
   - Claim a job number
   - Edit the client
   - View activity log
   - Delete the client

2. **Test edge cases:**
   - Duplicate client codes
   - Invalid inputs (empty fields, wrong formats)
   - Editing last job number to different values
   - Claiming multiple job numbers rapidly

3. **Test error handling:**
   - Invalid client IDs
   - Network errors
   - Server down scenarios

### Testing Checklist

Before submitting a pull request:

- [ ] Create a new client with valid code and name
- [ ] Try creating duplicate client code (should fail)
- [ ] Claim a job number (should copy to clipboard)
- [ ] Claim multiple job numbers for same client (should increment)
- [ ] Edit client code, name, and last job number
- [ ] View activity log (should show claims and edits)
- [ ] Delete a client (should remove from list)
- [ ] Refresh page (data should persist)
- [ ] Check browser console for errors
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Future Testing Plans

**Unit Tests:**
- Backend models (Client, ClaimLog)
- API endpoints
- Database transactions

**Integration Tests:**
- API workflows
- Database operations
- Error scenarios

**E2E Tests:**
- User workflows
- UI interactions
- Cross-browser testing

**Tools to Add:**
- **Backend:** Jest, Supertest
- **Frontend:** Vitest, React Testing Library
- **E2E:** Playwright or Cypress

---

## Git Workflow

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code, auto-deploys

**Development Branches:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation updates
- `refactor/what-changed` - Code refactoring

### Creating a Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-export-feature

# Or bug fix branch
git checkout -b fix/clipboard-not-working
```

### Commit Messages

**Format:**
```
<type>: <short description>

<optional longer description>

<optional footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
# Good commit messages
git commit -m "feat: add CSV export for activity log"
git commit -m "fix: prevent duplicate job numbers with concurrent claims"
git commit -m "docs: add API documentation for claim endpoint"

# Bad commit messages
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

**Multi-line Commits:**
```bash
git commit -m "feat: add client search functionality" -m "- Add search input to client list
- Filter clients by code or name
- Debounce search for performance"
```

### Making a Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/add-export-feature
   ```

2. **Create PR on GitHub/GitLab:**
   - Provide clear title and description
   - Reference any related issues
   - Add screenshots for UI changes
   - Request review from team members

3. **PR Description Template:**
   ```markdown
   ## Changes
   - Added CSV export button to Activity Log
   - Export includes all claims and edits
   - Formats dates in readable format

   ## Testing
   - Tested with 100+ log entries
   - Verified CSV opens in Excel
   - Checked edge case with no data

   ## Screenshots
   [Attach screenshot]

   ## Related Issues
   Closes #123
   ```

4. **After Review:**
   - Address feedback
   - Push additional commits
   - Request re-review

5. **Merge:**
   - Squash commits for cleaner history
   - Delete branch after merge

---

## Deployment

### Automatic Deployment

The project is configured for automatic deployment:
- **Push to `main`** → Triggers deployment
- **Backend** → Render (or similar)
- **Frontend** → Netlify (or similar)

### Manual Deployment

**Backend (Render):**
1. Build command: `npm install --workspace=server`
2. Start command: `npm run start --workspace=server`
3. Environment variables: Set in Render dashboard

**Frontend (Netlify):**
1. Build command: `npm run build --workspace=client`
2. Publish directory: `client/dist`
3. Environment variables: Set `VITE_API_URL`

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Database migrations applied (if any)
- [ ] Environment variables configured
- [ ] CORS settings updated for production domain
- [ ] API URLs point to production backend

### Rollback Strategy

If deployment fails:
1. Revert commit on `main` branch
2. Auto-deployment will trigger with previous version
3. Or manually deploy previous build in hosting dashboard

---

## Troubleshooting

### Common Development Issues

**Port Already in Use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev:server
```

**Database Locked:**
- Close all SQLite connections
- Restart the server
- Check for long-running transactions

**CORS Errors:**
- Verify `CORS_ORIGIN` in server `.env`
- Check frontend is using correct API URL
- Ensure no trailing slashes in URLs

**Frontend Not Updating:**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear Vite cache: `rm -rf client/node_modules/.vite`
- Restart dev server

**Dependencies Out of Sync:**
```bash
# Clean install
rm -rf node_modules server/node_modules client/node_modules
npm install
```

**Database Issues:**
```bash
# Reset database (loses all data!)
rm server/data/project-counter.db
npm run dev:server  # Will recreate database
```

### Getting Help

- Check existing documentation: README, API.md, DATABASE.md
- Search closed issues on GitHub
- Ask in team chat
- Create a new issue with:
  - Clear description
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots/error messages

---

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Write clear descriptions
- Test thoroughly before submitting
- Respond to feedback promptly
- Don't take feedback personally

### For Reviewers

- Be respectful and constructive
- Explain the "why" behind suggestions
- Approve if changes are good enough (not perfect)
- Test the changes locally if possible
- Focus on:
  - Correctness
  - Security
  - Performance
  - Maintainability
  - User experience

---

## Performance Guidelines

### Frontend

- Use React Query caching (already configured)
- Avoid unnecessary re-renders
- Debounce search inputs
- Lazy load components if app grows
- Optimize images (if added)

### Backend

- Use indexes for query performance
- Keep transactions short
- Use prepared statements (already done)
- Monitor database file size
- Consider pagination for large datasets

### Database

- Add indexes for frequently queried columns
- Use EXPLAIN QUERY PLAN to optimize queries
- Run VACUUM periodically if many deletes
- Monitor WAL file size

---

## Security Best Practices

- **Never commit secrets** - Use `.env` files
- **Validate all inputs** - Already done with express-validator
- **Use parameterized queries** - Already done with better-sqlite3
- **Enable CORS properly** - Restrict to specific origins in production
- **Keep dependencies updated** - Run `npm audit` regularly
- **Use HTTPS in production** - Configure on hosting platform

---

## Future Enhancements

Ideas for future contributors:

- [ ] Add user authentication
- [ ] Implement CSV/Excel export
- [ ] Add search and filtering to Activity Log
- [ ] Implement bulk job number claims
- [ ] Add dark mode
- [ ] Create automated tests
- [ ] Add API rate limiting
- [ ] Implement real-time updates with WebSockets
- [ ] Add client-specific permissions
- [ ] Create mobile app version

---

## Resources

### Documentation
- [README.md](../README.md) - Project overview
- [API.md](./API.md) - API reference
- [DATABASE.md](./DATABASE.md) - Database schema
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide

### External Resources
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query)
- [Express.js Guide](https://expressjs.com/)
- [better-sqlite3 Docs](https://github.com/WiseLibs/better-sqlite3)
- [Vite Guide](https://vitejs.dev/guide/)

---

## License

This project is licensed under the MIT License.

---

## Questions?

If you have questions not covered in this guide, please:
- Check other documentation files
- Search existing issues
- Ask in team chat
- Create a new issue

Thank you for contributing to the Job Number Tracker! 🚀
