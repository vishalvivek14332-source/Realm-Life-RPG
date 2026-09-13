import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import questRoutes from './routes/questRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS setup - supports local development and unified single-origin production
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      ENV.CLIENT_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://localhost:5000'
    ];
    if (ENV.NODE_ENV === 'production' || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    realm: 'REALM RPG Unified Service',
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/activity', activityRoutes);

// Locate frontend build directory (dist)
const clientDistCandidates = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(process.cwd(), '../dist')
];

const clientDistPath = clientDistCandidates.find(dir => fs.existsSync(path.join(dir, 'index.html')));

if (clientDistPath) {
  console.log(`📦 Serving React frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET routes so browser refreshes work
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('ℹ️ Frontend dist not detected yet. Running in API-only mode or local dev.');
}

// Centralized error handling
app.use(errorHandler);

// Start server
app.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`🏰 REALM Server is ascending at http://localhost:${ENV.PORT}`);
  console.log(`⚔️  Environment: ${ENV.NODE_ENV} | Port: ${ENV.PORT}`);
});

export default app;
