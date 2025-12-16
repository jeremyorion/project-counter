-- Clients table: stores client information and tracks job number counter
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(4) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_counter INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by code
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code);

-- Claim log table: stores history of all claimed job numbers
CREATE TABLE IF NOT EXISTS claim_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    job_number VARCHAR(10) NOT NULL,
    sequence_number INTEGER NOT NULL,
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Index for fast lookups by client and date
CREATE INDEX IF NOT EXISTS idx_claim_log_client_id ON claim_log(client_id);
CREATE INDEX IF NOT EXISTS idx_claim_log_claimed_at ON claim_log(claimed_at DESC);

-- Projects table: stores project information with auto-generated job numbers
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    job_number VARCHAR(10) UNIQUE NOT NULL,
    sequence_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_job_number ON projects(job_number);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_client_sequence ON projects(client_id, sequence_number);
