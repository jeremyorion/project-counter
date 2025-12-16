# Database Documentation

Complete database schema documentation for the Job Number Tracker application.

## Overview

The application uses SQLite as its database, managed through the `better-sqlite3` driver. The database is file-based and stored at `server/data/project-counter.db`.

**Key Features:**
- Atomic transactions for thread-safe job number generation
- Automatic timestamps on all records
- Foreign key constraints with CASCADE deletes
- Optimized indexes for common query patterns
- WAL (Write-Ahead Logging) mode for better concurrency

## Database Configuration

**File:** `server/src/db/database.js`

```javascript
// Connection settings
const db = new Database('./data/project-counter.db', {
  verbose: console.log // Development only
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
```

**WAL Mode Benefits:**
- Readers don't block writers
- Writers don't block readers
- Better performance for multiple connections
- Improved concurrency for multi-user access

---

## Schema Overview

```
┌─────────────────┐
│    clients      │
│─────────────────│
│ id (PK)         │
│ code (UNIQUE)   │◄───┐
│ name            │    │
│ current_counter │    │
│ created_at      │    │
│ updated_at      │    │
└─────────────────┘    │
                       │
       ┌───────────────┴────────────────┐
       │                                │
┌──────▼──────────┐           ┌────────▼────────┐
│   claim_log     │           │ client_edit_log │
│─────────────────│           │─────────────────│
│ id (PK)         │           │ id (PK)         │
│ client_id (FK)  │           │ client_id (FK)  │
│ job_number      │           │ client_code     │
│ sequence_number │           │ client_name     │
│ claimed_at      │           │ change_desc     │
└─────────────────┘           │ edited_at       │
                              └─────────────────┘

┌─────────────────┐
│    projects     │  ← Legacy table (not in use)
│─────────────────│
│ id (PK)         │
│ client_id (FK)  │
│ job_number      │
│ ...             │
└─────────────────┘
```

---

## Tables

### clients

Stores client information and tracks the job number counter for each client.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique client identifier |
| `code` | VARCHAR(4) | UNIQUE, NOT NULL | 3-4 uppercase letters (e.g., INS, PONT) |
| `name` | VARCHAR(255) | NOT NULL | Client name (e.g., Inspire, Pontiac) |
| `current_counter` | INTEGER | DEFAULT 0 | Last claimed job number |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When client was created |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_clients_code` on `code` - Fast lookups by client code

**Example Data:**
```sql
id | code | name           | current_counter | created_at          | updated_at
---|------|----------------|-----------------|---------------------|--------------------
1  | INS  | Inspire        | 5               | 2024-01-15 10:30:00 | 2024-01-20 14:45:00
2  | PONT | Pontiac        | 12              | 2024-01-16 09:00:00 | 2024-01-21 11:20:00
3  | GRC  | Grace          | 0               | 2024-01-17 11:15:00 | 2024-01-17 11:15:00
```

**Constraints:**
- `code` must be unique across all clients
- `code` is automatically uppercased by the application
- `current_counter` represents the last claimed job number (next will be current_counter + 1)

**Relationships:**
- One-to-Many with `claim_log` (CASCADE delete)
- One-to-Many with `client_edit_log` (CASCADE delete)
- One-to-Many with `projects` (CASCADE delete, legacy)

---

### claim_log

Audit trail of all claimed job numbers with timestamps.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique log entry identifier |
| `client_id` | INTEGER | NOT NULL, FOREIGN KEY | References `clients(id)` |
| `job_number` | VARCHAR(10) | NOT NULL | Full job number (e.g., INS-005) |
| `sequence_number` | INTEGER | NOT NULL | Numeric sequence (e.g., 5) |
| `claimed_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When job number was claimed |

**Indexes:**
- `idx_claim_log_client_id` on `client_id` - Fast lookups by client
- `idx_claim_log_claimed_at` on `claimed_at DESC` - Fast chronological queries

**Foreign Keys:**
- `client_id` → `clients(id)` ON DELETE CASCADE

**Example Data:**
```sql
id | client_id | job_number | sequence_number | claimed_at
---|-----------|------------|-----------------|--------------------
1  | 1         | INS-001    | 1               | 2024-01-15 11:00:00
2  | 1         | INS-002    | 2               | 2024-01-15 14:30:00
3  | 2         | PONT-001   | 1               | 2024-01-16 10:15:00
4  | 1         | INS-003    | 3               | 2024-01-17 09:20:00
5  | 2         | PONT-002   | 2               | 2024-01-18 13:45:00
```

**Usage:**
- Created automatically when claiming a job number via `POST /api/clients/:id/claim-job-number`
- Used to generate the Activity Log view
- Provides complete audit trail of all job number assignments
- Sorted by `claimed_at DESC` in Activity Log

---

### client_edit_log

Audit trail of all client edits with before/after values.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique log entry identifier |
| `client_id` | INTEGER | NOT NULL, FOREIGN KEY | References `clients(id)` |
| `client_code` | VARCHAR(4) | NOT NULL | Client code at time of edit |
| `client_name` | VARCHAR(255) | NOT NULL | Client name at time of edit |
| `change_description` | TEXT | NOT NULL | Human-readable description of changes |
| `edited_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When edit occurred |

**Indexes:**
- `idx_client_edit_log_client_id` on `client_id` - Fast lookups by client
- `idx_client_edit_log_edited_at` on `edited_at DESC` - Fast chronological queries

**Foreign Keys:**
- `client_id` → `clients(id)` ON DELETE CASCADE

**Example Data:**
```sql
id | client_id | client_code | client_name    | change_description                              | edited_at
---|-----------|-------------|----------------|------------------------------------------------|--------------------
1  | 1         | INS         | Inspire Group  | Name: Inspire → Inspire Group                  | 2024-01-20 14:45:00
2  | 1         | INS         | Inspire Group  | Last Job Number: 3 → 5                         | 2024-01-20 15:00:00
3  | 2         | PONT        | Pontiac Corp   | Code: PON → PONT; Name: Pontiac → Pontiac Corp| 2024-01-21 11:20:00
```

**Change Description Format:**
The `change_description` field contains a semicolon-separated list of changes in the format:
```
Field: OldValue → NewValue
```

Examples:
- `"Code: INS → INSP"`
- `"Name: Inspire → Inspire Group"`
- `"Last Job Number: 5 → 10"`
- `"Code: PON → PONT; Name: Pontiac → Pontiac Corp"`

**Usage:**
- Created automatically when updating a client via `PUT /api/clients/:id`
- Only logs if actual changes are detected
- Used to generate the Activity Log view
- Provides complete audit trail of all client modifications

---

### projects

**Status:** Legacy table - Not currently in use

This table was part of the original full-featured application but is not used in the simplified job number tracker. It's retained in the schema for potential future use.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique project identifier |
| `client_id` | INTEGER | NOT NULL, FOREIGN KEY | References `clients(id)` |
| `job_number` | VARCHAR(10) | UNIQUE, NOT NULL | Full job number (e.g., INS-005) |
| `sequence_number` | INTEGER | NOT NULL | Numeric sequence |
| `title` | VARCHAR(255) | NOT NULL | Project title |
| `description` | TEXT | | Project description |
| `status` | VARCHAR(50) | DEFAULT 'active' | active, completed, on-hold, cancelled |
| `start_date` | DATE | | Project start date |
| `due_date` | DATE | | Project due date |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_projects_client_id` on `client_id`
- `idx_projects_job_number` on `job_number`
- `idx_projects_status` on `status`
- `idx_projects_client_sequence` (UNIQUE) on `(client_id, sequence_number)`

**Foreign Keys:**
- `client_id` → `clients(id)` ON DELETE CASCADE

---

## Transactions

### Job Number Claiming (Atomic Operation)

The most critical operation is claiming a job number, which must be atomic to prevent race conditions.

**Transaction Flow:**
```javascript
db.transaction(() => {
  // 1. Get current client data
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);

  // 2. Calculate next sequence
  const nextSequence = client.current_counter + 1;

  // 3. Update client counter
  db.prepare('UPDATE clients SET current_counter = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(nextSequence, clientId);

  // 4. Generate job number
  const jobNumber = `${client.code}-${String(nextSequence).padStart(3, '0')}`;

  // 5. Log the claim
  db.prepare('INSERT INTO claim_log (client_id, job_number, sequence_number) VALUES (?, ?, ?)')
    .run(clientId, jobNumber, nextSequence);

  return { jobNumber, sequenceNumber: nextSequence };
})();
```

**Why Transactions Are Critical:**
- Multiple users can claim job numbers simultaneously
- Without transactions, two users might get the same number
- Transaction ensures all operations complete or none do
- SQLite's SERIALIZED isolation level prevents race conditions

### Client Update with Edit Logging

Client updates also use transactions to ensure data consistency:

```javascript
db.transaction(() => {
  // 1. Get current client data
  const client = this.getById(id);

  // 2. Detect changes
  const changes = [];
  if (newCode !== client.code) changes.push(`Code: ${client.code} → ${newCode}`);
  if (newName !== client.name) changes.push(`Name: ${client.name} → ${newName}`);

  // 3. Update client
  db.prepare('UPDATE clients SET code = ?, name = ?, ... WHERE id = ?')
    .run(newCode, newName, ..., id);

  // 4. Log changes
  if (changes.length > 0) {
    db.prepare('INSERT INTO client_edit_log (...) VALUES (...)')
      .run(id, newCode, newName, changes.join('; '));
  }

  return this.getById(id);
})();
```

---

## Indexes

### Performance Optimization

All indexes are carefully chosen based on query patterns:

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_clients_code` | clients | code | Fast client lookup by code |
| `idx_claim_log_client_id` | claim_log | client_id | Filter claims by client |
| `idx_claim_log_claimed_at` | claim_log | claimed_at DESC | Chronological activity log |
| `idx_client_edit_log_client_id` | client_edit_log | client_id | Filter edits by client |
| `idx_client_edit_log_edited_at` | client_edit_log | edited_at DESC | Chronological activity log |

**Query Examples Using Indexes:**

```sql
-- Uses idx_clients_code
SELECT * FROM clients WHERE code = 'INS';

-- Uses idx_claim_log_client_id
SELECT * FROM claim_log WHERE client_id = 1;

-- Uses idx_claim_log_claimed_at
SELECT * FROM claim_log ORDER BY claimed_at DESC LIMIT 50;

-- Combined activity log uses both timestamp indexes
SELECT * FROM claim_log ORDER BY claimed_at DESC
UNION ALL
SELECT * FROM client_edit_log ORDER BY edited_at DESC;
```

---

## Common Queries

### Get All Clients with Next Job Number

```sql
SELECT
  id,
  code,
  name,
  current_counter,
  current_counter + 1 as next_sequence,
  code || '-' || printf('%03d', current_counter + 1) as next_job_number,
  created_at,
  updated_at
FROM clients
ORDER BY code;
```

### Get Activity Log (Combined Claims and Edits)

```sql
-- Get claims
SELECT
  'claim' as activity_type,
  cl.id,
  cl.client_id,
  cl.job_number,
  NULL as change_description,
  c.code as client_code,
  c.name as client_name,
  cl.claimed_at as activity_at
FROM claim_log cl
JOIN clients c ON cl.client_id = c.id

UNION ALL

-- Get edits
SELECT
  'edit' as activity_type,
  el.id,
  el.client_id,
  NULL as job_number,
  el.change_description,
  el.client_code,
  el.client_name,
  el.edited_at as activity_at
FROM client_edit_log el

ORDER BY activity_at DESC;
```

### Get Claims for Specific Client

```sql
SELECT
  job_number,
  sequence_number,
  claimed_at
FROM claim_log
WHERE client_id = 1
ORDER BY claimed_at DESC;
```

### Get Client Statistics

```sql
SELECT
  c.code,
  c.name,
  c.current_counter as total_claimed,
  COUNT(cl.id) as claim_count,
  MAX(cl.claimed_at) as last_claim,
  (SELECT COUNT(*) FROM client_edit_log WHERE client_id = c.id) as edit_count
FROM clients c
LEFT JOIN claim_log cl ON c.client_id = cl.client_id
GROUP BY c.id;
```

---

## Data Integrity

### Foreign Key Constraints

All foreign keys have CASCADE delete:

```sql
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
```

**What This Means:**
- Deleting a client automatically deletes all related records
- Prevents orphaned records in child tables
- Maintains referential integrity

**Example:**
```sql
DELETE FROM clients WHERE id = 1;
-- Automatically deletes:
-- - All claim_log entries for client 1
-- - All client_edit_log entries for client 1
-- - All projects for client 1 (if used)
```

### Unique Constraints

**Client Code Uniqueness:**
```sql
code VARCHAR(4) UNIQUE NOT NULL
```
- Prevents duplicate client codes
- Enforced at database level
- Application validates before insert

### Check Constraints

While SQLite supports CHECK constraints, this application relies on application-level validation:
- Client codes must be 3-4 uppercase letters
- Current counter must be non-negative
- Dates must be valid ISO 8601 format

---

## Database Maintenance

### Backup Strategy

**Recommended Approach:**
```bash
# Backup database file
cp server/data/project-counter.db server/data/project-counter.backup.db

# Or use SQLite backup command
sqlite3 server/data/project-counter.db ".backup server/data/backup-$(date +%Y%m%d).db"
```

**Automated Backups:**
Add to cron or deployment script:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### Optimization

**VACUUM Command:**
```sql
VACUUM;
```
- Reclaims unused space
- Defragments the database
- Run periodically if many deletes occur

**ANALYZE Command:**
```sql
ANALYZE;
```
- Updates query optimizer statistics
- Improves query performance
- Run after significant data changes

### Monitoring

**Check Database Size:**
```bash
ls -lh server/data/project-counter.db
```

**Check Table Sizes:**
```sql
SELECT name, SUM(pgsize) as size
FROM dbstat
GROUP BY name
ORDER BY size DESC;
```

**Check Index Usage:**
```sql
EXPLAIN QUERY PLAN
SELECT * FROM claim_log WHERE client_id = 1;
```

---

## Migration Strategy

If database schema changes are needed:

1. Create migration script in `server/src/db/migrations/`
2. Version migrations with timestamps: `001_add_field.sql`
3. Run migrations on server startup or manually
4. Keep schema.sql as source of truth for new installations

**Example Migration:**
```sql
-- server/src/db/migrations/002_add_client_phone.sql
ALTER TABLE clients ADD COLUMN phone VARCHAR(20);
```

---

## Production Considerations

### SQLite Limitations

**Good For:**
- Low to medium traffic (< 100 concurrent users)
- Read-heavy workloads
- Simple deployment (no separate database server)

**Not Ideal For:**
- High concurrency writes
- Distributed systems
- Very large datasets (> 1TB)

**Alternative:** Consider PostgreSQL for production if:
- Many concurrent users
- High write frequency
- Need replication/clustering

### Connection Pooling

SQLite doesn't support connection pooling like traditional databases. Instead:
- Use single persistent connection
- Enable WAL mode for better concurrency
- Limit long-running transactions

---

## Schema Version

**Current Version:** 1.0
**Last Updated:** January 2024
**Changes:** Initial schema with claim and edit logging
