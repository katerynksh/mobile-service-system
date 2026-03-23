const pool = require('../db/pool');

const VALID_STATUSES = [
  'new', 
  'in progress', 
  'waiting customer response',
  'waiting spare parts',
  'failed',
  'done'
];

class OrderModel {
  static async findAll({ status, assignedTo, clientId, sortBy = 'created_at', sortDir = 'ASC' }) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (assignedTo) {
      query += ` AND assigned_to = $${paramIndex}`;
      values.push(assignedTo);
      paramIndex++;
    }
    
    if (clientId) {
      query += ` AND client_id = $${paramIndex}`;
      values.push(clientId);
      paramIndex++;
    }

    const allowedSortFields = ['created_at', 'device_type'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortDir = sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${safeSortBy} ${safeSortDir}`;

    const { rows } = await pool.query(query, values);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async update(id, updates) {
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      throw new Error('Invalid status');
    }

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      setClause.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    // Якщо немає полів для оновлення
    if (setClause.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE orders 
      SET ${setClause.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }
}

module.exports = { OrderModel, VALID_STATUSES };