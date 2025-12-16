import db from '../db/database.js';

class Client {
  static getAll() {
    const stmt = db.prepare(`
      SELECT *
      FROM clients
      ORDER BY name ASC
    `);
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT *
      FROM clients
      WHERE id = ?
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

  static claimJobNumber(id) {
    return db.transaction(() => {
      // Get current client
      const getStmt = db.prepare('SELECT * FROM clients WHERE id = ?');
      const client = getStmt.get(id);

      if (!client) {
        throw new Error('Client not found');
      }

      // Increment counter
      const nextSequence = client.current_counter + 1;
      const updateStmt = db.prepare(`
        UPDATE clients
        SET current_counter = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(nextSequence, id);

      // Generate and return claimed job number
      const jobNumber = `${client.code}-${String(nextSequence).padStart(3, '0')}`;

      return {
        jobNumber,
        sequenceNumber: nextSequence,
        clientCode: client.code,
        clientName: client.name
      };
    })();
  }
}

export default Client;
