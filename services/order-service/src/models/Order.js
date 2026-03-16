const pool = require('../db/pool');

const order = {
  updateStatus: async (orderId, masterId, newStatus, comment) => {
    const query = `
      UPDATE orders 
      SET 
        status = $1, 
        technician_comment = $2, 
        assigned_to = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const values = [newStatus, comment, masterId, orderId];
    const res = await pool.query(query, values);
    return res.rows[0];
  }
};