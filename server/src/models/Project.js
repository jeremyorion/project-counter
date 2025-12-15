import db from '../db/database.js';

class Project {
  static getAll({ clientId, status, search } = {}) {
    let query = `
      SELECT
        p.*,
        c.code as client_code,
        c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (clientId) {
      query += ' AND p.client_id = ?';
      params.push(clientId);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (p.job_number LIKE ? OR p.title LIKE ? OR p.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY p.created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT
        p.*,
        c.code as client_code,
        c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ?
    `);
    return stmt.get(id);
  }

  static create({ clientId, title, description, status, startDate, dueDate }) {
    return db.transaction(() => {
      // 1. Get client and increment counter
      const getClientStmt = db.prepare('SELECT * FROM clients WHERE id = ?');
      const client = getClientStmt.get(clientId);

      if (!client) {
        throw new Error('Client not found');
      }

      const nextSequence = client.current_counter + 1;

      // 2. Update client counter
      const updateClientStmt = db.prepare(`
        UPDATE clients
        SET current_counter = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateClientStmt.run(nextSequence, clientId);

      // 3. Generate job number
      const jobNumber = `${client.code}-${String(nextSequence).padStart(3, '0')}`;

      // 4. Insert project
      const insertProjectStmt = db.prepare(`
        INSERT INTO projects (
          client_id,
          job_number,
          sequence_number,
          title,
          description,
          status,
          start_date,
          due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertProjectStmt.run(
        clientId,
        jobNumber,
        nextSequence,
        title,
        description || null,
        status || 'active',
        startDate || null,
        dueDate || null
      );

      return this.getById(result.lastInsertRowid);
    })();
  }

  static update(id, { title, description, status, startDate, dueDate }) {
    const project = this.getById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    const stmt = db.prepare(`
      UPDATE projects
      SET
        title = ?,
        description = ?,
        status = ?,
        start_date = ?,
        due_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title !== undefined ? title : project.title,
      description !== undefined ? description : project.description,
      status !== undefined ? status : project.status,
      startDate !== undefined ? startDate : project.start_date,
      dueDate !== undefined ? dueDate : project.due_date,
      id
    );

    return this.getById(id);
  }

  static delete(id) {
    const project = this.getById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);

    return { message: 'Project deleted successfully' };
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM projects');
    const activeStmt = db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = ?');
    const clientsStmt = db.prepare('SELECT COUNT(*) as count FROM clients');

    return {
      totalProjects: totalStmt.get().count,
      activeProjects: activeStmt.get('active').count,
      totalClients: clientsStmt.get().count
    };
  }

  static getRecent(limit = 5) {
    const stmt = db.prepare(`
      SELECT
        p.*,
        c.code as client_code,
        c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }
}

export default Project;
