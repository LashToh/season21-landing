import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { closePool } from './db.js';
import registerRouter from './routes/register.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: config.api.corsOrigin,
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '16kb' }));

const registerLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many registration attempts. Please try again later.',
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'season21-registration-api' });
});

app.use('/api/register', registerLimiter, registerRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' });
});

const server = app.listen(config.api.port, () => {
  console.log(`Registration API listening on http://localhost:${config.api.port}`);
  console.log(`CORS origin: ${config.api.corsOrigin}`);
  console.log(`Hash method: ${config.hashMethod}`);
});

async function shutdown() {
  console.log('Shutting down...');
  server.close();
  await closePool();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
