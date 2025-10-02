import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/session.js';
import { restrictTo } from '../middleware/rbac.js';
import Joi from 'joi';

const router = express.Router();

const recordSchema = Joi.object({
  deviceId:    Joi.string().guid().required(),
  summary:     Joi.string().max(120).required(),
  description: Joi.string().allow('').max(2000),
  status:      Joi.string().valid('open','in_progress','completed','cancelled').default('open')
});

// GET /api/services – list all records (admin/tech)
router.get('/', verifyToken, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT sr.*,
             d.serial_number,
             d.model,
             u.full_name AS technician_name
      FROM service_records sr
      JOIN devices d ON d.id = sr.device_id
      JOIN users u   ON u.id = sr.technician_id
      ORDER BY sr.started_at DESC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/services/:id – single record
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT sr.*,
             d.serial_number,
             d.model,
             u.full_name AS technician_name
      FROM service_records sr
      JOIN devices d ON d.id = sr.device_id
      JOIN users u   ON u.id = sr.technician_id
      WHERE sr.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Service record not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/services – create new service log (admin/tech)
router.post('/', verifyToken, restrictTo('admin','technician'), async (req, res, next) => {
  try {
    const { error, value } = recordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { deviceId, summary, description, status } = value;
    const { rows: [rec] } = await pool.query(`
      INSERT INTO service_records (device_id, technician_id, summary, description, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [deviceId, req.user.id, summary, description, status]);
    res.status(201).json(rec);
  } catch (e) { next(e); }
});

// PUT /api/services/:id – update log (admin/tech)
router.put('/:id', verifyToken, restrictTo('admin','technician'), async (req, res, next) => {
  try {
    const { error, value } = recordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { deviceId, summary, description, status } = value;
    const { rows: [rec] } = await pool.query(`
      UPDATE service_records
      SET device_id   = $1,
          summary     = $2,
          description = $3,
          status      = $4,
          updated_at  = NOW()
      WHERE id = $5
      RETURNING *
    `, [deviceId, summary, description, status, req.params.id]);
    if (!rec) return res.status(404).json({ message: 'Service record not found' });
    res.json(rec);
  } catch (e) { next(e); }
});

// DELETE /api/services/:id – remove log (admin only)
router.delete('/:id', verifyToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const { rows: [rec] } = await pool.query(
      'DELETE FROM service_records WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rec) return res.status(404).json({ message: 'Service record not found' });
    res.json({ message: 'Service record deleted' });
  } catch (e) { next(e); }
});

export default router;