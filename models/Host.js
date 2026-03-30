const pool = require('../config/database');

class Host {
  static async create({ userId, bio, offerings, hourlyRate, categories }) {
    const query = `
      INSERT INTO hosts (user_id, bio, offerings, hourly_rate, categories, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, bio, offerings, hourlyRate, JSON.stringify(categories)]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT h.*, u.name, u.email, u.profile_photo
      FROM hosts h
      JOIN users u ON h.user_id = u.id
      WHERE h.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT h.*, u.name, u.email, u.profile_photo, u.verified,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM hosts h
      JOIN users u ON h.user_id = u.id
      LEFT JOIN reviews r ON h.id = r.host_id
      WHERE h.id = $1
      GROUP BY h.id, u.id
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll({ category, limit = 20, offset = 0, status = 'approved' }) {
    let query = `
      SELECT h.*, u.name, u.profile_photo, u.verified,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM hosts h
      JOIN users u ON h.user_id = u.id
      LEFT JOIN reviews r ON h.id = r.host_id
      WHERE h.status = $1
    `;
    
    const params = [status];
    let paramCount = 2;

    if (category) {
      query += ` AND h.categories::jsonb ? $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += `
      GROUP BY h.id, u.id
      ORDER BY avg_rating DESC, h.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE hosts 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'categories') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE hosts 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Host;
