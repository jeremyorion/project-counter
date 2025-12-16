# API Reference

Complete API documentation for the Job Number Tracker application.

## Base URL

**Development:** `http://localhost:3001/api`
**Production:** `https://your-api.onrender.com/api`

## Response Format

All API endpoints return JSON responses in a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### Success Response (200, 201)
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error description",
    "details": [ /* validation errors */ ]
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation failed |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource or constraint violation |
| 500 | Internal Server Error - Server error |

---

## Clients

### List All Clients

Get a list of all clients with their current counters.

**Endpoint:** `GET /api/clients`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "INS",
      "name": "Inspire",
      "current_counter": 5,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-20T14:45:00.000Z"
    },
    {
      "id": 2,
      "code": "PONT",
      "name": "Pontiac",
      "current_counter": 12,
      "created_at": "2024-01-16T09:00:00.000Z",
      "updated_at": "2024-01-21T11:20:00.000Z"
    }
  ],
  "error": null
}
```

### Get Single Client

Get details of a specific client by ID.

**Endpoint:** `GET /api/clients/:id`

**Parameters:**
- `id` (integer, required) - Client ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "INS",
    "name": "Inspire",
    "current_counter": 5,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T14:45:00.000Z"
  },
  "error": null
}
```

**Response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client not found"
  }
}
```

### Create Client

Create a new client with a unique code.

**Endpoint:** `POST /api/clients`

**Request Body:**
```json
{
  "code": "INS",
  "name": "Inspire"
}
```

**Validation Rules:**
- `code`: 3-4 uppercase letters, unique across all clients
- `name`: 1-255 characters, required

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "INS",
    "name": "Inspire",
    "current_counter": 0,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "error": null
}
```

**Response (400 - Validation Error):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "msg": "Client code must be 3-4 characters",
        "param": "code",
        "location": "body"
      }
    ]
  }
}
```

**Response (409 - Duplicate):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client with code 'INS' already exists"
  }
}
```

### Update Client

Update an existing client's code, name, or last job number.

**Endpoint:** `PUT /api/clients/:id`

**Parameters:**
- `id` (integer, required) - Client ID

**Request Body:**
```json
{
  "code": "INS",
  "name": "Inspire Group",
  "currentCounter": 10
}
```

**Fields:**
- `code` (string, required): 3-4 uppercase letters
- `name` (string, required): 1-255 characters
- `currentCounter` (integer, optional): Last claimed job number (≥0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "INS",
    "name": "Inspire Group",
    "current_counter": 10,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-22T16:00:00.000Z"
  },
  "error": null
}
```

**Side Effects:**
- If any fields are changed, an entry is logged in `client_edit_log` with before/after values
- Query cache is invalidated for clients and claim log

**Response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client not found"
  }
}
```

**Response (409):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client with code 'PON' already exists"
  }
}
```

### Delete Client

Delete a client and all associated data.

**Endpoint:** `DELETE /api/clients/:id`

**Parameters:**
- `id` (integer, required) - Client ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Client deleted successfully"
  },
  "error": null
}
```

**Response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client not found"
  }
}
```

**Side Effects:**
- Deletes all claim log entries (CASCADE)
- Deletes all edit log entries (CASCADE)

### Get Next Job Number

Get the next job number that will be assigned for a client.

**Endpoint:** `GET /api/clients/:id/next-job-number`

**Parameters:**
- `id` (integer, required) - Client ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nextJobNumber": "INS-006",
    "nextSequence": 6,
    "clientCode": "INS",
    "clientName": "Inspire"
  },
  "error": null
}
```

**Response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client not found"
  }
}
```

### Claim Job Number

Claim the next job number for a client. This atomically increments the counter and logs the claim.

**Endpoint:** `POST /api/clients/:id/claim-job-number`

**Parameters:**
- `id` (integer, required) - Client ID

**Request Body:** None

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobNumber": "INS-006",
    "sequenceNumber": 6,
    "clientCode": "INS",
    "clientName": "Inspire"
  },
  "error": null
}
```

**Response (404):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client not found"
  }
}
```

**Side Effects:**
- Increments `current_counter` in `clients` table
- Inserts entry in `claim_log` table
- Both operations happen atomically in a transaction
- Query cache is invalidated for clients and claim log

**Thread Safety:**
This endpoint uses SQLite transactions to ensure atomic updates, preventing race conditions when multiple users claim job numbers simultaneously.

---

## Activity Log

### Get Activity Log

Get a combined list of all job number claims and client edits, sorted by timestamp (newest first).

**Endpoint:** `GET /api/claim-log`

**Query Parameters:**
- `client_id` (integer, optional) - Filter by specific client

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "activity_type": "claim",
      "id": 15,
      "client_id": 1,
      "job_number": "INS-006",
      "change_description": null,
      "client_code": "INS",
      "client_name": "Inspire",
      "activity_at": "2024-01-22T16:30:00.000Z"
    },
    {
      "activity_type": "edit",
      "id": 3,
      "client_id": 1,
      "job_number": null,
      "change_description": "Name: Inspire → Inspire Group; Last Job Number: 5 → 10",
      "client_code": "INS",
      "client_name": "Inspire Group",
      "activity_at": "2024-01-22T16:00:00.000Z"
    },
    {
      "activity_type": "claim",
      "id": 14,
      "client_id": 2,
      "job_number": "PONT-013",
      "change_description": null,
      "client_code": "PONT",
      "client_name": "Pontiac",
      "activity_at": "2024-01-21T14:15:00.000Z"
    }
  ],
  "error": null
}
```

**Activity Types:**

**Claim Entry:**
- `activity_type`: "claim"
- `job_number`: The claimed job number (e.g., "INS-006")
- `change_description`: null

**Edit Entry:**
- `activity_type`: "edit"
- `job_number`: null
- `change_description`: Human-readable description of changes (e.g., "Code: INS → INSP; Name: Inspire → Inspire Group")

**Filter by Client:**
```
GET /api/claim-log?client_id=1
```

Returns only activity for the specified client.

---

## Data Models

### Client
```typescript
{
  id: number;                    // Auto-increment primary key
  code: string;                  // 3-4 uppercase letters (unique)
  name: string;                  // Client name
  current_counter: number;       // Last claimed job number
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### Claim Log Entry
```typescript
{
  activity_type: "claim";
  id: number;
  client_id: number;
  job_number: string;            // e.g., "INS-006"
  change_description: null;
  client_code: string;
  client_name: string;
  activity_at: string;           // ISO 8601 timestamp
}
```

### Edit Log Entry
```typescript
{
  activity_type: "edit";
  id: number;
  client_id: number;
  job_number: null;
  change_description: string;    // e.g., "Name: Old → New"
  client_code: string;
  client_name: string;
  activity_at: string;           // ISO 8601 timestamp
}
```

---

## Example Workflows

### Creating a Client and Claiming Job Numbers

**1. Create a new client:**
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{"code": "INS", "name": "Inspire"}'
```

**2. Claim first job number:**
```bash
curl -X POST http://localhost:3001/api/clients/1/claim-job-number
# Returns: INS-001
```

**3. Claim second job number:**
```bash
curl -X POST http://localhost:3001/api/clients/1/claim-job-number
# Returns: INS-002
```

**4. View activity log:**
```bash
curl http://localhost:3001/api/claim-log
```

### Editing a Client and Adjusting Counter

**1. Edit client and set last job number to 10:**
```bash
curl -X PUT http://localhost:3001/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"code": "INS", "name": "Inspire Group", "currentCounter": 10}'
```

**2. Next claim will be INS-011:**
```bash
curl -X POST http://localhost:3001/api/clients/1/claim-job-number
# Returns: INS-011
```

**3. View activity log (includes edit entry):**
```bash
curl http://localhost:3001/api/claim-log
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### Validation Errors (400)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "msg": "Client code must be 3-4 characters",
        "param": "code",
        "location": "body"
      }
    ]
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client not found"
  }
}
```

### Conflict (409)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Client with code 'INS' already exists"
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Internal server error message"
  }
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. This is suitable for internal team use. If deploying for external use, consider adding rate limiting middleware.

## Authentication

Currently, there is no authentication required. All endpoints are publicly accessible. This is designed for internal team use with trusted users.

## CORS

CORS is configured via the `CORS_ORIGIN` environment variable. In development, it defaults to `http://localhost:5173`. In production, set it to your frontend URL.

---

## Testing with cURL

### List all clients
```bash
curl http://localhost:3001/api/clients
```

### Create a client
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{"code": "INS", "name": "Inspire"}'
```

### Claim a job number
```bash
curl -X POST http://localhost:3001/api/clients/1/claim-job-number
```

### Update a client
```bash
curl -X PUT http://localhost:3001/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"code": "INS", "name": "Inspire Group", "currentCounter": 10}'
```

### Get activity log
```bash
curl http://localhost:3001/api/claim-log
```

### Delete a client
```bash
curl -X DELETE http://localhost:3001/api/clients/1
```
