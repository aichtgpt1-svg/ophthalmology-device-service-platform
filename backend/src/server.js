// ophthalmology-device-service-platform/backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import rateLimit from 'express-rate-limit';
import pool from './config/db.js';

import authRoutes    from './routes/authRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import deviceRoutes  from './routes/deviceRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import diagnosticRoutes from './routes/diagnosticRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';

dotenv.config();
const app = express();
const PGStore = pgSession(session);

// security & body parsing
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// rate-limit: skip localhost
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1',   // ← skip localhost
});
app.use(limiter);

// sessions
app.use(
  session({
    store: new PGStore({ pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// API routes
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/devices',  deviceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/telemetry',  telemetryRoutes);

// health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));