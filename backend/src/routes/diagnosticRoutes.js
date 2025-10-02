import express from 'express';
import { verifyToken } from '../middleware/session.js';
import { tree } from '../models/diagnosticTree.js';

const router = express.Router();

// POST /api/diagnostics/start – begin wizard
router.post('/start', verifyToken, (req, res) => {
  res.json({ node: tree });
});

// POST /api/diagnostics/next – follow yes/no
router.post('/next', verifyToken, (req, res) => {
  const { path } = req.body; // ["yes","no","yes"]  =  root → yes → no → yes
  if (!Array.isArray(path)) return res.status(400).json({ message: 'path array required' });

  let node = tree;
  for (const dir of path) {
    if (!node[dir]) return res.status(400).json({ message: 'Invalid path' });
    node = node[dir];
  }
  res.json({ node });
});

export default router;