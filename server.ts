import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SERVER_CONFIG } from './src/server/config/models.ts';
import planningRouter from './src/server/routes/planning.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : SERVER_CONFIG.defaultPort;

// Canonical Gemini Models for Celebranza
const MODELS = {
  text: 'gemini-3.5-flash',
  tts: 'gemini-3.8-flash-tts',
  ttsFallback: 'gemini-3.8-flash-lite-tts',
};

// Trust proxy headers for reverse proxies (Vercel, Cloudflare, AWS)
app.set('trust proxy', 1);

// Security hardening
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS headers & OPTIONS preflight handling restricted to own domain + development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    (origin === SERVER_CONFIG.allowedOrigin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app'))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', SERVER_CONFIG.allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Normalize request URL for Vercel serverless functions & rewrites
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api') && req.originalUrl?.startsWith('/api')) {
    req.url = req.originalUrl;
  } else if (req.url.startsWith('/planning/')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Request body size limit
app.use(express.json({ limit: SERVER_CONFIG.bodyLimit }));

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: SERVER_CONFIG.apiRateLimit.windowMs,
  max: SERVER_CONFIG.apiRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    source: 'fallback',
    error: 'Too many requests. Please wait a moment and try again.',
  },
});

// Stricter Per-Route Limiter for costly Gemini AI features
const aiLimiter = rateLimit({
  windowMs: SERVER_CONFIG.aiRateLimit.windowMs,
  max: SERVER_CONFIG.aiRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    source: 'fallback',
    error: 'AI generation limit reached (20 requests per 15 minutes). Please wait a moment.',
  },
});

app.use('/api/', apiLimiter);
app.use('/api/planning/one-prompt-planner', aiLimiter);
app.use('/api/planning/tts-briefing', aiLimiter);
app.use('/api/planning/chat-planner', aiLimiter);

// Mount modular planning routes
app.use('/api/planning', planningRouter);

// Vite middleware integration for local development / Static serve for local production
async function startServer() {
  if (process.env.VERCEL) return;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Celebranza platform online: http://localhost:${PORT}`);
  });
}

// Only listen on port when executed directly, not in Vercel serverless functions
if (!process.env.VERCEL) {
  startServer();
}

export default app;
