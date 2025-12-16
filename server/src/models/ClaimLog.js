import db from '../db/database.js';

class ClaimLog {
  static getAll() {
    // Get claim logs
    const claimsStmt = db.prepare(`
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
    `);
    const claims = claimsStmt.all();

    // Get edit logs
    const editsStmt = db.prepare(`
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
    `);
    const edits = editsStmt.all();

    // Combine and sort by date
    const combined = [...claims, ...edits].sort((a, b) => {
      return new Date(b.activity_at) - new Date(a.activity_at);
    });

    return combined;
  }

  static getByClient(clientId) {
    // Get claim logs for client
    const claimsStmt = db.prepare(`
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
      WHERE cl.client_id = ?
    `);
    const claims = claimsStmt.all(clientId);

    // Get edit logs for client
    const editsStmt = db.prepare(`
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
      WHERE el.client_id = ?
    `);
    const edits = editsStmt.all(clientId);

    // Combine and sort by date
    const combined = [...claims, ...edits].sort((a, b) => {
      return new Date(b.activity_at) - new Date(a.activity_at);
    });

    return combined;
  }
}

export default ClaimLog;
