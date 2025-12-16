import db from '../db/database.js';

class ClaimLog {
  static getAll() {
    const stmt = db.prepare(`
      SELECT
        cl.*,
        c.code as client_code,
        c.name as client_name
      FROM claim_log cl
      JOIN clients c ON cl.client_id = c.id
      ORDER BY cl.claimed_at DESC
    `);
    return stmt.all();
  }

  static getByClient(clientId) {
    const stmt = db.prepare(`
      SELECT
        cl.*,
        c.code as client_code,
        c.name as client_name
      FROM claim_log cl
      JOIN clients c ON cl.client_id = c.id
      WHERE cl.client_id = ?
      ORDER BY cl.claimed_at DESC
    `);
    return stmt.all(clientId);
  }
}

export default ClaimLog;
