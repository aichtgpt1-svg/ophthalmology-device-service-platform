// ophthalmology-device-service-platform/backend/src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import {
  generateMfaSecret,
  generateQrCodeDataUrl,
  verifyMfaToken,
} from '../services/mfaService.js';
import Joi from 'joi';

const rounds = Number(process.env.BCRYPT_ROUNDS);

// ---------- VALIDATION SCHEMAS ----------
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  role: Joi.string().valid('admin', 'technician', 'customer').default('technician'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ---------- HELPERS ----------
function signJwt(userId, role) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
}

// ---------- CONTROLLERS ----------

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, fullName, role } = value;

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(409).json({ message: 'Email exists' });

    const hash = await bcrypt.hash(password, rounds);
    const {
      rows: [user],
    } = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,$3,$4) RETURNING id,email,full_name,role',
      [email, hash, fullName, role]
    );

    res.status(201).json({ user });
  } catch (e) {
    next(e);
  }
}

// POST /api/auth/login  (NO MFA REQUIRED)
export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = value;

    const {
      rows: [u],
    } = await pool.query(
      'SELECT id,email,password_hash,role,mfa_secret FROM users WHERE email=$1',
      [email]
    );
    if (!u) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // MFA completely removed – no check here

    const token = signJwt(u.id, u.role);
    res.json({ token });
  } catch (e) {
    next(e);
  }
}

// POST /api/auth/setup-mfa  (kept for future use, but optional)
export async function setupMfa(req, res, next) {
  try {
    const { email } = req.user; // added by verifyToken
    const { secret, otpauth } = generateMfaSecret(email);
    const qrDataUrl = await generateQrCodeDataUrl(otpauth);
    // Temporarily store secret in DB (not enabled until verified)
    await pool.query('UPDATE users SET mfa_secret=$1 WHERE id=$2', [secret, req.user.id]);
    res.json({ qrDataUrl, secret });
  } catch (e) {
    next(e);
  }
}

// POST /api/auth/verify-mfa  (kept for future use)
export async function verifyMfa(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'token required' });

    const {
      rows: [u],
    } = await pool.query('SELECT mfa_secret FROM users WHERE id=$1', [req.user.id]);
    if (!u.mfa_secret) return res.status(400).json({ message: 'MFA not initiated' });

    const valid = verifyMfaToken(u.mfa_secret, token);
    if (!valid) return res.status(400).json({ message: 'Invalid token' });

    res.json({ message: 'MFA verified' });
  } catch (e) {
    next(e);
  }
}