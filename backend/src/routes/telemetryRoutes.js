// ophthalmology-device-service-platform/backend/src/routes/telemetryRoutes.js
import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/session.js';
import { analyseAnomalies } from '../services/anomalyAgent.js';
import Joi from 'joi';

const router = express.Router();

const schema = Joi.object({
  deviceId: Joi.string().guid().required(),
  metric:   Joi.string().valid('temp','vibration','power_draw','error_count','lens_dirt').required(),
  value:    Joi.number().required(),
  unit:     Joi.string().max(10).optional()
});

// POST /api/telemetry – ingest single point
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { deviceId, metric, value: val, unit } = value;
    const { rows: [row] } = await pool.query(
      'INSERT INTO telemetry (device_id, metric, value, unit) VALUES ($1,$2,$3,$4) RETURNING *',
      [deviceId, metric, val, unit || null]
    );
    res.status(201).json(row);
  } catch (e) { next(e); }
});

// GET /api/telemetry/:deviceId – last 24 h
router.get('/:deviceId', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM telemetry
       WHERE device_id = $1
         AND recorded_at >= NOW() - INTERVAL '24 hours'
       ORDER BY recorded_at DESC`,
      [req.params.deviceId]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/telemetry/:deviceId/anomalies – current anomaly report
router.get('/:deviceId/anomalies', verifyToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM telemetry
       WHERE device_id = $1
       ORDER BY recorded_at DESC
       LIMIT 100`,
      [req.params.deviceId]
    );
    const report = analyseAnomalies(req.params.deviceId, rows);
    res.json(report);
  } catch (e) { next(e); }
});

export default router;