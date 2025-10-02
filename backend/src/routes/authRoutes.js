import express from 'express';
import { register, login, setupMfa, verifyMfa } from '../controllers/authController.js';
import { verifyToken } from '../middleware/session.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/setup-mfa', verifyToken, setupMfa);
router.post('/verify-mfa', verifyToken, verifyMfa);

export default router;