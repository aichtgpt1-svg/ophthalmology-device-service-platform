// ophthalmology-device-service-platform/backend/src/routes/documentRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken } from '../middleware/session.js';
import { restrictTo } from '../middleware/rbac.js';
import { analyseDocument } from '../services/docAnalyzer.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/documents/upload  (tech/admin)
router.post('/upload', verifyToken, restrictTo('admin','technician'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.pdf','.docx','.doc','.txt'].includes(ext)) return res.status(400).json({ message: 'Unsupported file type' });

    // keep original extension
    const target = path.resolve('uploads', req.file.filename + ext);
    fs.renameSync(req.file.path, target);

    res.json({ id: req.file.filename + ext, name: req.file.originalname, path: target });
  } catch (e) { next(e); }
});

// GET /api/documents/:id  (download)
router.get('/:id', verifyToken, (req, res, next) => {
  const file = path.resolve('uploads', req.params.id);
  if (!fs.existsSync(file)) return res.status(404).json({ message: 'File not found' });
  res.download(file);
});

// POST /api/documents/:id/analyse  (tech/admin)
router.post('/:id/analyse', verifyToken, restrictTo('admin','technician'), async (req, res, next) => {
  try {
    const file = path.resolve('uploads', req.params.id);
    if (!fs.existsSync(file)) return res.status(404).json({ message: 'File not found' });
    const report = await analyseDocument(file);
    res.json(report);
  } catch (e) { next(e); }
});

export default router;