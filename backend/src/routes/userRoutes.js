// ophthalmology-device-service-platform/backend/src/routes/userRoutes.js
import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/session.js';
import { restrictTo } from '../middleware/rbac.js';
import Joi from 'joi';

const router = express.Router();

const userUpdateSchema = Joi.object({
  fullName: Joi.string().min(2).optional(),
  role:     Joi.string().valid('admin','technician','customer').optional()
});

// GET /api/users – list all (admin only)
router.get('/', verifyToken, restrictTo('admin'), async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/users/:id – single user (admin or self)
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// PUT /api/users/:id – update profile (admin or self)
router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { error, value } = userUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const fields = [];
    const vals = [];
    let idx = 1;
    if (value.fullName) { fields.push(`full_name = $${idx++}`); vals.push(value.fullName); }
    if (value.role     && req.user.role === 'admin') { fields.push(`role = $${idx++}`); vals.push(value.role); }
    if (!fields.length) return res.status(400).json({ message: 'Nothing to update' });
    vals.push(req.params.id);

    const { rows: [u] } = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, full_name, role, created_at`,
      vals
    );
    res.json(u);
  } catch (e) { next(e); }
});

// DELETE /api/users/:id – remove user (admin only)
router.delete('/:id', verifyToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const { rows: [u] } = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

// GET /api/users/me – current user (used by AuthContext)
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const { rows: [u] } = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(u);
  } catch (e) { next(e); }
});

export default router;