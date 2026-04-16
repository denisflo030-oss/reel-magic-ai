import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import videoRoutes from './routes/videos.js';
import clipsRoutes from './routes/clips.js';
import { initializeStorage } from './lib/storage.js';
import { db } from './lib/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize storage directories
(async () => {
  await initializeStorage();
})();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/videos', videoRoutes);
app.use('/api/clips', clipsRoutes);

// Get server stats/info
app.get('/api/info', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Reel Magic AI - AI Video Processing Backend',
    version: '1.0.0',
    stats: db.getStats(),
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error:', err);

    // Handle Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'Maximum file size is 2GB',
      });
    }

    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        error: 'Too many parts',
        message: 'Too many file parts in request',
      });
    }

    // Default error response
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err,
      }),
    });
  }
);

export default app;
