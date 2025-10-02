import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/session.js';
import { restrictTo } from '../middleware/rbac.js';
import Joi from 'joi';

const router = express.Router();

const schema = Joi.object({
  deviceId: Joi.string().guid().required(),
  title: Joi.string().max(120).required(),
  description: Joi.string().max(500).optional(),
  frequency: Joi.string().valid('daily','weekly','monthly','yearly','custom').required(),
  intervalDays: Joi.number().integer().min(1).when('frequency', { is: 'custom', then: Joi.required(), otherwise: Joi.optional() })
});

// POST /api/maintenance – create schedule
router.post('/', verifyToken, restrictTo('admin','technician'), async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { deviceId, title, description, frequency, intervalDays } = value;
    const interval = frequency === 'custom' ? intervalDays : mapFreq(frequency);
    const nextDue = new Date(); nextDue.setDate(nextDue.getDate() + interval);

    const { rows: [row] } = await pool.query(
      `INSERT INTO maintenance_schedules (device_id, title, description, frequency, interval_days, next_due)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [deviceId, title, description, frequency, intervalDays || null, nextDue]
    );
    res.status(201).json(row);
  } catch (e) { next(e); }
});

// GET /api/maintenance – list all (with device join)
router.get('/', verifyToken, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*, d.serial_number, d.model
      FROM maintenance_schedules m
      JOIN devices d ON d.id = m.device_id
      ORDER BY m.next_due ASC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/maintenance/due – jobs due now or overdue
router.get('/due', verifyToken, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*, d.serial_number, d.model
      FROM maintenance_schedules m
      JOIN devices d ON d.id = m.device_id
      WHERE m.next_due <= NOW()
      ORDER BY m.next_due ASC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// PUT /api/maintenance/:id/complete – mark done & advance next due
router.put('/:id/complete', verifyToken, restrictTo('admin','technician'), async (req, res, next) => {
  try {
    const { rows: [old] } = await pool.query(
      'SELECT frequency, interval_days FROM maintenance_schedules WHERE id = $1',
      [req.params.id]
    );
    if (!old) return res.status(404).json({ message: 'Schedule not found' });

    const interval = old.frequency === 'custom' ? (old.interval_days || 0) : mapFreq(old.frequency);
    const nextDue = new Date(); nextDue.setDate(nextDue.getDate() + interval);

    const { rows: [updated] } = await pool.query(
      `UPDATE maintenance_schedules
       SET last_done = NOW(), next_due = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id, nextDue]
    );
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/maintenance/:id – remove schedule
router.delete('/:id', verifyToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const { rows: [row] } = await pool.query(
      'DELETE FROM maintenance_schedules WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!row) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (e) { next(e); }
});

function mapFreq(f) {
  const days = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };
  return days[f] || 30;
}

export default router;