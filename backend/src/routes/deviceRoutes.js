import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/session.js';
import { restrictTo } from '../middleware/rbac.js';
import Joi from 'joi';

const router = express.Router();

const deviceSchema = Joi.object({
  serialNumber: Joi.string().required(),
  manufacturer: Joi.string().required(),
  model:        Joi.string().required(),
  location:     Joi.string().optional().allow(''),
  ownerId:      Joi.string().guid().optional().allow('')
});

// GET /api/devices – list all (admin/tech)
router.get('/', verifyToken, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, u.full_name AS owner_name
      FROM devices d
      LEFT JOIN users u ON u.id = d.owner_id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/devices/:id – single device
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, u.full_name AS owner_name
      FROM devices d
      LEFT JOIN users u ON u.id = d.owner_id
      WHERE d.id = $1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Device not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/devices – register new device (admin/tech)
router.post('/', verifyToken, restrictTo('admin', 'technician'), async (req, res, next) => {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { serialNumber, manufacturer, model, location, ownerId } = value;
    const { rows: [dev] } = await pool.query(`
      INSERT INTO devices (serial_number, manufacturer, model, location, owner_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `, [serialNumber, manufacturer, model, location, ownerId || null]);
    res.status(201).json(dev);
  } catch (e) { next(e); }
});

// PUT /api/devices/:id – update device (admin/tech)
router.put('/:id', verifyToken, restrictTo('admin', 'technician'), async (req, res, next) => {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { serialNumber, manufacturer, model, location, ownerId } = value;
    const { rows: [dev] } = await pool.query(`
      UPDATE devices
      SET serial_number = $1,
          manufacturer  = $2,
          model         = $3,
          location      = $4,
          owner_id      = $5,
          updated_at    = NOW()
      WHERE id = $6
      RETURNING *
    `, [serialNumber, manufacturer, model, location, ownerId || null, req.params.id]);
    if (!dev) return res.status(404).json({ message: 'Device not found' });
    res.json(dev);
  } catch (e) { next(e); }
});

// DELETE /api/devices/:id – remove device (admin only)
router.delete('/:id', verifyToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const { rows: [dev] } = await pool.query(
      'DELETE FROM devices WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!dev) return res.status(404).json({ message: 'Device not found' });
    res.json({ message: 'Device deleted' });
  } catch (e) { next(e); }
});

export default router;