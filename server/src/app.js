import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
import { privacyLogger } from './middleware/privacyLogger.js';
import { sanitizeInputs } from './middleware/sanitizeMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import moderationRoutes from './routes/moderationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers & Sanitization
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInputs);

// Minimal privacy-preserving logger
app.use(privacyLogger);

// Global API rate limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'CampusVoice API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    privacyMode: 'enabled',
  });
});

// Demo accounts endpoint for easy evaluation and role switching
app.get('/api/auth/demo-accounts', (req, res) => {
  res.status(200).json({
    success: true,
    accounts: [
      {
        role: 'student',
        email: 'student@campus.edu',
        password: 'Password123!',
        label: 'Student Account',
        description: 'Anonymous posting, voting, commenting, reporting',
      },
      {
        role: 'moderator',
        email: 'moderator@campus.edu',
        password: 'Password123!',
        label: 'Moderator Account',
        description: 'Pending queues, reviewing reports, approving/rejecting content',
      },
      {
        role: 'admin',
        email: 'admin@campus.edu',
        password: 'Password123!',
        label: 'Administrator Account',
        description: 'User management, audit trails, campus analytics, system settings',
      },
    ],
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static client assets if client/dist exists
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - API endpoint not found.`,
  });
});

// Generic 404 handler
app.use('*', (req, res) => {
  if (fs.existsSync(path.join(CLIENT_DIST, 'index.html'))) {
    return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  }
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
