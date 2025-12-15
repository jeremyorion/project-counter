import db from '../db/database.js';

class Client {
  static getAll() {
    const stmt = db.prepare(`
      SELECT
        c.*,
        COUNT(p.id) as project_count
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT
        c.*,
        COUNT(p.id) as project_count
      FROM clients c
      LEFT JOIN projects p ON c.id = p.client_id
      WHERE c.id = ?
      GROUP BY c.id
    `);
    return stmt.get(id);
  }

  static create({ code, name }) {
    const upperCode = code.toUpperCase();

    const stmt = db.prepare(`
      INSERT INTO clients (code, name, current_counter)
      VALUES (?, ?, 0)
    `);

    try {
      const result = stmt.run(upperCode, name);
      return this.getById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Client code '${upperCode}' already exists`);
      }
      throw error;
    }
  }

  static update(id, { code, name }) {
    const client = this.getById(id);
    if (!client) {
      throw new Error('Client not found');
    }

    const upperCode = code ? code.toUpperCase() : client.code;
    const updatedName = name || client.name;

    const stmt = db.prepare(`
      UPDATE clients
      SET code = ?, name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    try {
      stmt.run(upperCode, updatedName, id);
      return this.getById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error(`Client code '${upperCode}' already exists`);
      }
      throw error;
    }
  }

  static delete(id) {
    const client = this.getById(id);
    if (!client) {
      throw new Error('Client not found');
    }

    if (client.project_count > 0) {
      throw new Error(`Cannot delete client with existing projects. This client has ${client.project_count} project(s).`);
    }

    const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
    stmt.run(id);
    return { message: 'Client deleted successfully' };
  }

  static getNextJobNumber(id) {
    const client = this.getById(id);
    if (!client) {
      throw new Error('Client not found');
    }

    const nextSequence = client.current_counter + 1;
    const jobNumber = `${client.code}-${String(nextSequence).padStart(3, '0')}`;

    return {
      jobNumber,
      sequenceNumber: nextSequence,
      clientCode: client.code
    };
  }
}

export default Client;
